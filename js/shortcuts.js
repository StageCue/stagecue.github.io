export function registerShortcuts(app) {

    document.addEventListener("keydown", e => {

        switch (e.code) {

            case "Space":
                e.preventDefault();
                app.player.toggle();
                break;

            case "ArrowRight":
                app.playlist.next();
                break;

            case "ArrowLeft":
                app.playlist.previous();
                break;

        }

    });

}
