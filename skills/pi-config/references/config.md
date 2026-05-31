# Configuration Reference

Pi can be configured through settings files. Configuration can be global or project-specific.

## Configuration Files

| Location                    | Scope                         |
| --------------------------- | ----------------------------- |
| `~/.pi/agent/settings.json` | Global (affects all projects) |
| `.pi/settings.json`         | Project (shared with team)    |

## Settings Structure

```json
{
  "defaultMode": "interactive",
  "packages": ["npm:simple-pkg"],
  "extensions": ["/path/to/extension.ts"],
  "skills": ["~/.local/skills/my-skill"],
  "prompts": ["/path/to/prompts"],
  "themes": ["/path/to/themes"],
  "enableSkillCommands": true,
  "customModels": {
    "providers": {
      "ollama": {
        "baseUrl": "http://localhost:11434/v1",
        "api": "openai-completions",
        "models": [
          {
            "id": "llama-3.1-8b",
            "name": "Llama 3.1 8B (Local)",
            "contextWindow": 128000,
            "maxTokens": 32000
          }
        ]
      }
    }
  },
  "defaultModel": "anthropic/claude-3-5-sonnet"
}
```

## Configuration Keys

| Key                   | Type    | Description                                            |
| --------------------- | ------- | ------------------------------------------------------ |
| `defaultMode`         | string  | `"interactive"`, `"print"`, `"json"`, `"rpc"`, `"sdk"` |
| `packages`            | array   | npm, git, or local package sources                     |
| `extensions`          | array   | Extension files or directories                         |
| `skills`              | array   | Skill locations                                        |
| `prompts`             | array   | Template directories                                   |
| `themes`              | array   | Theme directories                                      |
| `enableSkillCommands` | boolean | Enable `/skill:name` commands                          |
| `customModels`        | object  | Custom provider configuration                          |
| `defaultModel`        | string  | Default model identifier                               |

See [REFERENCE.md](REFERENCE.md) for complete configuration options.

## Configuration Commands

```bash
# Display configuration
pi config

# Edit configuration
pi config --edit

# Export configuration
pi config --export

# Import configuration
pi config --import <file>
```

## Configuration Loading Order

1. Global settings (`~/.pi/agent/settings.json`)
2. Project settings (`.pi/settings.json` - overrides global)
3. Environment variables (`PI_CONFIG_PATH`, `PI_MODE`)
4. Command-line flags (overrides all)

## Configuration Best Practices

- Use project settings for team projects
- Keep configuration minimal
- Add `.pi/settings.json` to version control
- Document important changes
- Don't include API keys - use environment variables

## Configuration Examples

### Minimal Configuration

```json
{
  "packages": ["npm:my-package"]
}
```

### Development Configuration

```json
{
  "defaultMode": "interactive",
  "packages": ["npm:dev-package@dev"],
  "extensions": ["./dev-extensions"],
  "skills": ["./dev-skills"],
  "prompts": ["./dev-prompts"],
  "enableSkillCommands": true
}
```

### Production Configuration

```json
{
  "packages": ["npm:production-package@1.2.3"],
  "extensions": ["/opt/pi/extensions"],
  "skills": ["/opt/pi/skills"],
  "prompts": ["/opt/pi/prompts"],
  "defaultModel": "anthropic/claude-3-5-sonnet"
}
```

## Configuration Security

Don't include API keys in configuration files. Use environment variables:

```json
{
  "customModels": {
    "providers": {
      "anthropic": {
        "apiKey": "$ANTHROPic_API_KEY"
      }
    }
  }
}
```

## MCP Server Configuration

Pi uses `pi-mcp-adapter` to manage MCP servers. It reads configs in this precedence order:

| Priority | Path | Scope |
| -------- | ---- | ---- |
| 1 | `~/.config/mcp/mcp.json` | System-wide shared |
| 2 | `~/.pi/agent/mcp.json` | Pi global override |
| 3 | `.mcp.json` | Project root |
| 4 | `.pi/mcp.json` | Project override |

**⚠️ Common mistake:** editing `~/.pi/mcp.json` instead of `~/.pi/agent/mcp.json`. The former is NOT in the lookup path.

### Example (`~/.pi/agent/mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
      "directTools": true
    },
    "deepwiki": {
      "url": "https://mcp.deepwiki.com/mcp",
      "directTools": true,
      "lifecycle": "eager"
    }
  }
}
```

### Troubleshooting MCP Auth

1. **Token invalid?** Verify with curl: `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $TOKEN" https://api.github.com/user` (expect `200`)
2. **Config not loading?** Confirm you edited the right file: `~/.pi/agent/mcp.json` (priority 2)
3. **Cached stale process?** Restart Pi after config changes — MCP servers spawn fresh on startup
4. **Env var not expanding?** Check the shell exports the variable: `echo ${MY_VAR:+SET}`
5. **Dead token in .mcp.json?** Project `.mcp.json` (priority 3) overrides global `~/.pi/agent/mcp.json` (priority 2). A revoked token in project config will silently break the server even if global has a valid one. Remove dead entries or use `.pi/mcp.json` (priority 4) to override.

See [REFERENCE.md](REFERENCE.md) for complete configuration reference.

## MCP Tool Bloat

MCP server tool schemas can consume significant context window (50-100KB+). For audit data, stale cache cleanup, and per-server lifecycle tuning (`directTools`, `lifecycle`), see [mcp-tool-bloat.md](../../../memory/mcp-tool-bloat.md).
