// ==============================================
// StageCue Player Engine
// ==============================================

import Timeline from "./timeline/timeline.js";


import * as Media from "./player-media.js";
import * as Playback from "./player-playback.js";
import * as Output from "./player-output.js";

export class Player {

    constructor() {

        //-----------------------------------------
        // Preview Video
        //-----------------------------------------

        this.video =
            document.getElementById("preview");

        //-----------------------------------------
        // Timeline
        //-----------------------------------------

        this.timelineRoot =
            document.getElementById("timeline");

        this.timeline = null;

        //-----------------------------------------
        // UI
        //-----------------------------------------

        this.seek =
            document.getElementById("seek");

        this.currentLabel =
            document.getElementById("current");

        this.durationLabel =
            document.getElementById("duration");

        this.overlay =
            document.getElementById("previewOverlay");

        //-----------------------------------------
        // Data
        //-----------------------------------------

        this.currentClip = null;

        this.videoURL = null;

        //-----------------------------------------
        // External Output
        //-----------------------------------------

        this.output = null;

        //-----------------------------------------
        // Timeline
        //-----------------------------------------

        if (this.timelineRoot) {

            this.timeline =
                new Timeline({

                    root: this.timelineRoot,

                    video: this.video,

                    fps: 30

                });

        }

        //-----------------------------------------
        // Events
        //-----------------------------------------

        this.bindEvents();

    }

    // =====================================================
    // Events
    // =====================================================

    bindEvents() {

        //-----------------------------------------
        // Metadata
        //-----------------------------------------

        this.video.addEventListener(

            "loadedmetadata",

            async () => {

                this.updateDuration();

                if (
                    this.timeline &&
                    this.currentClip
                ) {

                    try {

                        const source =
                            this.currentClip.file ||
                            this.currentClip.url;

                        await this.timeline.load(source);

                    }

                    catch (err) {

                        console.error(
                            "Timeline error:",
                            err
                        );

                    }

                }

                Output.syncOutput(this);

            }

        );

        //-----------------------------------------
        // Time
        //-----------------------------------------

        this.video.addEventListener(

            "timeupdate",

            () => {

                this.updateTime();

            }

        );

        //-----------------------------------------
        // Playback
        //-----------------------------------------

        this.video.addEventListener(

            "play",

            () => Output.syncOutput(this)

        );

        this.video.addEventListener(

            "pause",

            () => Output.syncOutput(this)

        );

        this.video.addEventListener(

            "seeked",

            () => Output.syncOutput(this)

        );

        this.video.addEventListener(

            "volumechange",

            () => Output.syncOutput(this)

        );

        this.video.addEventListener(

            "ratechange",

            () => Output.syncOutput(this)

        );

        //-----------------------------------------
        // Seek Bar
        //-----------------------------------------

        this.seek.addEventListener(

            "input",

            () => {

                if (!this.video.duration)
                    return;

                Playback.seekTo(

                    this,

                    (
                        this.seek.value / 100
                    ) * this.video.duration

                );

            }

        );

    }
       // =====================================================
    // UI
    // =====================================================

    updateTime() {

        this.currentLabel.textContent =
            this.format(
                this.video.currentTime
            );

        if (this.video.duration) {

            this.seek.value =

                (
                    this.video.currentTime /
                    this.video.duration
                ) * 100;

        }

    }

    updateDuration() {

        this.durationLabel.textContent =

            this.format(

                this.video.duration

            );

    }

    format(seconds) {

        if (isNaN(seconds))
            return "00:00";

        const m =
            Math.floor(
                seconds / 60
            );

        const s =
            Math.floor(
                seconds % 60
            );

        return (

            String(m)
                .padStart(2, "0")

            +

            ":"

            +

            String(s)
                .padStart(2, "0")

        );

    }

    // =====================================================
    // Media
    // =====================================================

    load(clip) {

        Media.load(this, clip);

    }

    unload() {

        Media.unload(this);

    }

    // =====================================================
    // Playback
    // =====================================================

    play() {

        return Playback.play(this);

    }

    pause() {

        Playback.pause(this);

    }

    stop() {

        Playback.stop(this);

    }

    toggle() {

        Playback.toggle(this);

    }

    setVolume(value) {

        Playback.setVolume(

            this,

            value

        );

    }

    seekTo(seconds) {

        Playback.seekTo(

            this,

            seconds

        );

    }

    // =====================================================
    // Output
    // =====================================================

    attachOutput(video) {

        Output.attachOutput(

            this,

            video

        );

    }

    syncOutput() {

        Output.syncOutput(

            this

        );

    }

    detachOutput() {

        Output.detachOutput(

            this

        );

    }
       // =====================================================
    // Timeline API
    // =====================================================

    addCue(
        name = "Cue",
        color = "#ff9800"
    ) {

        return this.timeline?.addMarker(

            this.video.currentTime,

            name,

            color

        );

    }

    zoomIn() {

        this.timeline?.zoomIn();

    }

    zoomOut() {

        this.timeline?.zoomOut();

    }

    fitTimeline() {

        this.timeline?.fit();

    }

    // =====================================================
    // Getters
    // =====================================================

    get currentTime() {

        return this.video.currentTime;

    }

    get duration() {

        return this.video.duration || 0;

    }

    get paused() {

        return this.video.paused;

    }

    // =====================================================
    // Cleanup
    // =====================================================

    destroy() {

        this.timeline?.destroy();

        Media.unload(this);

        Output.detachOutput(this);

    }
   }

 
