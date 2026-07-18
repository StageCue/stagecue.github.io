// ==============================================
// StageCue Player Events
// ==============================================

import * as Playback from "./player-playback.js";
import * as Output from "./player-output.js";

export function bind(player) {

    //-----------------------------------------
    // Metadata
    //-----------------------------------------

    player.video.addEventListener(

        "loadedmetadata",

        async () => {

            player.updateDuration();

            //---------------------------------
            // Timeline
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

            Output.syncOutput(player);

        }

    );

    //-----------------------------------------
    // Pause
    //-----------------------------------------

    player.video.addEventListener(

        "pause",

        () => {

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
    // Ended
    //-----------------------------------------

    player.video.addEventListener(

        "ended",

        () => {

            document.dispatchEvent(

                new CustomEvent(

                    "stagecue:ended"

                )

            );

        }

    );

    //-----------------------------------------
    // Seek Bar
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
