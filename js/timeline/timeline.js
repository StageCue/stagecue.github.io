// ==========================================================
// StageCue Timeline
// Main controller
// ==========================================================

import Renderer from "./renderer.js";
import Events from "./events.js";

import Zoom from "./zoom.js";
import Scroll from "./scroll.js";

import Playhead from "./playhead.js";
import Markers from "./markers.js";
import Selection from "./selection.js";

import Ruler from "./ruler.js";
import Waveform from "./waveform.js";
import Spectrum from "./spectrum.js";


export default class Timeline {


    constructor({

        root,
        video,
        fps = 30

    }) {


        if (!root)
            throw new Error(
                "Timeline root missing."
            );


        if (!video)
            throw new Error(
                "Video element missing."
            );


        this.root = root;
        this.video = video;

        this.fps = fps;


        //------------------------------------------
        // Core
        //------------------------------------------

        this.zoom =
            new Zoom(this);


        this.scroll =
            new Scroll(this);



        //------------------------------------------
        // Objects
        //------------------------------------------

        this.playhead =
            new Playhead(this);


        this.markers =
            new Markers(this);


        this.selection =
            new Selection(this);



        //------------------------------------------
        // Drawing
        //------------------------------------------

        this.ruler =
            new Ruler(this);


        this.waveform =
            new Waveform(this);


        this.spectrum =
            new Spectrum(this);



        //------------------------------------------
        // UI
        //------------------------------------------

        this.renderer =
            new Renderer(this);


        this.events =
            new Events(this);



        //------------------------------------------
        // Events
        //------------------------------------------

        this.onMetadata =
            () => {

                this.scroll.computeMax();

                this.spectrum
                    .connect()
                    .catch(() => {});

            };


        this.onPlay =
            async () => {

                try {


                    await this.spectrum.connect();


                    await this.spectrum.resume();


                }

                catch(err) {


                    console.warn(
                        "Spectrum:",
                        err
                    );


                }


            };



        this.bindVideo();



        this.renderer.start();


    }





    //----------------------------------------------------------
    // Video events
    //----------------------------------------------------------

    bindVideo() {


        this.video.addEventListener(
            "loadedmetadata",
            this.onMetadata
        );


        this.video.addEventListener(
            "play",
            this.onPlay
        );


    }





    //----------------------------------------------------------
    // Load media
    //----------------------------------------------------------

    async load(source) {


        if (!source)
            throw new Error(
                "Missing media source"
            );


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


        if (isVideoSource) {

            await this.waveform.load(source);

            this.scroll.computeMax();

            return;

        }


        await this.waveform.load(
            source
        );


        this.scroll.computeMax();


    }





    //----------------------------------------------------------
    // Playback
    //----------------------------------------------------------

    async play() {


        await this.spectrum.resume();


        return this.video.play();


    }




    pause() {


        this.video.pause();


    }




    toggle() {


        if (this.video.paused)
            return this.play();


        this.pause();


    }





    //----------------------------------------------------------
    // Seeking
    //----------------------------------------------------------

    seek(time) {


        if (!Number.isFinite(time))
            return;


        this.video.currentTime =
            Math.max(
                0,
                Math.min(
                    time,
                    this.duration
                )
            );


    }




    get duration() {


        return this.video.duration || 0;


    }




    get currentTime() {


        return this.video.currentTime || 0;


    }




    set currentTime(value) {


        this.seek(value);


    }





    //----------------------------------------------------------
    // Marker API
    //----------------------------------------------------------

    addMarker(
        time,
        name,
        color
    ) {


        return this.markers.add(
            time,
            name,
            color
        );


    }



    removeMarker(id) {


        this.markers.remove(id);


    }




    clearMarkers() {


        this.markers.clear();


    }





    //----------------------------------------------------------
    // Zoom API
    //----------------------------------------------------------

    zoomIn() {


        this.zoom.zoomIn();


        this.scroll.onZoomChanged();


    }




    zoomOut() {


        this.zoom.zoomOut();


        this.scroll.onZoomChanged();


    }




    fit() {


        this.zoom.fit();


        this.scroll.onZoomChanged();


    }





    //----------------------------------------------------------
    // Selection
    //----------------------------------------------------------

    clearSelection() {


        this.selection.clear();


    }





    //----------------------------------------------------------
    // Save
    //----------------------------------------------------------

    toJSON() {


        return {


            version: 1,


            fps: this.fps,


            zoom:
                this.zoom.pixelsPerSecond,


            scroll:
                this.scroll.x,


            markers:
                this.markers.toJSON(),


            selection:
                this.selection.toJSON()


        };


    }





    //----------------------------------------------------------
    // Load
    //----------------------------------------------------------

    fromJSON(data) {


        if (!data)
            return;



        this.zoom.pixelsPerSecond =
            data.zoom ?? 100;



        this.scroll.x =
            data.scroll ?? 0;



        this.markers.fromJSON(
            data.markers || []
        );



        this.selection.fromJSON(
            data.selection
        );



        this.scroll.computeMax();


    }





    //----------------------------------------------------------
    // Cleanup
    //----------------------------------------------------------

    destroy() {



        this.video.removeEventListener(
            "loadedmetadata",
            this.onMetadata
        );


        this.video.removeEventListener(
            "play",
            this.onPlay
        );



        this.renderer.stop();


        this.spectrum.destroy();



        if (this.events.destroy)
            this.events.destroy();



    }



}
