// ==========================================================
// StageCue Timeline Renderer
// Responsible only for drawing.
// ==========================================================

import Utils from "./utils.js";

export default class Renderer {

    constructor(timeline) {

        this.timeline = timeline;

        this.root = timeline.root;

        this.waveCanvas =
            this.root.querySelector(".timeline-waveform canvas");

        this.rulerCanvas =
            this.root.querySelector(".timeline-ruler canvas");

        this.spectrumCanvas =
            this.root.querySelector(".timeline-spectrum canvas");

        this.waveCtx = Utils.resizeCanvas(this.waveCanvas);
        this.rulerCtx = Utils.resizeCanvas(this.rulerCanvas);

        this.spectrumCtx = this.spectrumCanvas
            ? Utils.resizeCanvas(this.spectrumCanvas)
            : null;

        this.lastWidth = 0;
        this.lastHeight = 0;

        this.running = false;

        window.addEventListener("resize", () => this.resize());

        this.resize();
    }

    resize() {

        this.waveCtx = Utils.resizeCanvas(this.waveCanvas);
        this.rulerCtx = Utils.resizeCanvas(this.rulerCanvas);

        if (this.spectrumCanvas)
            this.spectrumCtx = Utils.resizeCanvas(this.spectrumCanvas);

        this.lastWidth = this.waveCanvas.clientWidth;
        this.lastHeight = this.waveCanvas.clientHeight;
    }

    start() {

        if (this.running) return;

        this.running = true;

        const loop = () => {

            if (!this.running) return;

            this.render();

            requestAnimationFrame(loop);

        };

        requestAnimationFrame(loop);

    }

    stop() {

        this.running = false;

    }

    render() {

        if (this.timeline.scroll)
            this.timeline.scroll.update();

        if (
            this.waveCanvas.clientWidth !== this.lastWidth ||
            this.waveCanvas.clientHeight !== this.lastHeight
        ) {

            this.resize();

        }

        this.clear();

        this.drawGrid();

        if (this.timeline.waveform)
            this.timeline.waveform.draw(this.waveCtx);

        if (this.timeline.markers)
            this.timeline.markers.draw(this.waveCtx);

        if (this.timeline.selection)
            this.timeline.selection.draw(this.waveCtx);

        if (this.timeline.playhead)
            this.timeline.playhead.draw(this.waveCtx);

        if (this.timeline.ruler)
            this.timeline.ruler.draw(this.rulerCtx);

        if (
            this.timeline.spectrum &&
            this.spectrumCtx
        ) {

            this.timeline.spectrum.draw(
                this.spectrumCtx
            );

        }

    }

    clear() {

        this.waveCtx.clearRect(
            0,
            0,
            this.waveCanvas.clientWidth,
            this.waveCanvas.clientHeight
        );

        this.rulerCtx.clearRect(
            0,
            0,
            this.rulerCanvas.clientWidth,
            this.rulerCanvas.clientHeight
        );

        if (this.spectrumCtx) {

            this.spectrumCtx.clearRect(
                0,
                0,
                this.spectrumCanvas.clientWidth,
                this.spectrumCanvas.clientHeight
            );

        }

    }

    drawGrid() {

        const ctx = this.waveCtx;

        const width = this.waveCanvas.clientWidth;
        const height = this.waveCanvas.clientHeight;

        const zoom = this.timeline.zoom?.pixelsPerSecond || 100;
        const scroll = this.timeline.scroll?.x || 0;

        ctx.save();

        ctx.strokeStyle = "#2d2d2d";
        ctx.lineWidth = 1;

        const start = -(scroll % zoom);

        for (let x = start; x < width; x += zoom) {

            ctx.beginPath();

            ctx.moveTo(x, 0);

            ctx.lineTo(x, height);

            ctx.stroke();

        }

        ctx.restore();

    }

}
