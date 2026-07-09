// ==============================================
// StageCue Player Engine
// ==============================================

export class Player {

    constructor() {

        this.video = document.getElementById("preview");

        this.seek = document.getElementById("seek");

        this.currentLabel =
            document.getElementById("current");

        this.durationLabel =
            document.getElementById("duration");

        this.overlay =
            document.getElementById("previewOverlay");

        this.currentClip = null;

        this.output = null;

        this.bindEvents();
    }

    bindEvents() {

        this.video.addEventListener(
            "loadedmetadata",
            () => this.updateDuration()
        );

        this.video.addEventListener(
            "timeupdate",
            () => this.updateTime()
        );

        this.video.addEventListener(
            "ended",
            () => {

                document.dispatchEvent(
                    new CustomEvent("stagecue:ended")
                );

            }
        );

        this.seek.addEventListener(
            "input",
            () => {

                if (!this.video.duration) return;

                this.video.currentTime =
                    (this.seek.value / 100) *
                    this.video.duration;

                this.syncOutput();

            }
        );

    }

    load(clip) {

        if (!clip) return;

        this.currentClip = clip;

        this.video.src = clip.url;

        this.overlay.style.display = "none";

        this.video.load();

        this.syncOutput();

    }

    play() {

        this.video.play();

        this.syncOutput();

    }

    pause() {

        this.video.pause();

        this.syncOutput();

    }

    stop() {

        this.video.pause();

        this.video.currentTime = 0;

        this.syncOutput();

    }

    toggle() {

        if (this.video.paused)
            this.play();
        else
            this.pause();

    }

    setVolume(value) {

        this.video.volume = value;

        if (this.output)
            this.output.volume = value;

    }

    seekTo(seconds) {

        this.video.currentTime = seconds;

        this.syncOutput();

    }

    updateTime() {

        this.currentLabel.textContent =
            this.format(this.video.currentTime);

        if (this.video.duration) {

            this.seek.value =
                (this.video.currentTime /
                    this.video.duration) * 100;

        }

        if (this.output) {

            this.output.currentTime =
                this.video.currentTime;

        }

    }

    updateDuration() {

        this.durationLabel.textContent =
            this.format(this.video.duration);

    }

    format(seconds) {

        if (isNaN(seconds))
            return "00:00";

        const h = Math.floor(seconds / 3600);

        const m = Math.floor(
            (seconds % 3600) / 60
        );

        const s = Math.floor(seconds % 60);

        if (h > 0) {

            return (
                String(h).padStart(2, "0") +
                ":" +
                String(m).padStart(2, "0") +
                ":" +
                String(s).padStart(2, "0")
            );

        }

        return (
            String(m).padStart(2, "0") +
            ":" +
            String(s).padStart(2, "0")
        );

    }

    syncOutput() {

        if (!this.output) return;

        if (this.output.src !== this.video.src) {

            this.output.src = this.video.src;

        }

        this.output.currentTime =
            this.video.currentTime;

        if (this.video.paused)
            this.output.pause();
        else
            this.output.play();

    }

    attachOutput(videoElement) {

        this.output = videoElement;

    }

}
