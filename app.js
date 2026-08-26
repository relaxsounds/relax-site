const videoA = document.querySelector("#videoA");
const videoB = document.querySelector("#videoB");

const playButton = document.querySelector("#playButton");
const muteButton = document.querySelector("#muteButton");
const volumeSlider = document.querySelector("#volumeSlider");
const volumeValue = document.querySelector("#volumeValue");

const audioShell = document.querySelector("#audioShell");
const audioPanel = document.querySelector("#audioPanel");
const volumeToggle = document.querySelector("#volumeToggle");
const volumeToggleIcon = document.querySelector("#volumeToggleIcon");

const sceneTitle = document.querySelector("#sceneTitle");
const sceneDescription = document.querySelector("#sceneDescription");
const sceneInfo = document.querySelector(".scene-info");

const sceneButtons = document.querySelectorAll(".scene");

// =====================================================
// SCENE VARIANTS
// =====================================================

const sceneVariants = {

    rain: {

        heavy: {
            label: "HEAVY",
            subtitle: "сильный дождь",
            title: "HEAVY RAIN",
            description: "сильный дождь · плотный шум воды",
            video: "assets/video/optimized/rain-heavy.mp4",
            audio: "assets/audio/mixkit-rain-in-the-jungle-and-birds-2431.wav"
        },

        thunder: {
            label: "THUNDER",
            subtitle: "дождь · гром",
            title: "THUNDER",
            description: "дождь · гром · гроза",
            video: "assets/video/optimized/rain-thunder.mp4",
            audio: "assets/audio/heavy-rain.mp3"
        },

        sea: {
            label: "SEA",
            subtitle: "дождь · море",
            title: "SEA RAIN",
            description: "дождь · море · волны",
            video: "assets/video/optimized/rain-sea.mp4",
            audio: "assets/audio/sea-rain.mp3"
        },

        window: {
    label: "WINDOW",
    subtitle: "дождь за окном",
    title: "WINDOW RAIN",
    description: "тихий дождь · уют · окно",
    video: "assets/video/optimized/rain-window.mp4",
    audio: "assets/audio/window-rain.mp3"
}

    },

    city: {

        night: {
            label: "NIGHT",
            subtitle: "ночной город",
            title: "NIGHT CITY",
            description: "ночной город · огни · атмосфера",
            video: "assets/video/optimized/city-night.mp4",
            audio: "assets/audio/city-night.mp3"
},

        traffic: {
    label: "TRAFFIC",
    subtitle: "улицы · машины",
    title: "CITY TRAFFIC",
    description: "город · движение · шум улиц",
    video: "assets/video/optimized/city-traffic.mp4",
    audio: "assets/audio/city-traffic-loop2.wav"
},

        rooftop: {
            label: "ROOFTOP",
            subtitle: "город с высоты",
            title: "ROOFTOP",
            description: "высота · город · далёкий шум",
            video: "assets/video/optimized/city-rooftop.mp4",
            audio: "assets/audio/city-rooftop.mp3"
},

        late: {
            label: "LATE NIGHT",
            subtitle: "город после полуночи",
            title: "LATE NIGHT",
            description: "ночь · редкие машины · тишина",
            video: "assets/video/optimized/city-late-night.mp4",
            audio: "assets/audio/city-late-night.mp3"
        }

    },

    forest: {

        deep: {
            label: "DEEP",
            subtitle: "глубокий лес",
            title: "DEEP FOREST",
            description: "лес · природа · спокойствие",
            video: "assets/video/optimized/forest-deep.mp4",
            audio: "assets/audio/forest-deep.mp3"
        },

        birds: {
            label: "BIRDS",
            subtitle: "пение птиц",
            title: "FOREST BIRDS",
            description: "лес · птицы · утро",
            video: "assets/video/optimized/forest-birds.mp4",
            audio: "assets/audio/forest-birds.mp3"
        },

        wind: {
            label: "WIND",
            subtitle: "ветер в деревьях",
            title: "FOREST WIND",
            description: "деревья · ветер · природа",
            video: "assets/video/optimized/forest-wind.mp4",
            audio: "assets/audio/forest-wind.mp3"
        },

        creek: {
            label: "CREEK",
            subtitle: "лесной ручей",
            title: "FOREST CREEK",
            description: "лес · ручей · спокойствие",
            video: "assets/video/optimized/forest-creek.mp4",
            audio: "assets/audio/forest-creek.mp3"
        }

    },

    ocean: {

        waves: {
            label: "WAVES",
            subtitle: "мягкие волны",
            title: "OCEAN WAVES",
            description: "море · волны · спокойствие",
            video: "assets/video/optimized/ocean-waves.mp4",
            audio: "assets/audio/ocean-waves.mp3"
        },

        shore: {
            label: "SHORE",
            subtitle: "волны у берега",
            title: "OCEAN SHORE",
            description: "берег · море · волны",
            video: "assets/video/optimized/ocean-shore.mp4",
            audio: "assets/audio/ocean-shore.mp3"
        },

        storm: {
            label: "STORM",
            subtitle: "штормовое море",
            title: "OCEAN STORM",
            description: "море · ветер · сильные волны",
            video: "assets/video/optimized/ocean-storm.mp4",
            audio: "assets/audio/ocean-storm.mp3"
        },

        night: {
            label: "NIGHT",
            subtitle: "ночной океан",
            title: "NIGHT OCEAN",
            description: "ночь · море · тёмные волны",
            video: "assets/video/optimized/ocean-night.mp4",
            audio: "assets/audio/ocean-night.mp3"
        }

    }

};

