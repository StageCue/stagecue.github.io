// ==========================================================
// StageCue Audio Decoder
// Decodes local audio/video into AudioBuffer
// ==========================================================

export default class Decoder {

    constructor() {

        this.context = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    }

    //---------------------------------------------------------
    // Decode
    //---------------------------------------------------------

    async decode(source) {

        if (!source)
            throw new Error("No source specified.");

        let arrayBuffer;

        //---------------------------------------------
        // File object
        //---------------------------------------------

        if (source instanceof File) {

            arrayBuffer = await source.arrayBuffer();

        }

        //---------------------------------------------
        // URL string
        //---------------------------------------------

        else if (typeof source === "string") {

            const response = await fetch(source);

            if (!response.ok) {

                throw new Error(
                    `Unable to fetch "${source}".`
                );

            }

            arrayBuffer =
                await response.arrayBuffer();

        }

        //---------------------------------------------
        // Blob
        //---------------------------------------------

        else if (source instanceof Blob) {

            arrayBuffer =
                await source.arrayBuffer();

        }

        else {

            throw new Error(
                "Unsupported media source."
            );

        }

        //---------------------------------------------
        // decodeAudioData modifies buffer,
        // so clone it first.
        //---------------------------------------------

        const copy = arrayBuffer.slice(0);

        return await this.context.decodeAudioData(copy);

    }

    //---------------------------------------------------------
    // Decode safely
    //---------------------------------------------------------

    async tryDecode(source) {

        try {

            return await this.decode(source);

        }

        catch (err) {

            console.error(err);

            return null;

        }

    }

    //---------------------------------------------------------
    // Resume AudioContext
    //---------------------------------------------------------

    async resume() {

        if (
            this.context.state === "suspended"
        ) {

            await this.context.resume();

        }

    }

    //---------------------------------------------------------
    // Suspend
    //---------------------------------------------------------

    async suspend() {

        if (
            this.context.state === "running"
        ) {

            await this.context.suspend();

        }

    }

    //---------------------------------------------------------
    // Close
    //---------------------------------------------------------

    async destroy() {

        if (this.context) {

            await this.context.close();

        }

    }

}
