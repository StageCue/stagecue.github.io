// ==============================================
// StageCue Player Engine - Fixed Version
// ==============================================
import Timeline from "./timeline/timeline.js";

export class Player {
    constructor() {
        // Preview video
        this.video = document.getElementById("preview");

        // Timeline root
        this.timelineRoot = document.getElementById("timeline");

        // UI
        this.seek = document.getElementById("seek");
        this.currentLabel = document.getElementById("current");
        this.durationLabel = document.getElementById("duration");
        this.overlay = document.getElementById("previewOverlay");

        // Data
        this.currentClip = null;
        this.videoURL = null;        // Track current blob URL
        this.output = null;

        // Timeline
        this.timeline = null;
        if (this.timelineRoot) {
            this.timeline = new Timeline({
                root: this.timelineRoot,
                video: this.video,
                fps: 30
            });
        }

        this.bindEvents();
    }

    // =====================================================
    // Events
    // =====================================================
    bindEvents() {
        this.video.addEventListener("loadedmetadata", async () => {
            this.updateDuration();
            if (this.timeline && this.currentClip) {
                try {
                    await this.timeline.load(
                        this.currentClip.file || this.currentClip.url
                    );
                } catch (err) {
                    console.error("Timeline error:", err);
                }
            }
        });

        this.video.addEventListener("timeupdate", () => this.updateTime());
        this.video.addEventListener("play", () => this.syncOutput());
        this.video.addEventListener("pause", () => this.syncOutput());
        this.video.addEventListener("seeked", () => this.syncOutput());
        this.video.addEventListener("ended", () => this.handleEnded());

        this.seek.addEventListener("input", () => {
            if (!this.video.duration) return;
            this.seekTo((this.seek.value / 100) * this.video.duration);
        });
    }

    // =====================================================
    // Media
    // =====================================================
    load(clip) {
        if (!clip) return;

        this.stop();

        // Revoke previous blob URL to prevent memory leaks
        if (this.videoURL) {
            URL.revokeObjectURL(this.videoURL);
            this.videoURL = null;
        }

        this.currentClip = clip;

        if (clip.file) {
            // Local File → create fresh blob URL
            this.videoURL = URL.createObjectURL(clip.file);
            this.video.src = this.videoURL;
        } else if (clip.url) {
            // Remote URL
            this.video.src = clip.url;
        } else {
            console.error("Clip must have either .file or .url property");
            return;
        }

        this.overlay.style.display = "none";
        this.video.load();
    }

    unload() {
        this.stop();

        if (this.videoURL) {
            URL.revokeObjectURL(this.videoURL);
            this.videoURL = null;
        }

        this.video.removeAttribute("src");
        this.video.load();

        this.currentClip = null;

        if (this.timeline) {
            this.timeline.waveform.clear();
            this.timeline.clearMarkers();
            this.timeline.clearSelection();
        }
    }

    // =====================================================
    // Playback
    // =====================================================
    async play() {
        try {
            await this.video.play();
        } catch (err) {
            console.warn("Playback failed:", err);
        }
    }

    pause() {
        this.video.pause();
    }

    stop() {
        this.video.pause();
        this.video.currentTime = 0;
        if (this.output) {
            this.output.pause();
            this.output.currentTime = 0;
        }
    }

    toggle() {
        if (this.video.paused) this.play();
        else this.pause();
    }

    handleEnded() {
        // Optional: Add auto-advance logic here later
        this.syncOutput();
    }

    // =====================================================
    // Volume
    // =====================================================
    setVolume(value) {
        this.video.volume = Math.max(0, Math.min(1, value));
    }

    // =====================================================
    // Seek
    // =====================================================
    seekTo(seconds) {
        if (!this.video.duration) return;
        this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration));
    }

    // =====================================================
    // UI
    // =====================================================
    updateTime() {
        this.currentLabel.textContent = this.format(this.video.currentTime);

        if (this.video.duration) {
            this.seek.value = (this.video.currentTime / this.video.duration) * 100;
        }

        if (this.output) {
            this.output.currentTime = this.video.currentTime;
        }
    }

    updateDuration() {
        this.durationLabel.textContent = this.format(this.video.duration);
    }

    format(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    // =====================================================
    // Output Window
    // =====================================================
    syncOutput() {
        if (!this.output) return;
        this.output.currentTime = this.video.currentTime;

        if (this.video.paused) {
            this.output.pause();
        } else {
            this.output.play().catch(() => {});
        }
    }

    attachOutput(videoElement) {
        this.output = videoElement;
        this.syncOutput();
    }

    // =====================================================
    // Timeline API
    // =====================================================
    addCue(name = "Cue", color = "#ff9800") {
        return this.timeline?.addMarker(this.video.currentTime, name, color);
    }

    zoomIn() { this.timeline?.zoomIn(); }
    zoomOut() { this.timeline?.zoomOut(); }
    fitTimeline() { this.timeline?.fit(); }

    // =====================================================
    // Getters
    // =====================================================
    get currentTime() { return this.video.currentTime; }
    get duration() { return this.video.duration || 0; }
    get paused() { return this.video.paused; }

    // =====================================================
    // Cleanup
    // =====================================================
    destroy() {
        this.timeline?.destroy();
        if (this.videoURL) {
            URL.revokeObjectURL(this.videoURL);
        }
        this.stop();
    }
}
     