// =====================================================
// STATE
// =====================================================

let currentVideo = videoA;
let nextVideo = videoB;

let currentScene = "rain";

const currentVariants = {
    rain: "heavy",
    city: "night",
    forest: "deep",
    ocean: "waves"
};

let playing = false;

let currentAudio = null;

let transitionId = 0;

let audioVolume = 0.50;
let muted = false;
let videoTransitionTimer = null;

// Храним ожидающие обработчики загрузки для двух видеослоёв.
// Это не даёт старому loadeddata от предыдущего переключения
// вмешаться в новое переключение после возврата на вкладку.
const videoReadyHandlers = new Map();

// =====================================================
// VOLUME CONTROLS
// =====================================================

function clampVolume(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.min(1, Math.max(0, number));
}


function sliderValueToVolume(value) {
    const min = Number(volumeSlider.min || 0);
    const max = Number(volumeSlider.max || 1);
    const number = Number(value);

    if (!Number.isFinite(number) || max <= min) {
        return audioVolume;
    }

    return clampVolume(
        (number - min) / (max - min)
    );
}


function volumeToSliderValue(volume) {
    const min = Number(volumeSlider.min || 0);
    const max = Number(volumeSlider.max || 1);

    if (max <= min) {
        return volume;
    }

    return min + clampVolume(volume) * (max - min);
}


function updateVolumeUI() {

    const percent = Math.round(audioVolume * 100);

    volumeSlider.value =
        volumeToSliderValue(audioVolume);

    volumeValue.textContent = `${percent}%`;

    let icon = "🔊";

    if (muted || audioVolume === 0) {

        icon = "🔇";

    } else if (audioVolume < 0.35) {

        icon = "🔈";

    } else if (audioVolume < 0.7) {

        icon = "🔉";

    }

    muteButton.textContent = icon;

    if (volumeToggleIcon) {
        volumeToggleIcon.textContent = icon;
    }

    if (volumeToggle) {
        volumeToggle.setAttribute(
            "aria-label",
            muted
                ? "Открыть громкость — звук выключен"
                : `Открыть громкость — ${percent}%`
        );
    }

}


volumeSlider.addEventListener(
    "input",
    () => {

        audioVolume =
            sliderValueToVolume(
                volumeSlider.value
            );

        muted = false;

        if (currentAudio) {

            currentAudio.volume =
                audioVolume;

        }

        updateVolumeUI();

    }
);


