// ==============================================
// StageCue Playlist Manager
// ==============================================

import { generateThumbnail } from "./thumbnails.js";
import { UI } from "./ui.js";

export class Playlist {

    formatDuration(seconds) {

        if (isNaN(seconds))
            return "--:--";

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h) {
            return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }

        return `${m}:${String(s).padStart(2, "0")}`;

    }

    constructor(player) {

        this.ui = new UI(this);

        this.player = player;

        this.items = [];

        this.currentIndex = -1;

        this.container = document.getElementById("playlist");

        this.counter = document.getElementById("playlistCount");

        this.loop = document.getElementById("loopPlaylist");

        this.bindEvents();

    }

    bindEvents() {

        document.addEventListener(
            "stagecue:ended",
            () => this.next()
        );

    }

    //-----------------------------------
    // Add files
    //-----------------------------------

    async addFiles(files) {

        for (const file of files) {

            if (!file.type.startsWith("video/"))
                continue;

            const clip = {

                id: crypto.randomUUID(),

                type: "video",

                name: file.name,

                file,

                // Player creates blob URLs when needed
                url: null,

                thumbnail: null,

                duration: null

            };

            this.items.push(clip);

            try {

                const result = await generateThumbnail(file);

                clip.thumbnail = result.thumbnail;

                clip.duration = this.formatDuration(result.duration);

            }
            catch (err) {

                console.error(err);

            }

        }

        this.ui.render();

        if (this.currentIndex === -1 && this.items.length) {

            this.select(0);

        }

    }

    //-----------------------------------
    // Select clip
    //-----------------------------------

    select(index) {

        if (index < 0) return;

        if (index >= this.items.length) return;

        this.currentIndex = index;

        this.player.load(this.items[index]);

        this.ui.render();

    }

    //-----------------------------------
    // Play selected clip
    //-----------------------------------

    play(index) {

        if (typeof index === "number") {

            this.select(index);

        }

        this.player.play();

    }

    //-----------------------------------
    // Next
    //-----------------------------------

    next() {

        if (!this.items.length)
            return;

        let next = this.currentIndex + 1;

        if (next >= this.items.length) {

            if (this.loop.checked)
                next = 0;
            else
                return;

        }

        this.play(next);

    }

    //-----------------------------------
    // Previous
    //-----------------------------------

    previous() {

        if (!this.items.length)
            return;

        let previous = this.currentIndex - 1;

        if (previous < 0)
            previous = 0;

        this.play(previous);

    }

    //-----------------------------------
    // Remove clip
    //-----------------------------------

    remove(index) {

        if (index < 0) return;

        if (index >= this.items.length) return;

        // Player owns blob URLs now.
        // Nothing to revoke here.

        this.items.splice(index, 1);

        if (this.currentIndex >= this.items.length)
            this.currentIndex = this.items.length - 1;

        this.ui.render();

    }

    //-----------------------------------
    // Clear
    //-----------------------------------

    clear() {

        // Player owns blob URLs.
        // Just remove playlist items.

        this.items = [];

        this.currentIndex = -1;

        this.ui.render();

    }

    //-----------------------------------
    // Render
    //-----------------------------------

    render() {

        this.counter.textContent = this.items.length;

        this.container.innerHTML = "";

        if (this.items.length === 0) {

            this.container.innerHTML = `
                <div class="emptyPlaylist">
                    Drop videos here
                </div>
            `;

            return;

        }

        this.items.forEach((clip, index) => {

            const div = document.createElement("div");

            div.draggable = true;
            div.dataset.index = index;

            div.className = "playlist-item";

            if (index === this.currentIndex) {
                div.classList.add("active");
            }

            div.innerHTML = `
                <div class="thumb">
                    ${clip.thumbnail ? `<img src="${clip.thumbnail}">` : ""}
                </div>

                <div class="info">
                    <div class="title">
                        ${clip.name}
                    </div>

                    <div class="meta">
                        ${clip.duration ?? "Generating thumbnail..."}
                    </div>
                </div>
            `;

            div.addEventListener("click", () => {
                this.select(index);
            });

            div.addEventListener("dblclick", () => {
                this.play(index);
            });

            div.addEventListener("dragstart", e => {

                e.dataTransfer.setData(
                    "text/plain",
                    index
                );

            });

            div.addEventListener("dragover", e => {

                e.preventDefault();

            });

            div.addEventListener("drop", e => {

                e.preventDefault();

                const from = Number(
                    e.dataTransfer.getData("text/plain")
                );

                const to = index;

                if (from === to)
                    return;

                const clip = this.items.splice(from, 1)[0];

                this.items.splice(to, 0, clip);

                if (this.currentIndex === from) {

                    this.currentIndex = to;

                }
                else if (
                    from < this.currentIndex &&
                    to >= this.currentIndex
                ) {

                    this.currentIndex--;

                }
                else if (
                    from > this.currentIndex &&
                    to <= this.currentIndex
                ) {

                    this.currentIndex++;

                }

                this.ui.render();

            });

            this.container.appendChild(div);

        });

    }

}
