// ==============================================
// StageCue Output Window
// ==============================================

export class OutputWindow {

    constructor(player) {

        this.player = player;

        this.window = null;
        this.video = null;

    }

    //---------------------------------
    // Open Output Window
    //---------------------------------

    open() {

        if (this.window && !this.window.closed) {

            this.window.focus();

            return;

        }

        this.window = window.open(
            "",
            "StageCueOutput",
            "popup,width=1280,height=720"
        );

        this.window.document.write(`
<!DOCTYPE html>
<html>
<head>

<title>StageCue Output</title>

<style>

html,body{

margin:0;
width:100%;
height:100%;

background:black;

overflow:hidden;

cursor:none;

}

video{

width:100vw;
height:100vh;

object-fit:contain;

background:black;

}

#black{

position:fixed;

left:0;
top:0;

width:100%;
height:100%;

background:black;

display:none;

z-index:9999;

}

#live{

position:fixed;

top:20px;
right:20px;

background:#d82f2f;

color:white;

padding:8px 14px;

font-family:Segoe UI;

border-radius:20px;

font-size:12px;

opacity:.75;

}

</style>

</head>

<body>

<div id="black"></div>

<div id="live">

LIVE OUTPUT

</div>

<video autoplay playsinline></video>

</body>

</html>
        `);

        this.window.document.close();

        this.video =
            this.window.document.querySelector("video");

        this.player.attachOutput(this.video);

    }

    //---------------------------------
    // Fullscreen
    //---------------------------------

    fullscreen() {

        if (!this.window)
            return;

        const doc = this.window.document;

        const el = doc.documentElement;

        if (el.requestFullscreen)
            el.requestFullscreen();

    }

    //---------------------------------
    // Black Screen
    //---------------------------------

    black(enable = true) {

        if (!this.window)
            return;

        const black =
            this.window.document.getElementById("black");

        black.style.display =
            enable ? "block" : "none";

    }

    //---------------------------------
    // Close
    //---------------------------------

    close() {

        if (!this.window)
            return;

        this.window.close();

        this.window = null;

        this.video = null;

    }

    //---------------------------------
    // Is Open
    //---------------------------------

    isOpen() {

        return this.window &&
               !this.window.closed;

    }

}
