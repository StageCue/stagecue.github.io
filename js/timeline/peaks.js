   // ==========================================================
// StageCue Waveform Peak Generator
// Generates multi-resolution min/max peaks
// ==========================================================

export default class Peaks {


    constructor() {

        // Samples represented by one peak
        this.levels = [
            64,
            128,
            256,
            512,
            1024,
            2048,
            4096,
            8192
        ];

    }



    //---------------------------------------------------------
    // Generate all resolutions
    //---------------------------------------------------------

    generate(audioBuffer) {


        if (!audioBuffer)
            throw new Error(
                "AudioBuffer missing"
            );


        const channels = [];


        for (
            let c = 0;
            c < audioBuffer.numberOfChannels;
            c++
        ) {


            channels.push(

                this.generateChannel(
                    audioBuffer.getChannelData(c)
                )

            );


        }



        return {

            duration:
                audioBuffer.duration,


            sampleRate:
                audioBuffer.sampleRate,


            channels,


            levels:
                this.levels

        };


    }




    //---------------------------------------------------------
    // Generate one channel
    //---------------------------------------------------------

    generateChannel(samples) {


        const result = {};


        for (
            const blockSize of this.levels
        ) {


            result[blockSize] =
                this.buildLevel(
                    samples,
                    blockSize
                );


        }


        return result;


    }





    //---------------------------------------------------------
    // Build min/max level
    //---------------------------------------------------------

    buildLevel(
        samples,
        blockSize
    ) {


        const length =
            Math.ceil(
                samples.length /
                blockSize
            );



        const peaks =
            new Float32Array(
                length * 2
            );



        let index = 0;



        for (
            let i = 0;
            i < samples.length;
            i += blockSize
        ) {


            let min = 1;
            let max = -1;



            const end =
                Math.min(
                    i + blockSize,
                    samples.length
                );



            for (
                let j = i;
                j < end;
                j++
            ) {


                const value =
                    samples[j];



                if (value < min)
                    min = value;



                if (value > max)
                    max = value;


            }



            peaks[index++] = min;
            peaks[index++] = max;


        }



        return peaks;


    }





    //---------------------------------------------------------
    // Select best level for zoom
    //---------------------------------------------------------

    getLevel(
        waveform,
        pixelsPerSecond
    ) {


        if (!waveform)
            return this.levels[0];



        if (
            !Number.isFinite(
                pixelsPerSecond
            )
            ||
            pixelsPerSecond <= 0
        ) {

            return waveform.levels[0];

        }




        const duration =
            waveform.duration;



        const samples =
            waveform.sampleRate *
            duration;



        const pixels =
            duration *
            pixelsPerSecond;



        if (
            !Number.isFinite(samples)
            ||
            !Number.isFinite(pixels)
            ||
            pixels <= 0
        ) {

            return waveform.levels[0];

        }



        const samplesPerPixel =
            samples / pixels;



        for (
            const level of waveform.levels
        ) {


            if (
                level >= samplesPerPixel
            ) {

                return level;

            }


        }



        return waveform.levels[
            waveform.levels.length - 1
        ];


    }





    //---------------------------------------------------------
    // Get channel
    //---------------------------------------------------------

    getChannel(
        waveform,
        index = 0
    ) {


        return waveform.channels[index];


    }





    //---------------------------------------------------------
    // Get peaks
    //---------------------------------------------------------

    getPeaks(
        waveform,
        pixelsPerSecond,
        channel = 0
    ) {


        const level =
            this.getLevel(
                waveform,
                pixelsPerSecond
            );



        const data =
            waveform
                .channels[channel]
                ?.
                [level];



        if (!data) {


            console.warn(
                "Waveform peak data missing:",
                level
            );


            return null;


        }



        return data;


    }


}
