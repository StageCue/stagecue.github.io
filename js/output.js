// ==============================================
// StageCue
// Output Window
// ==============================================

export class OutputWindow {

    constructor(player) {

        this.player = player;

        this.window = null;

        this.video = null;

        this.settings = {
            zoom: 100,
            crop: 0,
            offsetX: 0,
            offsetY: 0
        };

    }

    open() {

        if (
            this.window &&
            !this.window.closed
        ) {

            this.window.focus();
            return;

        }

        this.window = window.open(
            "",
            "StageCueOutput",
            "popup,width=1280,height=720"
        );

        if (!this.window)
            return;

        this.window.document.write(`

<!DOCTYPE html>
<html>
<head>
<title>
StageCue Output
</title>

<style>

html,
body {

    margin:0;

    width:100%;

    height:100%;

    background:black;

    overflow:hidden;

    cursor:none;

}

video {

    width:100vw;

    height:100vh;

    object-fit:contain;

    background:black;

    transform-origin:center center;

}

#black {

    position:fixed;

    left:0;

    top:0;

    width:100%;

    height:100%;

    background:black;

    display:none;

    z-index:9999;

}

</style>

</head>

<body>

<div id="black"></div>

<video

autoplay

playsinline

>

</video>

</body>

</html>

        `);

        this.window.document.close();

        this.initVideo();

    }

    applyVideoAdjustments() {

        if (!this.video)
            return;

        const crop = this.settings.crop / 100;
        const scale = this.settings.zoom / 100;

        this.video.style.objectFit = "contain";
        this.video.style.transform = `scale(${scale})`;
        this.video.style.objectPosition = `${this.settings.offsetX}% ${this.settings.offsetY}%`;
        this.video.style.clipPath = `inset(${crop * 50}% ${crop * 50}% ${crop * 50}% ${crop * 50}%)`;

        if (this.player.output) {

            this.player.output.style.objectFit = this.video.style.objectFit;
            this.player.output.style.transform = this.video.style.transform;
            this.player.output.style.objectPosition = this.video.style.objectPosition;
            this.player.output.style.clipPath = this.video.style.clipPath;

        }

    }

    initVideo() {

        const init = () => {

            if (
                !this.window ||
                this.window.closed
            )
                return;

            this.video =
                this.window.document
                    .querySelector("video");

            if (!this.video)
                return;

            this.player.attachOutput(this.video);
            this.applyVideoAdjustments();

            this.window.addEventListener(
                "beforeunload",

                () => {
                    this.player.detachOutput();
                    this.video = null;
                }
            );

        };

        if (
            this.window.document.readyState ===
            "complete"
        ) {

            init();

        }
        else {

            this.window.addEventListener(
                "load",
                init,
                {once:true}
            );

        }

    }

    setAdjustment(key, value) {

        this.settings[key] = value;
        this.applyVideoAdjustments();

    }

    resetAdjustments() {

        this.settings = {
            zoom: 100,
            crop: 0,
            offsetX: 0,
            offsetY: 0
        };

        this.applyVideoAdjustments();

    }

    fullscreen() {

        if (
            !this.window ||
            this.window.closed
        )
            return;

        const element =
            this.window.document
                .documentElement;

        if (
            element.requestFullscreen
        ) {
            element.requestFullscreen();
        }

    }

    black(enable = true) {

        if (
            !this.window ||
            this.window.closed
        )
            return;

        const black =
            this.window.document
                .getElementById(
                    "black"
                );

        if (!black)
            return;

        black.style.display =
            enable
                ? "block"
                : "none";

    }

    close() {

        if (!this.window)
            return;

        this.player.detachOutput();
        this.window.close();
        this.window = null;
        this.video = null;

    }

    isOpen() {

        return !!(
            this.window &&
            !this.window.closed
        );

    }

}
