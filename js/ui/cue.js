// ==============================================
// StageCue
// Playlist Cue
// ==============================================

import { createCueHeader } from "./cue-header.js";
import { createCueControls } from "./cue-controls.js";
import { bindCueEvents } from "./cue-events.js";
import { enableCueDrag } from "./cue-drag.js";
import { CueMenu } from "./cue-menu.js";
import { CueStatus } from "./cue-status.js";

export class Cue {

    constructor(playlist, clip, index) {

        this.playlist = playlist;
        this.player = playlist.player;

        this.clip = clip;
        this.index = index;

        //----------------------------------
        // Default values
        //----------------------------------

        this.clip.expanded ??= false;

        //----------------------------------
        // Root
        //----------------------------------

        this.element = document.createElement("div");

        this.element.className = "playlist-item";

        this.element.draggable = true;
        this.element.dataset.index = index;

        if (index === playlist.currentIndex) {

            this.element.classList.add("active");

        }

        //----------------------------------
        // Header
        //----------------------------------

        this.header =
            createCueHeader(this);

        this.element.appendChild(
            this.header
        );

        //----------------------------------
        // Status
        //----------------------------------

        this.status =
            new CueStatus(this);

        this.element.appendChild(
            this.status.element
        );

        //----------------------------------
        // Controls
        //----------------------------------

        this.controls =
            createCueControls(this);

        this.element.appendChild(
            this.controls
        );

        //----------------------------------
        // Expanded
        //----------------------------------

        this.controls.hidden =
            !this.clip.expanded;

        this.element.classList.toggle(
            "expanded",
            this.clip.expanded
        );

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
    // Expand
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
    // Activate
    //----------------------------------

    activate() {

        this.player.setCurrentCue(this);

    }

    //----------------------------------
    // Select
    //----------------------------------

    select() {

        this.playlist.select(
            this.index
        );

        this.activate();

    }

    //----------------------------------
    // Play
    //----------------------------------

    play() {

        this.select();

        this.player.play();

    }

    //----------------------------------
    // Pause
    //----------------------------------

    pause() {

        this.player.pause();

    }

    //----------------------------------
    // Stop
    //----------------------------------

    stop() {

        this.player.stop();

    }

    //----------------------------------
    // Preview
    //----------------------------------

    preview() {

        this.select();

        this.player.play();

    }

    //----------------------------------
    // Remove
    //----------------------------------

    remove() {

        this.playlist.remove(
            this.index
        );

    }

    //----------------------------------
    // Refresh
    //----------------------------------

    refresh() {

        this.status.refresh();

    }

}
