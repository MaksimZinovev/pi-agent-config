// cx-ck-preflight — 4-step onboarding gate enforcing the AGENTS.md escalation hierarchy.
//
// Step 1: `cx overview .` — learn orientation. Use when: new codebase, re-orienting, before reading files.
// Step 2: `cx symbols/references/definition` — learn targeted search. Use when: symbols, definitions, usages.
// Step 3: `ck --index .` or `ck --status` — index for semantic search (or check existing index). Prerequisite for step 4.
// Step 4: `ck "PATTERN" PATH` — learn semantic search. Use when: text patterns cx can't find.
// After step 4: extension does nothing. cx-first-reminder still nudges on grep/find results.
//
// Key improvement: uses steer messages + system prompt injection (not just block) to make
// instructions unignorable by the model. See steer-model reference for rationale.
//
// Debounce: one block-steer per step, avoids stale/overlapping messages.

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

let step = 1;
let lastSteeredStep = 0;

const BASH_GREP_FIND_RE = /(^|\s|\||;|&&)(grep|rg|ack|ag|find|fd)\s/;
const BASH_CX_CK_RE = /\b(cx|ck)\s/;

const STEP_LABELS: Record<number, string> = {
	1: "Run `cx overview .` to learn codebase orientation",
	2: "Run `cx symbols --name PATTERN` or `cx references --name NAME`",
	3: "Run `ck --index .` (or `ck --status` to check) to index for semantic search",
	4: 'Run `ck "PATTERN" PATH` for semantic search',
};

const STEP_SYSTEM_PROMPTS: Record<number, string> = {
	1: "[PREFLIGHT GATE] You must run `cx overview .` before using any search tools. grep, find, rg, ack, ag, fd, and ck are BLOCKED until you complete this step. Do NOT attempt to use them.",
	2: "[PREFLIGHT GATE] Run `cx symbols --name PATTERN` or `cx references --name NAME` next. grep, find, rg, ack, ag, fd, and ck are still BLOCKED.",
	3: "[PREFLIGHT GATE] Run `ck --index .` (or `ck --status` if previously indexed) next. grep, find, rg, ack, ag, fd are still BLOCKED.",
	4: '[PREFLIGHT GATE] Run `ck "PATTERN" PATH` next. grep, find, rg, ack, ag, fd are still BLOCKED.',
};

const BLOCK_MSGS: Record<number, string> = {
	1: "⚠️ [Preflight 1/4] Use `cx overview .` first to learn codebase orientation. Search tools are blocked until this step is completed.",
	2: '⚠️ [Preflight 2/4] Use `cx symbols --name PATTERN` or `cx references --name NAME` next. Then `ck --index .` followed by `ck "PATTERN" PATH`.',
	3: '⚠️ [Preflight 3/4] Run `ck --index .` (or `ck --status` to check) to index for semantic search. Then proceed to `ck "PATTERN" PATH`.',
	4: '⚠️ [Preflight 4/4] Run `ck "PATTERN" PATH` for semantic search. After this, grep/find will be unblocked.',
};

const ENTRY_TYPE = "cx-ck-preflight";

function persistStep(pi: ExtensionAPI) {
	pi.appendEntry(ENTRY_TYPE, { step });
}

function restoreStep(ctx: any): void {
	const entries = ctx.sessionManager.getEntries();
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.type === "custom" && entry.customType === ENTRY_TYPE) {
			const saved = (entry.data as any)?.step;
			if (typeof saved === "number" && saved >= 1 && saved <= 5) {
				step = saved;
				return;
			}
		}
	}
}

function updateStatus(ctx: any) {
	if (step >= 5) {
		ctx.ui.setStatus("cx-ck-preflight", "✅ Preflight complete");
		setTimeout(() => ctx.ui.setStatus("cx-ck-preflight", ""), 5000);
	} else {
		ctx.ui.setStatus("cx-ck-preflight", `⚠️ Preflight [${step}/4]`);
	}
}

function advanceStep(
	pi: ExtensionAPI,
	ctx: any,
	newStep: number,
	message: string,
) {
	step = newStep;
	lastSteeredStep = 0;
	persistStep(pi);
	updateStatus(ctx);
	pi.sendMessage(
		{
			customType: "cx-ck-preflight-step",
			content: message,
			display: true,
		},
		{
			triggerTurn: true,
			deliverAs: "steer",
		},
	);
}

function sendBlockSteer(pi: ExtensionAPI, message: string) {
	if (lastSteeredStep === step) return;
	lastSteeredStep = step;
	pi.sendMessage(
		{
			customType: "cx-ck-preflight-block",
			content: message,
			display: true,
		},
		{
			triggerTurn: true,
			deliverAs: "steer",
		},
	);
}

