# @vtstech/pi-security

**Security extension for the Pi Coding Agent** — command, path, and network protection with configurable security modes.

## Install

```bash
pi install "npm:@vtstech/pi-security"
```

## Usage

```
/security mode basic    # Relaxed — critical commands blocked, localhost allowed
/security mode max      # Full lockdown — all 66 commands blocked, strict SSRF
/security mode off      # Disable all security checks
```

Default mode is **max**. Current mode shows in the status bar as `SEC:BASIC` or `SEC:MAX`.

## What It Protects

| Layer           | Details                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| **Commands**    | 41 CRITICAL always-blocked (sudo, chmod, rm, dd…) + 25 EXTENDED in max |
| **SSRF**        | 22 always-blocked URL patterns + 7 max-only (localhost, link-local…)  |
| **Paths**       | Blocks traversal, symlink escapes, system dirs (`/etc`, `/var`…)      |
| **Shell injection** | Regex detection for chaining (`;`), substitution (`$()`), redirects |

## Key Features

- Mode-aware: `basic` allows localhost URLs, `max` blocks them
- Symlink dereferencing via `fs.realpathSync()` to prevent `/tmp/evil → /etc/passwd`
- DNS rebinding protection (opt-in hostname resolution check)
- Audit log at `~/.pi/agent/audit.log` (JSON-lines, mode per entry)
- Config persisted to `~/.pi/agent/security.json`

## Source

- npm: [`@vtstech/pi-security`](https://www.npmjs.com/package/@vtstech/pi-security)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT