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

        this.video = document.getElementById("preview");
        this.timelineRoot = document.getElementById("timeline");
        this.timeline = null;

        this.seek = document.getElementById("seek");
        this.currentLabel = document.getElementById("current");
        this.durationLabel = document.getElementById("duration");
        this.overlay = document.getElementById("previewOverlay");

        this.currentClip = null;
        this.currentCue = null;
        this.videoURL = null;
        this.output = null;

        if (this.timelineRoot) {

            this.timeline = new Timeline({
                root: this.timelineRoot,
                video: this.video,
                fps: 30
            });

        }

        Events.bind(this);

    }

    updateTime() {
        UI.updateTime(this);
    }

    updateDuration() {
        UI.updateDuration(this);
    }

    format(seconds) {
        return UI.format(seconds);
    }

    setCurrentCue(cue) {
        this.currentCue = cue;
    }

    load(clip) {
        Media.load(this, clip);
    }

    unload() {
        Media.unload(this);
    }

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
        Playback.seekTo(this, seconds);
    }

    setVolume(value) {
        Playback.setVolume(this, value);
    }

    setPlaybackRate(rate) {
        Playback.setPlaybackRate(this, rate);
    }

    attachOutput(video) {
        Output.attachOutput(this, video);
    }

    syncOutput() {
        Output.syncOutput(this);
    }

    detachOutput() {
        Output.detachOutput(this);
    }

    addCue(name = "Cue", color = "#ff9800") {

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

    get currentTime() {
        return this.video?.currentTime || 0;
    }

    get duration() {
        return this.video?.duration || 0;
    }

    get paused() {
        return this.video?.paused ?? true;
    }

    destroy() {
        this.timeline?.destroy();
        Media.unload(this);
        Output.detachOutput(this);
    }

}
