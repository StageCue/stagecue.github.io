 // ==============================================
// StageCue Output Window
// External Monitor Output
// ==============================================

export class OutputWindow {

    constructor(player) {

        this.player = player;

        this.window = null;

        this.video = null;

    }


    // =============================================
    // Open Output Window
    // =============================================

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



#live {

    position:fixed;

    top:20px;

    right:20px;

    background:#d82f2f;

    color:white;

    padding:8px 14px;

    font-family:Segoe UI, sans-serif;

    border-radius:20px;

    font-size:12px;

    opacity:.75;

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
    // =============================================
    // Initialize Output Video
    // =============================================

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



            // Connect Player
            this.player.attachOutput(
                this.video
            );



            // Cleanup if popup closes

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

                {
                    once:true
                }

            );


        }


    }





    // =============================================
    // Fullscreen
    // =============================================

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





    // =============================================
    // Black Screen
    // =============================================

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
    // =============================================
    // Close Output Window
    // =============================================

    close() {


        if (!this.window)
            return;



        this.player.detachOutput();



        this.window.close();



        this.window = null;



        this.video = null;


    }





    // =============================================
    // Check State
    // =============================================

    isOpen() {


        return !!(

            this.window &&

            !this.window.closed

        );


    }


}
