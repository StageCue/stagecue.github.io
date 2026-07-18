// ==============================================
// StageCue Player Engine
// ==============================================

import * as Events from "./player-events.js";
import * as UI from "./player-ui.js";
import * as Media from "./player-media.js";
import * as Playback from "./player-playback.js";
import * as Output from "./player-output.js";

import Timeline from "./timeline/timeline.js";

export class Player {

    constructor() {

        //-----------------------------------------
        // Preview
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

        this.currentCue = null;

        this.videoURL = null;

        //-----------------------------------------
        // Output
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

        Events.bind(this);

    }

    //==================================================
    // UI
    //==================================================

    updateTime() {

        UI.updateTime(this);

    }

    updateDuration() {

        UI.updateDuration(this);

    }

    format(seconds) {

        return UI.format(seconds);

    }

    //==================================================
    // Current Cue
    //==================================================

    setCurrentCue(cue) {

        this.currentCue = cue;

    }

    //==================================================
    // Media
    //==================================================

    load(clip) {

        Media.load(this, clip);

    }

    unload() {

        Media.unload(this);

    }

    //==================================================
    // Playback
    //==================================================

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

    seekTo(seconds) {

        Playback.seekTo(

            this,

            seconds

        );

    }

    setVolume(value) {

        Playback.setVolume(

            this,

            value

        );

    }

    //==================================================
    // Output
    //==================================================

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

    //==================================================
    // Timeline
    //==================================================

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

    //==================================================
    // Getters
    //==================================================

    get currentTime() {

        return this.video.currentTime;

    }

    get duration() {

        return this.video.duration || 0;

    }

    get paused() {

        return this.video.paused;

    }

    //==================================================
    // Cleanup
    //==================================================

    destroy() {

        this.timeline?.destroy();

        Media.unload(this);

        Output.detachOutput(this);

    }

}
