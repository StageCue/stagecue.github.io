// ==============================================
// StageCue Player
// Media Loader
// ==============================================

import * as Output from "./output.js";

export function load(player, clip) {

    if (!clip)
        return;

    unload(player);

    player.currentClip = clip;

    //-----------------------------------------
    // Blob URL Cleanup
    //-----------------------------------------

    if (player.videoURL) {

        URL.revokeObjectURL(
            player.videoURL
        );

        player.videoURL = null;

    }

    //-----------------------------------------
    // Local File
    //-----------------------------------------

    if (clip.file) {

        player.videoURL =
            URL.createObjectURL(
                clip.file
            );

        player.video.src =
            player.videoURL;

    }

    //-----------------------------------------
    // URL
    //-----------------------------------------

    else {

        player.video.src =
            clip.url;

    }

    //-----------------------------------------
    // Apply Settings
    //-----------------------------------------

    applySettings(
        player,
        clip
    );

    //-----------------------------------------
    // Overlay
    //-----------------------------------------

    if (player.overlay) {

        player.overlay.style.display =
            "none";

    }

    //-----------------------------------------
    // Load Video
    //-----------------------------------------

    player.video.load();

    //-----------------------------------------
    // Output
    //-----------------------------------------

    Output.updateSource(
        player
    );

}

export function unload(player) {

    stop(player);

    //-----------------------------------------
    // Remove Source
    //-----------------------------------------

    player.video.removeAttribute(
        "src"
    );

    player.video.load();

    //-----------------------------------------
    // Blob Cleanup
    //-----------------------------------------

    if (player.videoURL) {

        URL.revokeObjectURL(
            player.videoURL
        );

        player.videoURL = null;

    }

    player.currentClip = null;

    //-----------------------------------------
    // Timeline
    //-----------------------------------------

    if (player.timeline) {

        player.timeline.waveform?.clear();

        player.timeline.clearMarkers?.();

        player.timeline.clearSelection?.();

    }

}

function applySettings(
    player,
    clip
) {

    const settings =
        clip.settings ?? {};

    //-----------------------------------------
    // Audio
    //-----------------------------------------

    player.video.volume =
        settings.audio?.volume ?? 1;

    player.video.muted =
        settings.audio?.muted ?? false;

    //-----------------------------------------
    // Playback
    //-----------------------------------------

    player.video.playbackRate =
        settings.playback?.rate ?? 1;

    //-----------------------------------------
    // Trim In
    //-----------------------------------------

    player.video.addEventListener(

        "loadedmetadata",

        () => {

            const trimIn =
                settings.trim?.in ?? 0;

            if (trimIn > 0) {

                player.video.currentTime =
                    trimIn;

            }

        },

        {

            once: true

        }

    );

}

function stop(player) {

    player.video.pause();

    player.video.currentTime = 0;

    if (player.output) {

        player.output.pause();

        player.output.currentTime = 0;

    }

}
