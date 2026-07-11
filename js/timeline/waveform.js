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

    }

    //---------------------------------------------------------
    // Load waveform
    //---------------------------------------------------------

    async load(source) {

        if (!source)
            return;

        this.currentSource = source;

        this.ready = false;
        this.loading = true;
        this.error = null;

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

            console.error(err);

            this.error = err;

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

        this.renderer.draw(
            ctx,
            this.waveform,
            width,
            height,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

    }

    //---------------------------------------------------------
    // Clear
    //---------------------------------------------------------

    clear() {

        this.audioBuffer = null;
        this.waveform = null;

        this.ready = false;

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
