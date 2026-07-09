// ==============================================
// StageCue Storage
// ==============================================

export class Storage {

    constructor(playlist) {

        this.playlist = playlist;

    }

    //-----------------------------------
    // Save playlist
    //-----------------------------------

    save() {

        const data = {

            version: 1,

            created: new Date().toISOString(),

            loop:
                document.getElementById("loopPlaylist").checked,

            items: this.playlist.items.map(item => ({

                name: item.name,

                duration: item.duration

            }))

        };

        const blob = new Blob(

            [JSON.stringify(data, null, 2)],

            {
                type: "application/json"
            }

        );

        const a = document.createElement("a");

        a.href = URL.createObjectURL(blob);

        a.download = "playlist.stagecue.json";

        a.click();

        URL.revokeObjectURL(a.href);

    }

    //-----------------------------------
    // Load playlist metadata
    //-----------------------------------

    load(json) {

        document.getElementById("loopPlaylist").checked =
            !!json.loop;

        console.log("Playlist metadata loaded.");

        console.table(json.items);

    }

}
