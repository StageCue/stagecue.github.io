// ==============================================
// StageCue
// Cue Header
// ==============================================

export function createCueHeader(cue) {

    const clip = cue.clip;

    const header =
        document.createElement("div");

    header.className =
        "cue-header";

    header.innerHTML = `

        <div class="cue-thumb">

            ${
                clip.thumbnail
                    ? `<img src="${clip.thumbnail}" draggable="false">`
                    : `<div class="cue-thumb-placeholder">🎬</div>`
            }

        </div>

        <div class="cue-info">

            <div class="cue-title">

                ${clip.name}

            </div>

            <div class="cue-meta">

                ${clip.durationLabel ?? "--:--"}

            </div>

        </div>

        <div class="cue-toolbar">

            <button
                class="cue-btn cue-play"
                title="Play">
                ▶
            </button>

            <button
                class="cue-btn cue-preview"
                title="Preview">
                👁
            </button>

            <button
                class="cue-btn cue-expand"
                title="Settings">

                ${clip.expanded ? "▲" : "▼"}

            </button>

        </div>

    `;

    // Store references so cue-events.js
    // doesn't need to search the DOM.

    cue.playButton =
        header.querySelector(".cue-play");

    cue.previewButton =
        header.querySelector(".cue-preview");

    cue.expandButton =
        header.querySelector(".cue-expand");

    cue.infoElement =
        header.querySelector(".cue-info");

    return header;

}
