// ==============================================
// StageCue
// Cue Controls
// ==============================================

export function createCueControls(cue) {

    const clip = cue.clip;

    // Default settings (for older projects)
    clip.settings ??= {};

    clip.settings.playback ??= {
        loop: false,
        autoNext: true,
        holdLastFrame: false
    };

    clip.settings.transition ??= {
        fadeIn: false,
        fadeInDuration: 1,
        fadeOut: false,
        fadeOutDuration: 1
    };

    clip.settings.audio ??= {
        volume: 1,
        muted: false
    };

    clip.settings.trim ??= {
        in: 0,
        out: clip.duration ?? 0
    };

    const controls =
        document.createElement("div");

    controls.className = "cue-controls";

    controls.innerHTML = `

        <div class="cue-group">

            <div class="cue-group-title">
                Playback
            </div>

            <label>
                <input class="loop" type="checkbox"
                    ${clip.settings.playback.loop ? "checked" : ""}>
                Loop Clip
            </label>

            <label>
                <input class="autoNext" type="checkbox"
                    ${clip.settings.playback.autoNext ? "checked" : ""}>
                Auto Next
            </label>

            <label>
                <input class="holdFrame" type="checkbox"
                    ${clip.settings.playback.holdLastFrame ? "checked" : ""}>
                Hold Last Frame
            </label>

        </div>


        <div class="cue-group">

            <div class="cue-group-title">
                Transition
            </div>

            <label>
                <input class="fadeIn" type="checkbox"
                    ${clip.settings.transition.fadeIn ? "checked" : ""}>
                Fade In
            </label>

            <input
                class="fadeInTime"
                type="number"
                min="0"
                step="0.1"
                value="${clip.settings.transition.fadeInDuration}">

            <label>
                <input class="fadeOut" type="checkbox"
                    ${clip.settings.transition.fadeOut ? "checked" : ""}>
                Fade Out
            </label>

            <input
                class="fadeOutTime"
                type="number"
                min="0"
                step="0.1"
                value="${clip.settings.transition.fadeOutDuration}">

        </div>


        <div class="cue-group">

            <div class="cue-group-title">
                Audio
            </div>

            <input
                class="volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value="${clip.settings.audio.volume}">

            <label>
                <input class="mute" type="checkbox"
                    ${clip.settings.audio.muted ? "checked" : ""}>
                Mute
            </label>

        </div>


        <div class="cue-group">

            <div class="cue-group-title">
                Trim
            </div>

            <label>

                In

                <input
                    class="trimIn"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${clip.settings.trim.in}">

            </label>

            <label>

                Out

                <input
                    class="trimOut"
                    type="number"
                    min="0"
                    step="0.01"
                    value="${clip.settings.trim.out ?? 0}">

            </label>

        </div>

    `;

    // Save references for cue-events.js

    cue.loopInput =
        controls.querySelector(".loop");

    cue.autoNextInput =
        controls.querySelector(".autoNext");

    cue.holdFrameInput =
        controls.querySelector(".holdFrame");

    cue.fadeInInput =
        controls.querySelector(".fadeIn");

    cue.fadeOutInput =
        controls.querySelector(".fadeOut");

    cue.fadeInTimeInput =
        controls.querySelector(".fadeInTime");

    cue.fadeOutTimeInput =
        controls.querySelector(".fadeOutTime");

    cue.volumeInput =
        controls.querySelector(".volume");

    cue.muteInput =
        controls.querySelector(".mute");

    cue.trimInInput =
        controls.querySelector(".trimIn");

    cue.trimOutInput =
        controls.querySelector(".trimOut");

    return controls;

}
