from pathlib import Path

app = Path("app.js")
text = app.read_text(encoding="utf-8")

marker = '''function getVideoUrl(videoPath) {\n\n    const runtimePath =\n        getRuntimeVideoPath(videoPath);\n\n    return `${runtimePath}?v=${VIDEO_VERSION}`;\n\n}\n'''
helper = marker + '''\n\nfunction prepareVideoSource(video, videoPath) {\n\n    if (!video || !videoPath) {\n        return \"\";\n    }\n\n    const url = getVideoUrl(videoPath);\n    const currentSource = video.getAttribute(\"src\") || \"\";\n\n    if (currentSource === url || video.src.endsWith(url)) {\n        video.preload = \"auto\";\n        return url;\n    }\n\n    clearPendingVideoReady(video);\n    video.pause();\n    video.preload = \"auto\";\n    video.src = url;\n    video.load();\n\n    return url;\n}\n'''
assert text.count(marker) == 1
text = text.replace(marker, helper, 1)

old = '''    incoming.preload = \"auto\";\n\n    incoming.src =\n        getVideoUrl(videoPath);\n\n    incoming.load();'''
new = '''    prepareVideoSource(\n        incoming,\n        videoPath\n    );'''
assert text.count(old) == 1
text = text.replace(old, new, 1)

old = '''                    outgoing.style.opacity = \"0\";\n                    outgoing.style.visibility =\n                        \"hidden\";\n\n                    videoTransitionTimer = null;'''
new = '''                    outgoing.style.opacity = \"0\";\n                    outgoing.style.visibility =\n                        \"hidden\";\n\n                    outgoing.removeAttribute(\"src\");\n\n                    try {\n                        outgoing.load();\n                    } catch (error) {}\n\n                    videoTransitionTimer = null;'''
assert text.count(old) == 1
text = text.replace(old, new, 1)

old = '''            /*\n             * Начинаем сетевую загрузку немного раньше —\n             * ещё в момент касания/нажатия.\n             */\n            const url =\n                getVideoUrl(scene.video);\n\n            if (\n                nextVideo.src !== url &&\n                !nextVideo.src.endsWith(url)\n            ) {\n                nextVideo.preload = \"auto\";\n            }'''
new = '''            /* Реальный ранний preload выбранной сцены. */\n            prepareVideoSource(\n                nextVideo,\n                scene.video\n            );'''
assert text.count(old) == 1
text = text.replace(old, new, 1)

app.write_text(text, encoding="utf-8")

index = Path("index.html")
html = index.read_text(encoding="utf-8")
assert html.count("app.js?v=8") == 1
index.write_text(html.replace("app.js?v=8", "app.js?v=9", 1), encoding="utf-8")
