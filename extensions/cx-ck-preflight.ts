// cx-ck-preflight — 4-step onboarding gate enforcing the AGENTS.md escalation hierarchy.
//
// Step 1: `cx overview .` — learn orientation. Use when: new codebase, re-orienting, before reading files.
// Step 2: `cx symbols/references/definition` — learn targeted search. Use when: symbols, definitions, usages.
// Step 3: `ck --index .` — index for semantic search. Prerequisite for step 4.
// Step 4: `ck "PATTERN" PATH` — learn semantic search. Use when: text patterns cx can't find.
// After step 4: extension does nothing. cx-first-reminder still nudges on grep/find results.
//
// Blocking rules:
//   grep/find: blocked in all steps 1-4
//   ck: blocked in steps 1-2 (must learn cx search first)
//   cx: always allowed
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// step: 1=cx overview, 2=cx search, 3=ck index, 4=ck search, 5=done
let step = 1;

const BASH_GREP_FIND_RE = /(^|\s|\||;|&&)(grep|rg|ack|ag|find|fd|ls|read)\s/;
const BASH_CX_CK_RE = /\b(cx|ck)\s/;

const BLOCK_MSGS: Record<number, string> = {
  1:
    "🔴 [1/4] [1/4] Blocked — DO NOT IGNORE THIS! User wants you to complete this session start onboarding before proceeding to your task" +
    "\nRun `cx overview .` do not read files to manually search",
  2:
    "🔴 [2/4] Blocked - you did not run cx." +
    '\nRun `cx symbols --name "PATTERN"` or `cx references --name NAME`. Next: `ck --index .` then `ck "PATTERN" PATH`',
  3:
    "🔴 [3/4] Blocked - you did not run ck." +
    '\nRun `ck --index .`. Next: `ck "PATTERN" PATH`',
  4:
    "🔴 [4/4]  Blocked - you did not run ck. " +
    '\nRun `ck "PATTERN" PATH`. After this, grep/find unblocked. Keep using learned tools usage as per AGENTS.md.',
};

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", (event) => {
    if (event.toolName === "bash") {
      const cmd = (event.input as { command?: string })?.command ?? "";
      if (step === 1 && /\bcx\s/.test(cmd) && /\boverview\b/i.test(cmd)) {
        step = 2;
      } else if (
        step === 2 &&
        /\bcx\s/.test(cmd) &&
        /\b(symbols|references|definition)\b/i.test(cmd)
      ) {
        step = 3;
      } else if (step === 3 && /\bck\s/.test(cmd) && /--index\b/.test(cmd)) {
        step = 4;
      } else if (
        step === 4 &&
        /\bck\s/.test(cmd) &&
        !/^(?:.*--index|--status|--clean|--help|--version)\b/.test(cmd)
      ) {
        step = 5;
      }
    }

    if (step >= 5) return;

    const reason = BLOCK_MSGS[step];

    // Block grep/find tool calls in all steps
    if (event.toolName === "grep" || event.toolName === "find") {
      return { block: true, reason };
    }

    if (event.toolName === "bash") {
      const cmd = (event.input as { command?: string })?.command ?? "";

      // Block bash grep/find in all steps (cx always allowed)
      if (BASH_GREP_FIND_RE.test(cmd) && !BASH_CX_CK_RE.test(cmd)) {
        return { block: true, reason };
      }

      // Block ck until step 2 is done (must learn cx search first)
      if (step <= 2 && /\bck\s/.test(cmd)) {
        return { block: true, reason };
      }
    }
  });
}
