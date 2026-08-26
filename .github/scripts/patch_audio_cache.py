from pathlib import Path

app = Path('app.js')
text = app.read_text(encoding='utf-8')

marker = '''// =====================================================\n// AUDIO\n// =====================================================\n\nfunction createAudio(path) {\n\n    const audio = new Audio(path);'''
replacement = '''// =====================================================\n// AUDIO\n// =====================================================\n\nconst AUDIO_VERSION = 2;\n\nfunction createAudio(path) {\n\n    const audio =\n        new Audio(`${path}?v=${AUDIO_VERSION}`);'''

if text.count(marker) != 1:
    raise SystemExit(f'Audio marker mismatch: {text.count(marker)}')

app.write_text(text.replace(marker, replacement, 1), encoding='utf-8')

index = Path('index.html')
html = index.read_text(encoding='utf-8')
if html.count('app.js?v=9') != 1:
    raise SystemExit(f'Expected app.js?v=9 once, found {html.count("app.js?v=9")}')
index.write_text(html.replace('app.js?v=9', 'app.js?v=10', 1), encoding='utf-8')
