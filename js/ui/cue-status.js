// ==============================================
// StageCue
// Cue Status
// ==============================================

export class CueStatus {

    constructor(cue) {

        this.cue = cue;

        this.element =
            document.createElement("div");

        this.element.className =
            "cue-status";

        this.element.innerHTML = `

            <div class="cue-progress">

                <div class="cue-progress-fill"></div>

            </div>

            <div class="cue-status-bar">

                <span class="cue-state ready">
                    READY
                </span>

                <span class="cue-flags">

                </span>

                <span class="cue-time">
                    00:00 / 00:00
                </span>

            </div>

        `;

        this.progress =
            this.element.querySelector(
                ".cue-progress-fill"
            );

        this.state =
            this.element.querySelector(
                ".cue-state"
            );

        this.flags =
            this.element.querySelector(
                ".cue-flags"
            );

        this.time =
            this.element.querySelector(
                ".cue-time"
            );

        this.refresh();

    }

    //----------------------------------
    // Refresh
    //----------------------------------

    refresh() {

        const clip =
            this.cue.clip;

        const flags = [];

        if (
            clip.settings?.playback?.loop
        ) {

            flags.push("🔁 Loop");

        }

        if (
            clip.settings?.transition?.fadeIn
        ) {

            flags.push("🌅 Fade In");

        }

        if (
            clip.settings?.transition?.fadeOut
        ) {

            flags.push("🌇 Fade Out");

        }

        if (
            clip.settings?.playback?.holdLastFrame
        ) {

            flags.push("🖼 Hold");

        }

        this.flags.textContent =
            flags.join("   ");

        this.time.textContent =
            `00:00 / ${clip.durationLabel ?? "--:--"}`;

    }

    //----------------------------------
    // State
    //----------------------------------

    setState(state) {

        this.state.className =
            "cue-state";

        switch (state) {

            case "playing":

                this.state.textContent =
                    "PLAYING";

                this.state.classList.add(
                    "playing"
                );

                break;

            case "paused":

                this.state.textContent =
                    "PAUSED";

                this.state.classList.add(
                    "paused"
                );

                break;

            case "done":

                this.state.textContent =
                    "DONE";

                this.state.classList.add(
                    "done"
                );

                break;

            default:

                this.state.textContent =
                    "READY";

                this.state.classList.add(
                    "ready"
                );

        }

    }

    //----------------------------------
    // Progress
    //----------------------------------

    setProgress(current, duration) {

        if (!duration)
            return;

        const percent =
            (current / duration) * 100;

        this.progress.style.width =
            `${percent}%`;

        this.time.textContent =
            `${this.format(current)} / ${this.format(duration)}`;

    }

    //----------------------------------
    // Format
    //----------------------------------

    format(seconds) {

        const m =
            Math.floor(seconds / 60);

        const s =
            Math.floor(seconds % 60);

        return `${m}:${String(s).padStart(2, "0")}`;

    }

}
