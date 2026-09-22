// ==============================================
// StageCue Player Playback Effects
// ==============================================

export function update(player) {

    const settings = player.currentClip?.settings ?? {};
    const audio = settings.audio ?? {};
    const transition = settings.transition ?? {};
    const trim = settings.trim ?? {};
    const baseVolume = Math.max(
        0,
        Math.min(1, Number(audio.volume ?? 1))
    );
    const current = player.currentTime;
    const trimIn = Math.max(0, Number(trim.in) || 0);
    const trimOut = Number(trim.out) > 0
        ? Number(trim.out)
        : player.duration;

    let volume = baseVolume;

    if (
        transition.fadeIn &&
        Number(transition.fadeInDuration) > 0 &&
        current < trimIn + Number(transition.fadeInDuration)
    ) {

        volume *= Math.max(
            0,
            Math.min(
                1,
                (current - trimIn) / Number(transition.fadeInDuration)
            )
        );

    }

    if (
        transition.fadeOut &&
        Number(transition.fadeOutDuration) > 0 &&
        current >= trimOut - Number(transition.fadeOutDuration)
    ) {

        volume *= Math.max(
            0,
            Math.min(
                1,
                (trimOut - current) / Number(transition.fadeOutDuration)
            )
        );

    }

    player.video.volume = volume;

    if (player.output)
        player.output.volume = volume;

}
