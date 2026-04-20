# Pi-Hooks: Filtering MCP Tool Calls

## Problem
pi-mcp-adapter registers ONE unified `mcp` proxy tool. Individual MCP tools are NOT separate tools.
`https://github.com/hsingjui/pi-hooks`
**Event reality:** `tool_name: "mcp"` (always), `tool_input: {tool: "actual_tool_name", ...}`

## Solution: `matcher` + `if` Field
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "mcp",                    // Match unified mcp tool
      "hooks": [{
        "if": "mcp(*deepwiki*)",           // Filter by tool_input content
        "type": "command",
        "command": "echo 'detected'"
      }]
    }]
  }
}
```

## How `if` Matching Works
```javascript
// For MCP, pattern matches JSON.stringify(tool_input)
toolInput = {tool: "deepwiki_ask_question", args: '{"repoUrl":"..."}'}
// → Target: '{"tool":"deepwiki_ask_question","args":"..."}'

// Syntax: ToolName(pattern) - * is wildcard
"mcp(*deepwiki*)"  // ✅ matches all deepwiki tools
"mcp(*memory*)"    // ✅ matches memory tools
"mcp(*)"           // ✅ matches ALL MCP calls (omit if for same effect)
```

## Quick Patterns
```json
// ALL MCP calls
{"matcher": "mcp", "hooks": [{"type": "command", "command": "..."}]}

// Specific MCP tool family
{"matcher": "mcp", "hooks": [{"if": "mcp(*deepwiki*)", ...}]}

// Non-MCP: Bash git commands (matches tool_input.command)
{"matcher": "bash", "hooks": [{"if": "Bash(git *)", ...}]}

// Non-MCP: TypeScript file edits (matches tool_input.path)
{"matcher": "edit", "hooks": [{"if": "Edit(*.ts)", ...}]}
```

**Config:** `~/.pi/agent/settings.json` → `hooks` key **Apply:** `/reload`
