// ==========================================================
// StageCue Spectrum Analyzer
// Real-time FFT visualizer
// ==========================================================

import { getAudioContext } from "./audio-context.js";


export default class Spectrum {


    constructor(timeline) {

        this.timeline = timeline;

        this.video = timeline.video;


        this.context = getAudioContext();

        this.source = null;
        this.analyser = null;


        this.connected = false;


        this.mode = "bars";


        this.barWidth = 3;
        this.barGap = 1;


        this.smoothing = 0.82;
        this.fftSize = 2048;


        this.data = null;
        this.wave = null;

    }



    //---------------------------------------------------------
    // Initialize
    //---------------------------------------------------------

    async connect() {


        if (this.connected)
            return;


        if (!this.video)
            throw new Error(
                "Video element missing"
            );


        this.analyser =
            this.context.createAnalyser();


        this.analyser.fftSize =
            this.fftSize;


        this.analyser.smoothingTimeConstant =
            this.smoothing;



        try {


            this.source =
                this.context.createMediaElementSource(
                    this.video
                );


        }

        catch(err) {


            console.warn(
                "Media source already exists",
                err
            );


        }



        if (this.source) {

            this.source.connect(
                this.analyser
            );

        }


        this.analyser.connect(
            this.context.destination
        );



        this.data =
            new Uint8Array(
                this.analyser.frequencyBinCount
            );


        this.wave =
            new Uint8Array(
                this.analyser.fftSize
            );


        this.connected = true;


    }



    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

    draw(ctx) {


        if (!this.connected)
            return;


        if (
            this.context.state ===
            "suspended"
        )
            return;



        if (this.mode === "bars")
            this.drawBars(ctx);
        else
            this.drawWave(ctx);


    }




    //---------------------------------------------------------
    // Frequency bars
    //---------------------------------------------------------

    drawBars(ctx) {


        this.analyser.getByteFrequencyData(
            this.data
        );


        const w =
            ctx.canvas.clientWidth;


        const h =
            ctx.canvas.clientHeight;



        ctx.clearRect(
            0,
            0,
            w,
            h
        );



        let x = 0;



        for (
            let i = 0;
            i < this.data.length;
            i += 2
        ) {


            const value =
                this.data[i] / 255;



            const height =
                value * h;



            ctx.fillStyle =
                "#5ba7ff";



            ctx.fillRect(
                x,
                h - height,
                this.barWidth,
                height
            );



            x +=
                this.barWidth +
                this.barGap;



            if (x > w)
                break;


        }


    }




    //---------------------------------------------------------
    // Oscilloscope
    //---------------------------------------------------------

    drawWave(ctx) {


        this.analyser.getByteTimeDomainData(
            this.wave
        );


        const w =
            ctx.canvas.clientWidth;


        const h =
            ctx.canvas.clientHeight;



        ctx.clearRect(
            0,
            0,
            w,
            h
        );



        ctx.beginPath();


        ctx.strokeStyle =
            "#5ba7ff";



        const step =
            w / this.wave.length;



        let x = 0;



        for (
            let i = 0;
            i < this.wave.length;
            i++
        ) {


            const y =
                (this.wave[i] / 255) * h;



            if (i === 0)
                ctx.moveTo(x,y);
            else
                ctx.lineTo(x,y);



            x += step;


        }


        ctx.stroke();


    }




    //---------------------------------------------------------
    // Resume
    //---------------------------------------------------------

    async resume() {


        if (!this.context)
            return;



        if (
            this.context.state ===
            "suspended"
        ) {

            await this.context.resume();

        }


    }




    //---------------------------------------------------------
    // Mode
    //---------------------------------------------------------

    setMode(mode) {

        this.mode = mode;

    }




    //---------------------------------------------------------
    // Destroy
    //---------------------------------------------------------

    destroy() {


        if (this.source)
            this.source.disconnect();


        if (this.analyser)
            this.analyser.disconnect();



        this.connected = false;


    }


}
