// ==============================================
// StageCue
// Cue Context Menu
// ==============================================

export class CueMenu {

    constructor(cue) {

        this.cue = cue;

        this.menu = null;

    }

    //-----------------------------------------
    // Show
    //-----------------------------------------

    show(x, y) {

        this.close();

        this.menu =
            document.createElement("div");

        this.menu.className =
            "cue-menu";

        this.menu.style.left =
            `${x}px`;

        this.menu.style.top =
            `${y}px`;

        this.menu.innerHTML = `

            <button data-action="play">

                ▶ Play

            </button>

            <button data-action="preview">

                👁 Preview

            </button>

            <button data-action="duplicate">

                📄 Duplicate

            </button>

            <hr>

            <button data-action="expand">

                ${this.cue.clip.expanded ? "▲ Collapse" : "▼ Expand"}

            </button>

            <button data-action="remove">

                🗑 Remove

            </button>

        `;

        this.bind();

        document.body.appendChild(
            this.menu
        );

        setTimeout(() => {

            document.addEventListener(

                "click",

                () => this.close(),

                { once: true }

            );

        }, 10);

    }

    //-----------------------------------------
    // Bind
    //-----------------------------------------

    bind() {

        this.menu.addEventListener("click", e => {

            const button =
                e.target.closest("button");

            if (!button)
                return;

            const action =
                button.dataset.action;

            switch (action) {

                case "play":

                    this.cue.play();

                    break;

                case "preview":

                    this.cue.select();

                    this.cue.player.play();

                    break;

                case "duplicate":

                    this.duplicate();

                    break;

                case "expand":

                    this.cue.toggle();

                    break;

                case "remove":

                    this.cue.remove();

                    break;

            }

            this.close();

        });

    }

    //-----------------------------------------
    // Duplicate Cue
    //-----------------------------------------

    duplicate() {

        const playlist =
            this.cue.playlist;

        const original =
            this.cue.clip;

        const copy =
            structuredClone(original);

        copy.id =
            crypto.randomUUID();

        playlist.items.splice(

            this.cue.index + 1,

            0,

            copy

        );

        playlist.ui.render();

    }

    //-----------------------------------------
    // Close
    //-----------------------------------------

    close() {

        if (!this.menu)
            return;

        this.menu.remove();

        this.menu = null;

    }

}