muteButton.addEventListener(
    "click",
    () => {

        muted = !muted;

        if (currentAudio) {

            currentAudio.volume =
                muted ? 0 : audioVolume;

        }

        updateVolumeUI();

    }
);


// =====================================================
// COMPACT VOLUME PANEL — TOUCH / MOBILE
// =====================================================

const compactAudioMedia = window.matchMedia(
    "(max-width: 768px), (hover: none) and (pointer: coarse)"
);


function isCompactAudioMode() {
    return compactAudioMedia.matches;
}


function setVolumePanelOpen(open) {

    if (!audioShell || !volumeToggle) {
        return;
    }

    const shouldOpen =
        Boolean(open && isCompactAudioMode());

    audioShell.classList.toggle(
        "is-open",
        shouldOpen
    );

    volumeToggle.setAttribute(
        "aria-expanded",
        String(shouldOpen)
    );

}


if (
    audioShell &&
    volumeToggle &&
    audioPanel
) {

    volumeToggle.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            setVolumePanelOpen(
                !audioShell.classList.contains(
                    "is-open"
                )
            );

        }
    );


    document.addEventListener(
        "pointerdown",
        event => {

            if (
                !isCompactAudioMode() ||
                !audioShell.classList.contains(
                    "is-open"
                ) ||
                audioShell.contains(event.target)
            ) {
                return;
            }

            setVolumePanelOpen(false);

        },
        { passive: true }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                setVolumePanelOpen(false);
            }

        }
    );


    const handleCompactAudioChange = () => {

        if (!isCompactAudioMode()) {
            setVolumePanelOpen(false);
        }

    };


    if (
        typeof compactAudioMedia.addEventListener ===
        "function"
    ) {

        compactAudioMedia.addEventListener(
            "change",
            handleCompactAudioChange
        );

    } else if (
        typeof compactAudioMedia.addListener ===
        "function"
    ) {

        compactAudioMedia.addListener(
            handleCompactAudioChange
        );

    }

}


updateVolumeUI();


// =====================================================
// AUDIO
// =====================================================

const AUDIO_VERSION = 2;

function createAudio(path) {

    const audio =
        new Audio(`${path}?v=${AUDIO_VERSION}`);

    audio.loop = true;
    audio.preload =
        isMobilePerformanceMode()
            ? "metadata"
            : "auto";

    // Ставим актуальную громкость сразу.
    // Это убирает конфликт ползунка с fade-анимацией.
    audio.volume =
        muted ? 0 : audioVolume;

    return audio;
}


async function stopCurrentAudio() {

    if (!currentAudio) {
        return;
    }

    const audio = currentAudio;

    currentAudio = null;

    audio.pause();

    try {
        audio.currentTime = 0;
    } catch (error) {}

    audio.volume = 0;

}


async function startSceneAudio(
    audioPath,
    id
) {

    if (
        !playing ||
        !audioPath
    ) {
        return;
    }


    // Старый звук выключаем сразу.
    if (currentAudio) {

        const oldAudio =
            currentAudio;

        currentAudio = null;

        oldAudio.pause();

        try {
            oldAudio.currentTime = 0;
        } catch (error) {}

        oldAudio.volume = 0;

    }


    const audio =
        createAudio(audioPath);

    /*
     * Важно: назначаем currentAudio ДО await audio.play().
     * Тогда ползунок уже управляет новым звуком,
     * даже пока мобильный браузер запускает аудио.
     */
    currentAudio = audio;


    try {

        await audio.play();

    } catch (error) {

        /*
         * На перегруженных мобильных браузерах play() иногда
         * временно падает с AbortError/ресурсной ошибкой.
         * Если переход всё ещё актуален — пробуем один раз ещё.
         */
        if (
            id === transitionId &&
            playing &&
            currentAudio === audio &&
            error?.name !== "NotAllowedError"
        ) {

            await new Promise(resolve => {
                setTimeout(resolve, 120);
            });

            try {

                await audio.play();

            } catch (retryError) {

                if (currentAudio === audio) {
                    currentAudio = null;
                }

                return;

            }

        } else {

            if (currentAudio === audio) {
                currentAudio = null;
            }

            return;

        }

    }


    // Пока браузер запускал файл,
    // пользователь мог выбрать другую сцену.
    if (
        id !== transitionId ||
        !playing ||
        currentAudio !== audio
    ) {

        audio.pause();

        try {
            audio.currentTime = 0;
        } catch (error) {}

        audio.volume = 0;

        if (currentAudio === audio) {
            currentAudio = null;
        }

        return;

    }


    // За время await пользователь мог
    // изменить громкость или mute.
    audio.volume =
        muted ? 0 : audioVolume;

}

