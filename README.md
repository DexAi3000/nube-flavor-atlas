# NUBE — Flavor Atlas

A cinematic, video-driven storefront concept for a fictional vape and nicotine-salt brand. Every product shot, loop and
smoke effect was generated with AI from hand-written prompts, then cut, interpolated and graded into a site that feels
like a film rather than a catalogue: a vapor wall opens onto a dark board of 13 always-playing product videos, devices
come alive frame by frame as you scroll, and a four-question flavor finder reveals your match through the smoke.

**Live demo → [vape-lovat.vercel.app](https://vape-lovat.vercel.app/)** (best on desktop)

![NUBE demo](docs/demo.gif)

> Portfolio concept, not a real store. The site is age-gated (18+) and carries a nicotine warning.

## Features

- **Vapor intro + 18+ gate** — two clips: vapor rolls in from both sides, the question rises on it, then the vapor tears
  open from the centre. The gate is screen-blended, so its black turns see-through and the board appears *through* the hole.
- **One-screen board** — all 13 products (8 salts, 3 pods, 2 mods) fit one fitted screen on desktop, every tile a looping
  video that never stops; a cursor "lens" tilts the board slightly. Phones get a two-column scrolling layout.
- **Seamless product view** — a tile expands into a full-screen 1080p video with a clip-path transition and shrinks back
  into its tile on close. The big video picks up at the exact frame the tile was on, and hands it back on close.
- **Device stories** — scroll-scrubbed "wake → heat → cloud" takes for each device (1049 frames at 48 fps on desktop).
- **Flavor finder** — 4 questions (the fruit one only appears if you pick fruit), the room tints with each answer, and the
  result is revealed through the same vapor effect, with the right nicotine strength preselected.
- **Cinematic black** — no grid, just soft light pools in each flavor's color, film grain and a vignette.
- **Device-aware media** — desktops load 48 fps motion-interpolated 1080p / 2K files; phones load light 24 fps files and
  a dedicated portrait cut of the smoke so nothing gets stretched.

## Tech

Vanilla HTML / CSS / JavaScript — no framework, no build step.
Canvas for the story frames, `<video>` scrubbing for the desktop stories, CSS `clip-path` and `mix-blend-mode: screen`
for the transitions, Unbounded + Newsreader (Google Fonts).

Media pipeline (`tools/`): ffmpeg scripts for ping-pong loops, motion interpolation (24 → 48 fps with `minterpolate`),
smoke cleanup (denoise, deband, 2K upscale), story joins with soft seams and fast-seek encodes.
The prompts used to generate every shot are in [`docs/PROMPTS.md`](docs/PROMPTS.md).

## Run locally

Any static server works, but the desktop stories seek inside video, so use one that supports HTTP range requests:

```bash
npx serve .
```

Then open the printed URL. To skip the age gate during development, open `/#skip` and reload (it's remembered for the tab).

## Structure

```
index.html · style.css · app.js
assets/img      posters (light)          assets/vid    24 fps loops for phones
assets/hd       48 fps 1080p/2K loops, smoke and story videos for desktop
assets/story    phone story frames
tools/          ffmpeg build scripts      docs/         demo GIF + generation prompts
```

---

Designed and built by Nima Ariyan Far.
