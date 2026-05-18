// cx-ck-preflight — 4-step onboarding gate enforcing the AGENTS.md escalation hierarchy.
//
// Step 1: `cx overview .` — learn orientation
// Step 2: `cx symbols --name '*'` (list all) or `cx symbols --name PATTERN` — targeted search
// Step 3: `ck --index .` or `ck --status` — index for semantic search
// Step 4: `ck "PATTERN" PATH` — semantic search
// After step 4: extension does nothing. cx-first-reminder still nudges on grep/find results.
//
// Key mechanisms (see steer-model reference):
//   - `deliverAs: "steer"` messages: injected before model's next reasoning step
//   - `before_agent_start`: step-specific system prompt injection (highest weight)
//   - `session_start`: proactive steer to begin onboarding
//   - Debounced block steers: one steer per step, avoids stale/overlapping messages
//   - Context-aware steers: parsed tool output enriches subsequent step guidance (C2)
//   - Segment-based blocking: checks each command segment independently (fixes || bypass)
//   - try-catch on ALL event handlers: prevents silent failures from killing step transitions

import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";

let step = 1;
let lastSteeredStep = 0;
// C2: Context extracted from tool output for enriched steer messages
let overviewInfo = "";

const BASH_GREP_FIND_RE = /(^|\s|\||;|&&)(grep|rg|ack|ag|find|fd)\s/;
const BASH_CX_CK_RE = /\b(cx|ck)\s/;

const STEP_LABELS: Record<number, string> = {
	1: "Run `cx overview .` to learn codebase orientation",
	2: "Run `cx symbols --name '*'` to list all symbols, or `cx symbols --name PATTERN` for specific ones",
	3: "Run `ck --index .` (or `ck --status` to check) to index for semantic search",
	4: 'Run `ck "PATTERN" PATH` for semantic search',
};

const STEP_SYSTEM_PROMPTS: Record<number, string> = {
	1: "[PREFLIGHT GATE] You must run `cx overview .` before using any search tools. grep, find, rg, ack, ag, fd, and ck are BLOCKED until you complete this step. Do NOT attempt to use them. Do NOT produce a lengthy summary after cx overview — proceed to the next tool.",
	2: "[PREFLIGHT GATE] Run `cx symbols --name '*'` to list all symbols, or `cx symbols --name PATTERN` for specific ones. You can also use `cx references --name NAME` for usages. grep, find, rg, ack, ag, fd, and ck are still BLOCKED. Do NOT produce a table or summary of symbols — you can query them individually with cx later.",
	3: "[PREFLIGHT GATE] Run `ck --index .` (or `ck --status` if previously indexed) next. grep, find, rg, ack, ag, fd are still BLOCKED. Be concise — just run the command, no summary needed.",
	4: '[PREFLIGHT GATE] Run `ck "PATTERN" PATH` next with a specific single term. E.g., `ck "Subscriptions" src/` — NOT `ck "payment subscription"`. grep, find, rg, ack, ag, fd are still BLOCKED. Be concise — report findings briefly, do not produce a summary table.',
};

const BLOCK_MSGS: Record<number, string> = {
	1: "⚠️ [Preflight 1/4] Use `cx overview .` first to learn codebase orientation. Search tools are blocked until this step is completed.",
	2: "⚠️ [Preflight 2/4] Run `cx symbols --name '*'` to list all symbols, or `cx symbols --name PATTERN` for specific ones. `cx references --name NAME` also works.",
	3: '⚠️ [Preflight 3/4] Run `ck --index .` (or `ck --status` to check) to index for semantic search. Then proceed to `ck "PATTERN" PATH`.',
	4: '⚠️ [Preflight 4/4] Run `ck "PATTERN" PATH` for semantic search. Use a specific single term, e.g., `ck "Subscriptions" src/`.',
};

const ENTRY_TYPE = "cx-ck-preflight";

// --- State persistence ---

function persistStep(pi: ExtensionAPI) {
	pi.appendEntry(ENTRY_TYPE, { step });
}

