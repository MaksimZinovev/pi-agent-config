# @vtstech/pi-diag

**Diagnostics extension for the Pi Coding Agent** — one command, full environment health check.

## Install

```bash
pi install "npm:@vtstech/pi-diag"
```

## Usage

```
/diag
```

Or ask the agent: *"run diagnostics"* / *"check my setup"* — it calls the registered `self_diagnostic` tool.

## What It Checks

| Section        | Details                                                    |
| -------------- | ---------------------------------------------------------- |
| **System**     | OS, CPU, RAM usage, uptime, Node.js version                |
| **Disk**       | Mount points, free space via `df -h`                       |
| **Ollama**     | Running? Version? Response latency? Pulled models? VRAM?   |
| **models.json**| Valid JSON? Providers? Models? Cross-ref with Ollama        |
| **Settings**   | `settings.json` exists and valid?                          |
| **Extensions** | Local extension files, active tools count                  |
| **Themes**     | Theme directory, valid JSON                                |
| **Session**    | Active model, provider, context window%, thinking level     |
| **Security**   | Mode, blocklists, SSRF/command/path validation tests, audit|

## Source

- npm: [`@vtstech/pi-diag`](https://www.npmjs.com/package/@vtstech/pi-diag)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT