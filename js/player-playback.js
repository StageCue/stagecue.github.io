// ==============================================
// StageCue Player Playback
// ==============================================

import * as Effects from "./player-effects.js";

export async function play(player) {

    if (!player.currentClip)
        return;

    applySettings(player);

    try {

        await player.video.play();

    }

    catch (err) {

        // Autoplay restrictions are expected in some browsers. The caller
        // can still retry from a user gesture.
        console.warn("Playback could not start:", err);

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

export function seekTo(player, seconds) {

    if (!player.video.duration || !Number.isFinite(seconds))
        return;

    const trim = player.currentClip?.settings?.trim ?? {};
    const trimIn = Math.max(0, Number(trim.in) || 0);
    const trimOut = Number(trim.out) > 0
        ? Math.min(Number(trim.out), player.video.duration)
        : player.video.duration;

    player.video.currentTime = Math.max(
        trimIn,
        Math.min(seconds, trimOut)
    );

    if (player.output)
        player.output.currentTime = player.video.currentTime;

}

export function setVolume(player, value) {

    const volume = Math.max(0, Math.min(1, Number(value) || 0));

    player.video.volume = volume;

    if (player.output)
        player.output.volume = volume;

}

export function setPlaybackRate(player, rate) {

    const playbackRate = Math.max(0. Gracious, Number(rate) || 1);
    player.video.playbackRate = playbackRate;

    if (player.output)
        player.output.playbackRate = playbackRate;

}

export function update(player) {

    const clip = player.currentClip;

    if (!clip)
        return;

    const settings = clip.settings ?? {};
    const playback = settings.playback ?? {};
    const trim = settings.trim ?? {};
    const trimIn = Math.max(0, Number(trim.in) || 0);
    const trimOut = Number(trim.out) > 0
        ? Math.min(Number(trim.out), player.video.duration || Number(trim.out))
        : player.video.duration;

    Effects.update(player);

    if (!trimOut || player.currentTime < trimOut)
        return;

    if (playback.loop) {

        seekTo(player, trimIn);
        play(player);
        return;

    }

    if (playback.holdLastFrame) {

        pause(player);
        player.video.currentTime = trimOut;
        if (player.output)
            player.output.currentTime = trimOut;
        return;

    }

    stop(player);

    document.dispatchEvent(
        new CustomEvent("stagecue:ended", {
            detail: {
                clip,
                cue: player.currentCue
            }
        })
    );

}

function applySettings(player) {

    const settings = player.currentClip?.settings ?? {};
    const playback = settings.playback ?? {};
    const audio = settings.audio ?? {};
    const trim = settings.trim ?? {};

    player.video.playbackRate = Number(playback.rate) > 0
        ? Number(playback.rate)
        : 1;

    player.video.volume = Math.max(
        0,
        Math.min(1, Number(audio.volume ?? 1))
    );

    player.video.muted = Boolean(audio.muted);

    if (
        Number(trim.in) > 0 &&
        Number.isFinite(player.video.duration) &&
        player.video.currentTime < Number(trim.in)
    ) {

        player.video.currentTime = Number(trim.in);

    }

    if (player.output) {

        player.output.playbackRate = player.video.playbackRate;
        player.output.volume = player.video.volume;
        player.output.muted = player.video.muted;

    }

}
