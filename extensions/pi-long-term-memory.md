# @vtstech/pi-long-term-memory

**Long-term memory extension for the Pi Coding Agent** — persistent memory across sessions with auto-injection, AI-driven creation, and a ~4k token window.

## Install

```bash
pi install "npm:@vtstech/pi-long-term-memory"
```

## Commands

```
/memory add <text>      Add a memory (optional tags, e.g. /memory add "Use postgres" --tags decision)
/memory list            List all memories
/memory clear            Clear memories (preserves metadata)
/memory clear-meta       Reset metadata
/memory meta             Show metadata (user, environment)
/memory-gate             Toggle confirmation gate on/off
/memory help             Show help
```

## How It Works

Memories are stored in `.pi/agent/long-term-memory.json` and **survive across sessions and restarts**. At session start the full memory context is automatically injected before the AI's first response — no manual loading needed.

### AI-Driven Creation

The agent can create memories via the `create_memory` tool:

```json
{ "action": "create_memory", "content": "Decided on PostgreSQL", "tags": "decision, architecture", "reason": "Better consistency guarantees" }
```

With the **memory gate** enabled (default), you're prompted to confirm before creation.

### Token Management

Memory operates within a ~4k token window. When approaching the limit, older/less important memories are auto-summarized. All memories are preserved across sessions.

### Metadata

Auto-detected on first run: primary user name and environment (from `USER`/`NODE_ENV`).

## Source

- npm: [`@vtstech/pi-long-term-memory`](https://www.npmjs.com/package/@vtstech/pi-long-term-memory)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT

## How the Agent Uses Memory

### 1. Auto-Injection (Passive)

When a session starts, the extension hooks into the Pi lifecycle:

| Hook | What happens |
|---|---|
| `pre_session_start` | Prompts for metadata (user name, environment) if missing, saves store |
| `session_start` | Displays memory context to the user in the TUI |
| `before_provider_request` | **Prepends the full memory context to every API request** — the agent sees it as part of the system prompt |

So the agent **automatically** has access to all your stored memories in every turn. It sees them formatted like:

```
---
LONG-TERM MEMORY (from previous sessions)
---
[06-28-2025 14:30:00] Decided on PostgreSQL for session storage [decision, architecture]
[06-27-2025 09:15:00] Prefer TypeScript for new projects [preference]
---
```

### 2. The `memory` Tool (Active)

The extension registers a `memory` tool the agent can call at any time:

| Action | What it does |
|---|---|
| `memory { action: "get" }` | Retrieve all memories + metadata |
| `memory { action: "add", content: "...", tags: "decision,db" }` | Store a new memory |
| `memory { action: "list" }` | List all memories sorted by last accessed |
| `memory { action: "clear" }` | Delete all memories |
| `memory { action: "meta" }` | Show metadata (user, environment, timestamps) |

### 3. The `create_memory` Tool (AI-Driven)

There's also a separate `create_memory` tool specifically for the AI to request saving something. **With the memory gate enabled (default)**, you get a confirmation prompt before it's actually stored. This means the agent can proactively say *"I'd like to remember this for next time"* and ask you to approve it.

### Summary Flow

```
Session starts
  → Pre-inject: metadata prompts if needed
  → Display: memory context shown to user
  → Every API call: memory prepended to request
  → Agent can call `memory` tool to read/write at any time
  → Agent can call `create_memory` to request saving (gate: confirm/deny)
  → Within ~4k token budget, older/less important memories get auto-summarized
```

You don't have to do anything for read — the agent **always** sees your memories. You only interact when adding (`/memory add`), clearing, or confirming AI-initiated saves.