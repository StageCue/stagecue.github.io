// ==============================================
// StageCue Player
// Events
// ==============================================

import * as Playback from "./playback.js";
import * as Output from "./output.js";

export function bind(player) {

    //-----------------------------------------
    // Metadata Loaded
    //-----------------------------------------

    player.video.addEventListener(

        "loadedmetadata",

        async () => {

            player.updateDuration();

            //---------------------------------
            // Load Timeline Waveform
            //---------------------------------

            if (

                player.timeline &&
                player.currentClip

            ) {

                try {

                    const source =

                        player.currentClip.file ||

                        player.currentClip.url;

                    await player.timeline.load(

                        source

                    );

                }

                catch (err) {

                    console.error(

                        "Timeline:",

                        err

                    );

                }

            }

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Time Update
    //-----------------------------------------

    player.video.addEventListener(

        "timeupdate",

        () => {

            player.updateTime();

            Playback.update(player);

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Play
    //-----------------------------------------

    player.video.addEventListener(

        "play",

        () => {

            document.dispatchEvent(

                new CustomEvent(

                    "stagecue:play",

                    {

                        detail: {

                            clip: player.currentClip,

                            cue: player.currentCue

                        }

                    }

                )

            );

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Pause
    //-----------------------------------------

    player.video.addEventListener(

        "pause",

        () => {

            document.dispatchEvent(

                new CustomEvent(

                    "stagecue:pause",

                    {

                        detail: {

                            clip: player.currentClip,

                            cue: player.currentCue

                        }

                    }

                )

            );

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Seeked
    //-----------------------------------------

    player.video.addEventListener(

        "seeked",

        () => {

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Volume
    //-----------------------------------------

    player.video.addEventListener(

        "volumechange",

        () => {

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Playback Rate
    //-----------------------------------------

    player.video.addEventListener(

        "ratechange",

        () => {

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Video Finished
    //-----------------------------------------

    player.video.addEventListener(

        "ended",

        () => {

            document.dispatchEvent(

                new CustomEvent(

                    "stagecue:ended",

                    {

                        detail: {

                            clip: player.currentClip,

                            cue: player.currentCue

                        }

                    }

                )

            );

        }

    );

    //-----------------------------------------
    // Seek Slider
    //-----------------------------------------

    player.seek.addEventListener(

        "input",

        () => {

            if (

                !player.video.duration

            )

                return;

            Playback.seekTo(

                player,

                (

                    player.seek.value /

                    100

                ) *

                player.video.duration

            );

        }

    );

}
