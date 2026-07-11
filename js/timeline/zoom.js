// ==========================================================
// StageCue Timeline Zoom
// Professional zoom controller
// ==========================================================

import Utils from "./utils.js";

export default class Zoom {

    constructor(timeline) {

        this.timeline = timeline;

        // pixels shown for one second
        this.pixelsPerSecond = 100;

        this.minPixelsPerSecond = 20;
        this.maxPixelsPerSecond = 4000;

        this.zoomFactor = 1.15;

        this.animation = null;

    }

    //--------------------------------------------------------
    // Basic zoom
    //--------------------------------------------------------

    zoomIn(anchorX = null) {

        this.setPixelsPerSecond(
            this.pixelsPerSecond * this.zoomFactor,
            anchorX
        );

    }

    zoomOut(anchorX = null) {

        this.setPixelsPerSecond(
            this.pixelsPerSecond / this.zoomFactor,
            anchorX
        );

    }

    //--------------------------------------------------------
    // Set zoom
    //--------------------------------------------------------

    setPixelsPerSecond(value, anchorX = null) {

        value = Utils.clamp(
            value,
            this.minPixelsPerSecond,
            this.maxPixelsPerSecond
        );

        if (value === this.pixelsPerSecond)
            return;

        //----------------------------------------------------
        // Keep mouse position fixed while zooming
        //----------------------------------------------------

        if (anchorX !== null) {

            const scroll = this.timeline.scroll.x;

            const seconds =
                (anchorX + scroll) /
                this.pixelsPerSecond;

            this.timeline.scroll.x =
                seconds * value - anchorX;

        }

        this.pixelsPerSecond = value;

        if (this.timeline.scroll.clamp)
            this.timeline.scroll.clamp();

    }

    //--------------------------------------------------------
    // Percentage
    //--------------------------------------------------------

    get percent() {

        return Math.round(
            (this.pixelsPerSecond / 100) * 100
        );

    }

    //--------------------------------------------------------
    // Fit entire video
    //--------------------------------------------------------

    fit() {

        const duration =
            this.timeline.video.duration || 1;

        const width =
            this.timeline.root.clientWidth;

        this.pixelsPerSecond =
            width / duration;

    }

    //--------------------------------------------------------
    // Frame zoom
    //--------------------------------------------------------

    frameZoom() {

        const fps =
            this.timeline.fps || 30;

        this.pixelsPerSecond = fps * 30;

    }

    //--------------------------------------------------------
    // Smooth animation
    //--------------------------------------------------------

    animate(target) {

        cancelAnimationFrame(this.animation);

        const start = this.pixelsPerSecond;

        const diff = target - start;

        const startTime = performance.now();

        const duration = 180;

        const step = now => {

            const t = Math.min(
                1,
                (now - startTime) / duration
            );

            const eased =
                t * t * (3 - 2 * t);

            this.pixelsPerSecond =
                start + diff * eased;

            if (t < 1) {

                this.animation =
                    requestAnimationFrame(step);

            }

        };

        this.animation =
            requestAnimationFrame(step);

    }

    //--------------------------------------------------------
    // Presets
    //--------------------------------------------------------

    zoomTo(secondsVisible) {

        const width =
            this.timeline.root.clientWidth;

        this.setPixelsPerSecond(
            width / secondsVisible
        );

    }

    zoom1Sec() {

        this.zoomTo(1);

    }

    zoom10Sec() {

        this.zoomTo(10);

    }

    zoom30Sec() {

        this.zoomTo(30);

    }

    zoom1Min() {

        this.zoomTo(60);

    }

    zoom5Min() {

        this.zoomTo(300);

    }

}
