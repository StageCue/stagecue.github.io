// ==============================================
// StageCue
// UI Manager
// ==============================================

import { Cue } from "./cue.js";

export class UI {

    constructor(playlist) {

        this.playlist = playlist;

        this.container =
            document.getElementById("playlist");

    }

    //-----------------------------------------
    // Render Playlist
    //-----------------------------------------

    render() {

        if (!this.container)
            return;

        this.container.innerHTML = "";

        if (!this.playlist.items.length) {

            this.container.innerHTML = `

                <div class="emptyPlaylist">

                    <div class="emptyIcon">
                        🎬
                    </div>

                    <div class="emptyTitle">
                        No Media
                    </div>

                    <div class="emptySubtitle">
                        Drop videos here or click Open
                    </div>

                </div>

            `;

            return;

        }

        const fragment =
            document.createDocumentFragment();

        this.playlist.items.forEach((clip, index) => {

            const cue =
                new Cue(
                    this.playlist,
                    clip,
                    index
                );

            fragment.appendChild(
                cue.element
            );

        });

        this.container.appendChild(
            fragment
        );

        this.updateCounter();

    }

    //-----------------------------------------
    // Counter
    //-----------------------------------------

    updateCounter() {

        if (!this.playlist.counter)
            return;

        this.playlist.counter.textContent =
            this.playlist.items.length;

    }

    //-----------------------------------------
    // Refresh only
    //-----------------------------------------

    refresh() {

        this.render();

    }

}
