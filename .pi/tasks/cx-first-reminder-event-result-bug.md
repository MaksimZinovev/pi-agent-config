# cx-first-reminder — Bug: event.result doesn't exist

## Bug
`cx-first-reminder.ts` reads `event.result` on lines 28 and 36, but the `tool_result` event has `event.content` (type `(TextContent | ImageContent)[]`), NOT `event.result`.

## Root Cause
Same bug as cx-ck-preflight. Handler parameter was untyped (`any`), so TypeScript couldn't flag `event.result` as an error. `event.result` is always `undefined`.

## Fix
- Line 28: `appendReminder(event.result || event)` → `appendReminder(event.content || event)` (and adjust `appendReminder` to handle array input)
- Line 36: same change
- Add proper type imports: `import type { ToolResultEvent } from "@mariozechner/pi-coding-agent"` and type the handler parameter
- `appendReminder` function may need updating since `event.content` is `(TextContent | ImageContent)[]`, not a string

## Status
Not yet fixed. Discovered by `tsc --noEmit` after adding tsconfig.json to pi-agent-config.