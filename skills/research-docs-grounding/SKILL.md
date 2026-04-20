---
description: Gathers minimal evidence (Doc Pack + local repo signals) and summarizes it as an Evidence Pack. Use when coding, analysis, docs, or CI behavior is uncertain and you need sources before deciding next steps. Use when user asks, you or subagents have general questions related to confguration, installation, customization, troubleshooting errors, investigating potential issues. Use when you or subagents guessed and failed to resolve the issue after 2 attempts. USe when you notice repeated patterns in conversation messages, your or subagent thinking, examples "returning 0 items", "having issues with", "not found", "Error Exit code", "weird", "strange", "parse error", "error message", "confusing", "critical", "inconsistency"
name: research-docs-grounding
allowed-tools: Bash, Read, Grep, Glob
---

# Research Documentation, Evidence Grounding

Comprehensive skill for researching documentation and providing reliable, evidence-based guidance on coding, automation , AI, other topics using allowed tools, filesystem MCP, search across local documentation, search web sources using Context7 tools, web search. The result should be optimized to avoid mistakes and guess work in the next phases, include  code snippets, examples when needed, reference links. 

This document is optimized for progressive disclosure. You should be able to find key commands and examples below. Read, explore referenced documents, tools only when you need them. You MUST focus on your main task and instructions. If you faced immediate blocker and was not able to resolve after 1st attempt, then stop and let user know

**Announce at start:** "I'm using research-doc-grounding skill to gather minimal evidence." All mentioned tools by default available, no configuration needed.

## Scope

Evidence-only: produce an Evidence Pack + recommended next action. Do not edit code/config/docs.

## Quick start

Skill and scripts are typically located in `$HOME/.claude/skills/research-docs-grounding`. Check `$HOME/.claude/plugins` if not in skills.
Available

```bash
cd $LLMSTXT_HOME     # always start by checking available local documentation
tree -L 1            # Buse ash, Read, Grep, Glob or Filesystem MCP as needed
# Available topics:
.
├── circleci
├── claude-code
├── github
└── tmux-cli

# mcporter is your best friend, CLI tool generated via [mcporter](https://github.com/steipete/mcporter) from the Context MCP server
# 1) resolve library name first => 2) fetch documentation => 3) adjust query if needed, iterate
mcporter call "context7.resolve-library-id(query: "config validate", libraryName: "playwright")"    # step 1

# Output (truncated):
----------
- Title: Playwright
- Context7-compatible library ID: /microsoft/playwright
- Description: Playwright is a framework for Web Testing and Automation, enabling cross-browser testing of Chromium, Firefox, and WebKit with a single API.
- Code Snippets: 3711
- Source Reputation: High
- Benchmark Score: 80.6
- Versions: v1.51.0
----------
- Title: Playwright
- Context7-compatible library ID: /microsoft/playwright.dev
- Description: Playwright is a cross-browser automation library that enables reliable end-to-end testing for web applications across Chromium, Firefox, and WebKit.
- Code Snippets: 13277
- Source Reputation: High
- Benchmark Score: 66.8
----------

mcporter call 'context7.query-docs(query: "validate", libraryId: "/microsoft/playwright")'       # step 2
# Output (truncated):                v24.0.2
### Validate Element Text with Web-First Assertions in Playwright

Source: https://github.com/microsoft/playwright/blob/main/docs/src/release-notes-js.md

mcporter call 'context7.query-docs(query: "validate", libraryId: "/microsoft/playwright", page: "2")'      # # step 3: if the context is not sufficient, * try page=2, page=3, page=4, etc. with the same topic
mcporter call 'context7.query-docs(query: "validate", libraryId: "/microsoft/playwright", mode: "code")'   # Documentation mode: 'code' for API references and code examples (default), 'info' for * conceptual guides, narrative information, and architectural questions
mcporter call 'context7.query-docs(query: "validate", libraryId: "/microsoft/playwright", topic: "hooks")'   # Topic to focus documentation on (e.g., 'hooks', 'routing')

Demonstrates using Playwright's `expect().toHaveText()` ...

# to avoid guessing
mcporter list
mcporter list <server> --schema
```

Embedded tools - resolve-library-id - Resolves a package/product name to a Context7-compatible library ID and returns a list of matching libraries.

You MUST call this function before 'get-library-docs' to obtain a valid Context7-compatible library ID UNLESS the user explicitly provides a library ID in the format '/org/project' or '/org/project/version' in their query.

Selection Process:

In most cases prioritize this order:
local sarch in $LLMSTXT_HOME => context7 => web search 

1. Analyze the query to understand what library/package the user is looking for
2. When ther request is too amgbiguous, unclear, pause and ask for clarifications
3. Return the most relevant match based on:

- Name similarity to the query (exact matches prioritized)
- Description relevance to the query's intent
- Documentation coverage (prioritize libraries with higher Code Snippet counts)
- Trust score (consider libraries with scores of 7-10 more authoritative)

Response Format:

- Return the selected library ID in a clearly marked section
- Provide a brief explanation for why this library was chosen
- If multiple good matches exist, acknowledge this but proceed with the most relevant one
- If no good matches exist, clearly state this and suggest query refinements

## Defaults (tight)

- Start with page=1
- Max 3 Doc Pack runs per question
- Prefer short quotes/claims; never paste long docs
- Clearly state when there is insufficient evidence, gaps.

## Workflow

1. Define the unknown in 1 sentence (what must be true to proceed?)
2. Break it down into meaningful keywords. Add synonyms, keywords to improve semantic search 
3. Use keywords to build queries. 
4. Try local search when relevant local documentation is available 
5. Run Doc Pack page=1 (mode=info unless code is explicitly needed)
6. If still unclear: refine topic (keyword-level) or switch mode (info ↔ code); rerun (<=2 more)
7. Cross-check locally if helpful (Grep/Read/Glob for config/docs/tests/logs)
8. Write Evidence Pack (<=8 bullets) + “Next action” (ask user to verify, or propose options)


## Progressive disclosure

- Only go to page=2+ after two page=1 attempts fail for a specific missing detail
- Fetch more evidence only to close a named gap, not “just in case”

## Evidence Pack (template)

- Claim:
- Source: (Web url, Doc Pack section/title OR local file path + line hint)
- Code snippets or citations
- Confidence: 0–1
- Implication:
- Missing observation / verification needed:

## Stop conditions

- If evidence is insufficient: ask for the exact missing observation (command output, log, file snippet), clarification or request help from user
- If sources conflict: record both claims + propose a single discriminating check
- If you were not able to use the `scripts/research-docs-grounding.sh`

## Examples of good topics

- CI: "CircleCI BASH_ENV loading order for dotenv"
- Tests: "Playwright request abort status handling"
- Docs: "How to structure SKILL.md frontmatter constraints"

## Don’ts

- Don’t claim you read a URL unless it came from Doc Pack output
- Don’t infer runtime results without a log/trace/config snippet
- Don’t propose a diff; propose verification + decision options instead
