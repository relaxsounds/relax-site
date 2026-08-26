(() => {
    const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection ||
        null;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function shouldUsePerformanceMode() {
        const memory = Number(navigator.deviceMemory || 0);
        const cores = Number(navigator.hardwareConcurrency || 0);
        const effectiveType = String(connection?.effectiveType || "");

        return Boolean(
            window.matchMedia("(max-width: 1100px)").matches ||
            reducedMotion.matches ||
            connection?.saveData ||
            effectiveType === "slow-2g" ||
            effectiveType === "2g" ||
            effectiveType === "3g" ||
            (memory > 0 && memory <= 4) ||
            (cores > 0 && cores <= 4)
        );
    }

    function syncPerformanceClass() {
        document.documentElement.classList.toggle(
            "relax-performance-mode",
            shouldUsePerformanceMode()
        );
    }

    syncPerformanceClass();

    connection?.addEventListener?.(
        "change",
        syncPerformanceClass
    );

    reducedMotion.addEventListener?.(
        "change",
        syncPerformanceClass
    );

    /*
     * Extend the existing mobile-video policy to constrained desktops,
     * laptop-sized viewports and slow/data-saver connections.
     * The existing app keeps the same paths and scene logic; only the
     * runtime file selected changes to the lightweight mobile encode.
     */
    if (typeof isMobilePerformanceMode === "function") {
        const originalIsMobilePerformanceMode =
            isMobilePerformanceMode;

        isMobilePerformanceMode = function () {
            return (
                shouldUsePerformanceMode() ||
                originalIsMobilePerformanceMode()
            );
        };
    }

    /*
     * On constrained devices, avoid asking the browser to aggressively
     * buffer a large ambience file before playback is actually needed.
     */
    if (typeof createAudio === "function") {
        createAudio = function (path) {
            const audio = new Audio();

            audio.loop = true;
            audio.preload = shouldUsePerformanceMode()
                ? "metadata"
                : "auto";
            audio.src = path;
            audio.volume = muted ? 0 : audioVolume;

            return audio;
        };
    }

    /*
     * app.js chooses the first source before this enhancement script runs.
     * Re-evaluate it once so laptop-sized / constrained devices do not keep
     * downloading the much heavier desktop encode unnecessarily.
     */
    try {
        if (
            shouldUsePerformanceMode() &&
            typeof getVideoUrl === "function" &&
            typeof initialScene !== "undefined" &&
            currentVideo &&
            initialScene?.video
        ) {
            const desiredUrl = getVideoUrl(initialScene.video);
            const currentUrl = currentVideo.getAttribute("src") || "";

            if (
                currentUrl !== desiredUrl &&
                !currentUrl.endsWith(desiredUrl)
            ) {
                currentVideo.pause();
                currentVideo.preload = "metadata";
                currentVideo.src = desiredUrl;
                currentVideo.load();
            }
        }
    } catch (error) {
        /* Progressive enhancement: the base player remains functional. */
    }

    /*
     * Never make the interface feel frozen just because the first video is
     * slow. The original canplay handler can still finish earlier; this only
     * provides a much shorter ceiling than the old 8-second fallback.
     */
    window.setTimeout(() => {
        document.body?.classList.remove("is-loading");
    }, 650);

    window.setTimeout(() => {
        if (typeof finishLoading === "function") {
            finishLoading();
        } else {
            document
                .querySelector("#loadingScreen")
                ?.classList.add("hidden");
        }
    }, 900);

    /*
     * Browsers do not consistently pause decorative video in background
     * tabs. Stop video decoding explicitly; audio is intentionally left
     * alone because users may want the ambience to continue playing.
     */
    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden && currentVideo) {
                currentVideo.pause();
            }
        },
        { passive: true }
    );

    window.addEventListener(
        "pagehide",
        () => {
            currentVideo?.pause?.();
            nextVideo?.pause?.();
        },
        { passive: true }
    );
})();