// =====================================================
// VIDEO
// =====================================================
const VIDEO_VERSION = 8;

/*
 * Mobile performance mode.
 *
 * Phones/touch devices use lightweight 720p/24 FPS files from
 * assets/video/mobile/. Desktop keeps the original optimized files.
 */
const MOBILE_VIDEO_MEDIA = window.matchMedia(
    "(max-width: 900px), (hover: none) and (pointer: coarse)"
);


function isMobilePerformanceMode() {
    const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection ||
        null;

    const effectiveType =
        String(connection?.effectiveType || "");

    const memory =
        Number(navigator.deviceMemory || 0);

    const cores =
        Number(navigator.hardwareConcurrency || 0);

    return Boolean(
        MOBILE_VIDEO_MEDIA.matches ||
        window.matchMedia("(max-width: 1100px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        connection?.saveData ||
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        effectiveType === "3g" ||
        (memory > 0 && memory <= 4) ||
        (cores > 0 && cores <= 4)
    );
}


function getRuntimeVideoPath(videoPath) {

    if (!isMobilePerformanceMode()) {
        return videoPath;
    }

    return videoPath.replace(
        "assets/video/optimized/",
        "assets/video/mobile/"
    );

}


function getVideoUrl(videoPath) {

    const runtimePath =
        getRuntimeVideoPath(videoPath);

    return `${runtimePath}?v=${VIDEO_VERSION}`;

}


function prepareVideoSource(video, videoPath) {

    if (!video || !videoPath) {
        return "";
    }

    const url = getVideoUrl(videoPath);
    const currentSource = video.getAttribute("src") || "";

    if (currentSource === url || video.src.endsWith(url)) {
        video.preload = "auto";
        return url;
    }

    clearPendingVideoReady(video);
    video.pause();
    video.preload = "auto";
    video.src = url;
    video.load();

    return url;
}
	
function clearPendingVideoReady(video) {

    const handler =
        videoReadyHandlers.get(video);

    if (!handler) {
        return;
    }

    video.removeEventListener(
        "loadeddata",
        handler
    );

    videoReadyHandlers.delete(video);

}


function safePlayVideo(video) {

    if (
        !video ||
        !playing ||
        document.hidden
    ) {
        return;
    }

    const promise = video.play();

    if (
        promise &&
        typeof promise.catch === "function"
    ) {
        promise.catch(() => {});
    }

}


function recoverCurrentMedia() {

    if (
        !playing ||
        document.hidden
    ) {
        return;
    }

    /*
     * Некоторые браузеры при уходе на другую вкладку
     * автоматически приостанавливают video.
     * Наше состояние playing при этом остаётся true.
     * Поэтому при возврате явно продолжаем активный слой.
     */
    if (currentVideo) {

        if (
            currentVideo.readyState === 0 &&
            currentVideo.src
        ) {
            currentVideo.load();
        }

        safePlayVideo(currentVideo);

    }


    /*
     * Аналогично восстанавливаем текущий звук,
     * если браузер его приостановил.
     */
    if (
        currentAudio &&
        currentAudio.paused
    ) {

        const promise =
            currentAudio.play();

        if (
            promise &&
            typeof promise.catch === "function"
        ) {
            promise.catch(() => {});
        }

    }

}


function switchVideo(videoPath) {

    const id = transitionId;

    const incoming = nextVideo;
    const outgoing = currentVideo;

    const lowPowerMode =
        isMobilePerformanceMode();

    let started = false;


    // Отменяем старый незавершённый визуальный переход.
    if (videoTransitionTimer) {

        clearTimeout(videoTransitionTimer);

        videoTransitionTimer = null;

    }


    // Удаляем старый loadeddata с этого слоя.
    // Особенно важно после быстрого переключения
    // или возвращения из другой вкладки.
    clearPendingVideoReady(incoming);


    /*
     * На телефоне сразу останавливаем декодирование старого видео.
     * Последний кадр остаётся на экране, пока новое видео грузится,
     * но два ролика одновременно уже не декодируются.
     */
    if (lowPowerMode && outgoing) {
        outgoing.pause();
    }


    incoming.pause();

    incoming.classList.remove("active");

    incoming.style.transition = "none";
    incoming.style.opacity = "0";
    incoming.style.visibility = "hidden";

    prepareVideoSource(
        incoming,
        videoPath
    );


    const startPlayback = () => {

        if (
            started ||
            id !== transitionId
        ) {
            return;
        }

        started = true;

        clearPendingVideoReady(incoming);


        // Не показываем первый чёрный кадр.
        try {

            if (incoming.duration > 0.35) {
                incoming.currentTime = 0.35;
            }

        } catch (error) {}


        /*
         * Показываем слой сразу, а play() запускаем безопасно.
         * Если вкладка в фоне — воспроизведение восстановится
         * через visibilitychange после возврата пользователя.
         */
        incoming.classList.add("active");

        incoming.style.opacity = "0";
        incoming.style.visibility = "visible";

        void incoming.offsetWidth;

        incoming.style.transition = "";


        currentVideo = incoming;
        nextVideo = outgoing;


        if (lowPowerMode) {

            /*
             * Mobile: мгновенная замена после появления первого кадра.
             * Старый ролик уже стоит на паузе, поэтому одновременно
             * декодируется только новый.
             */
            incoming.style.transition = "none";
            incoming.style.opacity = "1";

            outgoing.style.opacity = "0";
            outgoing.style.visibility = "hidden";

            outgoing.classList.remove(
                "active"
            );

            safePlayVideo(incoming);

            /*
             * Освобождаем декодер/память старого мобильного файла.
             * Элемент останется и будет переиспользован при следующей сцене.
             */
            outgoing.removeAttribute("src");

            try {
                outgoing.load();
            } catch (error) {}

            requestAnimationFrame(() => {
                incoming.style.transition = "";
            });

            videoTransitionTimer = null;

        } else {

            /*
             * Desktop: сохраняем красивый короткий crossfade.
             */
            safePlayVideo(incoming);


            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    if (id !== transitionId) {
                        return;
                    }

                    incoming.style.opacity = "1";
                    outgoing.style.opacity = "0";

                });

            });


            videoTransitionTimer =
                setTimeout(() => {

                    if (id !== transitionId) {
                        return;
                    }

                    outgoing.pause();

                    outgoing.classList.remove(
                        "active"
                    );

                    outgoing.style.opacity = "0";
                    outgoing.style.visibility =
                        "hidden";

                    outgoing.removeAttribute("src");

                    try {
                        outgoing.load();
                    } catch (error) {}

                    videoTransitionTimer = null;

                }, 450);

        }

    };


    if (incoming.readyState >= 2) {

        startPlayback();

    } else {

        const handleLoadedData = () => {

            videoReadyHandlers.delete(
                incoming
            );

            startPlayback();

        };

        videoReadyHandlers.set(
            incoming,
            handleLoadedData
        );

        incoming.addEventListener(
            "loadeddata",
            handleLoadedData,
            { once: true }
        );

    }

}

