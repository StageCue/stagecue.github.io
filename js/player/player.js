// ==============================================
// StageCue Player
// Main Controller
// ==============================================

import * as Events from "./events.js";
import * as UI from "./ui.js";
import * as Media from "./media.js";
import * as Playback from "./playback.js";
import * as Output from "./output.js";
import * as Timeline from "./timeline.js";

export class Player {

    constructor() {

        //-----------------------------------------
        // Video
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
        // Init
        //-----------------------------------------

        Timeline.create(this);

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
    // Cue
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

        Output.syncOutput(this);

    }

    detachOutput() {

        Output.detachOutput(this);

    }

    //==================================================
    // Timeline
    //==================================================

    addMarker(

        name = "Marker",

        color = "#ff9800"

    ) {

        return Timeline.addMarker(

            this,

            name,

            color

        );

    }

    zoomIn() {

        Timeline.zoomIn(this);

    }

    zoomOut() {

        Timeline.zoomOut(this);

    }

    fitTimeline() {

        Timeline.fit(this);

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

        Timeline.destroy(this);

        Media.unload(this);

        Output.detachOutput(this);

    }

}
