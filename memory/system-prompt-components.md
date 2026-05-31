
## Solutions 

- Remove not used skills, tools, mcps 
- Use subagents 
- Subagents start narrow by default: systemPromptMode: replace (default) means they get a
 clean system prompt — no parent's AGENTS.md, no full skills catalog, no bloat. You
 explicitly opt into inheritance with inheritProjectContext and inheritSkills.
- Per-agent tool allowlisting: The tools field lets you specify exactly which tools a
 subagent gets (e.g., tools: read, grep, find, bash). Omitted tools are excluded from
 that child's prompt entirely.
- Per-agent skill injection: The skills field injects only specific skills (e.g., skills:
 code-review+security), independent of the global catalog. Set inheritSkills: false to
 strip all global skills.


## Analysis 

 Saved to /Users/maksim/repos/pi-mono/system-prompt-components.md (27.6K — the text
 parts). The tool definitions make up the remaining ~44K.

 Summary of the 71K system prompt:
 
 1. Skills are 55.6% of the prompt — not 7%. I originally cited the
 system-prompt-components.md file which mismeasured this. The skills catalog (44,663
 chars) is the single largest component, bigger than tools (20.6%) and context files
 (21.6%) combined.
 2. Tools are 20.6% — not 55%. The system-prompt-components.md file said "~44K" for tools
 but actually measured something different. The real breakdown is 5,679 chars for 6
 active tools + 10,569 chars for tool_search containing 123 hidden tool schemas.
 3. Global AGENTS.md has 1 added line — not an exact match. The "Behavioral guidelines"
 line appears in the prompt but not in the source file.
 4. Project AGENTS.md is an exact match — confirmed character-by-character.
 1. 
   ╔══════════════════════════════════════════════════════════════════════════════════╗
   ║            SYSTEM PROMPT vs SOURCES — VERIFIED BREAKDOWN                        ║
   ╠══════════════════════════════════════════════════════════════════════════════════╣
   ║                                                                                ║
   ║  Total prompt: 80,316 chars (1,195 lines)                                      ║
   ║                                                                                ║
   ╠══════════════════════════════════╦═════════╦════════╦═════════╦═════════════════╣
   ║  Component                      ║  Chars  ║ Lines  ║    %    ║ Source Match     ║
   ╠══════════════════════════════════╬═════════╬════════╬═════════╬═════════════════╣
   ║  Skills catalog (93 skills)     ║ 44,663  ║  474   ║  55.6%  ║ ✅ All 93 valid  ║
   ║    - Descriptions (62.4%)       ║ 27,848  ║        ║  34.7%  ║                  ║
   ║    - File paths (14.2%)         ║  6,323  ║        ║   7.9%  ║                  ║
   ║    - XML overhead (15.8%)       ║  7,068  ║        ║   8.8%  ║                  ║
   ║    - Names (3.2%)               ║  1,431  ║        ║   1.8%  ║                  ║
   ╠══════════════════════════════════╬═════════╬════════╬═════════╬═════════════════╣
   ║  Context files (AGENTS.md)      ║ 17,381  ║  365   ║  21.6%  ║                  ║
   ║    - Global (~/.pi/agent/)      ║  5,496  ║  110   ║   6.8%  ║ ⚠️ 1 line added  ║
   ║    - Project (pi-mono/)         ║ 11,819  ║  240   ║  14.7%  ║ ✅ Exact match   ║
   ║    - Section header             ║     66  ║        ║   0.1%  ║                  ║
   ╠══════════════════════════════════╬═════════╬════════╬═════════╬═════════════════╣
   ║  Tool definitions               ║ 16,564  ║  332   ║  20.6%  ║ ✅ Match config   ║
   ║    - Active tools (6)           ║  5,679  ║        ║   7.1%  ║                  ║
   ║    - tool_search (123 hidden)   ║ 10,569  ║        ║  13.2%  ║                  ║
   ║      - chrome-devtools (29)     ║         ║        ║   ~4.7% ║  (MCP config)    ║
   ║      - github (26)               ║         ║        ║   ~4.2% ║  (MCP config)    ║
   ║      - teams/subagents (21)     ║         ║        ║   ~3.4% ║  (pi-teams pkg)  ║
   ║      - inspect (10)             ║         ║        ║   ~1.6% ║  (MCP config)    ║
   ║      - other (37)               ║         ║        ║   ~6.0% ║  (various pkgs)   ║
   ╠══════════════════════════════════╬═════════╬════════╬═════════╬═════════════════╣
   ║  System prompt template          ║  1,584  ║   21   ║   2.0%  ║ ✅ Dynamic gen   ║
   ║  Date/CWD metadata               ║    124  ║    7   ║   0.2%  ║ ✅ Runtime       ║
   ╠══════════════════════════════════╬═════════╬════════╬═════════╬═════════════════╣
   ║  TOTAL                           ║ 80,316  ║ 1195   ║ 100.0%  ║                  ║
   ╚══════════════════════════════════╩═════════╩════════╩═════════╩═════════════════╝
   
    DISCREPANCIES FOUND:
   
      1. Global AGENTS.md: 1 ADDED LINE not in source file
         "+ Behavioral guidelines to reduce common LLM coding mistakes.
          Derived from [Andrej Karpathy's observations](https://x.com/karpathy/...)
          on LLM coding pitfalls."
         Source: NOT found in any extension, hook, or package.
         Likely: Was in the file at capture time and removed afterwards.
   
      2. Skills on disk but NOT in prompt (2):
         - breadboarding  → /Users/maksim/.pi/agent/skills/breadboarding/SKILL.md
         - circleci-cli    → /Users/maksim/.pi/agent/skills/circleci-cli/SKILL.md
         Likely: Not triggered for current project context.
   
      3. Context files NOT loaded (by design):
         - AGENTS_TOOLING.md  (skills reference only, not a context file)
         - AGENTS_BROWSER.md   (skills reference only, not a context file)
         The resource-loader only discovers AGENTS.md and CLAUDE.md.
    """)
   
    PYEOF
----

 Here are the questions to figure out why tool definitions are so large and what to do
 about it:

 1. chrome-devtools (29 tools, ~9K chars?) — Do you actively use browser automation in
 this project? If not, this is the single biggest removable chunk.
 2. github (26 tools, ~8K chars?) — You use gh CLI and GitHub tools. Are all 26 endpoints
 needed, or could you trim to just the ones you use (push_files, create_issue,
 create_pull_request, etc.)?
 3. teams/subagents (21 tools, ~7K chars?) — Do you use multi-agent teams in this
 project? If solo-only, these could be disabled.
 4. inspect (10 tools, ~3K chars?) — PR review tools. Used only during code review
 sessions?
 5. mcp → nocodb (25 sub-tools via gateway) — The mcp gateway tool definition is compact,
 but does nocodb need to be connected for this project?
 6. deepwiki (3), soul (3), skill_forge/dojo (5), session (3), design_deck (2), hex_edit
 (4), monitor (1), review_loop (1), interview (1) — Individually small, but collectively
 ~5K chars. Any of these unused?
 7. What's the actual per-tool definition size? — The tool JSON schema format forces each
 tool to repeat parameter descriptions. Should we measure actual bytes per tool rather
 than estimating?how 

================================================================================
# COMPONENT: system-prompt.ts (5,959 chars)
================================================================================

/**
 * System prompt construction and project context loading
 */

import { getDocsPath, getExamplesPath, getReadmePath } from "../config.js";
import { formatSkillsForPrompt, type Skill } from "./skills.js";

export interface BuildSystemPromptOptions {
	/** Custom system prompt (replaces default). */
	customPrompt?: string;
	/** Tools to include in prompt. Default: [read, bash, edit, write] */
	selectedTools?: string[];
	/** Optional one-line tool snippets keyed by tool name. */
	toolSnippets?: Record<string, string>;
	/** Additional guideline bullets appended to the default system prompt guidelines. */
	promptGuidelines?: string[];
	/** Text to append to system prompt. */
	appendSystemPrompt?: string;
	/** Working directory. Default: process.cwd() */
	cwd?: string;
	/** Pre-loaded context files. */
	contextFiles?: Array<{ path: string; content: string }>;
	/** Pre-loaded skills. */
	skills?: Skill[];
}

/** Build the system prompt with tools, guidelines, and context */
export function buildSystemPrompt(options: BuildSystemPromptOptions = {}): string {
	const {
		customPrompt,
		selectedTools,
		toolSnippets,
		promptGuidelines,
		appendSystemPrompt,
		cwd,
		contextFiles: providedContextFiles,
		skills: providedSkills,
	} = options;
	const resolvedCwd = cwd ?? process.cwd();
	const promptCwd = resolvedCwd.replace(/\\/g, "/");

	const date = new Date().toISOString().slice(0, 10);

	const appendSection = appendSystemPrompt ? `\n\n${appendSystemPrompt}` : "";

	const contextFiles = providedContextFiles ?? [];
	const skills = providedSkills ?? [];

	if (customPrompt) {
		let prompt = customPrompt;

		if (appendSection) {
			prompt += appendSection;
		}

		// Append project context files
		if (contextFiles.length > 0) {
			prompt += "\n\n# Project Context\n\n";
			prompt += "Project-specific instructions and guidelines:\n\n";
			for (const { path: filePath, content } of contextFiles) {
				prompt += `## ${filePath}\n\n${content}\n\n`;
			}
		}

		// Append skills section (only if read tool is available)
		const customPromptHasRead = !selectedTools || selectedTools.includes("read");
		if (customPromptHasRead && skills.length > 0) {
			prompt += formatSkillsForPrompt(skills);
		}

		// Add date and working directory last
		prompt += `\nCurrent date: ${date}`;
		prompt += `\nCurrent working directory: ${promptCwd}`;

		return prompt;
	}

	// Get absolute paths to documentation and examples
	const readmePath = getReadmePath();
	const docsPath = getDocsPath();
	const examplesPath = getExamplesPath();

	// Build tools list based on selected tools.
	// A tool appears in Available tools only when the caller provides a one-line snippet.
	const tools = selectedTools || ["read", "bash", "edit", "write"];
	const visibleTools = tools.filter((name) => !!toolSnippets?.[name]);
	const toolsList =
		visibleTools.length > 0 ? visibleTools.map((name) => `- ${name}: ${toolSnippets![name]}`).join("\n") : "(none)";

	// Build guidelines based on which tools are actually available
	const guidelinesList: string[] = [];
	const guidelinesSet = new Set<string>();
	const addGuideline = (guideline: string): void => {
		if (guidelinesSet.has(guideline)) {
			return;
		}
		guidelinesSet.add(guideline);
		guidelinesList.push(guideline);
	};

	const hasBash = tools.includes("bash");
	const hasGrep = tools.includes("grep");
	const hasFind = tools.includes("find");
	const hasLs = tools.includes("ls");
	const hasRead = tools.includes("read");

	// File exploration guidelines
	if (hasBash && !hasGrep && !hasFind && !hasLs) {
		addGuideline("Use bash for file operations like ls, rg, find");
	} else if (hasBash && (hasGrep || hasFind || hasLs)) {
		addGuideline("Prefer grep/find/ls tools over bash for file exploration (faster, respects .gitignore)");
	}

	for (const guideline of promptGuidelines ?? []) {
		const normalized = guideline.trim();
		if (normalized.length > 0) {
			addGuideline(normalized);
		}
	}

	// Always include these
	addGuideline("Be concise in your responses");
	addGuideline("Show file paths clearly when working with files");

	const guidelines = guidelinesList.map((g) => `- ${g}`).join("\n");

	let prompt = `You are an expert coding assistant operating inside pi, a coding agent harness. You help users by reading files, executing commands, editing code, and writing new files.

Available tools:
${toolsList}

In addition to the tools above, you may have access to other custom tools depending on the project.

Guidelines:
${guidelines}

Pi documentation (read only when the user asks about pi itself, its SDK, extensions, themes, skills, or TUI):
- Main documentation: ${readmePath}
- Additional docs: ${docsPath}
- Examples: ${examplesPath} (extensions, custom tools, SDK)
- When asked about: extensions (docs/extensions.md, examples/extensions/), themes (docs/themes.md), skills (docs/skills.md), prompt templates (docs/prompt-templates.md), TUI components (docs/tui.md), keybindings (docs/keybindings.md), SDK integrations (docs/sdk.md), custom providers (docs/custom-provider.md), adding models (docs/models.md), pi packages (docs/packages.md)
- When working on pi topics, read the docs and examples, and follow .md cross-references before implementing
- Always read pi .md files completely and follow links to related docs (e.g., tui.md for TUI API details)`;

	if (appendSection) {
		prompt += appendSection;
	}

	// Append project context files
	if (contextFiles.length > 0) {
		prompt += "\n\n# Project Context\n\n";
		prompt += "Project-specific instructions and guidelines:\n\n";
		for (const { path: filePath, content } of contextFiles) {
			prompt += `## ${filePath}\n\n${content}\n\n`;
		}
	}

	// Append skills section (only if read tool is available)
	if (hasRead && skills.length > 0) {
		prompt += formatSkillsForPrompt(skills);
	}

	// Add date and working directory last
	prompt += `\nCurrent date: ${date}`;
	prompt += `\nCurrent working directory: ${promptCwd}`;

	return prompt;
}



================================================================================
# COMPONENT: AGENTS-global.md (5,456 chars)
================================================================================

# Pi Agent Guidelines

Always read Pi's own docs first before guessing how Pi works. Docs are at `node_modules/@earendil-works/pi-coding-agent/docs/` under the npm global prefix (find it with `which pi`). When a user asks about Pi features, configuration, packages, skills, extensions, or behavior - or when you need that info for a task - `read` the relevant `.md` file instead of assuming. This is non-negotiable.

Behavioral guidelines to reduce common LLM coding mistakes. Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

You have access to many tools and skills. Leverage them

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Tool & Extension Discovery

Before installing anything or assuming a tool is missing, check what you already have.

1. Pi extensions ≠ MCP servers — Pi packages (`npm:pi-*`) integrate into Pi's native tool system. MCP servers are separate processes. Use `mcp()` only for MCP servers, not Pi extensions.
2. Use tools proactively — When a task involves choosing between options, gathering structured input, or presenting decisions, prefer purpose-built tools (like `interview`) over freeform chat.

## Before Installing Anything

Before running `npm install`, `npx`, `pip install`, or any package manager:

1. Review your available tools — You have built-in tools (read, bash, edit, write, web_search, web_fetch, interview, mcp, etc.). If a tool exists in your tool list, use it directly — don't reinstall its package.
2. Check installed extensions — `ls ~/.pi/agent/extensions/` shows what Pi packages are installed; check `node_modules`, or relevant package files. Packages extend built-in tools; they don't appear as MCP servers.
3. Avoid duplicate installs — if a package is in `settings.json` → `packages`, it's already loaded. Don't reinstall it.
4. Check if it's already a tool — review your available tools. Many Pi packages extend built-in tools (e.g., `pi-interview` → `interview` tool).

## Security 

 Pi's security layer intercepts write operation in Pi folder. Do not try to find workaround. Ask user, share comamand to run and explain purpose, risks if any. 

## Environment Map

- Pi config: `~/.pi/agent/` | Pi docs: npm global prefix → `node_modules/@earendil-works/pi-coding-agent/docs/`
- Pi extensions: `~/.pi/agent/extensions/` | Pi packages: see `settings.json` → `packages`
- Repos: `~/repos/` | GitHub: MaksimZinovev (gh CLI auth'd) | Default Model: `glm-5.1` via [Ollama Cloud](https://docs.ollama.com/cloud)

## User & Workspace

- Style: concise, casual, beginner-friendly, concrete examples, plain words over abstract terms. Work in small chunks, frequent feedback, wait for permission on major steps.
- Use `slop-scan scan .` to check JS/TS code for AI slop patterns before finalizing changes.
- NEVER delete silently content of files, especially code. If you think something should be removed, ask first. If you remove something, mention it explicitly in the file as summary of deletions.
- When you repeatedly fase blocking issues, errors, stop think, re-read this file, report back to user, suggest 2-3 solutions, wait for feedback.
- Help user learn - when giving user Bash commands, output concise meaning of each parameter and syntaxis. Explain complex parts in commands when they are present (current user level is 3/10 on a beinner - advanced scale).  



================================================================================
# COMPONENT: AGENTS-project.md (11,445 chars)
================================================================================

# Development Rules

## First Message
If the user did not give you a concrete task in their first message,
read README.md, then ask which module(s) to work on. Based on the answer, read the relevant README.md files in parallel.
- packages/ai/README.md
- packages/tui/README.md
- packages/agent/README.md
- packages/coding-agent/README.md
- packages/mom/README.md
- packages/pods/README.md
- packages/web-ui/README.md

## Code Quality
- No `any` types unless absolutely necessary
- Check node_modules for external API type definitions instead of guessing
- **NEVER use inline imports** - no `await import("./foo.js")`, no `import("pkg").Type` in type positions, no dynamic imports for types. Always use standard top-level imports.
- NEVER remove or downgrade code to fix type errors from outdated dependencies; upgrade the dependency instead
- Always ask before removing functionality or code that appears to be intentional
- Do not preserve backward compatibility unless the user explicitly asks for it
- Never hardcode key checks with, eg. `matchesKey(keyData, "ctrl+x")`. All keybindings must be configurable. Add default to matching object (`DEFAULT_EDITOR_KEYBINDINGS` or `DEFAULT_APP_KEYBINDINGS`)

## Commands
- After code changes (not documentation changes): `npm run check` (get full output, no tail). Fix all errors, warnings, and infos before committing.
- Note: `npm run check` does not run tests.
- NEVER run: `npm run dev`, `npm run build`, `npm test`
- Only run specific tests if user instructs: `npx tsx ../../node_modules/vitest/dist/cli.js --run test/specific.test.ts`
- Run tests from the package root, not the repo root.
- If you create or modify a test file, you MUST run that test file and iterate until it passes.
- When writing tests, run them, identify issues in either the test or implementation, and iterate until fixed.
- For `packages/coding-agent/test/suite/`, use `test/suite/harness.ts` plus the faux provider. Do not use real provider APIs, real API keys, or paid tokens.
- Put issue-specific regressions under `packages/coding-agent/test/suite/regressions/` and name them `<issue-number>-<short-slug>.test.ts`.
- NEVER commit unless user asks

## GitHub Issues
When reading issues:
- Always read all comments on the issue
- Use this command to get everything in one call:
  ```bash
  gh issue view <number> --json title,body,comments,labels,state
  ```

## OSS Weekend
- If the user says `enable OSS weekend mode until X`, run `node scripts/oss-weekend.mjs --mode=close --end-date=YYYY-MM-DD --git` with the requested end date
- If the user says `end OSS weekend mode`, run `node scripts/oss-weekend.mjs --mode=open --git`
- The script updates `README.md`, `packages/coding-agent/README.md`, and `.github/oss-weekend.json`
- With `--git`, the script stages only those OSS weekend files, commits them, and pushes them
- During OSS weekend, `.github/workflows/oss-weekend-issues.yml` auto-closes new issues from non-maintainers, and `.github/workflows/pr-gate.yml` auto-closes PRs from approved non-maintainers with the weekend message

When creating issues:
- Add `pkg:*` labels to indicate which package(s) the issue affects
  - Available labels: `pkg:agent`, `pkg:ai`, `pkg:coding-agent`, `pkg:mom`, `pkg:pods`, `pkg:tui`, `pkg:web-ui`
- If an issue spans multiple packages, add all relevant labels

When posting issue/PR comments:
- Write the full comment to a temp file and use `gh issue comment --body-file` or `gh pr comment --body-file`
- Never pass multi-line markdown directly via `--body` in shell commands
- Preview the exact comment text before posting
- Post exactly one final comment unless the user explicitly asks for multiple comments
- If a comment is malformed, delete it immediately, then post one corrected comment
- Keep comments concise, technical, and in the user's tone

When closing issues via commit:
- Include `fixes #<number>` or `closes #<number>` in the commit message
- This automatically closes the issue when the commit is merged

## PR Workflow
- Analyze PRs without pulling locally first
- If the user approves: create a feature branch, pull PR, rebase on main, apply adjustments, commit, merge into main, push, close PR, and leave a comment in the user's tone
- You never open PRs yourself. We work in feature branches until everything is according to the user's requirements, then merge into main, and push.

## Tools
- GitHub CLI for issues/PRs
- Add package labels to issues/PRs: pkg:agent, pkg:ai, pkg:coding-agent, pkg:mom, pkg:pods, pkg:tui, pkg:web-ui

## Testing pi Interactive Mode with tmux

To test pi's TUI in a controlled terminal environment:

```bash
# Create tmux session with specific dimensions
tmux new-session -d -s pi-test -x 80 -y 24

# Start pi from source
tmux send-keys -t pi-test "cd /Users/badlogic/workspaces/pi-mono && ./pi-test.sh" Enter

# Wait for startup, then capture output
sleep 3 && tmux capture-pane -t pi-test -p

# Send input
tmux send-keys -t pi-test "your prompt here" Enter

# Send special keys
tmux send-keys -t pi-test Escape
tmux send-keys -t pi-test C-o  # ctrl+o

# Cleanup
tmux kill-session -t pi-test
```

## Style
- Keep answers short and concise
- No emojis in commits, issues, PR comments, or code
- No fluff or cheerful filler text
- Technical prose only, be kind but direct (e.g., "Thanks @user" not "Thanks so much @user!")

## Changelog
Location: `packages/*/CHANGELOG.md` (each package has its own)

### Format
Use these sections under `## [Unreleased]`:
- `### Breaking Changes` - API changes requiring migration
- `### Added` - New features
- `### Changed` - Changes to existing functionality
- `### Fixed` - Bug fixes
- `### Removed` - Removed features

### Rules
- Before adding entries, read the full `[Unreleased]` section to see which subsections already exist
- New entries ALWAYS go under `## [Unreleased]` section
- Append to existing subsections (e.g., `### Fixed`), do not create duplicates
- NEVER modify already-released version sections (e.g., `## [0.12.2]`)
- Each version section is immutable once released

### Attribution
- **Internal changes (from issues)**: `Fixed foo bar ([#123](https://github.com/badlogic/pi-mono/issues/123))`
- **External contributions**: `Added feature X ([#456](https://github.com/badlogic/pi-mono/pull/456) by [@username](https://github.com/username))`

## Adding a New LLM Provider (packages/ai)

Adding a new provider requires changes across multiple files:

### 1. Core Types (`packages/ai/src/types.ts`)
- Add API identifier to `Api` type union (e.g., `"bedrock-converse-stream"`)
- Create options interface extending `StreamOptions`
- Add mapping to `ApiOptionsMap`
- Add provider name to `KnownProvider` type union

### 2. Provider Implementation (`packages/ai/src/providers/`)
Create provider file exporting:
- `stream<Provider>()` function returning `AssistantMessageEventStream`
- `streamSimple<Provider>()` for `SimpleStreamOptions` mapping
- Provider-specific options interface
- Message/tool conversion functions
- Response parsing emitting standardized events (`text`, `tool_call`, `thinking`, `usage`, `stop`)

### 3. Provider Exports and Lazy Registration
- Add a package subpath export in `packages/ai/package.json` pointing at `./dist/providers/<provider>.js`
- Add `export type` re-exports in `packages/ai/src/index.ts` for provider option types that should remain available from the root entry
- Register the provider in `packages/ai/src/providers/register-builtins.ts` via lazy loader wrappers, do not statically import provider implementation modules there
- Add credential detection in `packages/ai/src/env-api-keys.ts`

### 4. Model Generation (`packages/ai/scripts/generate-models.ts`)
- Add logic to fetch/parse models from provider source
- Map to standardized `Model` interface

### 5. Tests (`packages/ai/test/`)
Add provider to: `stream.test.ts`, `tokens.test.ts`, `abort.test.ts`, `empty.test.ts`, `context-overflow.test.ts`, `image-limits.test.ts`, `unicode-surrogate.test.ts`, `tool-call-without-result.test.ts`, `image-tool-result.test.ts`, `total-tokens.test.ts`, `cross-provider-handoff.test.ts`.

For `cross-provider-handoff.test.ts`, add at least one provider/model pair. If the provider exposes multiple model families (for example GPT and Claude), add at least one pair per family.

For non-standard auth, create utility (e.g., `bedrock-utils.ts`) with credential detection.

### 6. Coding Agent (`packages/coding-agent/`)
- `src/core/model-resolver.ts`: Add default model ID to `DEFAULT_MODELS`
- `src/cli/args.ts`: Add env var documentation
- `README.md`: Add provider setup instructions

### 7. Documentation
- `packages/ai/README.md`: Add to providers table, document options/auth, add env vars
- `packages/ai/CHANGELOG.md`: Add entry under `## [Unreleased]`

## Releasing

**Lockstep versioning**: All packages always share the same version number. Every release updates all packages together.

**Version semantics** (no major releases):
- `patch`: Bug fixes and new features
- `minor`: API breaking changes

### Steps

1. **Update CHANGELOGs**: Ensure all changes since last release are documented in the `[Unreleased]` section of each affected package's CHANGELOG.md

2. **Run release script**:
   ```bash
   npm run release:patch    # Fixes and additions
   npm run release:minor    # API breaking changes
   ```

The script handles: version bump, CHANGELOG finalization, commit, tag, publish, and adding new `[Unreleased]` sections.

## **CRITICAL** Tool Usage Rules **CRITICAL**
- NEVER use sed/cat to read a file or a range of a file. Always use the read tool (use offset + limit for ranged reads).
- You MUST read every file you modify in full before editing.

## **CRITICAL** Git Rules for Parallel Agents **CRITICAL**

Multiple agents may work on different files in the same worktree simultaneously. You MUST follow these rules:

### Committing
- **ONLY commit files YOU changed in THIS session**
- ALWAYS include `fixes #<number>` or `closes #<number>` in the commit message when there is a related issue or PR
- NEVER use `git add -A` or `git add .` - these sweep up changes from other agents
- ALWAYS use `git add <specific-file-paths>` listing only files you modified
- Before committing, run `git status` and verify you are only staging YOUR files
- Track which files you created/modified/deleted during the session

### Forbidden Git Operations
These commands can destroy other agents' work:
- `git reset --hard` - destroys uncommitted changes
- `git checkout .` - destroys uncommitted changes
- `git clean -fd` - deletes untracked files
- `git stash` - stashes ALL changes including other agents' work
- `git add -A` / `git add .` - stages other agents' uncommitted work
- `git commit --no-verify` - bypasses required checks and is never allowed

### Safe Workflow
```bash
# 1. Check status first
git status

# 2. Add ONLY your specific files
git add packages/ai/src/providers/transform-messages.ts
git add packages/ai/CHANGELOG.md

# 3. Commit
git commit -m "fix(ai): description"

# 4. Push (pull --rebase if needed, but NEVER reset/checkout)
git pull --rebase && git push
```

### If Rebase Conflicts Occur
- Resolve conflicts in YOUR files only
- If conflict is in a file you didn't modify, abort and ask the user
- NEVER force push

### User override
If the user instructions conflict with rules set out here, ask for confirmation that they want to override the rules. Only then execute their instructions.



================================================================================
# COMPONENT: SKILL-pi-config.md (3,716 chars)
================================================================================

---
name: pi-config
description: Configures pi coding agent with skills, templates, extensions, packages, and models. Use for composable development workflows, custom agents, and project-specific configurations.
---

# Pi Coding Agent

Composable terminal coding harness with skills, templates, extensions, and packages.

## Core Components

- Skills: Directory-based capability packages with instructions and optional tools
- Templates: Markdown snippets that expand into full prompts
- Extensions: TypeScript modules adding tools, commands, events, and TUI features
- Packages: Bundle resources for sharing via npm or git
- Models: Configure AI providers via `models.json`

## Loading Locations

| Resource   | Global                      | Project             | Package        |
| ---------- | --------------------------- | ------------------- | -------------- |
| Extensions | `~/.pi/agent/extensions/`   | `.pi/extensions/`   | `package.json` |
| Skills     | `~/.pi/agent/skills/`       | `.pi/skills/`       | `package.json` |
| Templates  | `~/.pi/agent/prompts/`      | `.pi/prompts/`      | `package.json` |
| Settings   | `~/.pi/agent/settings.json` | `.pi/settings.json` | N/A            |

Disable with `--no-extensions`, `--no-skills`, `--no-prompt-templates`.

## Session Management

- `/new` - Create fresh session
- `/resume` - Switch to existing session
- `/tree` - Navigate session tree
- `/export` - Export to HTML
- `/share` - Upload to GitHub gist
- `/compact` - Trigger compaction

## Model Management

- `/model` - Switch models
- `Ctrl+L` - Cycle through favorites
- `Ctrl+P` - Show favorites list

## Four Modes

Interactive (default): Full TUI experience
Print: Simple text output
JSON: Event stream for APIs
RPC: JSON-RPC protocol
SDK: Embed in applications

```bash
pi --mode json    # JSON mode
pi --mode rpc     # RPC mode
pi --mode sdk     # SDK mode
```

## Project Configuration

### AGENTS.md

Project instructions loaded at startup from `~/.pi/agent/AGENTS.md`, parent directories, and current directory.

### SYSTEM.md

Replace system prompt per-project at `~/.pi/agent/SYSTEM.md`.

### Settings

Configure resources in `~/.pi/agent/settings.json` or `.pi/settings.json`.

## Package Installation

Always before installation
- read package README
- check current system and environment
- stop and ask user before installing - "What is preferred installation method for packages?". And provide recommendation + reasoning; be concise, specific.   

```bash
# Install from npm (in most cases)
pi install npm:@foo/bar@1.2.3

# Install from git
pi install git:github.com/user/repo@v1

# Install to project
pi install -l npm:@foo/bar

# Remove package
pi remove npm:@foo/bar
```

## Model Configuration

Create `~/.pi/agent/models.json` for custom providers:

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "models": [
        {
          "id": "llama-3.1-8b",
          "name": "Llama 3.1 8B (Local)",
          "contextWindow": 128000,
          "maxTokens": 32000
        }
      ]
    }
  }
}
```

## Detailed Documentation

- Mistakes to Avoid — See [mistakes.md](./references/mistakes.md)
- Extensions: See [extensions.md](./references/extensions.md)
- Steering model: See [extensions.md](./references/extensions-steer-model.md)
- Skills: See [skills.md](./references/skills.md)
- Templates: See [templates.md](./references/templates.md)
- Packages: See [packages.md](./references/packages.md)
- Sessions: See [sessions.md](./references/sessions.md)
- Configuration: See [config.md](./references/config.md)
- TUI input/debugging: See [tui-input-debugging.md](./references/tui-input-debugging.md)



================================================================================
# TOTAL (text components only): 26,576 chars
================================================================================
