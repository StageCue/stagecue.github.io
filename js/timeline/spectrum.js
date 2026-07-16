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
        this.sources = [];
        this.analyser = null;
        this.analyzers = [];
        this.stream = null;


        this.connected = false;


        this.mode = "bars";


        this.barWidth = 3;
        this.barGap = 1;


        this.smoothing = 0.82;
        this.fftSize = 2048;


        this.data = null;
        this.wave = null;
        this.trackCount = 0;

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


        this.source = null;
        this.stream = null;
        this.sources = [];
        this.analyser = null;
        this.analyzers = [];


        const useCaptureStream =
            typeof this.video.captureStream === "function";


        if (useCaptureStream) {

            try {

                this.stream =
                    this.video.captureStream();

            }

            catch(err) {

                console.warn(
                    "Unable to capture video audio stream",
                    err
                );

            }

        }


        const audioTracks =
            this.stream?.getAudioTracks?.() || [];


        if (audioTracks.length > 0) {

            for (const track of audioTracks) {

                const trackStream =
                    new MediaStream([track]);

                const source =
                    this.context.createMediaStreamSource(
                        trackStream
                    );

                const analyser =
                    this.context.createAnalyser();

                analyser.fftSize =
                    this.fftSize;

                analyser.smoothingTimeConstant =
                    this.smoothing;

                source.connect(analyser);
                analyser.connect(this.context.destination);

                this.sources.push(source);
                this.analyzers.push(analyser);

            }

        }

        else {

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

            this.analyzers.push(this.analyser);

        }


        this.data =
            new Uint8Array(
                this.fftSize / 2
            );


        this.wave =
            new Uint8Array(
                this.fftSize
            );

        this.trackCount =
            this.analyzers.length || 1;

        this.updateTrackCountUI();

        this.connected = true;


    }



    //---------------------------------------------------------
    // Draw
    //---------------------------------------------------------

    getAnalyzers() {

        if (this.analyzers.length)
            return this.analyzers;

        return [this.analyser].filter(Boolean);

    }

    updateTrackCountUI() {

        const node =
            this.timeline?.root?.querySelector("#audioTrackCount");

        if (!node)
            return;

        node.textContent =
            `Tracks: ${this.trackCount}`;

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

    const analyzers = this.getAnalyzers();

    if (!analyzers.length)
        return;

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

    const analyzerData =
        new Uint8Array(this.fftSize / 2);

    const barGroups =
        analyzers.length;

    const groupWidth =
        w / barGroups;

    analyzers.forEach((analyser, trackIndex) => {

        analyser.getByteFrequencyData(
            analyzerData
        );

        let x =
            trackIndex * groupWidth;

        for (
            let i = 0;
            i < analyzerData.length;
            i += 2
        ) {

            const value =
                analyzerData[i] / 255;

            const height =
                value * h;

            ctx.fillStyle =
                ["#5ba7ff", "#43c36b", "#f3b341"][trackIndex % 3];

            ctx.fillRect(
                x,
                h - height,
                this.barWidth,
                height
            );

            x +=
                this.barWidth +
                this.barGap;

            if (
                x >
                (trackIndex + 1) * groupWidth
            )
                break;

        }

    });

}




    //---------------------------------------------------------
    // Oscilloscope
    //---------------------------------------------------------

    drawWave(ctx) {


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


        const analyzers =
            this.getAnalyzers();


        analyzers.forEach((analyser, trackIndex) => {

            analyser.getByteTimeDomainData(this.wave);

            const step =
                w / this.wave.length;

            let x = 0;

            ctx.beginPath();
            ctx.strokeStyle =
                ["#5ba7ff", "#43c36b", "#f3b341"][trackIndex % 3];
            ctx.globalAlpha =
                0.55 + (trackIndex * 0.1);

            for (
                let i = 0;
                i < this.wave.length;
                i++
            ) {

                const y =
                    (this.wave[i] / 255) * h;

                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);

                x += step;

            }

            ctx.stroke();

        });

        ctx.globalAlpha = 1;


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


        for (const source of this.sources)
            source.disconnect();

        for (const analyser of this.analyzers)
            analyser.disconnect();


        if (this.source)
            this.source.disconnect();


        if (this.analyser)
            this.analyser.disconnect();



        this.connected = false;
        this.trackCount = 0;
        this.updateTrackCountUI();


    }


}
