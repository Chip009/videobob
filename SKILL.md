# Videobob

## Purpose (super simple)

Videobob is an **autopilot workflow** for making short videos for:
- **TikTok**
- **YouTube Shorts**

Default setup is for **science videos**, but you can use it for **any topic**.

What it does automatically:
1. Writes a 6-line script
2. Generates **6 images**
3. Turns each image into a short video clip
4. Adds voice-over
5. Stitches everything into one final vertical video

Result: one ready-to-post 9:16 video.

Every stage has approval gates, so you stay in control.

This skill ships as text files only. No finished videos or images are included. Users generate their own assets.

---

## What this is for

- **Content creators** who want science explainer videos without touching editing software
- **Faceless channels** that need a repeatable, agent-driven production pipeline
- **Anyone running OpenClaw** who wants a full multi-stage AI video workflow

The output: 6 scenes, each under 5 seconds, cinematic sci-fi visual style, ~24-30 second vertical video with voice-over. Optional branded outro at the end.

---

## What you need before starting

### Required

| Dependency | What it does | How to install |
|---|---|---|
| **OpenAI API key** | Powers image gen, voice-over, and Sora-2 video | Sign up at [platform.openai.com](https://platform.openai.com) |
| **ffmpeg + ffprobe** | Video processing and stitching | `brew install ffmpeg` (macOS) or `apt install ffmpeg` (Linux) |
| **Node.js >= 18** | Runs the image generation and stitching scripts | `brew install node` or [nodejs.org](https://nodejs.org) |
| **Python 3 + Pillow** | Crops images to 720x1280 | `pip3 install Pillow` |

### Quick check (run all four)
```bash
echo $OPENAI_API_KEY | head -c 5        # Should show "sk-..."
ffmpeg -version | head -1                # Should print version
node --version                           # Should be v18+
python3 -c "from PIL import Image; print('OK')"  # Should print "OK"
```

If any of these fail, install the missing dependency before proceeding.

### Optional

| What | Why |
|---|---|
| **CTA outro clip** | Your own branded call-to-action video to append at the end. Save as `assets/cta_outro.mp4` in the skill folder. Not included — you provide this yourself if you want it. |
| **Voicebox server** | Local TTS alternative to OpenAI. Better quality, runs offline. If running at `http://127.0.0.1:8000`, the agent can use it automatically. See [voicebox.sh](https://voicebox.sh). |

---

## Setup

1. **Set your API key** in your shell environment:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

2. **Install dependencies** (if not already present):
   ```bash
   # macOS
   brew install ffmpeg node
   pip3 install Pillow

   # Linux (Debian/Ubuntu)
   apt install ffmpeg nodejs python3-pip
   pip3 install Pillow
   ```

3. **Install the skill** — copy the `videobob` folder into your OpenClaw skills directory (via ClawHub, LarryBrain, or manual copy).

4. **Tell your agent:** `do a videobob` or `make a science TikTok`

The agent reads the SKILL.md and walks you through each stage.

---

## How a run works

```
You: "do a videobob"
  │
  ▼
Stage 1 — Agent proposes 5 topic candidates. You pick one.
  │
  ▼
Stage 2 — Agent writes a 6-line script (7-10 words per line). You approve.
  │
  ▼
Stage 2b — Agent generates 6 voice-over clips (OpenAI TTS).
  │         Automatic timing check: each must be ≤ 4.8s.
  │         If too long, agent rewrites and regenerates.
  ▼
Stage 3+4 — Agent generates 6 images and crops to 720×1280.
  │          You approve the images.
  ▼
Stage 5+6 — Agent submits 6 Sora-2 animation jobs (4s each).
  │          Auto-fallback to Ken Burns zoom if Sora blocks a scene.
  ▼
Stage 7 — (Optional) You provide a CTA outro clip.
  │
  ▼
Stage 8 — Agent stitches everything into final MP4.
  │         Delivers: video file + title + SEO description.
  ▼
Done — Video is ready to post.
```

---

## Per-run file structure

Each video run creates a self-contained directory:

```
runs/<topic>/
├── scene1.png ... scene6.png     ← 720x1280 images (cropped)
├── scene1.mp4 ... scene6.mp4    ← Sora-2 animated clips (if available)
├── vo/
│   └── vo1.wav ... vo6.wav       ← Voice-over audio
├── build/                        ← Temp files (auto-created by stitch)
└── final_<topic>.mp4             ← Finished video
```

The stitch script reads from this exact layout. Do not rename files.

---

## Skill file structure

```
videobob/
├── SKILL.md              ← Agent instructions (the brain of the skill)
├── README.md             ← This file (for humans)
├── .gitignore            ← Excludes generated media from version control
├── assets/               ← (you create this if you want a CTA outro)
│   └── cta_outro.mp4     ← Optional branded outro clip (YOU provide this)
├── references/
│   ├── hooks.md                      ← Hook patterns + scoring rubric
│   ├── image-rules.md                ← Visual style guide for image prompts
│   ├── science-facts.md              ← Curated fact bank for topic inspiration
│   ├── tiktok-language-guidelines.md ← Script writing rules
│   ├── video-prompt-rules.md         ← Sora-2 prompt construction rules
│   └── voice-over-rules.md           ← TTS settings + ffmpeg commands
└── scripts/
    ├── generate-images.js  ← Batch image generation (OpenAI API)
    ├── crop_images.py      ← Center-crop + resize to 720×1280
    └── stitch-final.js     ← Final assembly (scenes + VO + optional outro)
```

No binary files are included. Everything the skill produces is generated fresh per run.

---

## Customization

- **Visual style:** Edit `references/image-rules.md`. The style block is prepended to every image prompt.
- **Voice:** Change the `voice` parameter in the SKILL.md TTS commands. Options: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`.
- **Topics:** Add your own facts to `references/science-facts.md`, or ask for any topic. The agent can research on its own.
- **Non-science content:** The pipeline works for any topic. The "science" part comes from the reference files, not the scripts. Swap the facts and hooks for your niche.

---

## Approximate cost per video

| Component | Cost |
|---|---|
| 6 images (gpt-image-1, medium quality) | ~$0.60 |
| 6 TTS clips (tts-1) | ~$0.05 |
| 6 Sora-2 clips (4s each) | ~$3.00 |
| **Total** | **~$3.65** |

Costs depend on current OpenAI pricing. Higher quality settings cost more.

---

## Known limitations

- **Sora-2 content moderation** can reject prompts. The skill auto-falls back to a Ken Burns zoom on the still image, but some topics may need prompt rewording.
- **English only.** Word count guardrails are calibrated for English TTS timing.
- **Fixed visual style.** The cinematic sci-fi look is baked into `image-rules.md`. Edit that file to change it.
- **OpenAI TTS** is good but not broadcast quality. For more natural voice, use a local Voicebox server.

---

## License

MIT. Use it, fork it, sell videos made with it.
