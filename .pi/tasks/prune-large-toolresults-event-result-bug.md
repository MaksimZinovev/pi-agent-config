# prune-large-toolresults — Bug: event.result doesn't exist

## Bug
`prune-large-toolresults.ts` reads `event.result` on line 4, but the `tool_result` event has `event.content` (type `(TextContent | ImageImage)[]`), NOT `event.result`.

## Root Cause
Same bug as cx-ck-preflight. Handler parameter was untyped (`any`), so TypeScript couldn't flag `event.result` as an error. `event.result` is always `undefined`, so `event.result || event` falls back to `event` itself.

## Affected Lines
- Line 4: `const result = event.result || event;` — `event.result` is `undefined`, falls back to whole `event` object
- Lines 5-7: `result.content` — works by accident because `result` becomes `event` which has `.content`

## Fix
- Line 4: `event.result || event` → use `event.content` directly, then update lines 5-7 to work with the array
- Lines 5-7: `result.content` is already `(TextContent | ImageContent)[]`; need to find the text block and truncate it
- Add proper type import and type the handler parameter

## Status
Not yet fixed. Discovered by `tsc --noEmit` after adding tsconfig.json to pi-agent-config.