// cx-ck-preflight
//
// Pre-flight gate: blocks grep/find until the agent runs `cx overview .` and `ck --index .`.
// Forces the habit of reaching for project tools before falling back to universal ones.
//
// Flow:
//   1. Session starts — preflightPassed=false, grep/find are BLOCKED.
//   2. Agent attempts grep/find → blocked with reason telling it to run cx/ck first.
//   3. Agent runs `cx overview .` and `ck --index .` via bash (it does this itself, not the extension).
//   4. Extension detects both commands → preflightPassed=true.
//   5. From this point on, the extension does NOTHING — grep/find are fully unblocked.
//      The cx-first-reminder extension still appends nudges on grep/find results, but
//      this extension no longer blocks anything.
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

let preflightPassed = false;
let cxSeen = false;
let ckSeen = false;

const BASH_GREP_FIND_RE = /(^|\s|\||;|&&)(grep|rg|ack|ag|find|fd)\s/;
const BASH_CX_CK_RE = /\b(cx|ck)\s/;
const BLOCK_REASON =
	'🚫 [PRE-FLIGHT] grep/find blocked — run `cx overview .` and `ck --index .` first. If either fails, STOP and tell the user. After preflight: `cx symbols --name "PATTERN"`, `cx references --name NAME`, `ck "PATTERN" PATH` (add --json for structured output). Run `cx skill` for full usage. Follow AGENTS.md.';

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", (event) => {
		// Detect when the agent runs cx overview . and ck --index .
		if (!preflightPassed && event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";
			if (/\bcx\s/.test(cmd) && /\boverview\b/.test(cmd)) cxSeen = true;
			if (/\bck\s/.test(cmd) && /--index\b/.test(cmd)) ckSeen = true;
			if (cxSeen && ckSeen) preflightPassed = true;
		}

		if (preflightPassed) return;

		// Block direct grep/find tool calls
		if (event.toolName === "grep" || event.toolName === "find") {
			return { block: true, reason: BLOCK_REASON };
		}

		// Block bash commands using grep/find (but not cx/ck)
		if (event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";
			if (BASH_GREP_FIND_RE.test(cmd) && !BASH_CX_CK_RE.test(cmd)) {
				return { block: true, reason: BLOCK_REASON };
			}
		}
	});
}
