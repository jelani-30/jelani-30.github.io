# UK BSL Learn

Interactive **British Sign Language (UK BSL)** practice app for kids — **not ASL**.

**App path:** `/workspace/bsl-learn/index.html`  
**Resource list:** `/workspace/bsl-resources/BSL_Free_Learning_Resources.md`

## How to open

Prefer a local static server (needed for camera / mirror mode and the service worker):

```bash
cd /workspace/bsl-learn
python3 -m http.server 8765
```

Then open **http://127.0.0.1:8765/**

You can also open `index.html` as `file://`; audio and quizzes still work, but **getUserMedia** and **service worker** usually need `http://localhost` or HTTPS.

## What loads

- `index.html` — screen markup (live screen IDs preserved; stories screen added)
- `styles.css` — kid-friendly stylesheet
- `assets/bsl-data.js` — `window.BSL_DATA` (alphabet, greetings, kid packs, stories, demo sources)
- `assets/app.js` — behaviour
- `assets/media/demo-loop.mp4` — tiny local sample for slow-mo / loop / scrub
- `sw.js` — optional app-shell offline cache

## Features

| Feature | What it does |
|---------|----------------|
| **Slow-mo demo player** | HTML5 player on Learn / Mirror / Stories: 0.25–1× rate, loop, scrub, play/pause, restart on the local sample. External Deaf demos open in a new tab (we do **not** host their files). Scrub applies to HTML5 only, not cross-origin embeds. |
| **Deaf / child demo sources** | Curated links: Sign BSL, BSL SignBank, british-sign, Commanding Hands, NDCS Family, School of Signs, BSL Search, Lumo — labelled by signer variety. |
| **Kid-life packs** | Live packs: **family, feelings, school, food, play** (~8 signs each) with learn / quiz / match / mirror. |
| **Spaced repetition** | SM-2-lite per item (`ease`, `interval`, `nextDue`, fails). Home: **Review due** + **Weak signs** (leeches ≥3 recent fails). |
| **XP / gems / badges** | Earn on correct / learn / streak. Badges: first quiz, 7-day streak, pack complete, leech cleared, favourite 10, story star, gem collector. |
| **Signed stories** | 4 short kid dialogues — step through glosses, speak English, show model + demo player. |
| **Guided alphabet** | Home → **Guided alphabet** (`alphabet:guide`). Four formation steps per letter (name/hands → how → movement → face) with spoken en-GB coaching via `speak()`, demo player + Sign BSL links, Play all steps, mark learned on last step. Poteto polish: story/guide completion fires once; demo player stays mounted across steps of the same letter; last step advances to the next letter. |
| **Conversation signing** | Home → **Conversation signing** (`stories:coach`) or Open stories. Turn strip (You ↔ Partner), in-panel how/movement/face for each `signId`, **Coach** speaks English + how tips only (movement/face on-screen). |
| **Offline shell** | “Save for offline” registers `sw.js` and caches app shell + local media + data. External dictionary videos still need internet. Optional JSON pack export from parent zone. |
| **Multi-profile + kid mode** | Household profiles (name + emoji). Kid mode: soft PIN to leave parent / switch profile / reset. PIN is **not** security. |
| **Gentle error UX** | Wrong answers: “Almost — here's the sign again” + model; correct: brief stars/gems celebration. Soft beeps. |
| **Favourites** | Star on learn cards; **My Signs** learn/quiz from home. |
| **Fingerspelling / mirror / streak** | Existing drills, camera mirror (cleanup on leave), daily streak — kept working. |

## Progress storage

- Key: **`bslLearnProgress_v2`** (multi-profile store).
- On first load, **`bslLearnProgress_v1`** is migrated into profile **Learner 1** (fail-closed sanitize), then the **v1 key is removed** after a successful v2 write.
- If v2 is cleared while a tab is open (DevTools / another tab), that tab **stops** rewriting progress on `pagehide` / timers so migrate tests and intentional clears are not stomped.
- Bare v1 without `lastActiveDate` keeps a positive migrated streak on first open (does not force streak back to 1).
- Validation stays fail-closed: unknown keys dropped; numbers clamped; `textContent` / DOM APIs only (no `innerHTML` for progress text).

## Honest limits

- We **do not host** Sign BSL / NDCS / YouTube video files.
- Slow-mo / scrub works on the **local** `demo-loop.mp4` (and any future local mp4/webm). External pages open separately.
- `python3 -m http.server` does not send HTTP Range; the short local clip becomes scrubbable once fully buffered (usually instant).
- Offline cache covers **app shell + local media + vocab JSON in JS** — not external demos.
- Soft PIN is a kid-safe gate only — not security.

## Audio

- Header Sound on/off; `en-GB` Web Speech API when available; Replay forces last line; soft Web Audio beeps.
- **Guided alphabet** and **Conversation coach** auto-speak coaching lines when Sound is on (Replay / Coach / Play all force speech). Some browsers require a user gesture before the first utterance.

## Privacy

- Progress: this browser’s `localStorage` only.
- Camera: local preview only; tracks stop on leave / home / unload.

## Files

```
/workspace/bsl-learn/index.html
/workspace/bsl-learn/styles.css
/workspace/bsl-learn/sw.js
/workspace/bsl-learn/assets/app.js
/workspace/bsl-learn/assets/bsl-data.js
/workspace/bsl-learn/assets/media/demo-loop.mp4
/workspace/bsl-learn/README.md
```
