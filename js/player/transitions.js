// ==============================================
// StageCue Player
// Cue Transitions
// ==============================================

let activeTransition = null;

export function start(player, nextClip) {

    if (!nextClip)
        return;

    const current =
        player.currentClip;

    //---------------------------------------
    // No current clip
    //---------------------------------------

    if (!current) {

        player.load(nextClip);

        player.play();

        return;

    }

    const transition =

        current.settings?.transition ??

        "cut";

    switch (transition) {

        case "fade":

            fade(player, nextClip);
            break;

        case "crossfade":

            crossfade(player, nextClip);
            break;

        case "dip-black":

            dipBlack(player, nextClip);
            break;

        default:

            cut(player, nextClip);

    }

}

export function update(player) {

    if (!activeTransition)
        return;

    activeTransition(player);

}

function cut(player, clip) {

    player.load(clip);

    player.play();

}

function fade(player, clip) {

    activeTransition = () => {

        player.load(clip);

        player.play();

        activeTransition = null;

    };

}

function crossfade(player, clip) {

    console.log(

        "Crossfade coming soon"

    );

    cut(player, clip);

}

function dipBlack(player, clip) {

    console.log(

        "Dip to Black coming soon"

    );

    cut(player, clip);

}
