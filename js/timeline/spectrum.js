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
        this.peakFall = 0.010;
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
            console.warn("Spectrum source is already connected", error);
        }

        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        this.wave = new Uint8Array(this.analyser.fftSize);
        this.peaks = new Float32Array(Math.max(32, Math.floor(this.analyser.frequencyBinCount / 12)));
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
        const center = height / 2;
        const maxHeight = Math.max(8, center - 6);
        const count = Math.max(24, Math.floor(width / (this.barWidth + this.barGap)));
        const step = this.data.length / count;

        ctx.save();
        ctx.lineWidth = 1;

        for (let i = 0; i < count; i++) {
            const start = Math.floor(i * step);
            const end = Math.max(start + 1, Math.floor((i + 1) * step));

            let bandValue = 0;
            let total = 0;
            let weight = 0;

            for (let j = start; j < end && j < this.data.length; j++) {
                const value = this.data[j] / 255;
                const weightFactor = 1 + Math.log2(j + 2);
                total += value * weightFactor;
                weight += weightFactor;
            }

            if (weight > 0)
                bandValue = total / weight;

            const level = Math.pow(Math.min(1, bandValue), 0.72);
            const barHeight = Math.max(2, level * maxHeight);
            const x = i * (this.barWidth + this.barGap);
            const peak = this.peaks[i] || 0;

            this.peaks[i] = Math.max(level, peak - this.peakFall);

            const color = this.getBandColor(i / count, level);
            ctx.fillStyle = color;
            ctx.shadowBlur = 10 + level * 14;
            ctx.shadowColor = color;
            ctx.fillRect(x, center - barHeight, this.barWidth, barHeight);
            ctx.fillRect(x, center, this.barWidth, barHeight);

            if (this.peaks[i] > 0.04) {
                ctx.fillStyle = "rgba(255,255,255,0.9)";
                const peakY = center - this.peaks[i] * maxHeight;
                const peakYb = center + this.peaks[i] * maxHeight;
                ctx.fillRect(x, peakY, this.barWidth, 2);
                ctx.fillRect(x, peakYb, this.barWidth, 2);
            }
        }

        ctx.restore();

        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${0.16 + this.beatPulse * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(0, center + 0.5);
        ctx.lineTo(width, center + 0.5);
        ctx.stroke();
        ctx.restore();

        this.beatPulse *= 0.88;
    }

    getBandColor(normalized, level) {
        const low = ["#00f5d4", "#3dd9ff", "#81f4ff"];
        const mid = ["#5aa9ff", "#5b82ff", "#7f7bff"];
        const high = ["#d96af7", "#ff70b8", "#ff5c7a"];

        if (normalized < 0.38)
            return this.mixColors(low, level);
        if (normalized < 0.72)
            return this.mixColors(mid, level);
        return this.mixColors(high, level);
    }

    mixColors(colors, level) {
        const i = Math.min(colors.length - 1, Math.max(0, Math.floor(level * (colors.length - 1))));
        const next = colors[Math.min(colors.length - 1, i + 1)] || colors[i];
        const t = Math.min(1, Math.max(0, level * (colors.length - 1) - i));
        return this.interpolateHex(colors[i], next, t);
    }

    interpolateHex(a, b, t) {
        const ah = parseInt(a.slice(1), 16);
        const bh = parseInt(b.slice(1), 16);
        const ar = (ah >> 16) & 255;
        const ag = (ah >> 8) & 255;
        const ab = ah & 255;
        const br = (bh >> 16) & 255;
        const bg = (bh >> 8) & 255;
        const bb = bh & 255;

        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const b = Math.round(ab + (bb - ab) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    updateBeatEnergy() {
        const bassBins = Math.max(1, Math.floor(this.data.length * 0.08));
        let bass = 0;

        for (let i = 0; i < bassBins; i++)
            bass += this.data[i] / 255;

        bass /= bassBins;

        if (bass > 0.62 && bass > this.lastBass * 1.12)
            this.beatPulse = Math.min(1, bass + 0.2);

        this.lastBass = this.lastBass * 0.86 + bass * 0.14;
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
