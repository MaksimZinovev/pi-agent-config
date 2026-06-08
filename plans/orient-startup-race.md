---
id: orient-startup-race
type: plan
status: done
owner: maksim
depends_on: []
last_validated: 2025-07-11
---

# Fix orient startup race condition

```spec
scope: document
type: plan
required_sections: [Context, Tools & Skills, Approach, Out of Scope, Steps, Files to Modify, Reuse, Evidence Pack, Verification, Bottom Line]
max_chars: 20000
banned_words: [TODO, TBD, placeholder]
placeholders: ["```df-todo", "[REPLACE]"]
match:
  has_checklist: '^- \[( |x)\]'
  has_source: 'Source:'
  has_file_marker: '(CREATED|UPDATED|DELETED)'
  has_test: '# Test \d'
  has_out_of_scope: '^## Out of Scope'
  has_tools_and_skills: '^## Tools & Skills'
  has_ynp_format: '^- .+: (Yes|No|Possibly)\b'
```

## Context

```spec
type: plan
max_chars: 20000
banned_words: [might be, could be, seems like, I think, possibly, perhaps]
match:
  has_problem: '(problem|issue|bug|break|fail|cannot|does.not|unable)'
```

The orient extension's `triggerTurn: true` steer at `session_start` causes an `[aborted]` agent turn because other extensions inject custom messages (pi-session-search-primer, extmgr-auto-update, plannotator) immediately after session_start. The agent starts processing orient's steer, then receives these messages, which abort the in-flight turn. This problem cannot be fixed with a hardcoded `setTimeout` delay because the timing of other extensions' initialization is non-deterministic. An event-driven solution is needed that detects when the session is settled before sending the steer.

## Tools & Skills

```spec
type: plan
max_chars: 20000
banned_words: [N/A, n/a]
match:
  min_3_ynp: '^- .+: (Yes|No|Possibly)\b'
```

- grounded-planning (Skills): Yes — used to structure this plan with evidence
- docfence (Skills): Yes — plan validation
- cx/ck (Skills): No — code search not needed for this fix (small scope, known files)
- jq (CLI): Yes — parsing session JSONL logs for timestamps and abort events

## Approach

```spec
type: plan
max_chars: 800
banned_words: [Q1:, Q2:, Q3:, **Q, Question:]
match:
  has_alternative: '(alternative|instead of|rather than|compared to|over:|vs[.])'
```

Use `resources_discover` event instead of `session_start` to send the orient steer. `resources_discover` fires after all `session_start` handlers have completed and after Pi has loaded skills, context, and resources. This guarantees other extensions' session_start injections (pi-session-search-primer, plannotator, extmgr-auto-update) have already been written to the session, eliminating the race condition. An alternative — using `setTimeout` delay — is fragile and timing-dependent compared to the event-driven approach.

## Out of Scope

```spec
type: plan
max_chars: 20000
banned_words: [Nothing., None., N/A, n/a, Not applicable]
match:
  has_justification: '^- .+:'
  min_2_exclusions: '^- .+:'
```

- Changing other extensions' startup behavior: pi-session-search-primer and plannotator are external; we cannot control their timing. Instead we avoid the race.
- Removing proactive orientation: User explicitly wants the agent to orient without user typing.
- Changing the orient gate logic: Steps, blocking, skill injection all stay the same. Only the startup timing changes.
- Adding /orient skip command: Not in scope for this fix (separate future work).

## Steps

```spec
type: plan
max_chars: 20000
banned_words: [**Step, **Task, **Phase]
match:
  has_step_evidence: '^- \[ \].*\(Source'
  min_3_steps: '^- \[( |x)\]'
```

- [ ] Move orient steer from `session_start` to `resources_discover` (Source: Pi extensions.md lines 273-275 and 339-346)
  - Confidence: 0.85
  - Details: In orient.ts, add `pi.on("resources_discover", ...)` handler. Move the `sendMessage({triggerTurn: true, deliverAs: "steer"})` call from session_start to this handler. Keep `restoreStep()` and `updateStatus()` in session_start (they need to run early for the status line). The resources_discover handler should check `step <= TOTAL_STEPS` before sending the steer. `pi.on("resources_discover", async (event, ctx) => { if (step <= TOTAL_STEPS) { const stepCfg = currentStep(); ... pi.sendMessage(msg, {triggerTurn: true, deliverAs: "steer"}); } })`. Also remove the duplicate steer from `before_agent_start` (already removed in prior fix).

- [ ] Remove steer from session_start handler entirely (Source: Session 019ea65d JSONL timestamps)
  - Confidence: 0.90
  - Details: The session_start handler should only call `restoreStep(ctx)`, `updateStatus(ctx)`, and `ctx.ui.notify(...)`. No `sendMessage` or `sendUserMessage`. Remove the entire `if (step <= TOTAL_STEPS) { ... pi.sendMessage(...) }` block from session_start handler.

- [ ] Add resources_discover handler with steer (Source: Pi extensions.md line 339-346)
  - Confidence: 0.90
  - Details: The handler should be async (matching Pi's async handler signature). Send the same orient-start steer message with `triggerTurn: true` and `deliverAs: "steer"`. Add `console.error("[orient] resources_discover: sending steer")` for debugging. `pi.on("resources_discover", async (event, ctx) => { ... })`. The `event` has `cwd` and `reason` fields.

- [ ] Test in pi-agent-config project: verify no [aborted] turns (Source: Claim 1 — orient steer aborted by primer injection)
  - Confidence: 0.85
  - Details: Start a new session. Verify: (1) status line shows ⚠️ Orient [1/2] immediately, (2) the orient steer triggers agent processing after other extensions have settled, (3) no [aborted] turns in session log. Check session JSONL for `[aborted]` turns. Check that orient-start custom message timestamp is AFTER pi-session-search-primer timestamp.

- [ ] Test in automatify-jira-testops project: verify no regression (Source: Claim 5 — bug is project-specific)
  - Confidence: 0.95
  - Details: Verify orient still works in the project where it previously succeeded. Run full orient flow: cx overview → ck --status → skill tour → acknowledge.

## Files to Modify

- `extensions/orient.ts` — UPDATED: move `sendMessage(triggerTurn)` from `session_start` handler to new `resources_discover` handler. Add `resources_discover` event listener.
- `extensions/orient-config.json` — REFERENCED: no changes needed (config structure unchanged)

## Reuse

```spec
type: plan
max_chars: 20000
banned_words: [None., N/A, Nothing to reuse, No reuse]
match:
  has_reuse_item: '^- .+:'
