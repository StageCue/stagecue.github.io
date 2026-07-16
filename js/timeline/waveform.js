// ==========================================================
// StageCue Waveform Controller
// Coordinates decoding, peak generation and rendering
// ==========================================================

import Decoder from "./decoder.js";
import Peaks from "./peaks.js";
import WaveformRenderer from "./waveform-renderer.js";
import Cache from "./cache.js";

export default class Waveform {

    constructor(timeline) {

        this.timeline = timeline;
        this.video = timeline.video;

        this.decoder = new Decoder();
        this.cache = new Cache();
        this.peaks = new Peaks();
        this.renderer = new WaveformRenderer(timeline);

        this.audioBuffer = null;
        this.waveform = null;

        this.ready = false;
        this.loading = false;
        this.error = null;

        this.currentSource = null;
        this.liveAudioFallback = false;

    }

    //---------------------------------------------------------
    // Load waveform
    //---------------------------------------------------------

    async load(source) {

        if (!source)
            return;

        this.currentSource = source;
        this.liveAudioFallback = false;

        this.ready = false;
        this.loading = true;
        this.error = null;

        const isVideoSource =
            (
                source instanceof Blob &&
                source.type?.startsWith("video/")
            )
            ||
            (
                typeof source === "string" &&
                source.startsWith("blob:")
            );

        if (isVideoSource) {

            this.liveAudioFallback = true;
            this.waveform = null;
            this.audioBuffer = null;
            this.ready = true;
            this.loading = false;
            this.error = null;

            return;

        }

        try {

            //---------------------------------------------
            // Cache
            //---------------------------------------------

            const cached =
                await this.cache.load(source);

            if (cached) {

                this.waveform = cached;

                this.ready = true;
                this.loading = false;

                return;

            }

            //---------------------------------------------
            // Decode
            //---------------------------------------------

            this.audioBuffer =
                await this.decoder.decode(source);

            //---------------------------------------------
            // Peaks
            //---------------------------------------------

            this.waveform =
                this.peaks.generate(
                    this.audioBuffer
                );

            //---------------------------------------------
            // Save cache
            //---------------------------------------------

            await this.cache.save(
                source,
                this.waveform
            );

            this.ready = true;

        }

        catch (err) {

            console.warn(
                "Waveform decode fallback enabled.",
                err
            );

            this.liveAudioFallback = true;
            this.waveform = null;
            this.audioBuffer = null;
            this.ready = true;
            this.error = null;

        }

        this.loading = false;

    }

    //---------------------------------------------------------
    // Reload
    //---------------------------------------------------------

    async reload() {

        if (!this.currentSource)
            return;

        await this.load(
            this.currentSource
        );

    }

    //---------------------------------------------------------
    // Draw live video-audio waveform fallback
    //---------------------------------------------------------

    drawLiveAudioWave(ctx, width, height) {

        const spectrum = this.timeline?.spectrum;
        const analyzers = spectrum?.getAnalyzers?.() || [];
        const wave = spectrum?.wave;

        if (!analyzers.length || !wave) {

            ctx.save();
            ctx.fillStyle = "#888";
            ctx.font = "14px sans-serif";
            ctx.fillText(
                "Waveform will appear during playback",
                20,
                30
            );
            ctx.restore();

            return;

        }

        const colors = ["#5ba7ff", "#43c36b", "#f3b341"];

        ctx.save();

        analyzers.forEach((analyser, trackIndex) => {

            analyser.getByteTimeDomainData(wave);

            const mid = height / 2;
            const step = width / wave.length;

            ctx.beginPath();
            ctx.strokeStyle = colors[trackIndex % colors.length];
            ctx.globalAlpha = 0.55 + (trackIndex * 0.1);
            ctx.lineWidth = 1;

            for (let i = 0; i < wave.length; i++) {

                const centered = (wave[i] - 128) / 128;
                const y = mid - centered * (mid - 2);
                const x = i * step;

                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);

            }

            ctx.stroke();

        });

        ctx.globalAlpha = 1;
        ctx.restore();

    }

    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

    draw(ctx) {

        const width = ctx.canvas.clientWidth;
        const height = ctx.canvas.clientHeight;

        //---------------------------------------------
        // Loading
        //---------------------------------------------

        if (this.loading) {

            ctx.save();

            ctx.fillStyle = "#888";

            ctx.font = "14px sans-serif";

            ctx.fillText(
                "Generating waveform...",
                20,
                30
            );

            ctx.restore();

            return;

        }

        //---------------------------------------------
        // Error
        //---------------------------------------------

        if (this.error) {

            ctx.save();

            ctx.fillStyle = "#ff5555";

            ctx.fillText(
                "Waveform Error",
                20,
                30
            );

            ctx.restore();

            return;

        }

        //---------------------------------------------
        // Not ready
        //---------------------------------------------

        if (!this.ready)
            return;

        //---------------------------------------------
        // Draw waveform
        //---------------------------------------------

        if (this.waveform) {

            this.renderer.draw(
                ctx,
                this.waveform,
                width,
                height,
                this.timeline.zoom.pixelsPerSecond,
                this.timeline.scroll.x
            );

            return;

        }

        if (this.liveAudioFallback) {

            this.drawLiveAudioWave(
                ctx,
                width,
                height
            );

        }

    }

    //---------------------------------------------------------
    // Clear
    //---------------------------------------------------------

    clear() {

        this.audioBuffer = null;
        this.waveform = null;

        this.ready = false;
        this.liveAudioFallback = false;

    }

    //---------------------------------------------------------
    // Status
    //---------------------------------------------------------

    get duration() {

        if (!this.audioBuffer)
            return 0;

        return this.audioBuffer.duration;

    }

    get loaded() {

        return this.ready;

    }

}
