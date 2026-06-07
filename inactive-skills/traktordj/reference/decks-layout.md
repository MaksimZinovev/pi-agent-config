---
title: Decks Layout Mastery — 4-Deck, Stem Decks, Remix Decks, Flux Mode
level: 2 (Advanced Techniques)
prerequisites: [general-configuration.md, effects.md, controller-management.md]
unlocks: advanced-mixing-tips.md, troubleshooting.md
estimated_time: "90-120 min"
---

# Decks Layout Reference

## 🎯 Learning Objectives (Level 2)

By completing this module, you will:
- [ ] Master 4-deck workflows on 2-channel hardware (S2 MK3)
- [ ] Distinguish Stem Decks vs Remix Decks — when to use each
- [ ] Configure Flux Mode for non-destructive performance
- [ ] Design advanced cue point strategies (8+ cues per track)
- [ ] Build performance templates for different set types

---

## 1. 4-Deck Workflow on S2 MK3

### 1.1 Hardware Reality Check

**S2 MK3 has 2 physical channels** but controls **4 virtual decks**:

```
PHYSICAL          VIRTUAL MAPPING
┌─────────┐       ┌─────────────────┐
│ CHANNEL A │ ←→  │ DECK 1 (Left)   │
│           │     │ DECK 3 (Left)   │ ← Deck Toggle L
├─────────┤       ├─────────────────┤
│ CHANNEL B │ ←→  │ DECK 2 (Right)  │
│           │     │ DECK 4 (Right)  │ ← Deck Toggle R
└─────────┘       └─────────────────┘
```

### 1.2 Deck Switching Strategies

| Strategy | When to Use | Technique |
|----------|-------------|-----------|
| **A/B Standard** | 2-track mixing | Deck 1 + 2 only |
| **Layering** | Adding 3rd/4th element | Deck 3 = percussion, Deck 4 = vocals/FX |
| **Stem Isolation** | Stem Deck performance | Deck 1=Stems, Deck 2=Full, Deck 3/4=Remix |
| **Back-to-Back** | B2B with another DJ | You: Deck 1/2, Partner: Deck 3/4 |

### 1.3 S2 MK3 4-Deck Mapping (Custom)

**Essential Custom Mappings** (add to your `.tsi`):

| Hardware Control | Mapping | Why |
|------------------|---------|-----|
| `Shift + Deck Toggle L` | Deck 3 Select | Instant jump |
| `Shift + Deck Toggle R` | Deck 4 Select | Instant jump |
| `Cue + Deck Toggle L` | Deck 1 Select | Return to main |
| `Cue + Deck Toggle R` | Deck 2 Select | Return to main |
| `Shift + Browse Encoder Press` | Cycle Deck Focus (1→2→3→4→1) | Keyboard-free nav |

**Visual Feedback**: Map Deck Focus to **Cue LED colors**:
- Deck 1: Red, Deck 2: Green, Deck 3: Blue, Deck 4: Yellow

---

## 2. Stem Decks vs Remix Decks — Decision Framework

### 2.1 Core Differences

| Aspect | Stem Decks | Remix Decks |
|--------|------------|-------------|
| **Source** | Single track with stem separation | 64-slot sample grid (one-shots/loops) |
| **Stems** | 4 stems: Drums, Bass, Vocals, Other | N/A (individual samples) |
| **Control** | Per-stem volume, mute, solo, FX | Per-slot volume, filter, FX, reverse |
| **Workflow** | Live remixing of existing tracks | Building custom performance sets |
| **Prep Time** | Real-time (Traktor 3.11+ stem separation) | Offline (build Remix Sets beforehand) |
| **CPU** | Higher (real-time separation) | Lower (pre-rendered samples) |

