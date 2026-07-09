// ==============================================
// StageCue Playlist Manager
// ==============================================

import { generateThumbnail } from "./thumbnails.js";

export class Playlist {

    constructor(player) {

        this.player = player;

        this.items = [];

        this.currentIndex = -1;

        this.container =
            document.getElementById("playlist");

        this.counter =
            document.getElementById("playlistCount");

        this.loop =
            document.getElementById("loopPlaylist");

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

    addFiles(files) {

       const clip = {

    id: crypto.randomUUID(),

    name: file.name,

    file,

    url: URL.createObjectURL(file),

    thumbnail: null,

    duration: null

};

this.items.push(clip);

generateThumbnail(file)
    .then(result => {

        clip.thumbnail = result.thumbnail;

        clip.duration =
            this.formatDuration(
                result.duration
            );

        this.render();

    });

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

        const clip = this.items[index];

        this.player.load(clip);

        this.render();

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

        URL.revokeObjectURL(
            this.items[index].url
        );

        this.items.splice(index,1);

        if (this.currentIndex >= this.items.length)
            this.currentIndex = this.items.length-1;

        this.render();

    }

    //-----------------------------------
    // Clear
    //-----------------------------------

    clear() {

        this.items.forEach(item => {

            URL.revokeObjectURL(item.url);

        });

        this.items=[];

        this.currentIndex=-1;

        this.render();

    }

    //-----------------------------------
    // Render
    //-----------------------------------

    render() {

        this.counter.textContent =
            this.items.length;

        this.container.innerHTML="";

        if(this.items.length===0){

            this.container.innerHTML=`

            <div class="emptyPlaylist">

                Drop videos here

            </div>

            `;

            return;

        }

        this.items.forEach((clip,index)=>{

            const div=document.createElement("div");

            div.draggable = true;
            div.dataset.index = index;

            div.className="playlist-item";

            if(index===this.currentIndex){

                div.classList.add("active");

            }

            div.innerHTML=`

            <div class="thumb"></div>

            <div class="info">

                <div class="title">

                    ${clip.name}

                </div>

                <div class="meta">

                    ${clip.duration || "Loading..."}

                </div>

            </div>

            `;

            div.addEventListener("dblclick",()=>{

                this.play(index);

            });

            div.addEventListener("click",()=>{

                this.select(index);

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

    const clip = this.items.splice(from,1)[0];

    this.items.splice(to,0,clip);

    if(this.currentIndex===from){

        this.currentIndex=to;

    }

    this.render();

});

            this.container.appendChild(div);

        });

    }

}
