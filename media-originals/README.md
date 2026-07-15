# Full-resolution hero video masters

Kept for re-encoding; NOT deployed (this folder is outside `src/`).

- `hero-1080p.mp4`  — 1920×1080 H.264 master
- `hero-1080p.webm` — 1920×1080 VP9 master

The live site serves only a leaner 720p `src/assets/video/hero.mp4` (mp4-only —
see `src/assets/js/hero-video.js`). To regenerate that from the master:

    ffmpeg -i media-originals/hero-1080p.mp4 -vf scale=-2:720 \
      -c:v libx264 -profile:v high -preset veryslow -crf 28 \
      -pix_fmt yuv420p -an -movflags +faststart src/assets/video/hero.mp4
