// ==========================================================
// StageCue Spectrum Analyzer
// DJ-style real-time spectrum visualizer
// ==========================================================

import { getAudioContext } from "./audio-context.js";

export default class Spectrum {

    constructor(timeline) {
        this.timeline = timeline;
        this.video = timeline.video;
        this.context = getAudioContext();

        this.source = null;
        this.analyser = null;
        this.connected = false;
        this.mode = "bars";

        this.fftSize = 2048;
        this.smoothing = 0.78;
        this.minDecibels = -90;
        this.maxDecibels = -12;

        this.barWidth = 3;
        this.barGap = 2;
        this.peaks = [];
        this.peakFall = 0.018;
        this.lastBass = 0;
        this.beatPulse = 0;

        this.data = null;
        this.wave = null;
    }

    async connect() {
        if (this.connected)
            return;

        if (!this.video)
            throw new Error("Video element missing");

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.minDecibels = this.minDecibels;
        this.analyser.maxDecibels = this.maxDecibels;

        try {
            this.source = this.context.createMediaElementSource(this.video);
            this.source.connect(this.analyser);
            this.analyser.connect(this.context.destination);
        } catch (error) {
            // A media element can only have one MediaElementSource. Keep the
            // visualizer alive if another component already owns the source.
            console.warn("Spectrum source is already connected", error);
        }

        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        this.wave = new Uint8Array(this.analyser.fftSize);
        this.peaks = new Float32Array(this.data.length);
        this.connected = true;
    }

    draw(ctx) {
        const width = ctx.canvas.clientWidth;
        const height = ctx.canvas.clientHeight;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#0b0d12";
        ctx.fillRect(0, 0, width, height);

        this.drawGrid(ctx, width, height);

        if (!this.connected || this.context.state === "suspended") {
            this.drawIdle(ctx, width, height);
            return;
        }

        if (this.mode === "wave") {
            this.drawWave(ctx, width, height);
            return;
        }

        this.analyser.getByteFrequencyData(this.data);
        this.updateBeatEnergy();
        this.drawBars(ctx, width, height);
    }

    drawGrid(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,.07)";
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x + .5, 0);
            ctx.lineTo(x + .5, height);
            ctx.stroke();
        }

        for (let y = height / 2; y >= 0; y -= Math.max(12, height / 4)) {
            ctx.beginPath();
            ctx.moveTo(0, y + .5);
            ctx.lineTo(width, y + .5);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(255,255,255,.16)";
        ctx.beginPath();
        ctx.moveTo(0, height - 1.5);
        ctx.lineTo(width, height - 1.5);
        ctx.stroke();
        ctx.restore();
    }

    drawIdle(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = "rgba(150,170,200,.55)";
        ctx.font = "10px sans-serif";
        ctx.fillText("AUDIO SPECTRUM", 8, 14);
        ctx.restore();
    }

    drawBars(ctx, width, height) {
        const count = Math.max(1, Math.floor(width / (this.barWidth + this.barGap)));
        const step = this.data.length / count;
        const center = height / 2;
        const maxHeight = Math.max(4, center - 5);
        const gradient = ctx.createLinearGradient(0, height, 0, 0);

        gradient.addColorStop(0, "#18d6ff");
        gradient.addColorStop(.52, "#4c8dff");
        gradient.addColorStop(.82, "#b86cff");
        gradient.addColorStop(1, "#ff5470");

        ctx.save();
        ctx.shadowBlur = 7;
        ctx.shadowColor = "rgba(51,155,255,.45)";
        ctx.fillStyle = gradient;

        for (let i = 0; i < count; i++) {
            const start = Math.floor(i * step);
            const end = Math.max(start + 1, Math.floor((i + 1) * step));
            let value = 0;

            for (let j = start; j < end && j < this.data.length; j++)
                value = Math.max(value, this.data[j] / 255);

            // Compress the quiet end of the spectrum like a DJ mixer meter.
            const level = Math.pow(value, .72);
            const barHeight = Math.max(1, level * maxHeight);
            const x = i * (this.barWidth + this.barGap);
            const peak = this.peaks[i] || 0;

            this.peaks[i] = Math.max(level, peak - this.peakFall);

            ctx.fillRect(x, center - barHeight, this.barWidth, barHeight);
            ctx.fillRect(x, center, this.barWidth, barHeight);

            if (this.peaks[i] > .02) {
                ctx.fillStyle = "#f7fbff";
                const peakY = center - this.peaks[i] * maxHeight;
                ctx.fillRect(x, peakY, this.barWidth, 2);
                ctx.fillRect(x, center + this.peaks[i] * maxHeight - 2, this.barWidth, 2);
                ctx.fillStyle = gradient;
            }
        }

        ctx.restore();

        // A subtle center line gives the meter the familiar DJ-deck look.
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${.16 + this.beatPulse * .22})`;
        ctx.beginPath();
        ctx.moveTo(0, center + .5);
        ctx.lineTo(width, center + .5);
        ctx.stroke();
        ctx.restore();

        this.beatPulse *= .88;
    }

    updateBeatEnergy() {
        const bassBins = Math.max(1, Math.floor(this.data.length * .08));
        let bass = 0;

        for (let i = 0; i < bassBins; i++)
            bass += this.data[i] / 255;

        bass /= bassBins;

        if (bass > .62 && bass > this.lastBass * 1.12)
            this.beatPulse = Math.min(1, bass);

        this.lastBass = this.lastBass * .86 + bass * .14;
    }

    drawWave(ctx, width, height) {
        this.analyser.getByteTimeDomainData(this.wave);

        ctx.save();
        ctx.strokeStyle = "#45d7ff";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(69,215,255,.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const step = width / this.wave.length;
        for (let i = 0; i < this.wave.length; i++) {
            const x = i * step;
            const y = height / 2 + ((this.wave[i] - 128) / 128) * (height / 2 - 4);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
    }

    async resume() {
        if (this.context?.state === "suspended")
            await this.context.resume();
    }

    setMode(mode) {
        this.mode = mode === "wave" ? "wave" : "bars";
    }

    destroy() {
        if (this.source)
            this.source.disconnect();
        if (this.analyser)
            this.analyser.disconnect();

        this.source = null;
        this.analyser = null;
        this.connected = false;
        this.peaks = [];
    }
}
