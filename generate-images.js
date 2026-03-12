# Voice Over Rules

## Structure
- Exactly 6 voice over lines matching approved script lines 1:1.
- One audio file per scene.

## Default TTS: OpenAI API

Use the OpenAI `/v1/audio/speech` endpoint with:
- `model`: `tts-1` (or `tts-1-hd` for higher quality)
- `voice`: `alloy` (default — warm and clear; alternatives: `echo`, `fable`, `onyx`, `nova`, `shimmer`)
- `speed`: `1.0`

```bash
# Example generation for one scene
curl -sS -X POST https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "tts-1",
    "input": "Your script line here.",
    "voice": "alloy",
    "speed": 1.0,
    "response_format": "wav"
  }' --output vo/vo1.wav
```

Generate all 6 lines. Store as `vo/vo1.wav` through `vo/vo6.wav`.

## Optional: Local Voicebox TTS

If you have a local [Voicebox](https://voicebox.sh) server running at `http://127.0.0.1:8000`, you can use it instead of OpenAI TTS for higher quality / offline generation.

Quick smoke test:
```bash
curl -sS http://127.0.0.1:8000/health
```

If healthy, generate with:
```bash
curl -sS -X POST http://127.0.0.1:8000/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "profile_id": "<your_voicebox_profile_id>",
    "text": "Your script line here.",
    "language": "en",
    "model_size": "1.7B"
  }' --output vo/vo1.wav
```

Profile IDs are found in your Voicebox app dashboard.

## Timing requirements (critical)
- Each clip + 200ms padding must be **<= 5.0s**.
- If any clip is too long, rewrite the corresponding script line to **7-9 words** and regenerate all 6 clips.
- Do not mix different voice profiles across scenes.

## Fit-check labels (required before proceeding)
After generating each clip, measure duration with:
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 vo/vo1.wav
```

Label each:
- **fit** — comfortable timing margin (< 3.8s)
- **borderline** — likely tight but usable (3.8s–4.0s)
- **too-long** — must rewrite before synthesis (> 4.0s)

Only proceed to images when all 6 clips are `fit` or `borderline`.

## Audio + edit rules
- Treat generated scene clips as silent source video in final edit.
- Merge VO per scene, then concatenate scene outputs.
- Export final MP4 with stable loudness and no clipping.

## ffmpeg reference
```bash
# Normalize and scale scene video
ffmpeg -i sceneX_sora.mp4 -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30" -an sceneX_norm.mp4

# Combine scene video + VO
ffmpeg -i sceneX_norm.mp4 -i vo/voX.wav \
  -filter_complex "[1:a]adelay=100|100,apad[a]" \
  -map 0:v -map "[a]" \
  -c:v libx264 -crf 18 -preset medium \
  -c:a aac -b:a 192k \
  -t <scene_duration> sceneX_vo.mp4
```
