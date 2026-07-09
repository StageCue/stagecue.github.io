// ==============================================
// StageCue
// Application Entry Point
// ==============================================

import { Storage } from "./storage.js";
import { Playlist } from "./playlist.js";
import { Player } from "./player.js";
import { OutputWindow } from "./output.js";
import { enableDragDrop } from "./dragdrop.js";
import { registerShortcuts } from "./shortcuts.js";

class StageCue {

    constructor(){

        this.storage = new Storage(this.playlist);

        this.player = new Player();

        this.playlist = new Playlist(this.player);

        this.output = new OutputWindow(this.player);

    }

    init(){

        console.log("StageCue starting...");

        this.bindToolbar();

        this.bindTransport();

        enableDragDrop(this.playlist);

        registerShortcuts(this);

    }

    bindToolbar(){

        document
            .getElementById("openFiles")
            .onclick = () =>
                document
                    .getElementById("filePicker")
                    .click();

        document
            .getElementById("filePicker")
            .addEventListener("change", e => {

                this.playlist.addFiles(
                    [...e.target.files]
                );

            });

        document
            .getElementById("outputWindow")
            .onclick = () =>
                this.output.open();

        document
            .getElementById("fullscreen")
            .onclick = () =>
                this.output.fullscreen();

    }

    bindTransport(){

        document
            .getElementById("play")
            .onclick =
                () => this.player.play();

        document
            .getElementById("pause")
            .onclick =
                () => this.player.pause();

        document
            .getElementById("stop")
            .onclick =
                () => this.player.stop();

        document
            .getElementById("next")
            .onclick =
                () => this.playlist.next();

        document
            .getElementById("previous")
            .onclick =
                () => this.playlist.previous();

        document
            .getElementById("volume")
            .addEventListener("input", e=>{

                this.player.setVolume(e.target.value);

            });

    }

}

window.addEventListener("DOMContentLoaded",()=>{

    window.stageCue = new StageCue();

    window.stageCue.init();

});
