// ==============================================
// StageCue Player Playback
// ==============================================

export async function play(player) {

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

    if (player.video.paused)

        play(player);

    else

        pause(player);

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

    player.video.currentTime = Math.max(

        0,

        Math.min(

            seconds,

            player.video.duration

        )

    );

    if (player.output) {

        player.output.currentTime =
            player.video.currentTime;

    }

}
