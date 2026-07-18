// ==============================================
// StageCue
// Playlist Cue
// ==============================================

import { createCueHeader } from "./cue-header.js";
import { createCueControls } from "./cue-controls.js";
import { bindCueEvents } from "./cue-events.js";
import { enableCueDrag } from "./cue-drag.js";
import { CueMenu } from "./cue-menu.js";

export class Cue {

    constructor(playlist, clip, index) {

        this.playlist = playlist;
        this.player = playlist.player;

        this.clip = clip;
        this.index = index;

        // Root element

        this.element = document.createElement("div");

        this.element.className = "playlist-item";

        if (index === playlist.currentIndex) {

            this.element.classList.add("active");

        }

        this.element.draggable = true;
        this.element.dataset.index = index;

        //----------------------------------
        // Header
        //----------------------------------

        this.header =
            createCueHeader(this);

        this.element.appendChild(
            this.header
        );

        //----------------------------------
        // Controls
        //----------------------------------

        this.controls =
            createCueControls(this);

        this.element.appendChild(
            this.controls
        );

        if (!clip.expanded) {

            this.controls.hidden = true;

        } else {

            this.element.classList.add("expanded");

        }

        //----------------------------------
        // Events
        //----------------------------------

        bindCueEvents(this);

        //----------------------------------
        // Drag & Drop
        //----------------------------------

        enableCueDrag(this);

        //----------------------------------
        // Context Menu
        //----------------------------------

        this.menu =
            new CueMenu(this);

        this.element.addEventListener(
            "contextmenu",
            e => {

                e.preventDefault();

                this.menu.show(
                    e.clientX,
                    e.clientY
                );

            }
        );

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

        if (this.expandButton) {

            this.expandButton.textContent =
                this.clip.expanded
                    ? "▲"
                    : "▼";

        }

    }

    //----------------------------------
    // Select Cue
    //----------------------------------

    select() {

        this.playlist.select(
            this.index
        );

    }

    //----------------------------------
    // Play Cue
    //----------------------------------

    play() {

        this.playlist.play(
            this.index
        );

    }

    //----------------------------------
    // Preview Cue
    //----------------------------------

    preview() {

        this.select();

        this.player.play();

    }

    //----------------------------------
    // Remove Cue
    //----------------------------------

    remove() {

        this.playlist.remove(
            this.index
        );

    }

}
