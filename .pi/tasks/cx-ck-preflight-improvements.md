# cx-ck-preflight — Improvements Progress

## Current Status: Fixes implemented, pending test

### Completed
- [x] **Blocker 1 fixed**: `event.result` → `event.content` (lines 383, 400)
- [x] **Blocker 2 fixed**: Step 1/2 regexes now use `.*\b` pattern (`/\bcx\b.*\boverview\b/i`, `/\bcx\b.*\b(symbols|references|definition)\b/i`)
- [x] **`extractResultText()` updated**: `result: unknown`, `Array.isArray(result)` check at top for `event.content` arrays
- [x] **Type imports added**: `ExtensionAPI, ExtensionCommandContext, ExtensionContext`
- [x] **tsconfig.json added**: `/Users/maksim/repos/pi-agent-config/tsconfig.json` with `strict: true`, `noEmit`, SDK type resolution
- [x] **`tsc --noEmit` passes**: Zero errors on `cx-ck-preflight-wip.ts`

### Pending
- [ ] **Re-enable extension**: Rename `cx-ck-preflight-wip.ts` → `cx-ck-preflight.ts`
- [ ] **Test run 7**: Verify step 1→2 transition with C2 extraction (`overviewInfo` populated, no `[debug:]` tag)
- [ ] **Test run 7**: Verify step 2→3 transition with symbol extraction (`extractedNames` populated)
- [ ] **Test run 7**: Verify full 4-step flow completion
- [ ] **Remove `[debug: ...]` tags** from step messages after C2 confirmed working
- [ ] **Remove diagnostic `console.error` logs** after all issues confirmed fixed
- [ ] **Commit and update task file**

## Mandatory Checklist for Agent (MUST complete before every commit and show user the populated checklist in chat)

- [ ] 1. `tsc --noEmit` — Run from extension directory. Must pass with zero errors. No exceptions.
- [ ] 2. `lsp_diagnostics` severity `"error"` only — Run on the edited file. Read every error. Do not skip any.
- [ ] 3. Never dismiss LSP findings without reading — Each error must be read and resolved or explicitly documented why it's a false positive. Can add ignore comments only when approved by user.
- [ ] 4. Read SDK type definitions BEFORE writing handler code — Check `@mariozechner/pi-coding-agent` `types.d.ts` for actual event shapes before writing. Never assume field names.
- [ ] 5. No `any` types on event parameters unless approved by user and type handler parameters. `any` hides real bugs.

## Related Bugs (separate task files)
- `cx-first-reminder-event-result-bug.md` — Same `event.result` bug in `cx-first-reminder.ts`
- `prune-large-toolresults-event-result-bug.md` — Same `event.result` bug in `prune-large-toolresults.ts`

## Commits (latest first)
- (pending) Fix event.content, extractResultText array handling, type imports, tsconfig
- `01390d2` Diagnostic logging, JSON fallback, conciseness steers, try-catch all handlers
- `459d242` C2: context-aware steers from parsed tool output
- `eaa1298` B1: validate step 4 ck results before advancing
- `71af4a0` V2 rewrite: steer messages, system prompt injection, state persistence

## Test Run 6 Findings
1. Regex fix confirmed working — step 1→2 transition fired with `.*\b` pattern
2. C2 extraction broken — `event.result` is `undefined`, should be `event.content` (**fixed**)
3. Step 2 retry false-positive — caused by empty `resultText` from bug above (**fixed**)
4. `event.content` is `(TextContent | ImageContent)[]` — directly an array, not `{content: [...]}`
5. TypeScript would have caught this — `ToolResultEvent` has no `result` field

## Key Learnings
1. Pi adds `--root <path>` prefix to cx/ck commands — `.*` regex fix handles this
2. `toolName="bash"` for cx/ck — confirmed from diagnostic logs
3. Try-catch on ALL handlers prevents silent failures
4. `deliverAs: "steer"` + `triggerTurn: true` most effective redirect
5. Step guards make `.*` regex safe: false positive only advances 1 step early (benign)
6. Diagnostic logs visible in Pi transcript — no stderr access needed
7. `[debug: ...]` tags make C2 failures visible in chat
8. **Never skip type checking** — `any`-typed parameters hide real bugs. Import SDK types and run `tsc --noEmit`.
9. **Read SDK types before assuming field names** — `event.result` vs `event.content` cost 2 test runs and 1 hour.
10. **`tsc --noEmit` is mandatory** — would have caught `event.result` instantly on a typed handler. Now enforced by `tsconfig.json`.

## Decisions
- `.*` between cx/ck and subcommand: safe because step guards prevent cross-step conflicts
- Native cx/ck tool handling kept: harmless, may be needed if Pi changes tool routing
- `setActiveTools()` rejected — risk of breaking cx/ck internals
- Post-preflight nudges use `deliverAs: "followUp"` — graduated, less intrusive
- All handler parameters must be typed — no `any`, always import from SDK
- `tsconfig.json` with `strict: true` at project root — zero tolerance for type errors