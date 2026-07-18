// ==============================================
// StageCue Player Playback
// ==============================================

export async function play(player) {

    if (!player.currentClip)
        return;

    applyCueSettings(player);

    try {

        await player.video.play();

    }

    catch (err) {

        console.warn(err);

    }

}

export function pause(player) {

    player.video.pause();

}

export function stop(player) {

    player.video.pause();

    player.video.currentTime = 0;

    if (player.output) {

        player.output.pause();

        player.output.currentTime = 0;

    }

}

export function toggle(player) {

    if (player.video.paused) {

        play(player);

    }

    else {

        pause(player);

    }

}

export function setVolume(player, value) {

    player.video.volume = value;

    if (player.output) {

        player.output.volume = value;

    }

}

export function seekTo(player, seconds) {

    if (!player.video.duration)
        return;

    const clip =
        player.currentClip;

    const trim =
        clip?.settings?.trim ?? {};

    const trimIn =
        trim.in ?? 0;

    const trimOut =
        trim.out ?? player.video.duration;

    player.video.currentTime = Math.max(

        trimIn,

        Math.min(

            seconds,

            trimOut

        )

    );

    if (player.output) {

        player.output.currentTime =
            player.video.currentTime;

    }

}

export function update(player) {

    if (!player.currentClip)
        return;

    const clip =
        player.currentClip;

    const playback =
        clip.settings?.playback ?? {};

    const trim =
        clip.settings?.trim ?? {};

    const trimIn =
        trim.in ?? 0;

    const trimOut =
        trim.out ?? player.video.duration;

    //----------------------------------
    // Trim Out
    //----------------------------------

    if (

        player.video.currentTime >= trimOut

    ) {

        //----------------------------------
        // Loop
        //----------------------------------

        if (playback.loop) {

            player.video.currentTime =
                trimIn;

            if (player.output) {

                player.output.currentTime =
                    trimIn;

            }

            return;

        }

        //----------------------------------
        // Hold Last Frame
        //----------------------------------

        if (playback.holdLastFrame) {

            player.video.pause();

            player.video.currentTime =
                trimOut;

            return;

        }

        //----------------------------------
        // Stop
        //----------------------------------

        stop(player);

        document.dispatchEvent(

            new CustomEvent(

                "stagecue:ended"

            )

        );

    }

}

function applyCueSettings(player) {

    const clip =
        player.currentClip;

    if (!clip)
        return;

    const playback =
        clip.settings?.playback ?? {};

    const audio =
        clip.settings?.audio ?? {};

    const trim =
        clip.settings?.trim ?? {};

    //----------------------------------
    // Playback
    //----------------------------------

    player.video.playbackRate =
        playback.rate ?? 1;

    player.video.loop = false;

    //----------------------------------
    // Audio
    //----------------------------------

    player.video.volume =
        audio.volume ?? 1;

    player.video.muted =
        audio.muted ?? false;

    //----------------------------------
    // Trim In
    //----------------------------------

    if (

        trim.in > 0 &&

        player.video.currentTime < trim.in

    ) {

        player.video.currentTime =
            trim.in;

    }

    //----------------------------------
    // Output
    //----------------------------------

    if (player.output) {

        player.output.playbackRate =
            player.video.playbackRate;

        player.output.volume =
            player.video.volume;

        player.output.muted =
            player.video.muted;

    }

}
