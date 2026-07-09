// ==============================================
// StageCue Drag & Drop
// ==============================================

export function enableDragDrop(playlist) {

    const panel = document.getElementById("playlistPanel");

    let counter = 0;

    function highlight() {
        panel.classList.add("drop-target");
    }

    function unhighlight() {
        panel.classList.remove("drop-target");
    }

    panel.addEventListener("dragenter", e => {

        e.preventDefault();

        counter++;

        highlight();

    });

    panel.addEventListener("dragover", e => {

        e.preventDefault();

        e.dataTransfer.dropEffect = "copy";

    });

    panel.addEventListener("dragleave", e => {

        e.preventDefault();

        counter--;

        if (counter <= 0) {

            counter = 0;

            unhighlight();

        }

    });

    panel.addEventListener("drop", e => {

        e.preventDefault();

        counter = 0;

        unhighlight();

        const files = [...e.dataTransfer.files];

        if (!files.length)
            return;

        playlist.addFiles(files);

    });

}
