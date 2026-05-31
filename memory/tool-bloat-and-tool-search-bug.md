# Tool Bloat & pi-tool-search Race Condition Bug Report

**Date**: 2025-05-31  
**Project**: pi-agent-config  
**Status**: Investigated, fix applied (pi-tool-search uninstalled), further optimization pending

---

## 1. The pi-tool-search Race Condition Bug

### Summary

`pi-tool-search` (v0.3.6) is a Pi extension that hides all tools behind a `tool_search` gate to reduce system prompt token usage. When you call `tool_search(["hex_edit_show"])`, it reports "Enabled: hex_edit_show" — but calling `hex_edit_show` immediately after returns **"Tool not found"**.

### Root Cause

**Already fully documented** by the author in `docs/same-turn-race-bug.md`:

The LLM request payload (`tools: [...]` schema) is built **before** `tool_search.execute()` runs. When `tool_search` mutates state via `pi.setActiveTools()`, it only updates `this.agent.state.tools` — a **pure state mutation** with no schema re-send. The current LLM request already has the old tool schema baked in.

**Key code path** (`pi-coding-agent/dist/core/agent-session.js:568`):
```js
setActiveToolsByName(toolNames) {
    const tools = [];
    const validToolNames = [];
    for (const name of toolNames) {
        const tool = this._toolRegistry.get(name);
        if (tool) {
            tools.push(tool);
            validToolNames.push(name);
        }
    }
    this.agent.state.tools = tools;  // state mutation only, no re-send
    this._baseSystemPrompt = this._rebuildSystemPrompt(validToolNames);
}
```

The `_toolRegistry` **does** include extension-registered tools (like `hex_edit`), so the names resolve correctly. But the schema is frozen for the current provider request batch.

### Why It Worked Before (May 21 session)

In the May 21 session, `hex_edit` worked because the tool call happened in a **different agent-loop turn** after `tool_search` had already completed. The `turn_start` handler calls `refreshActiveTools()` which re-applies `setActiveTools()`, so tools enabled in a previous turn ARE available. The bug only manifests when the model calls a newly-enabled tool before the next LLM request is sent.

### Same-Turn Race Condition

When the LLM emits `tool_search(["hex_edit"])` and `hex_edit(...)` in the same assistant message (parallel tool calls), the second call fails because:
1. Both calls are dispatched from the same batch
2. `tool_search` updates state but doesn't re-send the tool schema
3. The provider returns "Tool not found" for `hex_edit`

### Mitigations Shipped (in v0.3.3-v0.3.6)

| Mitigation | Effectiveness |
|---|---|
| Prompt telling model to call `tool_search` alone | Partial — models sometimes ignore |
| `turn_start` refresh keeping unlocked tools active | Good — fixes cross-turn usage |
| Hidden steer hint after successful unlock | Good — triggers next turn |
| "Already active" section in manifest | Good — avoids redundant enable calls |

### Remaining Gap

Even following the "call tool_search alone, wait for next turn" advice, the model can still be in the **same agent-loop continuation** (not a fresh user turn). The `turn_start` event does fire for loop continuations, but if the LLM batches tool calls, the race persists.

### Fixes Considered

| Fix | Effort | Scope | Viable? |
|---|---|---|---|
| `alwaysEnabled` config in settings.json | 1/10 | Workaround, per-tool | ✅ Shipped |
| Disable `pi-tool-search` entirely | 1/10 | Removes gate entirely | ✅ Applied |
| Force sequential dispatch when `tool_search` is in batch | 3/10 | pi-tool-search fork | ✅ Possible |
| `before_provider_request` payload rewrite | 5/10 | pi-tool-search, fragile | ⚠️ Provider-specific |
| Upstream: re-resolve tools per dispatch in pi-coding-agent | 6-7/10 | Core fix | 🏗️ Best long-term |
| Upstream: graceful unknown-tool result ("retry next turn") | 3/10 | pi-coding-agent | ✅ Good fallback |

### Decision

**Uninstalled `pi-tool-search`** — eliminates the race condition entirely. All tools are always in schema. Token cost increases but correctness is guaranteed.

---

## 2. Tool Bloat Audit

### Current Tool Count: ~143

