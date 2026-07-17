// ==============================================
// StageCue Playlist Manager
// ==============================================

import { generateThumbnail } from "./thumbnails.js";
import { UI } from "./ui.js";


export class Playlist {


    constructor(player) {

        this.player = player;

        this.ui = new UI(this);

        this.items = [];

        this.currentIndex = -1;

        this.container =
            document.getElementById("playlist");

        this.counter =
            document.getElementById("playlistCount");

        this.loop =
            document.getElementById("loopPlaylist");


        this.bindEvents();

    }



    formatDuration(seconds) {

        if (isNaN(seconds))
            return "--:--";


        const h =
            Math.floor(seconds / 3600);

        const m =
            Math.floor((seconds % 3600) / 60);

        const s =
            Math.floor(seconds % 60);


        if (h) {

            return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

        }


        return `${m}:${String(s).padStart(2,"0")}`;

    }



    bindEvents() {

        document.addEventListener(
            "stagecue:ended",
            () => this.next()
        );

    }



    //-----------------------------------
    // Add files
    //-----------------------------------

    async addFiles(files) {


        for (const file of files) {


            if (
                !file.type.startsWith("video/")
            )
                continue;



            const clip = {


                id:
                    crypto.randomUUID(),


                type:
                    "video",


                name:
                    file.name,


                file,


                url:
                    null,


                thumbnail:
                    null,


                duration:
                    null,


                durationLabel:
                    "--:--"


            };



            this.items.push(clip);



            // Update UI immediately

            this.ui.render();



            // Generate thumbnail later

            try {


                const result =
                    await generateThumbnail(file);



                clip.thumbnail =
                    result.thumbnail;


                clip.duration =
                    result.duration;


                clip.durationLabel =
                    this.formatDuration(
                        result.duration
                    );


                this.ui.render();


            }
            catch(error){

                console.error(
                    "Thumbnail error:",
                    error
                );

            }

        }



        if (
            this.currentIndex === -1 &&
            this.items.length
        ){

            this.select(0);

        }


    }



    //-----------------------------------
    // Select
    //-----------------------------------

    select(index){


        if(index < 0)
            return;


        if(index >= this.items.length)
            return;



        this.currentIndex =
            index;


        this.player.load(
            this.items[index]
        );


        this.ui.render();


    }




    //-----------------------------------
    // Play
    //-----------------------------------

    play(index){


        if(typeof index === "number"){

            this.select(index);

        }


        this.player.play();

    }




    //-----------------------------------
    // Next
    //-----------------------------------

    next(){


        if(!this.items.length)
            return;



        let next =
            this.currentIndex + 1;



        if(next >= this.items.length){


            if(this.loop?.checked){

                next = 0;

            }
            else{

                return;

            }

        }



        this.play(next);


    }




    //-----------------------------------
    // Previous
    //-----------------------------------

    previous(){


        if(!this.items.length)
            return;



        let previous =
            this.currentIndex - 1;



        if(previous < 0)
            previous = 0;



        this.play(previous);


    }




    //-----------------------------------
    // Remove
    //-----------------------------------

    remove(index){


        if(index < 0)
            return;


        if(index >= this.items.length)
            return;



        this.items.splice(
            index,
            1
        );



        if(
            this.currentIndex >=
            this.items.length
        ){

            this.currentIndex =
                this.items.length - 1;

        }



        this.ui.render();


    }




    //-----------------------------------
    // Clear
    //-----------------------------------

    clear(){


        this.items = [];

        this.currentIndex = -1;


        this.ui.render();


    }



}
