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
     * The base player now chooses lightweight video/audio before the first
     * media request. This layer only owns visual performance state and
     * lifecycle behavior, so it no longer monkey-patches player functions.
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
     * Stop decorative video decoding in background tabs. Audio intentionally
     * stays alive because ambience playback is useful while the tab is hidden.
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
