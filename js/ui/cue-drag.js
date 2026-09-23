// ==============================================
// StageCue
// Cue Drag & Drop
// ==============================================

export function enableCueDrag(cue) {

    const item = cue.element;

    //-------------------------------------------------
    // Drag Start
    //-------------------------------------------------

    item.addEventListener("dragstart", e => {

        item.classList.add("dragging");

        e.dataTransfer.effectAllowed = "move";

        e.dataTransfer.setData(
            "text/plain",
            cue.index
        );

    });

    //-------------------------------------------------
    // Drag End
    //-------------------------------------------------

    item.addEventListener("dragend", () => {

        item.classList.remove("dragging");

        document
            .querySelectorAll(".drag-over")
            .forEach(el =>
                el.classList.remove("drag-over")
            );

    });

    //-------------------------------------------------
    // Drag Over
    //-------------------------------------------------

    item.addEventListener("dragover", e => {

        e.preventDefault();

        e.dataTransfer.dropEffect = "move";

        item.classList.add("drag-over");

    });

    //-------------------------------------------------
    // Drag Leave
    //-------------------------------------------------

    item.addEventListener("dragleave", () => {

        item.classList.remove("drag-over");

    });

    //-------------------------------------------------
    // Drop
    //-------------------------------------------------

    item.addEventListener("drop", e => {

        e.preventDefault();

        item.classList.remove("drag-over");

        const from =
            Number(
                e.dataTransfer.getData("text/plain")
            );

        const to =
            cue.index;

        if (from === to)
            return;

        const playlist =
            cue.playlist;

        const moved =
            playlist.items.splice(from, 1)[0];

        playlist.items.splice(
            to,
            0,
            moved
        );

        //-------------------------------------------------
        // Fix selected clip index
        //-------------------------------------------------

        if (playlist.currentIndex === from) {

            playlist.currentIndex = to;

        }
        else if (
            from < playlist.currentIndex &&
            to >= playlist.currentIndex
        ) {

            playlist.currentIndex--;

        }
        else if (
            from > playlist.currentIndex &&
            to <= playlist.currentIndex
        ) {

            playlist.currentIndex++;

        }

        playlist.ui.render();

    });

}
