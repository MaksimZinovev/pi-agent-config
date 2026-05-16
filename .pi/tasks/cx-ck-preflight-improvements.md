# cx-ck-preflight — Potential Improvements

## 1. ✅ DONE — Debounce steer messages — avoid stale/overlapping steers

Track a `lastSteeredStep` — only send a block steer once per step. If the model gets blocked multiple times on the same step, only the first block sends a steer. Subsequent blocks just return `{ block: true, reason }` (the system prompt already reinforces the instruction).

```ts
let lastSteeredStep = 0;

// Inside the block handler:
if (lastSteeredStep !== step) {
  lastSteeredStep = step;
  pi.sendMessage({ ... }, { deliverAs: "steer", triggerTurn: true });
}
return { block: true, reason };

// Reset on step transition:
function advanceStep(...) {
  lastSteeredStep = 0; // allow steer on new step if blocked again
  ...
}
```

This reduces token waste and prevents confusing stale messages.

---

## 2. ✅ DONE — Validate step transitions via tool_result — don't advance on failure

Steps 1-3 transitions moved from `tool_call` to `tool_result`. This enables:
- C2: Parsed tool output enriches steer messages
- B1: Step 4 only advances if `ck` returns results (not "No matches found")
- General robustness: commands must actually succeed before steps advance

```ts
pi.on("tool_result", (event, ctx) => {
  if (event.toolName !== "bash") return;
  const cmd = (event.input as { command?: string })?.command ?? "";
  const resultText = extractResultText(event.result);

  // Step 4→5: only advance if ck returned results
  if (step === 4 && CK_SEARCH_RE.test(cmd)) {
    if (NO_MATCHES_RE.test(resultText)) {
      // Stay on step 4, guide with better query tips
      pi.sendMessage({ content: guidance, ... }, { deliverAs: "steer", triggerTurn: true });
      return;
    }
    advanceStep(pi, ctx, 5, successMessage);
  }
});
```

---

## 3. Post-preflight gentle nudges — reinforce cx/ck after graduation

After step 5, the extension goes silent. But the model may still fall back to `grep`/`find` habits. The companion `cx-first-reminder.ts` handles this, but there's a gap: it only nudges on `grep`/`find` tool calls, not on bash grep/find.

**Fix:** After step 4 completes, register a persistent `tool_result` handler that appends a subtle reminder on any grep/find usage (bash or tool), similar to what `cx-first-reminder.ts` does:

```ts
// After step 5, add lightweight nudges
if (step >= 5) {
  pi.on("tool_result", (event) => {
    // Append gentle reminders on grep/find results
    // "💡 Consider cx/ck for better search"
  });
}
```

This creates a soft landing from the hard gate to the reminder phase, bridging the gap until `cx-first-reminder` kicks in.