// =====================================================
// CURRENT SCENE DATA
// =====================================================
const sceneRail =
    document.querySelector("#sceneRail");

const sceneRailTitle =
    sceneRail.querySelector(".scene-rail-title");

const variantButtons =
    Array.from(
        sceneRail.querySelectorAll(
            ".scene-rail-item[data-variant]"
        )
    );


function updateVariantRail() {

    const variants =
        sceneVariants[currentScene];

    if (!variants) {
        return;
    }

    sceneRailTitle.textContent =
        currentScene.toUpperCase();

    const entries =
        Object.entries(variants);

    variantButtons.forEach((button, index) => {

        const entry =
            entries[index];

        if (!entry) {
            button.style.display = "none";
            return;
        }

        button.style.display = "";

        const [variantName, variant] =
            entry;

        button.dataset.variant =
            variantName;

        const strong =
            button.querySelector("strong");

        const small =
            button.querySelector("small");

        strong.textContent =
            variant.label;

        small.textContent =
            variant.subtitle;

        button.classList.toggle(
            "active",
            currentVariants[currentScene] === variantName
        );

    });

}


function getCurrentSceneData() {

    const variants =
        sceneVariants[currentScene];

    const currentVariant =
        currentVariants[currentScene];

    if (
        variants &&
        variants[currentVariant]
    ) {

        return variants[currentVariant];

    }

    return variants
    ? Object.values(variants)[0]
    : null;

}