// =============================================================================

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		restoreStep(ctx);
		updateStatus(ctx);

		if (step < 5) {
			pi.sendMessage(
				{
					customType: "cx-ck-preflight-start",
					content: `📋 [Preflight ${step}/4] ${STEP_LABELS[step]}. Complete this onboarding step before proceeding with your task.`,
					display: true,
				},
				{
					triggerTurn: true,
					deliverAs: "steer",
				},
			);
		}
	});

	pi.on("before_agent_start", (event, _ctx) => {
		if (step >= 5) return;
		return {
			systemPrompt: event.systemPrompt + "\n\n" + STEP_SYSTEM_PROMPTS[step],
		};
	});

	pi.on("tool_call", (event, ctx) => {
		if (event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";

			// Step transitions
			if (step === 1 && /\bcx\s+overview\b/i.test(cmd)) {
				advanceStep(
					pi,
					ctx,
					2,
					"✅ [Preflight 1/4] Complete. Next: run `cx symbols --name PATTERN` or `cx references --name NAME`.",
				);
				return;
			}
			if (step === 2 && /\bcx\s+(symbols|references|definition)\b/i.test(cmd)) {
				advanceStep(
					pi,
					ctx,
					3,
					"✅ [Preflight 2/4] Complete. Next: run `ck --index .`.",
				);
				return;
			}
			if (step === 3 && /\bck\s+.*--(?:index|status)\b/.test(cmd)) {
				advanceStep(
					pi,
					ctx,
					4,
					'✅ [Preflight 3/4] Complete. Next: run `ck "PATTERN" PATH` for semantic search.',
				);
				return;
			}
			// Note: step 4 transition moved to tool_result to validate ck results (B1)
		}

		if (step >= 5) return;

		const reason = BLOCK_MSGS[step];

		if (event.toolName === "grep" || event.toolName === "find") {
			sendBlockSteer(
				pi,
				`${reason} Blocked tool: ${event.toolName}. Complete preflight step ${step}/4 first.`,
			);
			return { block: true, reason };
		}

		if (event.toolName === "bash") {
			const cmd = (event.input as { command?: string })?.command ?? "";

			if (BASH_GREP_FIND_RE.test(cmd) && !BASH_CX_CK_RE.test(cmd)) {
				sendBlockSteer(
					pi,
					`${reason} Blocked bash command containing grep/find. Complete preflight step ${step}/4 first.`,
				);
				return { block: true, reason };
			}

			if (step <= 2 && /\bck\s/.test(cmd)) {
				sendBlockSteer(
					pi,
					`${reason} Blocked ck command. Learn cx search first (step ${step}/4).`,
				);
				return { block: true, reason };
			}
		}
	});

	// --- tool_result: B1 — validate step 4 ck results before advancing ---
	// Step 4 only advances if ck returns actual results, not "No matches found".
	// Also handles steps 1–3 transitions via tool_result for future C2 support.

	// Helper: extract text from bash tool result
	function extractResultText(result: any): string {
		if (!result?.content) return "";
		if (typeof result.content === "string") return result.content;
		if (Array.isArray(result.content)) {
			return result.content
				.filter((c: any) => c?.type === "text")
				.map((c: any) => c.text ?? "")
				.join("\n");
		}
		return String(result.content);
	}

	// Step 4 ck regex: a search query, NOT --index/--status/--clean/--help/--version
	const CK_SEARCH_RE = /\bck\s+(?!.*--(?:index|status|clean|help|version)\b)/;

	// Regex detecting failed/empty results
	const NO_MATCHES_RE = /no matches found|command failed|exit code [1-9]/i;

	pi.on("tool_result", (event, ctx) => {
		if (event.toolName !== "bash") return;
		if (step !== 4) return;

		const cmd = (event.input as { command?: string })?.command ?? "";

		// Only handle ck search commands (not --index, --status, etc.)
		if (!CK_SEARCH_RE.test(cmd)) return;

		const resultText = extractResultText(event.result);

		if (NO_MATCHES_RE.test(resultText)) {
			// B1: ck returned no matches — stay on step 4, guide with better query tips
			let guidance = '⚠️ [Preflight 4/4] Your `ck` query returned no matches. Try a more specific single-term query.';
			guidance += ' E.g., `ck "Subscriptions" src/` or `ck "App" src/`.';
			guidance += ' Avoid vague multi-word queries like `ck "payment subscription authentication"`.';

			pi.sendMessage(
				{
					customType: "cx-ck-preflight-retry",
					content: guidance,
					display: true,
				},
				{
					triggerTurn: true,
					deliverAs: "steer",
				},
			);
			return;
		}

		// Results found — advance to step 5
		advanceStep(
			pi,
			ctx,
			5,
			"✅ [Preflight 4/4] Complete! All search tools are now unblocked. Continue using cx/ck as per AGENTS.md.",
		);
	});

	// B1: Also detect step 4 completion in tool_call to prevent the bash command
	// from being blocked by other handlers. The actual advancement happens in tool_result.
	// This is a no-op return that lets the ck search command through without blocking.
	// (The blocking logic already allows ck when step > 2, so this is just for clarity.)

	// --- /preflight command ---
	pi.registerCommand("preflight", {
		description: "Show/reset cx-ck preflight onboarding status",
		handler: async (args, ctx) => {
			const arg = (args ?? "").trim().toLowerCase();

			if (arg === "reset") {
				step = 1;
				lastSteeredStep = 0;
				persistStep(pi);
				updateStatus(ctx);
				ctx.ui.notify("🔄 Preflight reset to step 1/4", "info");
			} else if (arg === "skip") {
				step = 5;
				lastSteeredStep = 0;
				persistStep(pi);
				updateStatus(ctx);
				ctx.ui.notify("⏩ Preflight skipped — all tools unblocked", "info");
			} else if (arg === "status" || arg === "") {
				if (step >= 5) {
					ctx.ui.notify("✅ Preflight complete — all tools unblocked", "info");
				} else {
					ctx.ui.notify(
						`⚠️ Preflight step ${step}/4: ${STEP_LABELS[step]}`,
						"info",
					);
				}
			} else {
				ctx.ui.notify("Usage: /preflight [status|reset|skip]", "info");
			}
		},
	});
}
