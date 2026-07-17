// ==============================================
// StageCue Thumbnail Generator
// ==============================================


export async function generateThumbnail(file) {


    return new Promise((resolve, reject) => {


        const video =
            document.createElement("video");


        const url =
            URL.createObjectURL(file);



        let finished = false;



        function cleanup(){

            URL.revokeObjectURL(url);

            video.remove();

        }



        function fail(error){

            if(finished)
                return;


            finished = true;

            cleanup();

            reject(error);

        }



        video.preload = "auto";

        video.muted = true;

        video.playsInline = true;

        video.src = url;



        video.onloadedmetadata = () => {


            const duration =
                video.duration;



            let captureTime = 1;



            if(duration < 2){

                captureTime =
                    duration / 2;

            }



            if(
                isFinite(captureTime)
            ){

                video.currentTime =
                    captureTime;

            }
            else{

                fail(
                    "Invalid duration"
                );

            }


        };



        video.onloadeddata = () => {


            // fallback

            if(video.currentTime === 0){

                video.currentTime =
                    Math.min(
                        0.5,
                        video.duration
                    );

            }


        };



        video.onseeked = () => {


            if(finished)
                return;



            finished = true;



            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width = 320;

            canvas.height = 180;



            const ctx =
                canvas.getContext(
                    "2d"
                );



            ctx.drawImage(

                video,

                0,

                0,

                canvas.width,

                canvas.height

            );



            const thumbnail =
                canvas.toDataURL(
                    "image/jpeg",
                    0.85
                );



            const duration =
                video.duration;



            cleanup();



            resolve({

                thumbnail,

                duration

            });


        };




        video.onerror = () => {


            fail(
                "Video decode failed"
            );


        };



        video.load();



    });


}


