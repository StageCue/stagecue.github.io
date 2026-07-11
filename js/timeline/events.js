// ==========================================================
// StageCue Timeline Events
// Mouse, touch and keyboard interaction
// ==========================================================

export default class Events {

    constructor(timeline) {

        this.timeline = timeline;

        this.root = timeline.root;
        this.video = timeline.video;

        this.wave =
            this.root.querySelector(".timeline-waveform");

        this.draggingPlayhead = false;
        this.panning = false;

        this.lastX = 0;

        this.install();

    }

    install() {

        // Mouse
        this.wave.addEventListener(
            "mousedown",
            this.onMouseDown.bind(this)
        );

        window.addEventListener(
            "mousemove",
            this.onMouseMove.bind(this)
        );

        window.addEventListener(
            "mouseup",
            this.onMouseUp.bind(this)
        );

        // Wheel zoom

        this.wave.addEventListener(
            "wheel",
            this.onWheel.bind(this),
            { passive: false }
        );

        // Double click = cue

        this.wave.addEventListener(
            "dblclick",
            this.onDoubleClick.bind(this)
        );

        // Keyboard

        window.addEventListener(
            "keydown",
            this.onKeyDown.bind(this)
        );

        // Touch

        this.wave.addEventListener(
            "touchstart",
            this.onTouchStart.bind(this),
            { passive: false }
        );

        this.wave.addEventListener(
            "touchmove",
            this.onTouchMove.bind(this),
            { passive: false }
        );

        this.wave.addEventListener(
            "touchend",
            this.onTouchEnd.bind(this)
        );

    }

    //--------------------------------------------------------
    // Mouse
    //--------------------------------------------------------

    getX(event) {

        const rect =
            this.wave.getBoundingClientRect();

        return event.clientX - rect.left;

    }

    onMouseDown(e) {

        const x = this.getX(e);

        this.lastX = x;

        switch (e.button) {

            // Left button

            case 0:

                this.draggingPlayhead = true;

                this.timeline.playhead.startDrag();

                this.timeline.playhead.drag(x);

                break;

            // Middle button = pan

            case 1:

                e.preventDefault();

                this.panning = true;

                break;

        }

    }

    onMouseMove(e) {

        const x = this.getX(e);

        if (this.draggingPlayhead) {

            this.timeline.playhead.drag(x);

        }

        if (this.panning) {

            const dx = x - this.lastX;

            this.timeline.scroll.x -= dx;

            if (this.timeline.scroll.clamp)
                this.timeline.scroll.clamp();

            this.lastX = x;

        }

    }

    onMouseUp() {

        if (this.draggingPlayhead) {

            this.timeline.playhead.endDrag();

        }

        this.draggingPlayhead = false;

        this.panning = false;

    }

    //--------------------------------------------------------
    // Zoom
    //--------------------------------------------------------

   onWheel(e) {

    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {

        const rect = this.wave.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;

        if (e.deltaY < 0)
            this.timeline.zoom.zoomIn(mouseX);
        else
            this.timeline.zoom.zoomOut(mouseX);

        this.timeline.scroll.onZoomChanged();

    } else {

        this.timeline.scroll.scroll(e.deltaY);

    }

}

    //--------------------------------------------------------
    // Marker
    //--------------------------------------------------------

    onDoubleClick(e) {

        const x = this.getX(e);

        if (!this.timeline.markers)
            return;

        this.timeline.markers.addAtPixel(x);

    }

    //--------------------------------------------------------
    // Keyboard
    //--------------------------------------------------------

    onKeyDown(e) {

        switch (e.code) {

            case "Space":

                e.preventDefault();

                if (this.video.paused)
                    this.video.play();
                else
                    this.video.pause();

                break;

            case "ArrowRight":

                if (e.shiftKey)
                    this.timeline.playhead.nextFrame();
                else
                    this.timeline.playhead.jumpForward(5);

                break;

            case "ArrowLeft":

                if (e.shiftKey)
                    this.timeline.playhead.previousFrame();
                else
                    this.timeline.playhead.jumpBackward(5);

                break;

            case "Equal":

                this.timeline.zoom.zoomIn();

                break;

            case "Minus":

                this.timeline.zoom.zoomOut();

                break;

            case "Home":

                this.timeline.playhead.seek(0);

                break;

            case "End":

                this.timeline.playhead.seek(
                    this.video.duration
                );

                break;

        }

    }

    //--------------------------------------------------------
    // Touch
    //--------------------------------------------------------

    onTouchStart(e) {

        e.preventDefault();

        const touch = e.touches[0];

        const rect =
            this.wave.getBoundingClientRect();

        this.draggingPlayhead = true;

        this.timeline.playhead.startDrag();

        this.timeline.playhead.drag(
            touch.clientX - rect.left
        );

    }

    onTouchMove(e) {

        if (!this.draggingPlayhead)
            return;

        const touch = e.touches[0];

        const rect =
            this.wave.getBoundingClientRect();

        this.timeline.playhead.drag(
            touch.clientX - rect.left
        );

    }

    onTouchEnd() {

        this.draggingPlayhead = false;

        this.timeline.playhead.endDrag();

    }

}
