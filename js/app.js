// ==============================================
// StageCue
// Application Entry Point
// ==============================================

import { WelcomeScreen } from "./welcome.js";
import { Storage } from "./storage.js";
import { Playlist } from "./playlist.js";
import { Player } from "./player.js";
import { OutputWindow } from "./output.js";
import { enableDragDrop } from "./dragdrop.js";
import { registerShortcuts } from "./shortcuts.js";


class StageCue {


    constructor(){


        this.welcome =
            new WelcomeScreen();


        this.player =
            null;


        this.playlist =
            null;


        this.output =
            null;


        this.storage =
            null;


    }





    init(){


        console.log(
            "StageCue starting..."
        );



        requestAnimationFrame(() => {



            this.player =
                new Player();



            this.playlist =
                new Playlist(
                    this.player
                );



            this.output =
                new OutputWindow(
                    this.player
                );



            this.storage =
                new Storage(
                    this.playlist
                );



            this.bindWelcome();

            this.bindToolbar();

            this.bindTransport();


            enableDragDrop(
                this.playlist
            );


            registerShortcuts(
                this
            );


        });


    }





    // =====================================================
    // Welcome
    // =====================================================

    bindWelcome(){


        const newButton =
            document.getElementById(
                "welcomeNew"
            );


        if(newButton){


            newButton.onclick = () => {


                this.playlist.clear();


                this.welcome.hide();


            };


        }





        const openButton =
            document.getElementById(
                "welcomeOpen"
            );


        if(openButton){


            openButton.onclick = () => {


                this.welcome.hide();


                document
                .getElementById(
                    "loadPlaylist"
                )
                ?.click();


            };


        }


    }





    // =====================================================
    // Toolbar
    // =====================================================

    bindToolbar(){



        const saveButton =
            document.getElementById(
                "savePlaylist"
            );


        if(saveButton){


            saveButton.onclick = () => {


                this.storage.save();


            };


        }





        const loadButton =
            document.getElementById(
                "loadPlaylist"
            );


        if(loadButton){


            loadButton.onclick = () => {



                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "file";


                input.accept =
                    ".json,.stagecue.json";



                input.onchange = e => {



                    const file =
                        e.target.files[0];


                    if(!file)
                        return;



                    const reader =
                        new FileReader();



                    reader.onload = () => {


                        try {


                            const json =
                                JSON.parse(
                                    reader.result
                                );


                            this.storage.load(
                                json
                            );


                        }


                        catch(err){


                            console.error(
                                "Load error:",
                                err
                            );


                            alert(
                                "Invalid StageCue project file"
                            );


                        }


                    };



                    reader.readAsText(
                        file
                    );


                };



                input.click();


            };


        }





        const openFiles =
            document.getElementById(
                "openFiles"
            );


        const filePicker =
            document.getElementById(
                "filePicker"
            );



        if(openFiles && filePicker){


            openFiles.onclick = () => {


                filePicker.click();


            };





            filePicker.addEventListener(

                "change",

                e => {


                    this.playlist.addFiles(

                        [
                            ...e.target.files
                        ]

                    );


                }

            );


        }





        const outputButton =
            document.getElementById(
                "outputWindow"
            );


        if(outputButton){


            outputButton.onclick = () => {


                this.output.open();


            };


        }





        const fullscreen =
            document.getElementById(
                "fullscreen"
            );


        if(fullscreen){


            fullscreen.onclick = () => {


                this.output.fullscreen();


            };


        }


    }





    // =====================================================
    // Transport
    // =====================================================

    bindTransport(){



        const play =
            document.getElementById(
                "play"
            );


        if(play){

            play.onclick = () => {

                this.player.play();

            };

        }





        const pause =
            document.getElementById(
                "pause"
            );


        if(pause){

            pause.onclick = () => {

                this.player.pause();

            };

        }





        const stop =
            document.getElementById(
                "stop"
            );


        if(stop){

            stop.onclick = () => {

                this.player.stop();

            };

        }





        const next =
            document.getElementById(
                "next"
            );


        if(next){

            next.onclick = () => {

                this.playlist.next();

            };

        }





        const previous =
            document.getElementById(
                "previous"
            );


        if(previous){

            previous.onclick = () => {

                this.playlist.previous();

            };

        }





        const volume =
            document.getElementById(
                "volume"
            );


        if(volume){


            volume.addEventListener(

                "input",

                e => {


                    this.player.setVolume(

                        Number(
                            e.target.value
                        )

                    );


                }

            );


        }


    }


}





window.addEventListener(

    "DOMContentLoaded",

    () => {


        window.stageCue =
            new StageCue();


        window.stageCue.init();


    }

);