```

- Existing session_start handler logic: `restoreStep()`, `updateStatus()`, and `ctx.ui.notify()` stay in session_start — only the steer sending moves to resources_discover.
- Pi's resources_discover event: Already defined in the ExtensionAPI type system, no new API discovery needed. cx-cache-warm uses `pi.on("session_start", ...)` and `resources_discover` is documented as the next event in the startup lifecycle.

## Evidence Pack

- Claim: orient's `triggerTurn` steer at session_start is aborted because pi-session-search-primer, extmgr-auto-update, and plannotator inject custom messages within ~1.3 seconds of session_start, causing the agent to abort the in-flight turn.
  Source: Session 019ea65d JSONL — orient-start at 08:33:02.667, assistant [aborted] at 08:33:03.818, pi-session-search-primer at 08:33:04.008
  Confidence: 0.95
  Implication: Moving the steer to after all session_start injections eliminates the race condition.

- Claim: Pi's lifecycle is: `session_start` → `resources_discover` → user prompt/extension trigger. All session_start handlers complete before resources_discover fires.
  Source: Pi extensions.md lines 273-275 and 339-346; agent-session.js line 643-649 (session_start event emitted, then extendResourcesFromExtensions called)
  Confidence: 0.90
  Implication: `resources_discover` is the correct event to send a steer that must not conflict with other session_start injections.

- Claim: `sendCustomMessage` with `triggerTurn: true` when agent is idle calls `_runAgentPrompt(message)`, starting a new agent turn. If another message injection happens during that turn, the turn can be aborted.
  Source: agent-session.js lines 971-999 (sendCustomMessage implementation)
  Confidence: 0.85
  Implication: Sending the triggerTurn at session_start (before other injections settle) causes the abort. Sending it at resources_discover (after injections settle) avoids this.

- Claim: Only orient and hex-edit-steer (when blocked) use `triggerTurn: true` at session_start. pi-session-search-primer uses plain `sendMessage()` without triggerTurn.
  Source: Grep of all local and installed extensions for `triggerTurn` usage
  Confidence: 0.95
  Implication: orient is the only extension that can cause this race condition on a fresh session (hex-edit-steer only fires when edit is blocked).

- Claim: The bug is project-specific because different projects have different extension sets and different AGENTS.md content sizes, which affect how long session_start processing takes.
  Source: User report — "This does not occur in /Users/maksim/repos/automatify-jira-testops project"
  Confidence: 0.80
  Implication: The race is timing-dependent; projects with fewer/heavier session_start extensions are more likely to hit it.

### Gaps

- Cannot verify that `resources_discover` fires after ALL extension session_start handlers complete in every case. Pi docs state it fires after session_start, but async handler completion order is not guaranteed by the docs.
- Cannot verify that no future Pi version changes the lifecycle ordering of `resources_discover` relative to agent turn processing.

## Verification

```bash
# Test 1: Verify orient.ts compiles cleanly
cd /Users/maksim/repos/pi-agent-config && npx tsc --noEmit 2>&1 | grep orient
# Expected: no output (0 errors)

# Test 2: Verify resources_discover handler is registered
grep -n "resources_discover" extensions/orient.ts
# Expected: at least 1 match showing the new handler

# Test 3: Verify session_start no longer sends steer
grep -n "sendMessage\|sendUserMessage\|triggerTurn" extensions/orient.ts
# Expected: no sendMessage/sendUserMessage/triggerTurn in session_start handler; only in resources_discover and advanceStep/sendBlockSteer

# Test 4: Start new session in pi-agent-config project, check JSONL for no [aborted] turns
# Expected: orient-start message timestamp is AFTER pi-session-search-primer timestamp. No assistant turns with stopReason "aborted".

# Test 5: Start new session in automatify-jira-testops project, verify full orient flow works
# Expected: ⚠️ Orient [1/2] appears, agent runs cx overview, ⚠️ Orient [2/2] appears, agent runs ck --status, skill tour completes, no [aborted] turns
```

## Bottom Line

- Per-step confidence: 0.89 (0.85, 0.90, 0.90, 0.85, 0.95; lowest: 0.85 — move and remove steps)
- Key risk: `resources_discover` may fire before all async session_start handlers have completed their custom message injections. If Pi does not await async handlers before emitting resources_discover, the race could persist. Mitigation: test with verbose logging to confirm message ordering in the session JSONL.
- Gaps: Cannot verify Pi's internal async handler completion guarantee for resources_discover timing. Cannot predict future Pi lifecycle changes.
- Recommendation: proceed — `resources_discover` is documented as firing after `session_start` in the Pi extension lifecycle. It is the idiomatic event for "session is fully initialized." The risk of timing issues is low compared to the current guaranteed race condition at `session_start`.