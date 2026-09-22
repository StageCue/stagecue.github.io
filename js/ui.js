// ==============================================
// StageCue UI Manager
// ==============================================

export class UI {

    constructor(playlist) {

        this.playlist = playlist;

        this.container =
            document.getElementById("playlist");

    }

    render() {

        this.container.innerHTML = "";

        if (this.playlist.items.length === 0) {

            this.container.innerHTML = `
                <div class="emptyPlaylist">
                    Drop videos here
                </div>
            `;

            return;

        }

        this.playlist.items.forEach((clip, index) => {

            this.container.appendChild(

                this.createPlaylistItem(
                    clip,
                    index
                )

            );

        });

    }

    createPlaylistItem(clip, index) {

        const item = document.createElement("div");

        item.className = "playlist-item";

        if (index === this.playlist.currentIndex) {

            item.classList.add("active");

        }

        item.draggable = true;

        item.dataset.index = index;

        item.innerHTML = `

        <div class="thumb">

            ${
                clip.thumbnail
                ? `<img src="${clip.thumbnail}">`
                : ""
            }

        </div>

        <div class="info">

            <div class="title">

                ${clip.name}

            </div>

            <div class="meta">

                ${clip.duration || "--:--"}

            </div>

        </div>

        <div class="playlist-item__controls">
            <button data-action="up" title="Move up">↑</button>
            <button data-action="down" title="Move down">↓</button>
            <button data-action="play" title="Play">▶</button>
            <button data-action="remove" title="Remove">✕</button>
        </div>

        `;

        this.bindItemEvents(item, index);

        return item;

    }

    bindItemEvents(item, index) {

        item.onclick = (e) => {

            const actionEl = e.target.closest("[data-action]");

            if (actionEl) {

                const action = actionEl.dataset.action;

                if (action === "play") {

                    this.playlist.play(index);
                    return;

                }

                if (action === "up") {

                    this.playlist.move(index, -1);
                    return;

                }

                if (action === "down") {

                    this.playlist.move(index, 1);
                    return;

                }

                if (action === "remove") {

                    this.playlist.remove(index);
                    return;

                }

            }

            this.playlist.select(index);

        };

        item.ondblclick = () => {

            this.playlist.play(index);

        };

        item.oncontextmenu = e => {

            e.preventDefault();

            this.showContextMenu(
                e.clientX,
                e.clientY,
                index
            );

        };

    }

    //------------------------------------

    showContextMenu(x, y, index) {

        this.closeContextMenu();

        const menu = document.createElement("div");

        menu.className = "contextMenu";

        menu.style.left = x + "px";
        menu.style.top = y + "px";

        menu.innerHTML = `

            <div data-action="play">
                ▶ Play
            </div>

            <div data-action="up">
                ↑ Move Up
            </div>

            <div data-action="down">
                ↓ Move Down
            </div>

            <div data-action="remove">
                🗑 Remove
            </div>

        `;

        menu.onclick = e => {

            const action =
                e.target.dataset.action;

            switch(action){

                case "play":

                    this.playlist.play(index);

                    break;

                case "up":

                    this.playlist.move(index, -1);

                    break;

                case "down":

                    this.playlist.move(index, 1);

                    break;

                case "remove":

                    this.playlist.remove(index);

                    break;

            }

            this.closeContextMenu();

        };

        document.body.appendChild(menu);

        setTimeout(()=>{

            document.addEventListener(
                "click",
                () => this.closeContextMenu(),
                {once:true}
            );

        },10);

    }

    closeContextMenu(){

        document
            .querySelectorAll(".contextMenu")
            .forEach(m=>m.remove());

    }

}