// =====================================================
// SCENE UI
// =====================================================

function updateSceneUI() {

    sceneButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.scene === currentScene
        );

    });

}
// =====================================================
// SCENE
// =====================================================

async function selectScene(sceneName) {

    if (!sceneVariants[sceneName])  {
        return;
    }

    if (sceneName === currentScene) {
        return;
    }

const scene =
    sceneVariants[sceneName]?.[
        currentVariants[sceneName]
    ];

if (!scene) {
    return;
}

    // Новый ID делает все предыдущие
    // переходы неактуальными.

    transitionId++;

    const id = transitionId;

 currentScene = sceneName;

localStorage.setItem(
    "scene",
    sceneName
);

// Обновляем активную сцену
updateSceneUI();

const activeSceneButton =
    document.querySelector(
        ".scene-selector button.active"
    );

if (activeSceneButton) {

    activeSceneButton.animate(
        [
            {
                filter: "brightness(0.8)",
                opacity: 0.7
            },
            {
                filter: "brightness(1.18)",
                opacity: 1
            },
            {
                filter: "brightness(1)",
                opacity: 1
            }
        ],
        {
            duration: 280,
            easing:
                "cubic-bezier(0.22, 1, 0.36, 1)"
        }
    );

}

/* Плавная смена левого меню */

sceneRail
    .getAnimations()
    .forEach(animation => {
        animation.cancel();
    });


const railOutAnimation =
    sceneRail.animate(
        [
            {
                opacity: 1,
                filter: "blur(0px)",
                transform: "translateY(-50%) translateX(0)"
            },
            {
                opacity: 0,
                filter: "blur(5px)",
                transform: "translateY(-50%) translateX(-8px)"
            }
        ],
        {
            duration: 90,
            easing: "ease-in",
            fill: "forwards"
        }
    );


railOutAnimation.finished
    .then(() => {

        /*
         * Если пользователь уже успел
         * выбрать другую сцену —
         * старый переход не продолжаем.
         */
        if (id !== transitionId) {
            return;
        }


        /* Теперь подменяем содержимое */
        updateVariantRail();


        /* И показываем уже новое меню */
        sceneRail.animate(
            [
                {
                    opacity: 0,
                    filter: "blur(5px)",
                    transform:
                        "translateY(-50%) translateX(8px)"
                },
                {
                    opacity: 1,
                    filter: "blur(0px)",
                    transform:
                        "translateY(-50%) translateX(0)"
                }
            ],
            {
                duration: 220,
                easing:
                    "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "forwards"
            }
        );

    })
    .catch(() => {});

    // Сначала полностью останавливаем
    // старый звук.

switchVideo(scene.video);


updateText(scene);

if (playing && scene.audio) {

    startSceneAudio(
        scene.audio,
        id
    );

}

}

