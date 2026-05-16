# cx-ck-preflight

4-step onboarding gate enforcing the AGENTS.md escalation hierarchy. Forces the agent to learn project tools (cx/ck) before falling back to universal search (grep/find).

## Why

Agents systematically route around cx/ck using universal tools (grep/find) even when reminded. A reminder doesn't fix the behavior — the agent needs to actually **run** the project tools first. This extension creates a structured 4-step gate that forces the agent to use cx/ck in order.

## The 4 steps

1. **`cx overview .`** — learn codebase orientation
2. **`cx symbols --name PATTERN`** or **`cx references --name NAME`** — learn targeted search
3. **`ck --index .`** (or **`ck --status`** if already indexed) — index for semantic search
4. **`ck "PATTERN" PATH`** — learn semantic search

After step 4: all tools unblocked. `cx-first-reminder` continues to nudge on ongoing grep/find usage.

## Key mechanisms

The extension uses **three layers of enforcement** to make instructions unignorable:

- **`deliverAs: "steer"` messages** — injected before the model's next reasoning step (hardest to ignore)
- **System prompt injection** via `before_agent_start` — highest-weight instruction for models
- **`{ block: true, reason }`** — prevents tool execution entirely

Additional features:
- **Debounced block steers** — one steer per step, avoids stale/overlapping messages
- **State persistence** via `appendEntry` — survives session resumes
- **Status line** showing current step (`⚠️ Preflight [2/4]`)
- **`/preflight` command** — `status`, `reset`, `skip`

## Blocked patterns

- `grep` and `find` tool calls blocked in steps 1–4
- Bash commands containing `grep|rg|ack|ag|find|fd` blocked in steps 1–4 (unless also containing `cx` or `ck`)
- `ck` commands blocked in steps 1–2 (must learn cx search first)
- `cx` commands always allowed

## Install

Add to `settings.json` extensions array:

```json
"extensions": [
  "/path/to/cx-ck-preflight.ts"
]
```

## `/preflight` command

| Command | Description |
|---------|-------------|
| `/preflight` | Show current step |
| `/preflight reset` | Reset to step 1 |
| `/preflight skip` | Skip to step 5 (all tools unblocked) |

## Changelog

- **v2** — Complete rewrite: steer messages, system prompt injection, state persistence, status line, `/preflight` command, debounced block steers, removed `ls`/`read` from blocklist, softened block messages, accepted `ck --status` for step 3.

## Check for errors 

:```js
cd path-to-repo/pi-agent-config && npx tsc --noEmit 2>&1 | grep "cx-ck-preflight"

```