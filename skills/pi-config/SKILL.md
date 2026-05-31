---
name: pi-config
description: Configures pi coding agent with skills, templates, extensions, packages, and models. Use for composable development workflows, custom agents, and project-specific configurations.
---

# Pi Coding Agent

Composable terminal coding harness with skills, templates, extensions, and packages.

## Core Components

- Skills: Directory-based capability packages with instructions and optional tools
- Templates: Markdown snippets that expand into full prompts
- Extensions: TypeScript modules adding tools, commands, events, and TUI features
- Packages: Bundle resources for sharing via npm or git
- Models: Configure AI providers via `models.json`

## Loading Locations

| Resource   | Global                      | Project             | Package        |
| ---------- | --------------------------- | ------------------- | -------------- |
| Extensions | `~/.pi/agent/extensions/`   | `.pi/extensions/`   | `package.json` |
| Skills     | `~/.pi/agent/skills/`       | `.pi/skills/`       | `package.json` |
| Templates  | `~/.pi/agent/prompts/`      | `.pi/prompts/`      | `package.json` |
| Settings   | `~/.pi/agent/settings.json` | `.pi/settings.json` | N/A            |

Disable with `--no-extensions`, `--no-skills`, `--no-prompt-templates`.

## Session Management

- `/new` - Create fresh session
- `/resume` - Switch to existing session
- `/tree` - Navigate session tree
- `/export` - Export to HTML
- `/share` - Upload to GitHub gist
- `/compact` - Trigger compaction

## Model Management

- `/model` - Switch models
- `Ctrl+L` - Cycle through favorites
- `Ctrl+P` - Show favorites list

## Four Modes

Interactive (default): Full TUI experience
Print: Simple text output
JSON: Event stream for APIs
RPC: JSON-RPC protocol
SDK: Embed in applications

```bash
pi --mode json    # JSON mode
pi --mode rpc     # RPC mode
pi --mode sdk     # SDK mode
```

## Project Configuration

### AGENTS.md

Project instructions loaded at startup from `~/.pi/agent/AGENTS.md`, parent directories, and current directory.

### SYSTEM.md

Replace system prompt per-project at `~/.pi/agent/SYSTEM.md`.

### Settings

Configure resources in `~/.pi/agent/settings.json` or `.pi/settings.json`.

## Package Installation

Always before installation
- read package README
- check current system and environment
- stop and ask user before installing - "What is preferred installation method for packages?". And provide recommendation + reasoning; be concise, specific.   

```bash
# Install from npm (in most cases)
pi install npm:@foo/bar@1.2.3

# Install from git
pi install git:github.com/user/repo@v1

# Install to project
pi install -l npm:@foo/bar

# Remove package
pi remove npm:@foo/bar
```

## Model Configuration

Create `~/.pi/agent/models.json` for custom providers:

```json
{
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
}
```

## Detailed Documentation

- Mistakes to Avoid — See [mistakes.md](./references/mistakes.md)
- Extensions: See [extensions.md](./references/extensions.md)
- Steering model: See [extensions.md](./references/extensions-steer-model.md)
- Skills: See [skills.md](./references/skills.md)
- Templates: See [templates.md](./references/templates.md)
- Packages: See [packages.md](./references/packages.md)
- Sessions: See [sessions.md](./references/sessions.md)
- Configuration: See [config.md](./references/config.md)
- TUI input/debugging: See [tui-input-debugging.md](./references/tui-input-debugging.md)
