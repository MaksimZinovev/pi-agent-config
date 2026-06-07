# Pi Agent Guidelines

Always read Pi's own docs first before guessing how Pi works. Docs are at `node_modules/@earendil-works/pi-coding-agent/docs/` under the npm global prefix (find it with `which pi`). When a user asks about Pi features, configuration, packages, skills, extensions, or behavior - or when you need that info for a task - `read` the relevant `.md` file instead of assuming. This is non-negotiable.
You have access to many tools and skills. Leverage them

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State assumptions explicitly. If uncertain, ask.
- Multiple interpretations? Present them — don't pick silently.
- Simpler approach exists? Say so. Push back when warranted.
- Unclear? Stop. Name it. Ask.

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
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Tool & Extension Usage and Discovery

 Code exploration hierarchy — use the best tool first

- cx/ck  - command line tools. ALWAYS assume they are installed. If issues → stop, inform user, wait for feedback.
- IMPORTANT! The system prompt says "prefer grep/find/ls over bash" — this is still correct as a fallback hierarchy, but cx/ck should be tried first for code exploration
- Indexed dir (git root): `cx` → `ck` → `ast_grep` → `read`. Never `grep`/`find` as first method when cx/ck are available and indexed.
- Non-indexed dir: `ck` → `ast_grep` → `read`. Never `grep`/`find` as first method when cx/ck are available and indexed.
- Use relative paths from project root (e.g. `cx overview apps/cli/src/auto.ts`).
- Before editing: `cx definition --name X` gives exact text for Edit's `old_string`.
- Fallback to `read` only when you need full file or context beyond symbol body.
- New codebase: `cx overview .` first, then drill in.
- Deeper tool details: see `AGENTS_TOOLING.md`.
- When an extension blocks a tool call, follow the block message immediately. Blocked = dead end. Don't circumvent with alternative tools.

On 2+ repeating failures, auto-invoke `systematic-debugging` skill.
---

## Before Installing Anything

Before installing anything or assuming a tool is missing, check what you already have.

   1. Tool exists in tool list? Not in the list? Tried to search tool and found? Use it directly — don't reinstall its package.
   2. Package in `settings.json` → `packages`? Already loaded.
   3. Pi extensions ≠ MCP servers. Pi packages (`npm:pi-*`) integrate natively. `mcp()` is for MCP servers only.
   4. Use tools proactively — When a task involves choosing between options, gathering structured input, or presenting decisions, prefer purpose-built tools (like `interview`) over freeform chat.
   5. Check if it's already a tool. Many Pi packages extend built-in tools (e.g., `pi-interview` → `interview` tool).

## Skills

- Use skills proactively without asking.
- Apply relevant skills as needed — don't wait for permission.
- If you encounter repeating failures or errors (2 or more), immediately use skill: systematic-debugging.

## Security 

 Pi's security layer intercepts write operation in Pi folder. Do not try to find workaround. Ask user, share command to run and explain purpose, risks if any. 

## Environment Map

- Pi config: `~/.pi/agent/` | Pi docs: npm global prefix → `node_modules/@earendil-works/pi-coding-agent/docs/`
- Default locations are symlinked 
  - Pi extensions: `~/.pi/agent/extensions/` =>  `/Users/maksim/repos/pi-agent-config/extensions` 
  - Pi packages:  `~/.pi/agent/settings.json` → `packages` => `Users/maksim/repos/pi-agent-config/settings.json`
  - Pi skills:  `~/.pi/agent/skills` => `Users/maksim/repos/pi-agent-config/skills`
- Default location for repos: `Users/maksim/repos/` | GitHub: MaksimZinovev (gh CLI auth'd) | Default Model: `glm-5.1` via [Ollama Cloud](https://docs.ollama.com/cloud)

## User & Workspace

- Style: concise, casual, beginner-friendly, concrete examples, plain words over abstract terms. Work in small chunks, frequent feedback, wait for permission on major steps.
- Use `slop-scan scan .` cli to check JS/TS code for AI slop patterns before finalizing changes.
- NEVER delete silently content of files, especially code. If you think something should be removed, ask first. If you remove something, mention it explicitly in the file as summary of deletions.
- Help user learn - when giving user Bash commands, output concise meaning of each parameter and syntax. Explain complex parts in commands when they are present (current user level is 3/10 on a beinner - advanced scale).  

IMPORTANT! The system prompt says "prefer grep/find/ls over bash" — this is still correct as a fallback hierarchy, but cx/ck should be tried first for code exploration

If you read these instructions. Append to your first response: "✅ Read AGENTS.md: success."
