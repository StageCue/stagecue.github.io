// ==============================================
// StageCue Player UI
// Time Labels & Seek Bar
// ==============================================

export function updateTime(player) {

    const current =
        player.video.currentTime;

    player.currentLabel.textContent =
        format(current);

    if (player.video.duration) {

        player.seek.value =

            (
                current /
                player.video.duration
            ) * 100;

    }

}

export function updateDuration(player) {

    player.durationLabel.textContent =

        format(

            player.video.duration

        );

}

export function format(seconds) {

    if (

        isNaN(seconds) ||

        seconds < 0

    )

        return "00:00";

    const hours =

        Math.floor(

            seconds / 3600

        );

    const minutes =

        Math.floor(

            (seconds % 3600) / 60

        );

    const secs =

        Math.floor(

            seconds % 60

        );

    if (hours > 0) {

        return (

            hours +

            ":" +

            String(minutes)

                .padStart(2, "0") +

            ":" +

            String(secs)

                .padStart(2, "0")

        );

    }

    return (

        String(minutes)

            .padStart(2, "0") +

        ":" +

        String(secs)

            .padStart(2, "0")

    );

}
