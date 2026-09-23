// ==============================================
// StageCue Player UI
// Time Labels & Seek Bar
// ==============================================

export function updateTime(player) {

    const current = player.video.currentTime;

    player.currentLabel.textContent = format(current);

    if (player.video.duration) {
        player.seek.value = (current / player.video.duration) * 100;
    }

}

export function updateDuration(player) {
    player.durationLabel.textContent = format(player.video.duration);
}

export function updateMediaInfo(player) {
    if (!player?.video) return;

    const v = player.video;
    const resolution = v.videoWidth && v.videoHeight ? `${v.videoWidth}×${v.videoHeight}` : "--";
    const videoCodec = getVideoCodec(v);
    const audioCodec = getAudioCodec(v);
    const fps = getEstimatedFps(v);
    const time = `${format(v.currentTime || 0)} / ${format(v.duration || 0)}`;

    setText(player.mediaInfo?.resolution, resolution);
    setText(player.mediaInfo?.fps, fps);
    setText(player.mediaInfo?.videoCodec, videoCodec);
    setText(player.mediaInfo?.audioCodec, audioCodec);
    setText(player.mediaInfo?.time, time);
}

function setText(el, value) {
    if (el) el.textContent = value ?? "--";
}

function getEstimatedFps(video) {
    const src = (video.currentSrc || video.src || "").toLowerCase();
    const mime = video.mimeType || "";

    if (video.webkitDecodedFrameCount && video.webkitDecodedFrameCount > 0) {
        const now = performance.now();
        const frames = video.webkitDecodedFrameCount;
        if (video.__fpsSampleAt) {
            const elapsed = (now - video.__fpsSampleAt) / 1000;
            if (elapsed > 0.25)
                return `${Math.max(1, Math.round((frames - video.__fpsSampleAtFrames) / elapsed))} fps`;
        }
        video.__fpsSampleAt = now;
        video.__fpsSampleAtFrames = frames;
    }

    if (src.includes(".mov") || src.includes(".m4v") || mime.includes("quicktime"))
        return "24 fps";
    if (src.includes(".mp4") || mime.includes("mp4"))
        return "30 fps";
    if (src.includes(".webm") || mime.includes("webm"))
        return "30 fps";
    if (src.includes(".mkv") || mime.includes("matroska"))
        return "24 fps";

    return "--";
}

function getVideoCodec(video) {
    const src = (video.currentSrc || video.src || "").toLowerCase();
    const mime = video.mimeType || "";
    if (src.includes(".mp4") || mime.includes("mp4")) return "H.264 / AVC";
    if (src.includes(".webm") || mime.includes("webm")) return "VP8 / VP9";
    if (src.includes(".mov") || mime.includes("quicktime")) return "H.264 / ProRes";
    if (src.includes(".mkv") || mime.includes("matroska")) return "H.264 / HEVC";
    return "--";
}

function getAudioCodec(video) {
    const src = (video.currentSrc || video.src || "").toLowerCase();
    const mime = video.mimeType || "";
    if (src.includes(".mp4") || mime.includes("mp4")) return "AAC";
    if (src.includes(".webm") || mime.includes("webm")) return "Vorbis / Opus";
    if (src.includes(".mov") || mime.includes("quicktime")) return "AAC / PCM";
    if (src.includes(".mkv") || mime.includes("matroska")) return "AAC / Opus";
    return "--";
}

export function format(seconds) {

    if (isNaN(seconds) || seconds < 0)
        return "00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    }

    return String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");

}
