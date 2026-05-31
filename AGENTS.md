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
