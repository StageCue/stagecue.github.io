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
        this.sources = [];
        this.analyser = null;
        this.analyzers = [];
        this.stream = null;


        this.connected = false;
        this.mode = "bars";

        this.fftSize = 2048;
        this.smoothing = 0.78;
        this.minDecibels = -90;
        this.maxDecibels = -12;

        this.barWidth = 4;
        this.barGap = 2;
        this.peaks = [];
        this.peakFall = 0.013;
        this.lastBass = 0;
        this.beatPulse = 0;

        this.data = null;
        this.wave = null;
        this.trackCount = 0;

    }

    async connect() {
        if (this.connected)
            return;

        if (!this.video)
            throw new Error(
                "Video element missing"
            );


        this.source = null;
        this.stream = null;
        this.sources = [];
        this.analyser = null;
        this.analyzers = [];


        const useCaptureStream =
            typeof this.video.captureStream === "function";


        if (useCaptureStream) {

            try {

                this.stream =
                    this.video.captureStream();

            }

            catch(err) {

                console.warn(
                    "Unable to capture video audio stream",
                    err
                );

            }

        }


        const audioTracks =
            this.stream?.getAudioTracks?.() || [];


        if (audioTracks.length > 0) {

            for (const track of audioTracks) {

                const trackStream =
                    new MediaStream([track]);

                const source =
                    this.context.createMediaStreamSource(
                        trackStream
                    );

                const analyser =
                    this.context.createAnalyser();

                analyser.fftSize =
                    this.fftSize;

                analyser.smoothingTimeConstant =
                    this.smoothing;

                source.connect(analyser);
                analyser.connect(this.context.destination);

                this.sources.push(source);
                this.analyzers.push(analyser);

            }

        }

        else {

            this.analyser =
                this.context.createAnalyser();


            this.analyser.fftSize =
                this.fftSize;


            this.analyser.smoothingTimeConstant =
                this.smoothing;



            try {


                this.source =
                    this.context.createMediaElementSource(
                        this.video
                    );


            }

            catch(err) {


                console.warn(
                    "Media source already exists",
                    err
                );


            }



            if (this.source) {

                this.source.connect(
                    this.analyser
                );

            }


            this.analyser.connect(
                this.context.destination
            );

            this.analyzers.push(this.analyser);

        }


        this.data =
            new Uint8Array(
                this.fftSize / 2
            );


        this.wave =
            new Uint8Array(
                this.fftSize
            );

        this.trackCount =
            this.analyzers.length || 1;

        this.updateTrackCountUI();

        this.connected = true;
    }



    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

    getAnalyzers() {

        if (this.analyzers.length)
            return this.analyzers;

        return [this.analyser].filter(Boolean);

    }

    updateTrackCountUI() {

        const node =
            this.timeline?.root?.querySelector("#audioTrackCount");

        if (!node)
            return;

        node.textContent =
            `Tracks: ${this.trackCount}`;

    }

    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

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



    //---------------------------------------------------------
// Frequency bars
//---------------------------------------------------------

drawBars(ctx) {

    const analyzers = this.getAnalyzers();

    if (!analyzers.length)
        return;

    const w =
        ctx.canvas.clientWidth;

    const h =
        ctx.canvas.clientHeight;

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    const analyzerData =
        new Uint8Array(this.fftSize / 2);

    const barGroups =
        analyzers.length;

    const groupWidth =
        w / barGroups;

    analyzers.forEach((analyser, trackIndex) => {

        analyser.getByteFrequencyData(
            analyzerData
        );

        let x =
            trackIndex * groupWidth;

        for (
            let i = 0;
            i < analyzerData.length;
            i += 2
        ) {

            const value =
                analyzerData[i] / 255;

            const height =
                value * h;

            ctx.fillStyle =
                ["#5ba7ff", "#43c36b", "#f3b341"][trackIndex % 3];

            ctx.fillRect(
                x,
                h - height,
                this.barWidth,
                height
            );

            x +=
                this.barWidth +
                this.barGap;

            if (
                x >
                (trackIndex + 1) * groupWidth
            )
                break;

        }

    });

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
        const visibleBars = Math.min(this.bandCount, Math.max(24, Math.floor(width / (this.barWidth + this.barGap))));

        ctx.save();
        ctx.lineWidth = 1;

        for (let i = 0; i < visibleBars; i++) {
            const bandValue = this.getBandValue(i, visibleBars);
            const level = Math.pow(Math.min(1, bandValue), 0.72);
            const barHeight = Math.max(2, level * maxHeight);
            const x = i * (this.barWidth + this.barGap);
            const peak = this.peaks[i] || 0;

            this.peaks[i] = Math.max(level, peak - this.peakFall);

            const color = this.getBandColor(i / visibleBars, level);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12 + level * 16;

            ctx.fillRect(x, center - barHeight, this.barWidth, barHeight);
            ctx.fillRect(x, center + 1, this.barWidth, barHeight);

            if (this.peaks[i] > 0.04) {
                ctx.fillStyle = "rgba(255,255,255,0.88)";
                const peakYTop = center - this.peaks[i] * maxHeight;
                const peakYBottom = center + 1 + this.peaks[i] * maxHeight;
                ctx.fillRect(x, peakYTop, this.barWidth, 2);
                ctx.fillRect(x, peakYBottom, this.barWidth, 2);
            }
        }

        ctx.restore();

    //---------------------------------------------------------
    // Oscilloscope
    //---------------------------------------------------------

    drawWave(ctx) {


        const w =
            ctx.canvas.clientWidth;


        const h =
            ctx.canvas.clientHeight;



        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        const analyzers =
            this.getAnalyzers();


        analyzers.forEach((analyser, trackIndex) => {

            analyser.getByteTimeDomainData(this.wave);

            const step =
                w / this.wave.length;

            let x = 0;

            ctx.beginPath();
            ctx.strokeStyle =
                ["#5ba7ff", "#43c36b", "#f3b341"][trackIndex % 3];
            ctx.globalAlpha =
                0.55 + (trackIndex * 0.1);

            for (
                let i = 0;
                i < this.wave.length;
                i++
            ) {

                const y =
                    (this.wave[i] / 255) * h;

                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);

                x += step;

            }

            ctx.stroke();

        });

        ctx.globalAlpha = 1;


    }

    async resume() {
        if (this.context?.state === "suspended")
            await this.context.resume();
    }

    setMode(mode) {
        this.mode = mode === "wave" ? "wave" : "bars";
    }

    destroy() {


        for (const source of this.sources)
            source.disconnect();

        for (const analyser of this.analyzers)
            analyser.disconnect();


        if (this.source)
            this.source.disconnect();
        if (this.analyser)
            this.analyser.disconnect();

        this.source = null;
        this.analyser = null;
        this.connected = false;
        this.trackCount = 0;
        this.updateTrackCountUI();


    }
}
