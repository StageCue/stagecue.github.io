// ==========================================================
// StageCue Timeline Ruler
// Draws adaptive timeline ticks and labels.
// ==========================================================

import Utils from "./utils.js";

export default class Ruler {

    constructor(timeline) {

        this.timeline = timeline;

    }

    draw(ctx) {

        const canvas = ctx.canvas;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const pixelsPerSecond =
            this.timeline.zoom?.pixelsPerSecond || 100;

        const scroll =
            this.timeline.scroll?.x || 0;

        ctx.save();

        ctx.fillStyle = "#202020";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "#555";
        ctx.fillStyle = "#ddd";

        ctx.font = "11px Consolas";
        ctx.textBaseline = "top";

        const spacing = this.getSpacing(pixelsPerSecond);

        const firstSecond =
            Math.floor(scroll / pixelsPerSecond / spacing) * spacing;

        const lastSecond =
            (scroll + width) / pixelsPerSecond;

        for (
            let sec = firstSecond;
            sec <= lastSecond + spacing;
            sec += spacing
        ) {

            const x =
                Utils.secondsToPixels(
                    sec,
                    pixelsPerSecond,
                    scroll
                );

            this.drawTick(
                ctx,
                x,
                height,
                sec,
                spacing
            );

        }

        ctx.restore();

    }

    drawTick(ctx, x, height, seconds, spacing) {

        if (x < -50)
            return;

        ctx.beginPath();

        let tick = 8;

        if (spacing >= 60)
            tick = 18;
        else if (spacing >= 10)
            tick = 14;
        else if (spacing >= 1)
            tick = 10;

        ctx.moveTo(x + 0.5, height);

        ctx.lineTo(x + 0.5, height - tick);

        ctx.stroke();

        const label =
            this.format(seconds);

        ctx.fillText(
            label,
            x + 4,
            2
        );

    }

    format(seconds) {

        const zoom =
            this.timeline.zoom?.pixelsPerSecond || 100;

        if (zoom > 600) {

            return Utils.formatSMPTE(
                seconds,
                this.timeline.fps || 30
            );

        }

        return Utils.formatRuler(seconds);

    }

    getSpacing(pxPerSecond) {

        /*
            Adaptive ruler spacing.

            Zoomed Out
            ------------------
            5 min
            2 min
            1 min
            30 sec
            10 sec

            Zoomed In
            ------------------
            5 sec
            2 sec
            1 sec
            0.5 sec
            frame
        */

        if (pxPerSecond < 8)
            return 300;

        if (pxPerSecond < 15)
            return 120;

        if (pxPerSecond < 30)
            return 60;

        if (pxPerSecond < 60)
            return 30;

        if (pxPerSecond < 120)
            return 10;

        if (pxPerSecond < 250)
            return 5;

        if (pxPerSecond < 500)
            return 2;

        if (pxPerSecond < 900)
            return 1;

        if (pxPerSecond < 1600)
            return 0.5;

        return 1 / (this.timeline.fps || 30);

    }

}
