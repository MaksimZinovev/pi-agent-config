// orient — 2-step onboarding gate driven by orient-config.json.
// Forces the agent to learn project tools (cx/ck) before falling back to
// universal search (grep/find). Auto-injects skill content if not loaded.

import type {
	BuildSystemPromptOptions,
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";

// --- Types ---

interface SkillConfig {
	name: string;
	path: string;
}

interface StepConfig {
	label: string;
	systemPrompt: string;
	blockMessage: string;
	detectCommandRegex: string;
	advanceMessage: string;
	retryMessage: string;
	blockTools: string[];
	blockBashPatterns: string[];
	blockNativeTools: string[];
	completionPrompt?: string;
}

interface OrientConfig {
	skills: SkillConfig[];
	sessionStartMessage: string;
	postGateTour: string;
	steps: StepConfig[];
}

// --- Load config ---

// Resolve config path relative to this file's directory.
// Try multiple strategies since import.meta.url may not be reliable in Pi's ESM runtime.
let __dir: string;
try {
	if (typeof __dirname !== "undefined") {
		__dir = __dirname;
	} else {
		__dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
	}
} catch (e) {
	console.error("[orient] Could not resolve __dir from import.meta.url:", e);
	__dir = process.env.HOME + "/.pi/agent/extensions";
}
const CONFIG_PATH = __dir + "/orient-config.json";
console.error(
	"[orient] Extension loading. __dir=",
	__dir,
	"CONFIG_PATH=",
	CONFIG_PATH,
);

let config: OrientConfig;
try {
	const raw = readFileSync(CONFIG_PATH, "utf-8");
	config = JSON.parse(raw);
	console.error(
		"[orient] Config loaded. skills=",
		config.skills.map((s: SkillConfig) => s.name).join(","),
		"steps=",
		config.steps.length,
	);
} catch (e) {
	console.error("[orient] Could not read config from", CONFIG_PATH, e);
	config = { skills: [], sessionStartMessage: "", postGateTour: "", steps: [] };
}

const TOTAL_STEPS = config.steps.length;

// --- Resolve ~ in paths ---

function resolvePath(p: string): string {
	return p.startsWith("~/") ? process.env.HOME + p.slice(1) : p;
}

// --- Cached skill content (loaded once at module init) ---

const skillContents: Record<string, string> = {};

for (const skill of config.skills) {
	try {
		const resolved = resolvePath(skill.path);
		skillContents[skill.name] = readFileSync(resolved, "utf-8").trim();
		console.error(
			`[orient] Skill "${skill.name}" loaded from ${resolved} (${skillContents[skill.name].length} chars)`,
		);
	} catch (e) {
		console.error(
			`[orient] Could not read skill "${skill.name}" from ${skill.path}:`,
			e,
		);
	}
}

// --- State ---

let step = 1;
let lastSteeredStep = 0;

const ENTRY_TYPE = "orient";

// --- Derived regex patterns from config ---

const bashBlockRe = new RegExp(
	`(^|\\s|\\||;|&)(${config.steps
		.flatMap((s) => s.blockBashPatterns)
		.filter((v, i, a) => a.indexOf(v) === i)
		.join("|")})\\s`,
);
const cxckRe = /\b(cx|ck)\s/;

const stepDetectRegexps = config.steps.map(
	(s) => new RegExp(s.detectCommandRegex, "i"),
);

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
			if (typeof saved === "number" && saved >= 1 && saved <= TOTAL_STEPS + 1) {
				step = saved;
				return;
			}
		}
	}
}

// --- Status line ---

