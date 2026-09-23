// ==============================================
// StageCue Player
// Playback Engine
// ==============================================

import * as Effects from "./effects.js";

export async function play(player) {

    if (!player.currentClip)
        return;

    applySettings(player);

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

    player.outputs.forEach(output => {

        output.pause();

        output.currentTime = 0;

    });

}

export function toggle(player) {

    if (player.video.paused)

        play(player);

    else

        pause(player);

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

    player.outputs.forEach(output => {

        output.currentTime =
            player.video.currentTime;

    });

}

export function setVolume(player, value) {

    player.video.volume = value;

    player.outputs.forEach(output => {

        output.volume = value;

    });

}

export function setPlaybackRate(player, rate) {

    player.video.playbackRate = rate;

    player.outputs.forEach(output => {

        output.playbackRate = rate;

    });

}

export function update(player) {

    const clip =
        player.currentClip;

    if (!clip)
        return;

    const settings =
        clip.settings;

    //--------------------------------------
    // Effects
    //--------------------------------------

    Effects.update(player);

    //--------------------------------------
    // Trim Out
    //--------------------------------------

    const trimOut =
        settings?.trim?.out ?? 0;

    if (

        trimOut > 0 &&

        player.currentTime >= trimOut

    ) {

        //----------------------------------

        // Loop

        //----------------------------------

        if (

            settings.playback.loop

        ) {

            seekTo(

                player,

                settings.trim.in

            );

            play(player);

            return;

        }

        //----------------------------------

        // Hold Last Frame

        //----------------------------------

        if (

            settings.playback.holdLastFrame

        ) {

            pause(player);

            return;

        }

        //----------------------------------

        // Finish

        //----------------------------------

        stop(player);

        document.dispatchEvent(

            new CustomEvent(

                "stagecue:ended"

            )

        );

    }

}

function applySettings(player) {

    const settings =
        player.currentClip?.settings;

    if (!settings)
        return;

    //--------------------------------------
    // Playback Rate
    //--------------------------------------

    player.video.playbackRate =

        settings.playback?.rate ?? 1;

    //--------------------------------------
    // Volume
    //--------------------------------------

    player.video.volume =

        settings.audio?.volume ?? 1;

    player.video.muted =

        settings.audio?.muted ?? false;

    //--------------------------------------
    // Trim In
    //--------------------------------------

    const trimIn =

        settings.trim?.in ?? 0;

    if (trimIn > 0) {

        player.video.currentTime =
            trimIn;

    }

}