function restoreStep(ctx: ExtensionContext): void {
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

// --- Status line ---

function updateStatus(ctx: ExtensionContext) {
	if (step >= 5) {
		ctx.ui.setStatus("cx-ck-preflight", "✅ Preflight complete");
		setTimeout(() => ctx.ui.setStatus("cx-ck-preflight", ""), 5000);
	} else {
		ctx.ui.setStatus("cx-ck-preflight", `⚠️ Preflight [${step}/4]`);
	}
}

// --- Step transition ---

function advanceStep(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
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

// --- Debounced block steer ---

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

// --- C2: Tool output parsing ---

function extractResultText(result: unknown): string {
	if (!result) return "";
	// Handle event.content which is already an array of content blocks
	if (Array.isArray(result)) {
		const texts = result
			.filter((c: any) => c?.type === "text")
			.map((c: any) => c.text ?? "");
		if (texts.length > 0) return texts.join("\n");
	}
	// Try result.content (standard format — for objects wrapping content)
	const r = result as Record<string, unknown>;
	if (r.content) {
		if (typeof r.content === "string") return r.content;
		if (Array.isArray(r.content)) {
			const texts = r.content
				.filter((c: any) => c?.type === "text")
				.map((c: any) => c.text ?? "");
			if (texts.length > 0) return texts.join("\n");
		}
	}
	// Try result.output (some tools use this)
	if (typeof r.output === "string") return r.output as string;
	// Try result.text
	if (typeof r.text === "string") return r.text as string;
	// Try result as string (bash results sometimes return raw strings)
	if (typeof result === "string") return result;
	// Fix B: JSON.stringify fallback — brute-force search the entire result object
	const json = JSON.stringify(result);
	if (json.length > 0) {
		console.error(
			`[cx-ck-preflight] extractResultText: format unknown, using JSON fallback. keys=${Object.keys(result).join(",")} preview=${json.slice(0, 300)}`,
		);
		return json;
	}
	return "";
}

// C2: Extract "(N files, M symbols)" from cx overview output
function extractOverviewInfo(text: string): string {
	const match = text.match(/\((\d+)\s+files?,\s*(\d+)\s+symbols?\)/);
	if (match) return `${match[1]} files, ${match[2]} symbols`;
	return "";
}



// --- Context-aware steer message builders ---

function buildStep2Message(): string {
	let msg =
		"✅ [Preflight 1/4] Complete. Next do this NOW: run `cx symbols --name '*'` to list all symbols, or `cx symbols --name PATTERN` for specific ones. No summary needed — proceed to the next tool.";
	if (overviewInfo) {
		msg += ` Codebase overview: ${overviewInfo}.`;
	} else {
		msg += " [debug: overviewInfo empty, extractResultText may have failed]";
	}
	return msg;
}

function buildStep3Message(): string {
	return "✅ [Preflight 2/4] Complete. Next do this NOW: run `ck --index .` (or `ck --status` to check).";
}

function buildStep4Message(): string {
	return '✅ [Preflight 3/4] Complete. Next do this NOW: run `ck "PATTERN" PATH` for semantic search. E.g., `ck "App" src/` or `ck "Subscriptions" src/`. Avoid vague multi-word queries like `ck "payment subscription"`. Be concise, no summary tables.';
}

// --- Segment-based command blocking (fixes || bypass) ---

function containsBlockedSegment(cmd: string): boolean {
	// Split on shell operators: ||, &&, ;, |, newlines
	const segments = cmd.split(/\s*(?:\|\||&&|;|\|)\s*/);
	for (const seg of segments) {
		// Check if this segment contains grep/find/ls
		if (BASH_GREP_FIND_RE.test(seg)) {
			// But allow if it also contains cx/ck (explicit intent to use project tools)
			if (!BASH_CX_CK_RE.test(seg)) {
				return true;
			}
		}
	}
	return false;
}

// =============================================================================

export default function (pi: ExtensionAPI) {
	// --- session_start: restore state + initial steer ---
	pi.on("session_start", (_event, ctx) => {
		try {
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
		} catch (e) {
			console.error(`[cx-ck-preflight] session_start error: ${e}`);
		}
	});

	// --- before_agent_start: inject step into system prompt ---
	pi.on("before_agent_start", (event, _ctx) => {
		if (step >= 5) return;
		try {
			return {
				systemPrompt: event.systemPrompt + "\n\n" + STEP_SYSTEM_PROMPTS[step],
			};
		} catch (e) {
			console.error(`[cx-ck-preflight] before_agent_start error: ${e}`);
			return undefined;
		}
	});

	// --- tool_call: blocking only (step transitions happen in tool_result) ---
	pi.on("tool_call", (event, ctx) => {
		try {
			// Debug: log ALL tool calls during steps 1-4
			if (step <= 4) {
				const cmdPreview =
					event.toolName === "bash"
						? ((event.input as { command?: string })?.command?.slice(0, 60) ??
							"(no cmd)")
						: "(native)";
				console.error(
					`[cx-ck-preflight] tool_call: toolName="${event.toolName}" cmd="${cmdPreview}" step=${step} input_keys=${Object.keys(event.input || {}).join(",")}`,
				);
			}

			if (step >= 5) {
				// Post-preflight: no blocking needed
				return;
			}

			const reason = BLOCK_MSGS[step];

			// Block grep/find tool calls in all steps 1-4
			if (event.toolName === "grep" || event.toolName === "find") {
				sendBlockSteer(
					pi,
					`${reason} Blocked tool: ${event.toolName}. Complete preflight step ${step}/4 first.`,
				);
				return { block: true, reason };
			}

			// Block ck native tool in steps 1-2 (must learn cx search first)
			if (step <= 2 && event.toolName === "ck") {
				sendBlockSteer(
					pi,
					`${reason} Blocked ck command. Learn cx search first (step ${step}/4).`,
				);
				return { block: true, reason };
			}

			if (event.toolName === "bash") {
				const cmd = (event.input as { command?: string })?.command ?? "";

				// Segment-based blocking: check each part of compound commands
				if (containsBlockedSegment(cmd)) {
					sendBlockSteer(
						pi,
						`${reason} Blocked bash command containing grep/find. Complete preflight step ${step}/4 first.`,
					);
					return { block: true, reason };
				}

				// Block ck in bash commands until step 2 is done (must learn cx search first)
				if (step <= 2 && /\bck\s/.test(cmd)) {
					sendBlockSteer(
						pi,
						`${reason} Blocked ck command. Learn cx search first (step ${step}/4).`,
					);
					return { block: true, reason };
				}
			}
		} catch (e) {
			console.error(`[cx-ck-preflight] tool_call error: ${e}`);
		}
	});

	// --- tool_result: step transitions + output parsing (C2 + B1) ---
	// Steps 1-3 transitions moved here from tool_call so we can parse
	// command output and enrich steer messages with extracted context.
	// NOTE: cx/ck may be native tools (event.toolName === "cx"/"ck"), not just
	// bash commands. We must handle both.

	// Step 4 ck regex: a search query, NOT --index/--status/--clean/--help/--version
	const CK_SEARCH_RE = /\bck\s+(?!.*--(?:index|status|clean|help|version)\b)/;
	// Regex detecting failed/empty results (B1)
	const NO_MATCHES_RE = /no matches found|command failed|exit code [1-9]/i;

	// Reconstruct a command string from the tool call for regex matching.
	// Native cx/ck tools have inputs like { args: [...] } rather than { command: "..." }.
	function buildCmdString(toolName: string, input: any): string {
		// Bash tools have { command: "..." }
		if (input?.command && typeof input.command === "string")
			return input.command;
		// Native cx/ck tools: reconstruct from toolName + args
		if (toolName === "cx" || toolName === "ck") {
			const args = Array.isArray(input?.args) ? input.args.join(" ") : "";
			// Also try other common input shapes
			if (typeof input?.subcommand === "string")
				return `${toolName} ${input.subcommand} ${args}`.trim();
			if (typeof input?.query === "string") return `${toolName} ${input.query}`;
			if (typeof input?.path === "string") return `${toolName} ${input.path}`;
			// Debug: log unknown input shape
			console.error(
				`[cx-ck-preflight] buildCmdString: unknown cx/ck input shape for ${toolName}, keys=${Object.keys(input || {}).join(",")} input_preview=${JSON.stringify(input || {}).slice(0, 300)}`,
			);
			return `${toolName} ${args}`.trim();
		}
		// Fallback: just tool name
		return toolName;
	}

	pi.on("tool_result", (event, ctx) => {
		try {
			// Debug: log ALL tool calls during steps 1-4 to diagnose event shapes
			if (step <= 4) {
				const cmdPreview =
					event.toolName === "bash"
						? ((event.input as { command?: string })?.command?.slice(0, 60) ??
							"(no cmd)")
						: "(native)";
				console.error(
					`[cx-ck-preflight] tool_result: toolName="${event.toolName}" cmd="${cmdPreview}" step=${step} result_keys=${Object.keys(event.content || {}).join(",")} input_keys=${Object.keys(event.input || {}).join(",")}`,
				);
			}

			// Only process cx, ck, or bash tool calls
			const isCxOrCk = event.toolName === "cx" || event.toolName === "ck";
			if (event.toolName !== "bash" && !isCxOrCk) return;

			const cmd = buildCmdString(event.toolName, event.input);
			const resultText = extractResultText(event.content);

			// Step 1→2: cx overview (C2: parse overview info)
			if (step === 1 && /\bcx\b.*\boverview\b/i.test(cmd)) {
				overviewInfo = extractOverviewInfo(resultText);
				advanceStep(pi, ctx, 2, buildStep2Message());
				return;
			} 

			// Step 2→3: cx symbols/references/definition (C2: parse symbol names)
			// B1-style: don't advance on empty/failed results
			if (step === 2 && /\bcx\b.*\b(symbols|references|definition)\b/i.test(cmd)) {
				if (NO_MATCHES_RE.test(resultText) || resultText.trim() === "") {
					// Empty/failed result — guide the model to try a better query
					pi.sendMessage(
						{
							customType: "cx-ck-preflight-retry",
							content:
								"⚠️ [Preflight 2/4] Your cx query returned no results. Try `cx symbols --name '*'` to list all symbols, or a more specific name like `cx symbols --name App`.",
							display: true,
						},
						{
							triggerTurn: true,
							deliverAs: "steer",
						},
					);
					return;
				}
				advanceStep(pi, ctx, 3, buildStep3Message());
				return;
			}

			// Step 3→4: ck --index or ck --status (A1)
			if (step === 3 && /\bck\s+.*--(?:index|status)\b/.test(cmd)) {
				advanceStep(pi, ctx, 4, buildStep4Message());
				return;
			}

			// Step 4→5 or retry: ck search (B1: validate results)
			if (step === 4 && CK_SEARCH_RE.test(cmd)) {
				if (NO_MATCHES_RE.test(resultText)) {
					// B1: ck returned no matches — stay on step 4, guide with better query tips
					let guidance =
						'⚠️ [Preflight 4/4] Your `ck` query returned no matches. Try a more specific single-term query. E.g., `ck "Subscriptions" src/` or `ck "App" src/`.';
					guidance +=
						' Avoid vague multi-word queries like `ck "payment subscription authentication"`.';

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
					"✅ [Preflight 4/4] Complete! All search tools unblocked. Use cx/ck efficiently as per AGENTS.md — no need to summarize what you already learned.",
				);
				return;
			}

			// Post-preflight: gentle nudge on bash grep/find (bridges gap with cx-first-reminder)
			if (
				step >= 5 &&
				BASH_GREP_FIND_RE.test(cmd) &&
				!BASH_CX_CK_RE.test(cmd)
			) {
				pi.sendMessage(
					{
						customType: "cx-ck-preflight-nudge",
						content:
							"💡 Consider using `cx symbols` or `ck` instead of grep/find for better search.",
						display: true,
					},
					{
						deliverAs: "followUp",
					},
				);
			}
		} catch (e) {
			console.error(`[cx-ck-preflight] tool_result error: ${e}`);
		}
	});

	// --- /preflight command ---
	pi.registerCommand("preflight", {
		description: "Show/reset cx-ck preflight onboarding status",
		handler: async (args: string, ctx: ExtensionCommandContext) => {
			try {
				const arg = (args ?? "").trim().toLowerCase();

				if (arg === "reset") {
					step = 1;
					lastSteeredStep = 0;
					overviewInfo = "";
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
						ctx.ui.notify(
							"✅ Preflight complete — all tools unblocked",
							"info",
						);
					} else {
						ctx.ui.notify(
							`⚠️ Preflight step ${step}/4: ${STEP_LABELS[step]}`,
							"info",
						);
					}
				} else {
					ctx.ui.notify("Usage: /preflight [status|reset|skip]", "info");
				}
			} catch (e) {
				console.error(`[cx-ck-preflight] /preflight error: ${e}`);
			}
		},
	});
}
