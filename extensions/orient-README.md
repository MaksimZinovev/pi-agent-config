# orient

2-step onboarding gate enforcing the AGENTS.md escalation hierarchy. Forces the agent to use `cx overview .` and `ck --index .` before falling back to grep/find.

## The 2 steps

1. **`cx overview .`** — learn codebase orientation
2. **`ck --index .`** (or **`ck --status`** if already indexed) — prepare semantic search

After step 2: all tools unblocked. `cx-first-reminder` continues to nudge on ongoing grep/find usage.

## Key mechanisms

- **`deliverAs: "steer"` messages** — injected before model's next reasoning step
- **`{ block: true, reason }`** — prevents grep/find tool execution entirely
- **State persistence** via `appendEntry` — survives session resumes
- **Status line** showing current step (`⚠️ Orient [1/2]`)
- **`/orient` command** — `status`, `reset`, `skip`

## Blocked patterns

| Step | Blocked |
|------|---------|
| 1 | grep/find tools, bash grep/find commands, ck commands |
| 2 | grep/find tools, bash grep/find commands |
| 3+ | Nothing (cx-first-reminder handles nudges) |

## Install

Add to `settings.json` extensions array:

```json
"extensions": [
  "/path/to/orient.ts"
]
```

## `/orient` command

| Command | Description |
|---------|-------------|
| `/orient` | Show current step |
| `/orient reset` | Reset to step 1 |
| `/orient skip` | Skip to step 3 (all tools unblocked) |