# MCP Tool Bloat Management

## The Problem

MCP servers inject their tool schemas into every LLM turn. With 6 servers, that's **113KB of schemas** sent with every request — eating context window and costing tokens.

The worst offender is stale cache: servers you no longer use but whose schemas are still cached and loaded.

## Bloat Audit (2025-05-31)

| Server | Tools | Schema Size | % of Total | Notes |
|--------|-------|-------------|------------|-------|
| circleci (stale) | 16 | **57KB** | **50.3%** | Not in mcp.json — stale cache |
| chrome-devtools | 29 | 19KB | 17.1% | `directTools: true` |
| github | 26 | 15KB | 13.4% | `directTools: true` |
| nocodb | 25 | 13KB | 11.9% | Server not running |
| inspect | 10 | 7KB | 6.6% | `directTools: true, eager` |
| deepwiki | 3 | 1KB | 0.8% | `directTools: true, eager` |
| **TOTAL** | **109** | **113KB** | | |

## Reducing Bloat

### 1. Remove Stale Cache Entries

The MCP cache is global (`~/.pi/agent/mcp-cache.json`). Servers from other projects accumulate here even after they're removed from `mcp.json`.

```bash
# View cache size
cat ~/.pi/agent/mcp-cache.json | python3 -c "
import json, sys; d=json.load(sys.stdin)
for name, info in d.get('servers',{}).items():
    print(f'{name}: {len(info.get(\"tools\",[]))} tools, {len(json.dumps(info))//1024}KB')
"

# Remove a stale entry
python3 -c "
import json
with open('$HOME/.pi/agent/mcp-cache.json') as f: d=json.load(f)
d['servers'].pop('circleci', None)
with open('$HOME/.pi/agent/mcp-cache.json', 'w') as f: json.dump(d, f, indent=2)
"
```

### 2. Use `lifecycle: "lazy"` Instead of `directTools: true`

`directTools: true` injects ALL server tools into every LLM turn. Use `lifecycle: "lazy"` instead — the server only starts and loads tools when actually called.

```json
{
  "mcpServers": {
    "circleci": {
      "command": "npx",
      "args": ["-y", "@circleci/mcp-server-circleci@latest"],
      "lifecycle": "lazy"
    }
  }
}
```

**Trade-off**: First call to a lazy server is slower (server startup), but you save the full schema on every other turn.

### 3. Use Project-Level MCP Configs

Keep heavy servers in project-level `.pi/mcp.json` instead of global `~/.pi/agent/mcp.json`. They only load when you're in that project.

```json
// ~/repos/my-project/.pi/mcp.json
{
  "mcpServers": {
    "circleci": {
      "command": "npx",
      "args": ["-y", "@circleci/mcp-server-circleci@latest"],
      "env": { "CIRCLECI_TOKEN": "${CIRCLECI_TOKEN}" },
      "lifecycle": "lazy"
    }
  }
}
```

**⚠️ Project-level tools still go into the global cache** (`~/.pi/agent/mcp-cache.json`). When you switch projects, stale tools from the previous project remain cached. Clean the cache periodically or after project switches.

### 4. Remove Servers You Don't Use

If nocodb server is never running, remove it from `mcp.json` entirely. Add it back when needed.

### 5. Disable Pi Packages You Don't Use

Pi packages (in `settings.json`) also contribute tools. Move unused ones to `disabledExtensions`:

```json
{
  "disabledExtensions": [
    "npm:pi-teams",        // 21 tools, ~8KB — only needed for team orchestration
    "npm:pi-design-deck"    // 2 tools, ~3KB — only needed for design decks
  ]
}
```

## CircleCI Specific Guidance

**Q: I cleared CircleCI from the global cache. Will it come back?**

Yes. When you open a project that has CircleCI in its `.pi/mcp.json` (e.g., `scool-playwright`), Pi will:
1. Merge project-level MCP servers with global ones
2. Start the CircleCI MCP server
3. Cache the 16 tool schemas (57KB) back into the global cache

**Prevention options (pick one):**

| Option | Config Change | Token Savings | Trade-off |
|--------|--------------|---------------|-----------|
| A. `lifecycle: "lazy"` | Add to project `.pi/mcp.json` | 57KB per turn | First call to CircleCI tool is ~2-5s slower (server startup) |
| B. Remove `directTools` | Remove from project `.pi/mcp.json` | 57KB per turn | Tools only available after explicit MCP interaction |
| C. Keep project-only (current) | Already the case | 57KB only in that project | Still cached globally after visiting the project |

**Recommendation**: Use **Option A** (`lifecycle: "lazy"`) for project-level CircleCI config. This eliminates bloat for all projects while keeping CircleCI available when needed.

```json
// ~/repos/scool-playwright/.pi/mcp.json
{
  "mcpServers": {
    "circleci": {
      "command": "npx",
      "args": ["-y", "@circleci/mcp-server-circleci@latest"],
      "env": {
        "CIRCLECI_TOKEN": "${CIRCLECI_TOKEN}",
        "CIRCLECI_PROJECT_SLUG": "circleci/8jqZMi7ntqjWvEKEyV1acB/FBHX8QX3jeytFsLRoAit26"
      },
      "lifecycle": "lazy"
    }
  }
}
```

## The pi-tool-search Race Condition Bug

> **Status**: pi-tool-search uninstalled as of 2025-05-31

`pi-tool-search` (v0.3.6) gates tools behind a `tool_search` function to reduce prompt tokens. It has a **known race condition** (documented in `docs/same-turn-race-bug.md` in the repo):

- When `tool_search` enables a tool, `setActiveToolsByName()` mutates state but **does not re-send the tool schema** to the current LLM request
- Calling the newly-enabled tool in the same turn (or same agent-loop continuation) returns **"Tool not found"**
- The fix requires changes in `pi-coding-agent` core (re-resolve tools per dispatch)

If re-installing `pi-tool-search`, add frequently-used tools to `alwaysEnabled` in `settings.json`:

```json
"toolSearch": {
  "alwaysEnabled": [
    "hex_edit", "hex_edit_show", "hex_edit_validate", "hex_edit_diff",
    "subagent", "web_search", "web_fetch"
  ]
}
```

See the full bug report in `~/repos/pi-agent-config/memory/tool-bloat-and-tool-search-bug.md`.

## Quick Reference: MCP Config Loading Priority

| Priority | Path | Scope |
|----------|------|-------|
| 1 | `~/.config/mcp/mcp.json` | System-wide shared |
| 2 | `~/.pi/agent/mcp.json` | Pi global override |
| 3 | `.mcp.json` | Project root |
| 4 | `.pi/mcp.json` | Project override |

**⚠️ Common mistake**: editing `~/.pi/mcp.json` instead of `~/.pi/agent/mcp.json`. The former is NOT in the lookup path.

## MCP Server Lifecycle Options

| Option | Description | Best For |
|--------|-------------|----------|
| `lifecycle: "eager"` | Start immediately on session start | Frequently-used servers (deepwiki, inspect) |
| `lifecycle: "lazy"` or omitted | Start on first tool call | Occasionally-used servers (circleci, nocodb) |
| `directTools: true` | Inject all tools into every LLM turn | Servers with small schemas (deepwiki, inspect) |
| `directTools: false` or omitted | Tools available via `mcp` gateway | Servers with large schemas or infrequent use |