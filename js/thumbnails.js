// ==============================================
// StageCue Thumbnail Generator
// ==============================================

export async function generateThumbnail(file) {

    return new Promise((resolve, reject) => {

        const video = document.createElement("video");

        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(file);

        video.src = url;

        video.onloadedmetadata = () => {

            const duration = video.duration;

            // Capture frame at 1 second or halfway through
            let captureTime = 1;

            if (duration < 2) {
                captureTime = duration / 2;
            }

            video.currentTime = captureTime;

        };

        video.onseeked = () => {

            const canvas = document.createElement("canvas");

            canvas.width = 320;
            canvas.height = 180;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const image =
                canvas.toDataURL("image/jpeg", 0.85);

            const duration = video.duration;

            URL.revokeObjectURL(url);

            resolve({

                thumbnail: image,

                duration

            });

        };

        video.onerror = () => {

            URL.revokeObjectURL(url);

            reject();

        };

    });

}
