// ==========================================================
// StageCue Audio Decoder
// ==========================================================

import { getAudioContext } from "./audio-context.js";

export default class Decoder {

    constructor() {

        this.context = getAudioContext();

    }

    //---------------------------------------------------------
    // Decode
    //---------------------------------------------------------

    async decode(source) {

        if (!source)
            throw new Error("No media source.");

        let arrayBuffer;

        //---------------------------------------------
        // File / Blob
        //---------------------------------------------

        if (
            source instanceof File ||
            source instanceof Blob
        ) {

            arrayBuffer = await source.arrayBuffer();

        }

        //---------------------------------------------
        // URL (http, https, blob, data)
        //---------------------------------------------

        else if (typeof source === "string") {

            const response = await fetch(source);

            if (!response.ok) {

                throw new Error(
                    `Unable to fetch media: ${response.status}`
                );

            }

            arrayBuffer = await response.arrayBuffer();

        }

        else {

            throw new Error(
                `Unsupported media source: ${typeof source}`
            );

        }

        const buffer = arrayBuffer.slice(0);

        return await this.context.decodeAudioData(buffer);

    }

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

    async resume() {

        if (this.context.state === "suspended") {

            await this.context.resume();

        }

    }

    //---------------------------------------------------------

    async suspend() {

        if (this.context.state === "running") {

            await this.context.suspend();

        }

    }

}
