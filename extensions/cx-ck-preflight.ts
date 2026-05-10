// cx-ck-preflight — 3-phase onboarding gate enforcing the AGENTS.md escalation hierarchy.
//
// Phase 1: `cx overview .` — learn orientation. Use when: new codebase, re-orienting, before reading files.
// Phase 2: `cx symbols/references/definition` — learn targeted search. Use when: looking for a symbol, definition, or usage.
// Phase 3: `ck --index .` — learn semantic search. Use when: text search cx can't find, concepts, phrases.
// After phase 3: extension does nothing. cx-first-reminder still nudges on grep/find results.
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// phase: 1=cx overview needed, 2=cx search needed, 3=ck index needed, 4=done
let phase = 1;

const BASH_GREP_FIND_RE = /(^|\s|\||;|&&)(grep|rg|ack|ag|find|fd)\s/;
const BASH_CX_CK_RE = /\b(cx|ck)\s/;

const PHASES: Record<number, string> = {
	1: "🚫 [1/3] Run `cx overview .` first. (Orient: new codebase, before reading files.)",
	2: '🚫 [2/3] cx ✓. Now run `cx symbols --name "PATTERN"` or `cx references --name NAME`. (Search: symbols, definitions, usages.)',
	3: "🚫 [3/3] cx ✓. Run `ck --index .`. (Semantic search: text patterns cx can't find.) After this grep/find unblocked. AGENTS.md.",
};

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", (event) => {
		// Detect phase completion
		if (event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";
			if (phase === 1 && /\bcx\s/.test(cmd) && /\boverview\b/i.test(cmd)) {
				phase = 2;
			} else if (
				phase === 2 &&
				/\bcx\s/.test(cmd) &&
				/\b(symbols|references|definition)\b/i.test(cmd)
			) {
				phase = 3;
			} else if (phase === 3 && /\bck\s/.test(cmd) && /--index\b/.test(cmd)) {
				phase = 4;
			}
		}

		// All phases complete — fully unblocked
		if (phase >= 4) return;

		const reason = PHASES[phase];

		// Block direct grep/find tool calls
		if (event.toolName === "grep" || event.toolName === "find") {
			return { block: true, reason };
		}

		// Block bash commands using grep/find (but not cx/ck)
		if (event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";
			if (BASH_GREP_FIND_RE.test(cmd) && !BASH_CX_CK_RE.test(cmd)) {
				return { block: true, reason };
			}
		}
	});
}