> **Evidence**: Crossfader analysis confirms Stem Decks = real-time track deconstruction, Remix Decks = pre-prepared sample grids [citation:Crossfader Stem vs Remix](https://wearecrossfader.co.uk/blog/remix-decks-vs-stem-decks-traktor-pro-3-tips-tricks/).

### 2.2 When to Use Each

**Use STEM DECKS when:**
- Playing tracks you haven't prepped
- Want live vocal/instrumental isolation
- Need quick transition tools (kill drums, keep bass)
- CPU headroom available (M-series Mac recommended)

**Use REMIX DECKS when:**
- Performing prepared routines
- Triggering one-shots (horns, vocals, FX)
- Building evolving layers over 32+ bars
- Need rock-solid stability (low CPU)

### 2.3 Stem Deck Controls (S2 MK3 Mapping)

**Default Stem Controls** (require Stem Deck loaded):

| Control | Function |
|---------|----------|
| **EQ High** | Stem 1 (Drums) Volume |
| **EQ Mid** | Stem 2 (Bass) Volume |
| **EQ Low** | Stem 3 (Vocals) Volume |
| **Filter** | Stem 4 (Other) Volume |
| **Shift + EQ High** | Stem 1 Mute Toggle |
| **Shift + EQ Mid** | Stem 2 Mute Toggle |
| **Shift + EQ Low** | Stem 3 Mute Toggle |
| **Shift + Filter** | Stem 4 Mute Toggle |

**Advanced Stem Mapping** (custom):
| Control | Function |
|---------|----------|
| `Cue + EQ High` | Stem 1 Solo |
| `Cue + EQ Mid` | Stem 2 Solo |
| `Cue + EQ Low` | Stem 3 Solo |
| `Cue + Filter` | Stem 4 Solo |
| `Shift + Browse Encoder` | Cycle Stem View (Single/Split Waveform) |

> **Evidence**: DJ TechTools mapping for S2 MK3 includes Stem Waveform View toggle via Shift+Browse [citation:DJ TechTools S2 MK3 Mapping](https://maps.djtechtools.com/mappings/9586).

### 2.4 Remix Deck Controls (S2 MK3 Mapping)

**Default Remix Deck Controls** (when Remix Deck focused):

| Control | Function |
|---------|----------|
| **8 Cue Pads** | Trigger Slots 1-8 (current page) |
| **Shift + Cue Pads** | Trigger Slots 9-16 |
| **Loop Encoder** | Navigate Pages (1-8, 64 slots total) |
| **Shift + Loop Encoder** | Slot Volume (turn) / Slot Mute (press) |
| **FX Knobs** | Slot Filter / FX Send (per slot) |

**Custom Remix Mapping** (recommended):
| Control | Function |
|---------|----------|
| `Cue + Pad 1-8` | Slot FX Toggle (per slot) |
| `Shift + Browse Encoder` | Cycle Remix Deck Focus (A/B/C/D) |
| `FX Select + Pad` | Load Sample to Slot (browser preview) |

---

## 3. Flux Mode — Non-Destructive Performance

### 3.1 What Flux Mode Does

**Flux Mode** = "Scratch/loop/cue without losing play position"

| Normal Mode | Flux Mode |
|-------------|-----------|
| Scratch → playhead moves | Scratch → playhead **stays**, audio scratches |
| Loop → playhead loops | Loop → playhead **continues**, audio loops |
| Cue jump → playhead jumps | Cue jump → **ghost playhead** jumps, main continues |
| **Result**: Lose phrase position | **Result**: Keep phrase, add performance |

### 3.2 Flux Mode Activation

```
Deck Header → Flux Button (ϕ symbol) → ON
Shortcut: Custom map to `Shift + Sync` (per deck)
```

### 3.3 Flux Mode Workflows

**Workflow 1: Flux Scratch**
1. Enable Flux on Deck A
2. Scratch intro vocal (playhead stays at drop)
3. Release → drop hits perfectly on phrase

**Workflow 2: Flux Loop Roll**
1. Enable Flux on Deck B
2. Activate 1/4 loop → roll buildup
3. Release → track continues at correct phrase

**Workflow 3: Flux Cue Juggling**
1. Enable Flux on Deck A
2. Jump between 8 cue points rhythmically
3. Main playhead never leaves "the one"

### 3.4 Flux + Stem/Remix Decks

| Combination | Power Move |
|-------------|------------|
| **Flux + Stem Deck** | Scratch vocal stem while drums/bass continue |
| **Flux + Remix Deck** | Trigger one-shots without stopping loop grid |
| **Flux + 4-Deck** | Deck 1/2 main, Deck 3/4 Flux performance |

---

## 4. Advanced Cue Point Strategy

### 4.1 8-Cue System (Per Track)

| Cue | Color | Purpose | Naming Convention |
|-----|-------|---------|-------------------|
| **1** | Red | **Load/Start** (first downbeat) | "START" |
| **2** | Orange | **Intro End / Mix In** | "MIX IN" |
| **3** | Yellow | **Verse 1** | "V1" |
| **4** | Green | **Chorus / Drop** | "DROP" |
| **5** | Cyan | **Breakdown** | "BREAK" |
| **6** | Blue | **Build Up** | "BUILD" |
| **7** | Purple | **Outro Start / Mix Out** | "MIX OUT" |
| **8** | White | **End / Emergency Out** | "END" |

### 4.2 Cue Point Types

| Type | Symbol | Behavior | Use Case |
|------|--------|----------|----------|
| **Cue** | ▶ | Jump + Play | Standard |
| **Loop** | ↻ | Activate Loop | Phrase loops |
| **Fade** | ⤓ | Fade Out/In | Smooth exits |
| **Grid** | # | Beatgrid Marker | Manual grid fix |

### 4.3 S2 MK3 Cue Mapping (8 Cues on 8 Pads)

**Default**: Pads 1-8 = Cues 1-8 (current deck)

**Advanced Layered Mapping**:
| Layer | Pads 1-4 | Pads 5-8 |
|-------|----------|----------|
| **Base** | Cues 1-4 | Cues 5-8 |
| **Shift** | **Loop** 1-4 (1/4, 1/2, 1, 4 bars) | **Fade** In/Out / **Grid** Set/Delete |
| **Cue** | **Hotcue Delete** 1-4 | **Hotcue Delete** 5-8 |

---

## 5. Performance Templates by Set Type

### 5.1 Club Set (2-Deck Focus + 2 Utility)

| Deck | Role | Content |
|------|------|---------|
| **Deck 1** | Main A | Primary track |
| **Deck 2** | Main B | Next track |
| **Deck 3** | Utility | Acapella / Percussion / FX |
| **Deck 4** | Safety | Emergency backup / Loop tool |

**Mapping Focus**: Fast Deck 1↔2 switching, Deck 3/4 one-shot access

### 5.2 Festival / Peak Time (4-Deck Layering)

| Deck | Role | Content |
|------|------|---------|
| **Deck 1** | Drums/Bass | Stem Deck (drums+bass stems) |
| **Deck 2** | Melodic | Full track or Stem Deck (melodic) |
| **Deck 3** | Vocals/FX | Stem Deck (vocals) / Remix Deck |
| **Deck 4** | Atmosphere | Remix Deck (pads, textures, FX) |

**Mapping Focus**: Stem mute/solo, Remix Deck page nav, Flux on all decks

### 5.3 Technical / Controllerism (Remix Deck Heavy)

| Deck | Role | Content |
|------|------|---------|
| **Deck 1** | Rhythm | Remix Deck (drum one-shots/loops) |
| **Deck 2** | Bass | Remix Deck (bass loops) |
| **Deck 3** | Lead/FX | Remix Deck (synth, vocal chops, FX) |
| **Deck 4** | Master | Remix Deck (global FX, transitions) |

**Mapping Focus**: 64-slot access, per-slot FX, Flux Mode, Macro FX

---

## 6. Screen Layouts for Each Template

### 6.1 Club Layout (Horizontal 4-Deck)

```
┌────────────────────────────────────────────────────────────┐
│ BROWSER (minimized)  │  DECK 1  │  DECK 2  │  DECK 3  │ 4 │
│ ──────────────────── │  ──────  │  ──────  │  ──────  │   │
│ PLAYLIST (hidden)    │  WAV     │  WAV     │  WAV     │   │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Stem/Remix Layout (Vertical 4-Deck)

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   DECK 1    │   DECK 2    │   DECK 3    │   DECK 4    │
│  (Stems)    │  (Full)     │  (Remix)    │  (Remix)    │
│ ──────────  │ ──────────  │ ──────────  │ ──────────  │
│ STEM PANEL  │  WAVEFORM   │  SLOT GRID  │  SLOT GRID  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Shortcut**: Save layouts as **Window Layouts** (View → Window Layout → Save)

---

## 7. Level 2 Verification Checklist

**Complete all to unlock Level 3 (Expert/Customization):**

- [ ] Perform 5-min mix using all 4 decks (Deck 3/4 for layers, not just backup)
- [ ] Load a Stem Deck, isolate vocals for 32 bars, bring back full mix cleanly
- [ ] Load a Remix Deck, trigger 8+ slots rhythmically over a playing track
- [ ] Enable Flux Mode, perform scratch/loop/cue juggle without losing phrase
- [ ] Explain Stem vs Remix Deck choice for 3 different scenarios
- [ ] Demonstrate 8-cue system on 3 tracks of different genres
- [ ] Switch between Club/Festival/Controllerism layouts in < 30 sec each

---

## 🔗 Next Steps

| If you... | Then... |
|-----------|---------|
| Completed all checklists | → Read `reference/advanced-mixing-tips.md` (Level 2) |
| Want custom Stem/Remix mappings | → Level 3: Custom MIDI Mapping |
| Struggled with 4-deck cognitive load | → Practice 2-deck + 1 utility first |
| Need Flux Mode troubleshooting | → Read `reference/troubleshooting.md` §Performance |

---

## Sources

- [Crossfader: Stem vs Remix Decks](https://wearecrossfader.co.uk/blog/remix-decks-vs-stem-decks-traktor-pro-3-tips-tricks/) — Core comparison
- [DJ TechTools: S2 MK3 Stem Mapping](https://maps.djtechtools.com/mappings/9586) — Stem waveform toggle mapping
- [NI Traktor Pro 3 Manual](https://www.native-instruments.com/fileadmin/ni_media/downloads/manuals/traktor/TRAKTOR_PRO_3.2_Manual_English_0719.pdf) — Flux Mode, Deck layouts
- [Native Instruments: Traktor Pro Manual Online](https://www.native-instruments.com/ni-tech-manuals/traktor-pro-manual/en/index-en) — Current docs