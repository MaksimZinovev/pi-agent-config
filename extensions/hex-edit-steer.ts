// hex-edit-steer — Blocks the `edit` tool after first failure and steers to `hex_edit`.
//
// When the agent's `edit` tool call results in an error, this extension:
//   1. Permanently blocks all future `edit` calls for the session
//   2. Steers the agent to use `hex_edit` (from @vtstech/pi-hex-edit) instead
//   3. Injects system-prompt instructions via `before_agent_start`
//   4. Persists state across turns so the block survives compaction
//
// Key mechanisms (mirrors cx-ck-preflight):
//   - `deliverAs: "steer"` messages: injected before model's next reasoning step
//   - `before_agent_start`: system prompt injection (highest weight)
//   - `session_start`: restore state + proactive steer if blocked
//   - `tool_call` blocking: prevent `edit` from executing once blocked
//   - `tool_result` detection: trigger on first edit error
//   - Debounced steers: one steer per state change, avoids spam
//   - try-catch on ALL event handlers: prevents silent failures

import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";

// --- State ---

let editBlocked = false;
let lastSteered = false;
let lastEditFile = "";

const ENTRY_TYPE = "hex-edit-steer";

// --- Messages ---

const BLOCK_REASON = "⚠️ The `edit` tool is blocked for this session (it failed earlier). Use `hex_edit` instead. Run `hex_edit_validate` first to locate the text, then `hex_edit` to apply the edit.";

const SYSTEM_PROMPT_INJECTION = `[HEX-EDIT-STEER] The \`edit\` tool is permanently blocked this session because it failed. You MUST use \`hex_edit\` for all file edits. Always run \`hex_edit_validate\` first to confirm the target text exists, then use \`hex_edit\` to make the change. Use \`hex_edit_show\` to inspect file content and \`hex_edit_diff\` to verify changes.`;

const STEER_ON_FAILURE = "⚠️ The `edit` tool failed. For reliable byte-level editing, use `hex_edit` instead. Use `hex_edit_validate` first to confirm the text exists, then `hex_edit` to make the change.";

// --- State persistence ---

function persistState(pi: ExtensionAPI) {
	pi.appendEntry(ENTRY_TYPE, { editBlocked, lastEditFile });
}

function restoreState(ctx: ExtensionContext): void {
	const entries = ctx.sessionManager.getEntries();
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.type === "custom" && entry.customType === ENTRY_TYPE) {
			const data = entry.data as any;
			if (typeof data?.editBlocked === "boolean") {
				editBlocked = data.editBlocked;
				lastEditFile = data.lastEditFile ?? "";
				console.error(`[hex-edit-steer] Restored state: editBlocked=${editBlocked} lastEditFile=${lastEditFile}`);
				return;
			}
		}
	}
	console.error("[hex-edit-steer] No saved state found, starting fresh");
}

// --- Status line ---

function updateStatus(ctx: ExtensionContext) {
	if (editBlocked) {
		ctx.ui.setStatus("hex-edit-steer", "🔒 edit blocked → use hex_edit");
	} else {
		ctx.ui.setStatus("hex-edit-steer", "");
	}
}

// --- Debounced steer ---

function sendSteer(pi: ExtensionAPI, message: string) {
	if (lastSteered) return;
	lastSteered = true;
	pi.sendMessage(
		{
			customType: "hex-edit-steer",
			content: message,
			display: true,
		},
		{
			triggerTurn: true,
			deliverAs: "steer",
		},
	);
}

// --- Result text extraction ---
// (Mirrors cx-ck-preflight's extractResultText for robustness)

function extractResultText(result: unknown): string {
	if (!result) return "";
	if (Array.isArray(result)) {
		const texts = result
			.filter((c: any) => c?.type === "text")
			.map((c: any) => c.text ?? "");
		if (texts.length > 0) return texts.join("\n");
	}
	const r = result as Record<string, unknown>;
	if (r.content) {
		if (typeof r.content === "string") return r.content;
		if (Array.isArray(r.content)) {
			const texts = (r.content as any[])
				.filter((c: any) => c?.type === "text")
				.map((c: any) => c.text ?? "");
			if (texts.length > 0) return texts.join("\n");
		}
	}
	if (typeof r.output === "string") return r.output as string;
	if (typeof r.text === "string") return r.text as string;
	if (typeof result === "string") return result;
	// Fallback: JSON.stringify
	const json = JSON.stringify(result);
	if (json.length > 0) {
		console.error(
			`[hex-edit-steer] extractResultText: format unknown, using JSON fallback. keys=${Object.keys(result).join(",")} preview=${json.slice(0, 300)}`,
		);
		return json;
	}
	return "";
}

// Detect if an edit tool result indicates failure
function isEditFailure(event: any): boolean {
	// Check isError flag first (most reliable)
	if (event.isError === true) {
		console.error("[hex-edit-steer] edit failure detected via isError=true");
		return true;
	}

	// Check result content for error indicators
	const resultText = extractResultText(event.content);
	const lowerText = resultText.toLowerCase();

	// Common edit failure patterns
	const failurePatterns = [
		/no (?:match|matching)/i,
		/not found/i,
		/could not find/i,
		/failed to (?:find|match|edit|replace)/i,
		/cannot find/i,
		/error/i,
		/does not (?:exist|match)/i,
		/did not match/i,
		/multiple matches/i, // ambiguous match is also a failure
	];

	for (const pattern of failurePatterns) {
		if (pattern.test(lowerText)) {
			console.error(`[hex-edit-steer] edit failure detected via pattern "${pattern}" in: ${lowerText.slice(0, 200)}`);
			return true;
		}
	}

	return false;
}

