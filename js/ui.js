// ==============================================
// StageCue UI Manager
// ==============================================

export class UI {
    constructor(playlist) {
        this.playlist = playlist;
        this.container = document.getElementById("playlist");
        this.createOutputControls();
    }

    render() {
        this.container.innerHTML = "";
        if (!this.playlist.items.length) {
            this.container.innerHTML = `<div class="emptyPlaylist">Drop videos here</div>`;
            return;
        }
        this.playlist.items.forEach((clip, index) => this.container.appendChild(this.createPlaylistItem(clip, index)));
    }

    createPlaylistItem(clip, index) {
        const item = document.createElement("div");
        item.className = "playlist-item";
        if (index === this.playlist.currentIndex) item.classList.add("active");
        item.draggable = true;
        item.dataset.index = index;
        item.innerHTML = `
            <div class="thumb">${clip.thumbnail ? `<img src="${clip.thumbnail}">` : ""}</div>
            <div class="info"><div class="title">${clip.name}</div><div class="meta">${clip.duration || "--:--"}</div></div>
            <div class="playlist-item__controls">
                <button data-action="up" title="Move up">↑</button>
                <button data-action="down" title="Move down">↓</button>
                <button data-action="play" title="Play">▶</button>
                <button data-action="remove" title="Remove">✕</button>
            </div>`;
        this.bindItemEvents(item, index);
        return item;
    }

    bindItemEvents(item, index) {
        item.onclick = event => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "play") return this.playlist.play(index);
            if (action === "up") return this.playlist.move(index, -1);
            if (action === "down") return this.playlist.move(index, 1);
            if (action === "remove") return this.playlist.remove(index);
            this.playlist.select(index);
        };
        item.ondblclick = () => this.playlist.play(index);
        item.oncontextmenu = event => {
            event.preventDefault();
            this.showContextMenu(event.clientX, event.clientY, index);
        };
    }

    showContextMenu(x, y, index) {
        this.closeContextMenu();
        const menu = document.createElement("div");
        menu.className = "contextMenu";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.innerHTML = `<div data-action="play">▶ Play</div><div data-action="up">↑ Move Up</div><div data-action="down">↓ Move Down</div><div data-action="remove">🗑 Remove</div>`;
        menu.onclick = event => {
            const action = event.target.dataset.action;
            if (action === "play") this.playlist.play(index);
            if (action === "up") this.playlist.move(index, -1);
            if (action === "down") this.playlist.move(index, 1);
            if (action === "remove") this.playlist.remove(index);
            this.closeContextMenu();
        };
        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener("click", () => this.closeContextMenu(), { once:true }), 10);
    }

    closeContextMenu() { document.querySelectorAll(".contextMenu").forEach(menu => menu.remove()); }

    createOutputControls() {
        const panel = document.createElement("section");
        panel.id = "outputAdjustments";
        panel.className = "output-adjustments";
        panel.innerHTML = `<div class="output-adjustments__header">Output</div>
            <div class="output-adjustments__group"><label>Crop<input data-output="crop" type="range" min="0" max="100" value="0"></label><label>Zoom<input data-output="zoom" type="range" min="80" max="200" value="100"></label></div>
            <div class="output-adjustments__group"><label>Offset X<input data-output="offsetX" type="range" min="-50" max="50" value="0"></label><label>Offset Y<input data-output="offsetY" type="range" min="-50" max="50" value="0"></label></div>
            <div class="output-adjustments__actions"><button data-output-reset type="button">Reset</button></div>`;
        document.getElementById("playlistPanel")?.appendChild(panel);
        const settings = { crop:0, zoom:100, offsetX:0, offsetY:0 };
        const apply = () => {
            const output = window.stageCue?.player?.output;
            if (!output) return;
            const crop = settings.crop / 100;
            output.style.transform = `scale(${settings.zoom / 100})`;
            output.style.transformOrigin = "center center";
            output.style.objectPosition = `${settings.offsetX}% ${settings.offsetY}%`;
            output.style.clipPath = `inset(${crop * 50}% ${crop * 50}% ${crop * 50}% ${crop * 50}%)`;
        };
        panel.querySelectorAll("[data-output]").forEach(input => input.addEventListener("input", event => {
            settings[event.target.dataset.output] = Number(event.target.value);
            apply();
        }));
        panel.querySelector("[data-output-reset]").onclick = () => {
            Object.assign(settings, { crop:0, zoom:100, offsetX:0, offsetY:0 });
            panel.querySelectorAll("[data-output]").forEach(input => input.value = settings[input.dataset.output]);
            apply();
        };
    }
}