function updateStatus(ctx: ExtensionContext) {
	if (step > TOTAL_STEPS) {
		ctx.ui.setStatus("orient", "✅ Orient complete");
		setTimeout(() => ctx.ui.setStatus("orient", ""), 5000);
	} else {
		ctx.ui.setStatus("orient", `⚠️ Orient [${step}/${TOTAL_STEPS}]`);
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
	// If gate just completed, send post-gate skill tour instead of step advance
	if (newStep > TOTAL_STEPS && config.postGateTour) {
		const stepPrefix = message ? message + " " : "";
		pi.sendMessage(
			{
				customType: "orient-tour",
				content: stepPrefix + config.postGateTour,
				display: true,
			},
			{ triggerTurn: true, deliverAs: "steer" },
		);
	} else {
		pi.sendMessage(
			{ customType: "orient-step", content: message, display: true },
			{ triggerTurn: true, deliverAs: "steer" },
		);
	}
}

// --- Debounced block steer ---

function sendBlockSteer(pi: ExtensionAPI, message: string) {
	if (lastSteeredStep === step) return;
	lastSteeredStep = step;
	pi.sendMessage(
		{ customType: "orient-block", content: message, display: true },
		{ triggerTurn: true, deliverAs: "steer" },
	);
}

// --- Segment-based command blocking ---

function containsBlockedSegment(cmd: string): boolean {
	const segments = cmd.split(/\s*(?:\|\||&&|;|\|)\s*/);
	for (const seg of segments) {
		if (bashBlockRe.test(seg) && !cxckRe.test(seg)) return true;
	}
	return false;
}

// --- Tool result text extraction ---

function extractResultText(result: unknown): string {
	if (!result) return "";
	if (typeof result === "string") return result;
	if (Array.isArray(result)) {
		return result
			.filter((c: any) => c?.type === "text")
			.map((c: any) => c.text ?? "")
			.join("\n");
	}
	const r = result as Record<string, unknown>;
	if (typeof r.content === "string") return r.content;
	if (Array.isArray(r.content)) {
		return (r.content as any[])
			.filter((c: any) => c?.type === "text")
			.map((c: any) => c.text ?? "")
			.join("\n");
	}
	if (typeof r.output === "string") return r.output;
	if (typeof r.text === "string") return r.text;
	return JSON.stringify(result).slice(0, 2000);
}

// --- Build command string from tool call ---

function buildCmdString(toolName: string, input: any): string {
	if (input?.command && typeof input.command === "string") return input.command;
	if (toolName === "cx" || toolName === "ck") {
		const args = Array.isArray(input?.args) ? input.args.join(" ") : "";
		if (typeof input?.subcommand === "string")
			return `${toolName} ${input.subcommand} ${args}`.trim();
		if (typeof input?.query === "string") return `${toolName} ${input.query}`;
		if (typeof input?.path === "string") return `${toolName} ${input.path}`;
		return `${toolName} ${args}`.trim();
	}
	return toolName;
}

// --- Check for failed/empty results ---

const NO_MATCHES_RE = /no matches found|command failed|exit code [1-9]/i;

// --- Skill injection ---

function hasSkill(options: BuildSystemPromptOptions, name: string): boolean {
	return (
		options.skills?.some((s: { name: string }) => s.name === name) ?? false
	);
}

function buildSkillInjection(options: BuildSystemPromptOptions): string {
	const parts: string[] = [];
	for (const skill of config.skills) {
		if (!hasSkill(options, skill.name) && skillContents[skill.name]) {
			parts.push(skillContents[skill.name]);
			const folder = resolvePath(skill.path).replace("/SKILL.md", "");
			parts.push(`Skill folder: ${folder} — references available there`);
		}
	}
	if (parts.length === 0) return "";
	return (
		"\n\n--- Auto-injected by orient extension (read reference files in skill folders for more detail) ---\n\n" +
		parts.join("\n\n")
	);
}

// --- Current step config helper ---

function currentStep(): StepConfig | undefined {
	return config.steps[step - 1];
}

// =============================================================================

export default function (pi: ExtensionAPI) {
	console.error(
		"[orient] Extension initialized. step=",
		step,
		"TOTAL_STEPS=",
		TOTAL_STEPS,
	);
	// --- session_start: restore state only (steer deferred to resources_discover to avoid race) ---
	pi.on("session_start", (_event: any, ctx: ExtensionContext) => {
		try {
			restoreStep(ctx);
			updateStatus(ctx);
			console.error(
				"[orient] session_start fired. step=",
				step,
				"TOTAL_STEPS=",
				TOTAL_STEPS,
				"skills loaded=",
				Object.keys(skillContents).join(","),
			);
		} catch (e) {
			console.error(`[orient] session_start error: ${e}`);
		}
	});

	// --- resources_discover: send orient steer after all session_start injections have settled ---
	pi.on("resources_discover", async (_event: any, ctx: ExtensionContext) => {
		try {
			if (step <= TOTAL_STEPS) {
				const stepCfg = currentStep();
				if (!stepCfg) {
					console.error(
						"[orient] resources_discover: no step config found, skipping steer",
					);
					return { skillPaths: [], promptPaths: [], themePaths: [] };
				}
				const msg = config.sessionStartMessage
					.replace("{step}", String(step))
					.replace("{total}", String(TOTAL_STEPS))
					.replace("{label}", stepCfg.label);
				console.error(
					"[orient] resources_discover: sending steer. step=",
					step,
					"label=",
					stepCfg.label,
				);
				// Fire-and-forget: don't await sendMessage — awaiting would block resources_discover
				// until the agent turn completes, stalling session initialization.
				pi.sendMessage(
					{ customType: "orient-start", content: msg, display: true },
					{ triggerTurn: true, deliverAs: "steer" },
				).catch((e: unknown) =>
					console.error("[orient] resources_discover sendMessage error:", e),
				);
			} else {
				console.error(
					"[orient] resources_discover: gate already complete, no steer sent. step=",
					step,
				);
			}
		} catch (e) {
			console.error(`[orient] resources_discover error: ${e}`);
		}
		return { skillPaths: [], promptPaths: [], themePaths: [] };
	});

	// --- before_agent_start: inject skills + gate instruction + steer on gate steps ---
	pi.on("before_agent_start", (event: any, _ctx: any) => {
		try {
			let prompt = event.systemPrompt;

			// Inject cx/ck skill content if not already loaded by Pi
			const skillInjection = buildSkillInjection(event.systemPromptOptions);
			if (skillInjection) {
				prompt += skillInjection;
			}

			if (step <= TOTAL_STEPS) {
				const stepCfg = currentStep();
				if (stepCfg) {
					prompt += "\n\n" + stepCfg.systemPrompt;
				}
			} else {
				// Gate complete — inject completion prompt from last step to reinforce skill usage
				const lastStep = config.steps[config.steps.length - 1];
				if (lastStep?.completionPrompt) {
					prompt += "\n\n" + lastStep.completionPrompt;
				}
			}

			return { systemPrompt: prompt };
		} catch (e) {
			console.error(`[orient] before_agent_start error: ${e}`);
			return undefined;
		}
	});

	// --- tool_call: block tools during gate steps ---
	pi.on("tool_call", (event: any, _ctx: any) => {
		try {
			if (step > TOTAL_STEPS) return;
			const stepCfg = currentStep();
			if (!stepCfg) return;

			const reason = stepCfg.blockMessage;

			// Block configured native tools
			if (stepCfg.blockTools.includes(event.toolName)) {
				sendBlockSteer(pi, `${reason} Blocked tool: ${event.toolName}.`);
				return { block: true, reason };
			}

			if (event.toolName === "bash") {
				const cmd = (event.input as { command?: string })?.command ?? "";

				if (containsBlockedSegment(cmd)) {
					sendBlockSteer(
						pi,
						`${reason} Blocked bash command containing blocked pattern.`,
					);
					return { block: true, reason };
				}
			}

			// Block native tools exclusive to this step (e.g. ck in step 1)
			if (stepCfg.blockNativeTools?.includes(event.toolName)) {
				sendBlockSteer(
					pi,
					`${reason} Blocked ${event.toolName} — complete current step first.`,
				);
				return { block: true, reason };
			}
			// Also check bash for those tools
			if (event.toolName === "bash") {
				const cmd = (event.input as { command?: string })?.command ?? "";
				for (const blocked of stepCfg.blockNativeTools ?? []) {
					if (new RegExp(`\\b${blocked}\\s`).test(cmd)) {
						sendBlockSteer(
							pi,
							`${reason} Blocked ${blocked} — complete current step first.`,
						);
						return { block: true, reason };
					}
				}
			}
		} catch (e) {
			console.error(`[orient] tool_call error: ${e}`);
		}
	});

	// --- tool_result: step transitions ---
	pi.on("tool_result", (event: any, ctx: ExtensionContext) => {
		try {
			if (step > TOTAL_STEPS) return;
			const stepCfg = currentStep();
			if (!stepCfg) return;

			const isRelevantTool =
				event.toolName === "bash" ||
				event.toolName === "cx" ||
				event.toolName === "ck";
			if (!isRelevantTool) return;

			const cmd = buildCmdString(event.toolName, event.input);
			const resultText = extractResultText(event.content);

			// Check if the step's target command was executed
			if (stepDetectRegexps[step - 1].test(cmd)) {
				// Empty/failed result → retry
				if (NO_MATCHES_RE.test(resultText) || resultText.trim() === "") {
					if (stepCfg.retryMessage) {
						pi.sendMessage(
							{
								customType: "orient-retry",
								content: stepCfg.retryMessage,
								display: true,
							},
							{ triggerTurn: true, deliverAs: "steer" },
						);
					}
					return;
				}
				// Success → advance
				advanceStep(pi, ctx, step + 1, stepCfg.advanceMessage);
				return;
			}
		} catch (e) {
			console.error(`[orient] tool_result error: ${e}`);
		}
	});

	// --- /orient command ---
	pi.registerCommand("orient", {
		description: "Show/reset orient onboarding status",
		handler: async (args: string, ctx: ExtensionCommandContext) => {
			try {
				const arg = (args ?? "").trim().toLowerCase();

				if (arg === "reset") {
					step = 1;
					lastSteeredStep = 0;
					persistStep(pi);
					updateStatus(ctx);
					ctx.ui.notify(`🔄 Orient reset to step 1/${TOTAL_STEPS}`, "info");
				} else if (arg === "skip") {
					step = TOTAL_STEPS + 1;
					lastSteeredStep = 0;
					persistStep(pi);
					updateStatus(ctx);
					ctx.ui.notify("⏩ Orient skipped — all tools unblocked", "info");
				} else if (arg === "status" || arg === "") {
					if (step > TOTAL_STEPS) {
						ctx.ui.notify("✅ Orient complete — all tools unblocked", "info");
					} else {
						const stepCfg = currentStep();
						ctx.ui.notify(
							`⚠️ Orient step ${step}/${TOTAL_STEPS}: ${stepCfg?.label ?? "unknown"}`,
							"info",
						);
					}
				} else {
					ctx.ui.notify("Usage: /orient [status|reset|skip]", "info");
				}
			} catch (e) {
				console.error(`[orient] /orient error: ${e}`);
			}
		},
	});
}
