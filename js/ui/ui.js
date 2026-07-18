// ==============================================
// StageCue UI Manager
// ==============================================

import { Cue } from "./cue.js";
import { ContextMenu } from "./context-menu.js";

export class UI {

    constructor(playlist) {

        this.playlist = playlist;

        this.container =
            document.getElementById("playlist");

        this.context =
            new ContextMenu(playlist);

    }

    //-----------------------------------

    render() {

        this.container.innerHTML = "";

        if (!this.playlist.items.length) {

            this.container.innerHTML = `
                <div class="emptyPlaylist">
                    Drop videos here
                </div>
            `;

            return;

        }

        this.playlist.items.forEach((clip, index) => {

            const cue = new Cue(

                this.playlist,

                clip,

                index

            );

            this.container.appendChild(

                cue.element

            );

        });

    }

}
