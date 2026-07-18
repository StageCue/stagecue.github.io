// ==============================================
// StageCue
// Playlist Cue
// ==============================================

import { createCueHeader } from "./cue-header.js";
import { createCueControls } from "./cue-controls.js";
import { bindCueEvents } from "./cue-events.js";
import { enableCueDrag } from "./cue-drag.js";

export class Cue {

    constructor(playlist, clip, index) {

        this.playlist = playlist;
        this.player = playlist.player;

        this.clip = clip;
        this.index = index;

        this.element =
            document.createElement("div");

        this.element.className =
            "playlist-item";

        if (index === playlist.currentIndex) {

            this.element.classList.add("active");

        }

        this.element.draggable = true;

        this.element.dataset.index = index;

        // -----------------------------
        // Header
        // -----------------------------

        this.header =
            createCueHeader(this);

        this.element.appendChild(
            this.header
        );

        // -----------------------------
        // Controls
        // -----------------------------

        this.controls =
            createCueControls(this);

        this.element.appendChild(
            this.controls
        );

        // Hide controls until expanded

        if (!clip.expanded) {

            this.controls.hidden = true;

        }

        // -----------------------------
        // Events
        // -----------------------------

        bindCueEvents(this);

        // -----------------------------
        // Drag & Drop
        // -----------------------------

        enableCueDrag(this);

    }

    //----------------------------------
    // Expand / Collapse
    //----------------------------------

    toggle() {

        this.clip.expanded =
            !this.clip.expanded;

        this.controls.hidden =
            !this.clip.expanded;

        this.element.classList.toggle(
            "expanded",
            this.clip.expanded
        );

    }

    //----------------------------------
    // Select
    //----------------------------------

    select() {

        this.playlist.select(
            this.index
        );

    }

    //----------------------------------
    // Play
    //----------------------------------

    play() {

        this.playlist.play(
            this.index
        );

    }

    //----------------------------------
    // Remove
    //----------------------------------

    remove() {

        this.playlist.remove(
            this.index
        );

    }

}
