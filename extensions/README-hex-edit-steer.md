# hex-edit-steer

Blocks Pi's `edit` tool after first failure, steering the agent to `hex_edit` (from `@vtstech/pi-hex-edit`) for reliable byte-level edits.

## Quick Start

```bash
pi install npm:@vtstech/pi-hex-edit          # install hex_edit tools
ln -s $(pwd)/hex-edit-steer.ts ~/.pi/agent/extensions/hex-edit-steer.ts
# Add to settings.json extensions array, then restart Pi
```

## Structure

```
hex-edit-steer.ts   # Extension source (single file)
```

## How It Works

- `tool_result` — detects first `edit` failure → flips `editBlocked=true`, steers agent to `hex_edit`
- `tool_call` — blocks all subsequent `edit` calls, steers to `hex_edit_validate` → `hex_edit`
- `before_agent_start` — injects system prompt enforcing `hex_edit` only
- `session_start` — restores block state across compactions

## Commands

| Command | Action |
|---|---|
| `/hexsteer status` | Show current block state |
| `/hexsteer block` | Manually block `edit` |
| `/hexsteer unblock` | Re-enable `edit` |