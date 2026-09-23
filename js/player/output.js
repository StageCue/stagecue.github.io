// ==============================================
// StageCue Player
// Output Manager
// ==============================================

export function attachOutput(player, video) {

    if (!video)
        return;

    if (

        player.outputs.includes(video)

    )

        return;

    player.outputs.push(video);

    syncVideo(player, video);

}

export function detachOutput(player, video = null) {

    //------------------------------------------
    // Remove All
    //------------------------------------------

    if (!video) {

        player.outputs.forEach(

            output => {

                output.pause();

                output.removeAttribute("src");

                output.load();

            }

        );

        player.outputs = [];

        return;

    }

    //------------------------------------------
    // Remove One
    //------------------------------------------

    const index =

        player.outputs.indexOf(video);

    if (index === -1)
        return;

    video.pause();

    video.removeAttribute("src");

    video.load();

    player.outputs.splice(index, 1);

}

export function updateSource(player) {

    player.outputs.forEach(

        output => {

            const src =

                player.video.currentSrc ||

                player.video.src;

            if (!src)
                return;

            if (

                output.src !== src

            ) {

                output.src = src;

                output.load();

            }

        }

    );

}

export function syncOutput(player) {

    player.outputs.forEach(

        output => {

            syncVideo(

                player,

                output

            );

        }

    );

}

function syncVideo(

    player,

    output

) {

    //------------------------------------------
    // Source
    //------------------------------------------

    const src =

        player.video.currentSrc ||

        player.video.src;

    if (

        src &&

        output.src !== src

    ) {

        output.src = src;

        output.load();

    }

    //------------------------------------------
    // Playback
    //------------------------------------------

    output.playbackRate =

        player.video.playbackRate;

    //------------------------------------------
    // Audio
    //------------------------------------------

    output.volume =

        player.video.volume;

    output.muted =

        player.video.muted;

    //------------------------------------------
    // Drift
    //------------------------------------------

    if (

        Math.abs(

            output.currentTime -

            player.video.currentTime

        ) > 0.10

    ) {

        output.currentTime =

            player.video.currentTime;

    }

    //------------------------------------------
    // Play / Pause
    //------------------------------------------

    if (

        player.video.paused

    ) {

        output.pause();

    }

    else {

        output.play()

            .catch(() => {});

    }

}
