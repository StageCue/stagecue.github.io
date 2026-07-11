// ==========================================================
// StageCue Timeline Selection
// Time range selection
// ==========================================================

import Utils from "./utils.js";

export default class Selection {

    constructor(timeline) {

        this.timeline = timeline;

        this.enabled = true;

        this.visible = false;

        this.dragging = false;

        this.dragMode = null;

        this.start = 0;
        this.end = 0;

        this.handleSize = 8;

        this.fill = "rgba(91,167,255,.18)";
        this.border = "#5ba7ff";

    }

    //---------------------------------------------------------
    // Helpers
    //---------------------------------------------------------

    get length() {

        return Math.max(0, this.end - this.start);

    }

    clear() {

        this.visible = false;
        this.dragging = false;

    }

    set(start, end) {

        this.start = Math.min(start, end);
        this.end = Math.max(start, end);

        this.visible = true;

    }

    //---------------------------------------------------------
    // Mouse
    //---------------------------------------------------------

    begin(pixel) {

        if (!this.enabled)
            return;

        const sec = Utils.pixelsToSeconds(
            pixel,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        this.start = sec;
        this.end = sec;

        this.visible = true;
        this.dragging = true;
        this.dragMode = "new";

    }

    drag(pixel) {

        if (!this.dragging)
            return;

        let sec = Utils.pixelsToSeconds(
            pixel,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        sec = Utils.clamp(
            sec,
            0,
            this.timeline.video.duration || 0
        );

        switch (this.dragMode) {

            case "new":

                this.end = sec;

                if (this.end < this.start) {

                    const tmp = this.start;
                    this.start = this.end;
                    this.end = tmp;

                }

                break;

            case "left":

                this.start = Math.min(
                    sec,
                    this.end
                );

                break;

            case "right":

                this.end = Math.max(
                    sec,
                    this.start
                );

                break;

            case "move": {

                const len = this.length;

                this.start = sec;

                this.end = sec + len;

                break;
            }

        }

    }

    endDrag() {

        this.dragging = false;

    }

    //---------------------------------------------------------
    // Hit testing
    //---------------------------------------------------------

    hit(pixel) {

        if (!this.visible)
            return null;

        const left = Utils.secondsToPixels(
            this.start,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        const right = Utils.secondsToPixels(
            this.end,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        if (Math.abs(pixel - left) <= this.handleSize)
            return "left";

        if (Math.abs(pixel - right) <= this.handleSize)
            return "right";

        if (pixel > left && pixel < right)
            return "move";

        return null;

    }

    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

    draw(ctx) {

        if (!this.visible)
            return;

        const h = ctx.canvas.clientHeight;

        const x1 = Utils.secondsToPixels(
            this.start,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        const x2 = Utils.secondsToPixels(
            this.end,
            this.timeline.zoom.pixelsPerSecond,
            this.timeline.scroll.x
        );

        ctx.save();

        // Fill
        ctx.fillStyle = this.fill;

        ctx.fillRect(
            x1,
            0,
            x2 - x1,
            h
        );

        // Border
        ctx.strokeStyle = this.border;
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x1,
            0,
            x2 - x1,
            h
        );

        // Handles
        ctx.fillStyle = this.border;

        ctx.fillRect(
            x1 - 2,
            0,
            4,
            h
        );

        ctx.fillRect(
            x2 - 2,
            0,
            4,
            h
        );

        ctx.restore();

    }

    //---------------------------------------------------------
    // Queries
    //---------------------------------------------------------

    contains(seconds) {

        return (
            seconds >= this.start &&
            seconds <= this.end
        );

    }

    toJSON() {

        return {

            visible: this.visible,
            start: this.start,
            end: this.end

        };

    }

    fromJSON(data) {

        if (!data)
            return;

        this.visible = data.visible;

        this.start = data.start;

        this.end = data.end;

    }

}
