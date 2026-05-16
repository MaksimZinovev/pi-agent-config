# @vtstech/pi-soul

**SoulSpec extension for the Pi Coding Agent** — load and manage AI agent personas (souls) with progressive disclosure and smart name matching.

## Install

```bash
pi install "npm:@vtstech/pi-soul"
```

## Usage

### Commands

```
/souls                   List available souls
/soul nova-helper        Load soul by exact name
/soul dev                Load by partial match (any soul containing "dev")
/soul /dev/ig            Load by regex (case-insensitive)
/soul --help             Show help with matching examples
```

### Tools (callable by the agent)

| Tool          | What it does                                    |
| ------------- | ----------------------------------------------- |
| `load_soul`   | Load a SoulSpec persona, build system prompt     |
| `list_souls`  | List all available SoulSpec personas              |
| `soul_info`   | Get detailed info about a soul                   |

`load_soul` accepts `soul_name` and an optional `level` (1–3, default 2).

## What It Does

Souls are persona definitions that shape the agent's behavior, identity, and style. Each soul lives in a directory under `~/.pi/agent/souls/` (global) or `.pi/souls/` (project-local) and contains:

```
souls/nova-helper/
├── soul.json     # Manifest (name, version, tags, disclosure levels)
├── SOUL.md       # Core persona (required)
├── IDENTITY.md   # Identity details (optional)
├── STYLE.md      # Style guidelines (optional)
├── AGENTS.md     # Agent behavior rules (optional)
└── HEARTBEAT.md  # Operational rhythm (optional)
```

### Progressive Disclosure

- **Level 1** — Basic info (`soul.json` only)
- **Level 2** — Core persona (`sOUL.md` + `IDENTITY.md`)
- **Level 3** — Full behavior (all files)

## Source

- npm: [`@vtstech/pi-soul`](https://www.npmjs.com/package/@vtstech/pi-soul)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT