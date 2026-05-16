# cx-ck-preflight — Improvements Progress

## Commits (latest first)
- `01390d2` Fix compound bypass, improve result parsing, add post-preflight nudges
- `459d242` C2: context-aware steers from parsed tool output (moved transitions to tool_result)
- `eaa1298` B1: validate step 4 ck results before advancing
- `71af4a0` V2 rewrite: steer messages, system prompt injection, state persistence, debounce, /preflight cmd

## Key Learnings
1. **`{ block, reason }` alone is ignored** — models need steer messages + system prompt injection
2. **`deliverAs: "steer"` + `triggerTurn: true`** is the most effective redirect (see extensions-steer-model.md)
3. **`before_agent_start` system prompt injection** carries highest model weight
4. **Debounce steers** — one steer per step prevents stale/overlapping messages
5. **Step transitions belong in `tool_result`** — enables result validation (B1) and output parsing (C2)
6. **Models chain `cx || find`** to bypass grep/find blocks — need segment-based checking
7. **`extractResultText()` returned empty** in test — added fallbacks for result.output, result.text, raw string; **needs verification**

## Decisions
- `setActiveTools()` rejected — risk of breaking cx/ck internals that need grep
- `ls` and `read` removed from blocklist — too broad, blocks basic navigation
- Block messages softened from `🔴 STOP` to `⚠️` — steer+system-prompt do the heavy lifting
- Post-preflight nudges use `deliverAs: "followUp"` (not "steer") — graduated, less intrusive
- Segment-based blocking splits on `||, &&, ;, |` — each segment checked independently