// ==============================================
// StageCue Player UI
// Time Labels & Media Metadata
// ==============================================

export function updateTime(player) {
    const current = player.video.currentTime;
    player.currentLabel.textContent = format(current);
    if (player.video.duration)
        player.seek.value = (current / player.video.duration) * 100;
    updateMediaInfo(player);
}

export function updateDuration(player) {
    player.durationLabel.textContent = format(player.video.duration);
    updateMediaInfo(player);
}

export function updateMediaInfo(player) {
    if (!player?.video) return;

    const video = player.video;
    const clip = player.currentClip;
    const resolution = video.videoWidth && video.videoHeight ? `${video.videoWidth}×${video.videoHeight}` : "--";
    const fps = getEstimatedFps(video);
    const videoCodec = getVideoCodec(video, clip);
    const audioCodec = getAudioCodec(video, clip);
    const size = clip?.file?.size || clip?.size || 0;
    const duration = Number(video.duration) || Number(clip?.duration) || 0;
    const bitrate = size && duration ? formatBitrate((size * 8) / duration) : "--";
    const time = `${format(video.currentTime || 0)} / ${format(video.duration || 0)}`;

    setText(player.mediaInfo?.resolution, resolution);
    setText(player.mediaInfo?.fps, fps);
    setText(player.mediaInfo?.videoCodec, videoCodec);
    setText(player.mediaInfo?.audioCodec, audioCodec);
    setText(player.mediaInfo?.fileSize, size ? formatBytes(size) : "--");
    setText(player.mediaInfo?.bitrate, bitrate);
    setText(player.mediaInfo?.time, time);

    const badge = document.getElementById("mediaBadge");
    if (badge) {
        badge.textContent = size
            ? `${resolution} • ${fps} • ${formatBytes(size)}`
            : `${resolution} • ${fps}`;
        badge.hidden = !resolution || resolution === "--";
    }
}

function setText(element, value) {
    if (element) element.textContent = value ?? "--";
}

function getEstimatedFps(video) {
    const frames = video.getVideoPlaybackQuality?.().totalVideoFrames;
    const now = performance.now();
    if (Number.isFinite(frames)) {
        if (video.__fpsSampleAt) {
            const elapsed = (now - video.__fpsSampleAt) / 1000;
            if (elapsed >= 0.5) {
                const fps = Math.round((frames - video.__fpsSampleFrames) / elapsed);
                video.__fpsSampleAt = now;
                video.__fpsSampleFrames = frames;
                if (fps > 0 && fps < หว) return `${fps} fps`;
            }
        } else {
            video.__fpsSampleAt = now;
            video.__fpsSampleFrames = frames;
        }
    }
    return "--";
}

function getVideoCodec(video, clip) {
    const type = (clip?.file?.type || video.currentSrc || video.src || "").toLowerCase();
    if (type.includes("av01")) return "AV1";
    if (type.includes("hevc") || type.includes("hvc1")) return "HEVC / H.265";
    if (type.includes("vp9") || type.includes("webm")) return "VP9 / WebM*";
    if (type.includes("vp8")) return "VP8*";
    if (type.includes("avc") || type.includes("mp4") || type.includes("quicktime")) return "H.264 / AVC*";
    return "--";
}

function getAudioCodec(video, clip) {
    const type = (clip?.file?.type || video.currentSrc || video.src || "").toLowerCase();
    if (type.includes("opus")) return "Opus*";
    if (type.includes("vorbis")) return "Vorbis*";
    if (type.includes("mp4") || type.includes("quicktime")) return "AAC*";
    if (type.includes("webm")) return "Opus / Vorbis*";
    return "--";
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "--";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

function formatBitrate(bitsPerSecond) {
    if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) return "--";
    return bitsPerSecond >= 1_000_000
        ? `${(bitsPerSecond / 1_000_000).toFixed(2)} Mbps`
        : `${Math.round(bitsPerSecond / 1_000)} kbps`;
}

export function format(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
