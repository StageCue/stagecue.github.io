// ==============================================
// StageCue
// Cue Events
// ==============================================

export function bindCueEvents(cue) {

    const clip = cue.clip;

    const settings = clip.settings;

    //--------------------------------------------------
    // Select cue
    //--------------------------------------------------

    cue.element.addEventListener("click", e => {

        // Ignore button clicks

        if (e.target.closest("button"))
            return;

        if (e.target.closest("input"))
            return;

        cue.select();

    });

    //--------------------------------------------------
    // Double click = Play
    //--------------------------------------------------

    cue.element.addEventListener("dblclick", () => {

        cue.play();

    });

    //--------------------------------------------------
    // Play button
    //--------------------------------------------------

    cue.playButton.addEventListener("click", e => {

        e.stopPropagation();

        cue.play();

    });

    //--------------------------------------------------
    // Preview button
    //--------------------------------------------------

    cue.previewButton.addEventListener("click", e => {

        e.stopPropagation();

        cue.select();

        // Preview only
        // (later we'll add Preview Monitor)

        cue.player.play();

    });

    //--------------------------------------------------
    // Expand
    //--------------------------------------------------

    cue.expandButton.addEventListener("click", e => {

        e.stopPropagation();

        cue.toggle();

        cue.expandButton.textContent =
            clip.expanded
                ? "▲"
                : "▼";

    });

    //--------------------------------------------------
    // Loop
    //--------------------------------------------------

    cue.loopInput.onchange = e => {

        settings.playback.loop =
            e.target.checked;

    };

    //--------------------------------------------------
    // Auto Next
    //--------------------------------------------------

    cue.autoNextInput.onchange = e => {

        settings.playback.autoNext =
            e.target.checked;

    };

    //--------------------------------------------------
    // Hold Last Frame
    //--------------------------------------------------

    cue.holdFrameInput.onchange = e => {

        settings.playback.holdLastFrame =
            e.target.checked;

    };

    //--------------------------------------------------
    // Fade In
    //--------------------------------------------------

    cue.fadeInInput.onchange = e => {

        settings.transition.fadeIn =
            e.target.checked;

    };

    //--------------------------------------------------
    // Fade Out
    //--------------------------------------------------

    cue.fadeOutInput.onchange = e => {

        settings.transition.fadeOut =
            e.target.checked;

    };

    //--------------------------------------------------
    // Fade In Duration
    //--------------------------------------------------

    cue.fadeInTimeInput.onchange = e => {

        settings.transition.fadeInDuration =
            Number(e.target.value);

    };

    //--------------------------------------------------
    // Fade Out Duration
    //--------------------------------------------------

    cue.fadeOutTimeInput.onchange = e => {

        settings.transition.fadeOutDuration =
            Number(e.target.value);

    };

    //--------------------------------------------------
    // Volume
    //--------------------------------------------------

    cue.volumeInput.oninput = e => {

        settings.audio.volume =
            Number(e.target.value);

        // Live update if selected

        if (
            cue.playlist.currentIndex ===
            cue.index
        ) {

            cue.player.video.volume =
                settings.audio.volume;

        }

    };

    //--------------------------------------------------
    // Mute
    //--------------------------------------------------

    cue.muteInput.onchange = e => {

        settings.audio.muted =
            e.target.checked;

        if (
            cue.playlist.currentIndex ===
            cue.index
        ) {

            cue.player.video.muted =
                settings.audio.muted;

        }

    };

    //--------------------------------------------------
    // Trim In
    //--------------------------------------------------

    cue.trimInInput.onchange = e => {

        settings.trim.in =
            Math.max(
                0,
                Number(e.target.value)
            );

    };

    //--------------------------------------------------
    // Trim Out
    //--------------------------------------------------

    cue.trimOutInput.onchange = e => {

        settings.trim.out =
            Math.max(
                settings.trim.in,
                Number(e.target.value)
            );

    };

}
