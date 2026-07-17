// ==============================================
// StageCue Player Media
// Loading / Unloading Clips
// ==============================================

export function load(player, clip) {

    if (!clip)
        return;

    stop(player);

    player.currentClip = clip;

    // Release previous blob
    if (player.videoURL) {

        URL.revokeObjectURL(player.videoURL);
        player.videoURL = null;

    }

    //---------------------------------
    // Local File
    //---------------------------------

    if (clip.file) {

        player.videoURL =
            URL.createObjectURL(clip.file);

        player.video.src =
            player.videoURL;

    }

    //---------------------------------
    // URL
    //---------------------------------

    else {

        player.video.src =
            clip.url;

    }

    player.overlay.style.display =
        "none";

    player.video.load();

    //---------------------------------
    // Sync Output Window
    //---------------------------------

    if (player.output) {

        player.output.src =
            player.video.currentSrc ||
            player.video.src;

        player.output.load();

    }

}

export function unload(player) {

    stop(player);

    player.video.removeAttribute("src");
    player.video.load();

    if (player.videoURL) {

        URL.revokeObjectURL(player.videoURL);
        player.videoURL = null;

    }

    player.currentClip = null;

    if (player.timeline) {

        player.timeline.waveform?.clear();

        player.timeline.clearMarkers?.();

        player.timeline.clearSelection?.();

    }

}

function stop(player) {

    player.video.pause();

    player.video.currentTime = 0;

    if (player.output) {

        player.output.pause();

        player.output.currentTime = 0;

    }

}