function updateText(scene) {

    // Уход старого текста
    sceneInfo.style.opacity = "0";
    sceneInfo.style.transform =
        "translateY(-8px) scale(0.985)";

    sceneTitle.style.filter = "blur(6px)";
    sceneDescription.style.filter = "blur(4px)";

    setTimeout(() => {

        // Меняем содержимое только после исчезновения
        sceneTitle.textContent = scene.title;
        sceneDescription.textContent = scene.description;

        // Начальная точка нового текста
        sceneInfo.style.transform =
            "translateY(8px) scale(0.985)";

        sceneTitle.style.filter = "blur(6px)";
        sceneDescription.style.filter = "blur(4px)";

        // Небольшая пауза создаёт ощущение
        // настоящего перехода между сценами
        requestAnimationFrame(() => {

            sceneInfo.style.opacity = "1";
            sceneInfo.style.transform =
                "translateY(0) scale(1)";

            sceneTitle.style.filter = "blur(0)";
            sceneDescription.style.filter = "blur(0)";

        });

    }, 140);

}
// =====================================================
// SCENE BUTTONS
// =====================================================

sceneButtons.forEach(button => {

    button.addEventListener(
        "pointerdown",
        () => {

            const sceneName =
                button.dataset.scene;

            const scene =
                sceneVariants[sceneName]?.[
                    currentVariants[sceneName]
                ];

            if (
                !scene ||
                sceneName === currentScene
            ) {
                return;
            }

            /* Реальный ранний preload выбранной сцены. */
            prepareVideoSource(
                nextVideo,
                scene.video
            );

        },
        { passive: true }
    );

    button.addEventListener(
        "click",
        () => {

            selectScene(
                button.dataset.scene
            );

        }
    );

});
// =====================================================
// SCENE VARIANTS
// =====================================================

variantButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const variant =
                button.dataset.variant;

            const variants =
                sceneVariants[currentScene];

            if (
                !variants ||
                !variants[variant]
            ) {
                return;
            }

            if (
                currentVariants[currentScene] === variant
            ) {
                return;
            }

            const data =
                variants[variant];

            currentVariants[currentScene] =
                variant;

            localStorage.setItem(
                `${currentScene}Variant`,
                variant
            );

            updateVariantRail();

            transitionId++;

            const id =
                transitionId;

            switchVideo(
                data.video
            );

            if (
                playing &&
                data.audio
            ) {

                startSceneAudio(
                    data.audio,
                    id
                );

            }

            updateText(
                data
            );

        }
    );

});

// =====================================================
// PLAY / PAUSE
// =====================================================

playButton.addEventListener(
    "click",
    async () => {

        if (playing) {

            playing = false;

            transitionId++;

            currentVideo.pause();

            await stopCurrentAudio();

            playButton.textContent = "▶";

        } else {

            playing = true;

            safePlayVideo(
                currentVideo
            );

const scene =
    getCurrentSceneData();

if (scene && scene.audio) {

    startSceneAudio(
        scene.audio,
        transitionId
    );

}

            playButton.textContent = "Ⅱ";

        }

    }
);


// =====================================================
// INITIAL STATE
// =====================================================
const savedScene =
    localStorage.getItem("scene");

if (
    savedScene &&
    sceneVariants[savedScene]
) {
    currentScene = savedScene;
}

Object.keys(sceneVariants).forEach(
    sceneName => {

        const savedVariant =
            localStorage.getItem(
                `${sceneName}Variant`
            );

        if (
            savedVariant &&
            sceneVariants[sceneName][savedVariant]
        ) {

            currentVariants[sceneName] =
                savedVariant;

        }

    }
);


updateVariantRail();
const initialScene =
    getCurrentSceneData();

currentVideo.src =
    getVideoUrl(initialScene.video);

currentVideo.load();

currentVideo.addEventListener(
    "loadedmetadata",
    () => {

        currentVideo.currentTime = 0.35;

    },
    { once: true }
);


