# cx-ck-preflight

Blocks `grep`/`find` until the agent runs `cx overview .` and `ck --index .` itself.

## Why

The agent has a systematic blind spot: it routes around cx/ck using universal tools (grep/find)
even when reminded. A reminder doesn't fix the behavior — the agent needs to actually **run**
the project tools before it can fall back to universal ones. This extension creates a one-time
gate that forces the agent to use cx/ck first.

## How it works

1. At session start, `preflightPassed = false`. `grep`/`find` tool calls are **blocked** with a
   message telling the agent to run `cx overview .` and `ck --index .` first.
2. The agent runs those commands itself (via bash) — building the habit of using project tools.
3. When the extension detects both commands have been issued (`cxSeen && ckSeen`), it sets
   `preflightPassed = true` and stops blocking.
4. The existing `cx-first-reminder` extension continues to nudge on ongoing grep/find usage.

The extension does **not** run the commands on the agent's behalf. The agent must run them itself.

## Blocked patterns

- Direct `grep` or `find` tool calls
- Bash commands containing `grep|rg|ack|ag|find|fd` (unless they also contain `cx` or `ck`)

## Install

Add to `settings.json` extensions array:

```json
"extensions": [
  "/path/to/cx-ck-preflight.ts"
]
```