| Source | Tools | Schema Size | % of Total | Status |
|--------|-------|-------------|------------|--------|
| **circleci** (stale cache) | 16 | **57KB** | **50.3%** | ❌ Not in mcp.json — stale cache |
| **chrome-devtools** | 29 | 19KB | 17.1% | ⚠️ Only needed for browser work |
| **github** | 26 | 15KB | 13.4% | ✅ Keep — commonly used |
| **nocodb** | 25 | 13KB | 11.9% | ❌ Server not running |
| **inspect** | 10 | 7KB | 6.6% | ✅ Keep — PR reviews |
| **deepwiki** | 3 | 1KB | 0.8% | ✅ Keep — tiny |
| **Pi core** (read/write/edit/bash/grep/find/ls) | 7 | ~2KB | — | ✅ Keep |
| **Pi AST/LSP** | 4 | ~3KB | — | ✅ Keep |
| **pi-hex-edit** | 4 | ~3KB | — | ✅ Keep |
| **pi-web-search** | 2 | ~2KB | — | ✅ Keep |
| **pi-design-deck** | 2 | ~3KB | — | ⚠️ If not using decks |
| **pi-interview** | 1 | ~1KB | — | ⚠️ If not using interviews |
| **pi-monitor** | 1 | ~1KB | — | ✅ Keep |
| **pi-long-term-memory** | 2 | ~2KB | — | ✅ Keep |
| **pi-session-search** | 3 | ~2KB | — | ✅ Keep |
| **pi-mcp-adapter** | 1 | ~1KB | — | ✅ Keep |
| **pi-diag** | 1 | ~1KB | — | ✅ Keep |
| **pi-subagents** | 1 | **~15KB** | — | ⚠️ Massive single-tool schema |
| **pi-teams** | 21 | **~8KB** | — | ⚠️ Only if using teams |
| **pi-tool-display** | — | — | — | Extension, no tool |
| **pi-rtk-optimizer** | — | — | — | Extension, no tool |
| **pi-permission-system** | — | — | — | Extension, no tool |
| **pi-slopchop** | — | — | — | Extension, no tool |

### Total MCP Schema Bloat: 113KB

```
circleci       ████████████████████████████████████████████████  50.3%  (57KB — STALE)
chrome-devtools █████████████████                                17.1%  (19KB)
github          █████████████                                    13.4%  (15KB)
nocodb          ████████████                                    11.9%  (13KB — SERVER DOWN)
inspect         ██████                                           6.6%  (7KB)
deepwiki        █                                                 0.8%  (1KB)
```

### Recommendations (Priority Order)

1. **Clear stale CircleCI cache** — 57KB (50%!) freed. CircleCI is not in `mcp.json`, this is leftover cache from a previous config.

2. **Remove `nocodb` from `mcp.json`** — 13KB freed. Server isn't running (`localhost:8080` returns nothing). Re-add when needed.

3. ~~**Comment out `chrome-devtools` in `mcp.json`** when not doing browser work — 19KB freed. MCP servers are `directTools: true` so all 29 tools are always in schema.~~ **Now obsolete** — all servers set to `lifecycle: "lazy"` without `directTools`, so no schema bloat when idle.

4. **Add `npm:pi-teams` and `npm:pi-design-deck` to `disabledExtensions`** — ~11KB freed. Only enable when doing team orchestration or design decks.

5. **Consider `subagent` schema optimization** — The single `subagent` tool has ~15KB of schema (acceptance contracts, chains, parallel tasks). This is the largest single-tool schema. Would need upstream changes to reduce.

6. **GitHub MCP schema could be trimmed** — 26 tools with verbose parameter descriptions (15KB). Some tools like `github_create_pull_request_review` are rarely used. Could create a "minimal github" config.

### Potential Savings

| Action | Saved | Complexity |
|--------|-------|------------|
| Clear CircleCI cache | 57KB | ✅ Done — auto-clears |
| Remove nocodb | 13KB | ✅ Done — moved to project-level config |
| All MCP servers to lazy lifecycle | 45KB | ✅ Done — zero schema bloat when idle |
| Disable pi-teams | ~8KB | Add to disabledExtensions |
| Disable pi-design-deck | ~3KB | Add to disabledExtensions |
| **Total** | **~126KB** | — |

After clearing CircleCI cache + moving nocodb to project-level + all servers lazy: **0KB MCP bloat when idle** (all schemas loaded on demand).

---

## 3. The `alwaysEnabled` Workaround (if pi-tool-search is re-enabled)

If `pi-tool-search` is re-installed later, frequently-used tools can be pre-unlocked by adding to `settings.json`:

```json
"toolSearch": {
  "alwaysEnabled": [
    "hex_edit", "hex_edit_show", "hex_edit_validate", "hex_edit_diff",
    "subagent", "web_search", "web_fetch",
    "ls", "mcp", "memory", "create_memory"
  ],
  "showToolSearchFooterStatus": true
}
```

This bypasses the race condition for those specific tools (they're always in the schema from session start), at the cost of ~500 bytes per tool per turn.

---

## 4. Key Files Referenced

| File | Role |
|------|------|
| `~/.pi/agent/settings.json` | Pi configuration (packages, extensions, disabled list) |
| `~/.pi/agent/mcp.json` | MCP server definitions |
| `~/.pi/agent/mcp-cache.json` | Cached MCP tool schemas (173KB) — includes stale CircleCI |
| `~/repos/pi-tool-search/extensions/index.ts` | The tool_search extension source |
| `~/repos/pi-tool-search/docs/same-turn-race-bug.md` | Author's own bug documentation |
| `pi-coding-agent/dist/core/agent-session.js:568` | `setActiveToolsByName()` — state-only mutation |

---

## 5. Open Questions

- Should `pi-tool-search` be re-installed once the upstream fix lands in `pi-coding-agent`? (Depends on token cost vs. savings)
- Can `circleci` MCP cache be safely deleted from `mcp-cache.json`, or does it auto-regenerate?
- Is the `subagent` schema (~15KB for one tool) something that could be split into multiple smaller tools upstream?
- Should `nocodb` be moved to a lazy-connect MCP pattern (only spawn when needed)?