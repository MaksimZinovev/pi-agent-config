# pi-agent-config

Personal [Pi agent](https://github.com/passively/lens) configuration — skills, extensions, settings, and tooling — managed as dotfiles with symlink-based deployment.

## Why

- **Version control** — track, diff, and rollback agent config changes
- **Portability** — clone on any machine, run `setup.sh`, ready to go
- **Sharing** — public reference for skill/extension patterns and Pi configuration

## Quick Start

```bash
git clone https://github.com/MaksimZinovev/pi-agent-config.git
cd pi-agent-config
./setup.sh            # symlinks configs into ~/.pi/agent/

# MCP servers need your GitHub token:
cp mcp.json.template mcp.json   # then edit or: envsubst < mcp.json.template > mcp.json
```

> `setup.sh` backs up existing files before symlinking. `mcp.json` is **not** symlinked — it's generated from the template so secrets stay local.

## Directory Structure

```
pi-agent-config/
├── AGENTS.md                 # System prompt & skill trigger rules
├── settings.json             # Agent behavior, models, packages, hooks
├── models.json               # Provider/model definitions (local Ollama)
├── pi-permissions.jsonc      # Tool/bash/MCP permission policies
├── keybindings.json          # Keyboard shortcuts
├── fancy-footer.json         # Footer status bar config
├── promptsmith-settings.json # Prompt enhancement preferences
├── mcp.json.template         # MCP server template (envsubst, never real tokens)
├── setup.sh                  # Symlink deploy script with auto-backup
├── .gitleaks.toml            # Secret scanning config
├── extensions/               # TypeScript extensions loaded by Pi
│   ├── answer.ts             #   Streaming answer handler
│   ├── cx-cache-warm.ts      #   Auto-warm cx index at session start
│   ├── cx-first-reminder.ts  #   Prefer cx over grep/find
│   ├── files.ts              #   File operation helpers
│   ├── prune-large-toolresults.ts  # Truncate oversized tool output
│   └── split-fork.ts         #   Split-fork orchestration
├── skills/                   # Skill definitions (SKILL.md + references)
│   ├── systematic-debugging/  #   Auto-trigger on repeated errors
│   ├── github-cli/           #   gh CLI patterns & scripts
│   ├── design-deck/          #   Multi-slide design decisions
│   ├── mermaid/              #   Diagram generation & validation
│   ├── commit/               #   Structured commit workflow
│   ├── root-cause-tracing/   #   find-polluter.sh for bisecting
│   └── ...                   #   20+ more skills
├── memory/                   # Persistent notes across sessions
└── git/                      # Vendored git-tracked packages
```