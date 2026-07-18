// ==============================================
// StageCue Player
// Playback Effects
// ==============================================

export function update(player) {

    const clip =
        player.currentClip;

    if (!clip)
        return;

    const settings =
        clip.settings;

    if (!settings)
        return;

    //-----------------------------------------
    // Fade In
    //-----------------------------------------

    updateFadeIn(

        player,

        settings

    );

    //-----------------------------------------
    // Fade Out
    //-----------------------------------------

    updateFadeOut(

        player,

        settings

    );

}

function updateFadeIn(

    player,

    settings

) {

    const duration =

        settings.audio?.fadeIn ?? 0;

    if (duration <= 0)
        return;

    const progress =

        Math.min(

            player.currentTime /

            duration,

            1

        );

    const volume =

        (

            settings.audio?.volume ??

            1

        ) * progress;

    player.video.volume = volume;

    player.outputs.forEach(output => {

        output.volume = volume;

    });

}

function updateFadeOut(

    player,

    settings

) {

    const duration =

        settings.audio?.fadeOut ?? 0;

    if (duration <= 0)
        return;

    const trimOut =

        settings.trim?.out ||

        player.duration;

    const remaining =

        trimOut -

        player.currentTime;

    if (

        remaining >

        duration

    )

        return;

    const progress =

        Math.max(

            remaining /

            duration,

            0

        );

    const volume =

        (

            settings.audio?.volume ??

            1

        ) * progress;

    player.video.volume = volume;

    player.outputs.forEach(output => {

        output.volume = volume;

    });

}
