// ==============================================
// StageCue Player Output
// External Output Synchronization
// ==============================================

export function attachOutput(player, output) {

    player.output = output;

    if (!output)
        return;

    updateSource(player);

    output.currentTime =
        player.video.currentTime;

    output.volume =
        player.video.volume;

    output.muted =
        player.video.muted;

    output.playbackRate =
        player.video.playbackRate;

    if (!player.video.paused) {

        output.play().catch(() => {});

    }

}

export function detachOutput(player) {

    if (!player.output)
        return;

    player.output.pause();

    player.output.removeAttribute("src");

    player.output.load();

    player.output = null;

}

export function updateSource(player) {

    if (!player.output)
        return;

    const src =
        player.video.currentSrc ||
        player.video.src;

    if (!src)
        return;

    if (player.output.src !== src) {

        player.output.src = src;

        player.output.load();

    }

}

export function syncOutput(player) {

    if (!player.output)
        return;

    // Keep source updated
    updateSource(player);

    // Sync playback rate
    player.output.playbackRate =
        player.video.playbackRate;

    // Sync volume
    player.output.volume =
        player.video.volume;

    player.output.muted =
        player.video.muted;

    // Correct drift only when needed
    if (
        Math.abs(
            player.output.currentTime -
            player.video.currentTime
        ) > 0.10
    ) {

        player.output.currentTime =
            player.video.currentTime;

    }

    if (player.video.paused) {

        player.output.pause();

    } else {

        player.output.play().catch(() => {});

    }

}