// ВАЖНО:
// сайт стартует полностью остановленным.

playing = false;

playButton.textContent = "▶";

sceneTitle.textContent =
    initialScene.title;

sceneDescription.textContent =
    initialScene.description;

sceneButtons.forEach(button => {

    button.classList.toggle(
        "active",
        button.dataset.scene === currentScene
    );

});
// =====================================================
// SOFT MOUSE GLOW
// =====================================================

const mouseGlow =
    document.querySelector(".mouse-glow");

const FINE_POINTER_MEDIA =
    window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );


if (
    mouseGlow &&
    FINE_POINTER_MEDIA.matches &&
    !isMobilePerformanceMode()
) {

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let glowX = mouseX;
    let glowY = mouseY;

    let glowFrame = null;


    function animateMouseGlow() {

        glowFrame = null;

        const deltaX =
            mouseX - glowX;

        const deltaY =
            mouseY - glowY;

        glowX += deltaX * 0.12;
        glowY += deltaY * 0.12;

        mouseGlow.style.transform =
            `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

        if (
            Math.abs(deltaX) > 0.25 ||
            Math.abs(deltaY) > 0.25
        ) {
            glowFrame =
                requestAnimationFrame(
                    animateMouseGlow
                );
        }

    }


    function queueMouseGlowFrame() {

        if (glowFrame !== null) {
            return;
        }

        glowFrame =
            requestAnimationFrame(
                animateMouseGlow
            );

    }


    document.addEventListener(
        "mousemove",
        (event) => {

            mouseX = event.clientX;
            mouseY = event.clientY;

            mouseGlow.style.opacity = "1";

            queueMouseGlowFrame();

        },
        { passive: true }
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                glowFrame !== null
            ) {
                cancelAnimationFrame(
                    glowFrame
                );

                glowFrame = null;
            }

        },
        { passive: true }
    );

} else if (mouseGlow) {

    /*
     * Не запускаем бесконечный requestAnimationFrame на телефоне.
     */
    mouseGlow.style.display = "none";

}

// =====================================================
// TAB / PAGE VISIBILITY RECOVERY
// =====================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (!document.hidden) {

            requestAnimationFrame(() => {

                setTimeout(
                    recoverCurrentMedia,
                    80
                );

            });

        }

    }
);


window.addEventListener(
    "pageshow",
    () => {

        setTimeout(
            recoverCurrentMedia,
            80
        );

    }
);


window.addEventListener(
    "focus",
    () => {

        setTimeout(
            recoverCurrentMedia,
            80
        );

    }
);


// =====================================================
// LOADING SCREEN
// =====================================================

const loadingScreen =
    document.querySelector("#loadingScreen");

const loadingProgress =
    document.querySelector("#loadingProgress");

const loadingVideo =
    document.querySelector("#videoA");


let loadingFinished = false;


function finishLoading() {

    if (loadingFinished) {
        return;
    }

    loadingFinished = true;

    loadingProgress.style.width = "100%";

    setTimeout(() => {

        loadingScreen.classList.add("hidden");

    }, 550);

}


/*
 * Ждём, пока первое видео сможет
 * нормально начать воспроизведение.
 */

function checkInitialVideo() {

    if (
        loadingVideo.readyState >= 3
    ) {

        finishLoading();

    }

}


/*
 * Основной вариант
 */

loadingVideo.addEventListener(
    "canplay",
    finishLoading,
    { once: true }
);


/*
 * Если браузер уже успел загрузить видео
 */

checkInitialVideo();


/*
 * Запасной вариант.
 * Сайт никогда не должен зависнуть
 * на загрузочном экране навсегда.
 */

setTimeout(() => {

    finishLoading();

}, 1800);
// =====================================================
// INITIAL LOAD FADE
// =====================================================

window.addEventListener("load", () => {

    requestAnimationFrame(() => {

        document.body.classList.remove(
            "is-loading"
        );

    });

});