// Extract file path from edit tool input
function extractFilePath(input: any): string {
	if (typeof input?.file === "string") return input.file;
	if (typeof input?.path === "string") return input.path;
	if (typeof input?.filePath === "string") return input.filePath;
	return "";
}

// =============================================================================

export default function (pi: ExtensionAPI) {

	// --- session_start: restore state + steer if already blocked ---
	pi.on("session_start", (_event, ctx) => {
		try {
			restoreState(ctx);
			updateStatus(ctx);

			if (editBlocked) {
				console.error("[hex-edit-steer] session_start: edit is blocked, sending steer");
				pi.sendMessage(
					{
						customType: "hex-edit-steer-reminder",
						content: `🔒 The \`edit\` tool remains blocked for this session. Use \`hex_edit\` for all file edits. Run \`hex_edit_validate\` first, then \`hex_edit\` to apply changes.${lastEditFile ? ` (Previous failure was on: ${lastEditFile})` : ""}`,
						display: true,
					},
					{
						triggerTurn: true,
						deliverAs: "steer",
					},
				);
			}
		} catch (e) {
			console.error(`[hex-edit-steer] session_start error: ${e}`);
		}
	});

	// --- before_agent_start: inject system prompt when edit is blocked ---
	pi.on("before_agent_start", (event, _ctx) => {
		if (!editBlocked) return;
		try {
			console.error("[hex-edit-steer] before_agent_start: injecting system prompt block");
			return {
				systemPrompt: event.systemPrompt + "\n\n" + SYSTEM_PROMPT_INJECTION,
			};
		} catch (e) {
			console.error(`[hex-edit-steer] before_agent_start error: ${e}`);
			return undefined;
		}
	});

	// --- tool_call: block `edit` when blocked ---
	pi.on("tool_call", (event, ctx) => {
		try {
			if (!editBlocked) return;

			if (event.toolName === "edit") {
				console.error(`[hex-edit-steer] tool_call: blocking edit tool. input_keys=${Object.keys(event.input || {}).join(",")}`);
				sendSteer(pi, BLOCK_REASON);
				return { block: true, reason: BLOCK_REASON };
			}
		} catch (e) {
			console.error(`[hex-edit-steer] tool_call error: ${e}`);
		}
	});

	// --- tool_result: detect first edit failure and activate block ---
	pi.on("tool_result", (event, ctx) => {
		try {
			// Only care about the `edit` tool
			if (event.toolName !== "edit") return;

			// If already blocked, nothing to do here (blocking happens in tool_call)
			if (editBlocked) return;

			console.error(`[hex-edit-steer] tool_result: checking edit result. isError=${event.isError} content_keys=${Object.keys(event.content || {}).join(",")}`);

			if (isEditFailure(event)) {
				// Extract file info for context
				lastEditFile = extractFilePath(event.input);
				editBlocked = true;
				persistState(pi);
				updateStatus(ctx);

				console.error(`[hex-edit-steer] edit failure detected! Blocking edit for session. lastEditFile=${lastEditFile}`);

				pi.sendMessage(
					{
						customType: "hex-edit-steer-block",
						content: lastEditFile
							? `${STEER_ON_FAILURE} (Failed file: ${lastEditFile})`
							: STEER_ON_FAILURE,
						display: true,
					},
					{
						triggerTurn: true,
						deliverAs: "steer",
					},
				);
			}
		} catch (e) {
			console.error(`[hex-edit-steer] tool_result error: ${e}`);
		}
	});

	// --- /hexsteer command ---
	pi.registerCommand("hexsteer", {
		description: "Manage hex-edit-steer: block/unblock the edit tool",
		handler: async (args: string, ctx: ExtensionCommandContext) => {
			try {
				const arg = (args ?? "").trim().toLowerCase();

				if (arg === "unblock") {
					editBlocked = false;
					lastSteered = false;
					lastEditFile = "";
					persistState(pi);
					updateStatus(ctx);
					ctx.ui.notify("🔓 `edit` tool re-enabled. Use `hex_edit` as needed.", "info");
				} else if (arg === "block") {
					editBlocked = true;
					persistState(pi);
					updateStatus(ctx);
					ctx.ui.notify("🔒 `edit` tool manually blocked. Use `hex_edit` instead.", "info");
				} else if (arg === "status" || arg === "") {
					if (editBlocked) {
						const fileMsg = lastEditFile ? ` (after failure on: ${lastEditFile})` : "";
						ctx.ui.notify(`🔒 \`edit\` is BLOCKED${fileMsg}. Use \`hex_edit\` instead.`, "info");
					} else {
						ctx.ui.notify("✅ `edit` is available (not blocked).", "info");
					}
				} else {
					ctx.ui.notify("Usage: /hexsteer [status|block|unblock]", "info");
				}
			} catch (e) {
				console.error(`[hex-edit-steer] /hexsteer error: ${e}`);
			}
		},
	});
}