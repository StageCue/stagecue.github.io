   // ==============================================
// StageCue Player Engine
// ==============================================

import Timeline from "./timeline/timeline.js";


export class Player {


    constructor() {


        // Preview video
        this.video =
            document.getElementById("preview");


        // Timeline root
        this.timelineRoot =
            document.getElementById("timeline");


        // UI
        this.seek =
            document.getElementById("seek");


        this.currentLabel =
            document.getElementById("current");


        this.durationLabel =
            document.getElementById("duration");


        this.overlay =
            document.getElementById("previewOverlay");



        // Data
        this.currentClip = null;


        this.videoURL = null;


        // External output
        this.output = null;


        // Timeline
        this.timeline = null;



        if (this.timelineRoot) {


            this.timeline =
                new Timeline({

                    root:this.timelineRoot,

                    video:this.video,

                    fps:30

                });


        }



        this.bindEvents();


    }





    // =====================================================
    // Events
    // =====================================================

    bindEvents() {



        this.video.addEventListener(
            "loadedmetadata",
            async () => {


                this.updateDuration();



                if (
                    this.timeline &&
                    this.currentClip
                ) {


                    try {


                        const source =
                            this.currentClip.file
                            ||
                            this.currentClip.url;


                        const isVideoSource =
                            (
                                source instanceof Blob &&
                                source.type?.startsWith("video/")
                            )
                            ||
                            (
                                typeof source === "string" &&
                                source.startsWith("blob:")
                            );


                        await this.timeline.load(source);


                    }


                    catch(err) {


                        console.error(
                            "Timeline error:",
                            err
                        );


                    }


                }


            }
        );





        this.video.addEventListener(
            "timeupdate",
            () => this.updateTime()
        );



        this.video.addEventListener(
            "play",
            () => this.syncOutput()
        );


        this.video.addEventListener(
            "pause",
            () => this.syncOutput()
        );


        this.video.addEventListener(
            "seeked",
            () => this.syncOutput()
        );





        this.seek.addEventListener(
            "input",
            () => {


                if (!this.video.duration)
                    return;



                this.seekTo(

                    (
                        this.seek.value /
                        100
                    )
                    *
                    this.video.duration

                );


            }
        );



    }







    // =====================================================
    // Media
    // =====================================================

    load(clip) {


        if (!clip)
            return;



        this.stop();



        this.currentClip =
            clip;



        //--------------------------------
        // Release old blob
        //--------------------------------

        if (this.videoURL) {


            URL.revokeObjectURL(
                this.videoURL
            );


            this.videoURL = null;

        }





        //--------------------------------
        // Local File
        //--------------------------------

        if (clip.file) {


            this.videoURL =
                URL.createObjectURL(
                    clip.file
                );


            this.video.src =
                this.videoURL;


        }



        //--------------------------------
        // URL
        //--------------------------------

        else {


            this.video.src =
                clip.url;


        }




        this.overlay.style.display =
            "none";



        this.video.load();



    }






    unload() {


        this.stop();



        this.video.removeAttribute(
            "src"
        );


        this.video.load();



        if (this.videoURL) {


            URL.revokeObjectURL(
                this.videoURL
            );


            this.videoURL = null;


        }



        this.currentClip =
            null;



        if (this.timeline) {


            this.timeline.waveform.clear();


            this.timeline.clearMarkers();


            this.timeline.clearSelection();


        }


    }







    // =====================================================
    // Playback
    // =====================================================

    async play() {


        try {


            await this.video.play();


        }


        catch(err) {


            console.warn(err);


        }


    }



    pause() {


        this.video.pause();


    }



    stop() {


        this.video.pause();


        this.video.currentTime =
            0;



        if (this.output) {


            this.output.pause();


            this.output.currentTime =
                0;


        }


    }




    toggle() {


        if (this.video.paused)

            this.play();

        else

            this.pause();


    }







    // =====================================================
    // Volume
    // =====================================================

    setVolume(value) {


        this.video.volume =
            value;


    }







    // =====================================================
    // Seek
    // =====================================================

    seekTo(seconds) {


        if (!this.video.duration)
            return;



        this.video.currentTime =
            Math.max(

                0,

                Math.min(

                    seconds,

                    this.video.duration

                )

            );


    }







    // =====================================================
    // UI
    // =====================================================

    updateTime() {


        this.currentLabel.textContent =
            this.format(
                this.video.currentTime
            );



        if (this.video.duration) {


            this.seek.value =

                (
                    this.video.currentTime /
                    this.video.duration
                )
                *
                100;


        }



        if (this.output) {


            this.output.currentTime =
                this.video.currentTime;


        }


    }




    updateDuration() {


        this.durationLabel.textContent =
            this.format(
                this.video.duration
            );


    }







    format(seconds) {


        if (isNaN(seconds))
            return "00:00";



        const m =
            Math.floor(
                seconds / 60
            );



        const s =
            Math.floor(
                seconds % 60
            );



        return (

            String(m)
                .padStart(2,"0")

            +

            ":"

            +

            String(s)
                .padStart(2,"0")

        );


    }







    // =====================================================
    // Output Window
    // =====================================================

    syncOutput() {


        if (!this.output)
            return;



        this.output.currentTime =
            this.video.currentTime;



        if (this.video.paused) {


            this.output.pause();


        }

        else {


            this.output.play()
                .catch(()=>{});


        }


    }





    attachOutput(videoElement) {


        this.output =
            videoElement;


        this.syncOutput();


    }







    // =====================================================
    // Timeline API
    // =====================================================

    addCue(
        name="Cue",
        color="#ff9800"
    ) {


        return this.timeline?.addMarker(

            this.video.currentTime,

            name,

            color

        );


    }



    zoomIn() {


        this.timeline?.zoomIn();


    }



    zoomOut() {


        this.timeline?.zoomOut();


    }



    fitTimeline() {


        this.timeline?.fit();


    }







    // =====================================================
    // Getters
    // =====================================================

    get currentTime() {


        return this.video.currentTime;


    }



    get duration() {


        return this.video.duration || 0;


    }



    get paused() {


        return this.video.paused;


    }







    // =====================================================
    // Cleanup
    // =====================================================

    destroy() {



        this.timeline?.destroy();



        if (this.videoURL) {


            URL.revokeObjectURL(
                this.videoURL
            );


        }



        this.stop();


    }


}
    


