# Skill Coordination Patterns

This document provides patterns for combining `github-cli` with other skills for effective debugging workflows.

## Debugging Skill Stack

Use skills in a layered approach based on escalation triggers:

### Layer 1: Local Investigation

**Trigger:** Start here for any debugging task.

**Skills to use:**
- `code-search` or `Grep` - Search local codebase for error-related code
- `systematic-debugging` - Four-phase debugging framework
- `root-cause-tracing` - Trace bugs backward through call stack

**Escalate to Layer 2 when:**
- Local search returns 0 results
- Error source is unclear
- Issue appears to be in external dependencies

### Layer 2: Community Resources

**Trigger:** Zero local results or unfamiliar error codes.

**Skills to use:**
- `remembering-conversations` - Search prior discussions for similar issues
- `github-cli` - Search issues, gists, discussions for solutions

**Workflow:**
```bash
# 1. Search conversations first
~/.claude/skills/remembering-conversations/tool/search-conversations "error pattern"

# 2. Extract insights from conversations (repo names, successful solutions)

# 3. Use insights to refine GitHub search
gh issue list --repo REPO_FROM_CONVERSATION --search "error from step 1"

# 4. Extract patches from issue comments
$HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL
```

**Escalate to Layer 3 when:**
- No GitHub solutions found
- Need latest documentation
- Error is in third-party tools

### Layer 3: External Resources

**Trigger:** Community resources exhausted.

**Skills to use:**
- `web-search` or `research-docs-grounding` - Documentation search
- `github-cli` - Find repos implementing similar functionality
- `cli-tool-discovery` - Identify relevant debugging tools

**Workflow:**
```bash
# 1. Search official documentation
# Use web-search skill

# 2. Find repos with similar implementations
gh search code "function pattern" --language LANGUAGE

# 3. Cross-reference with GitHub issues
gh issue list --repo FOUND_REPO --search "similar error"
```

## Specific Coordination Patterns

### Pattern 1: LSP/Editor Configuration Debugging

**When:** Editor extensions, language servers fail.

**Skill combination:**
1. `systematic-debugging` - Analyze debug logs for "0 server" or empty results
2. `remembering-conversations` - Find prior LSP troubleshooting sessions
3. `github-cli` - Search extension repo for known issues and patches
4. `github-gist-searcher` - Find community config snippets

**Example:**
```bash
# Debug logs show "0 LSP servers loaded"
# Escalate to GitHub community search
$HOME/.claude/skills/github-cli/scripts/gh-debug-scan.sh "LSP initialization failed"

# Prior conversation mentioned specific extension
gh issue list --repo that-extension/repo --search "initialization"
```

### Pattern 2: CI/CD Failure Investigation

**When:** GitHub Actions workflows fail.

**Skill combination:**
1. `verification-before-completion` - Get CI failure logs
2. `github-cli` - Search for related CI failures
3. `github-cli` - Extract patches from issue comments
4. `condition-based-waiting` - Fix flaky CI tests

**Example:**
```bash
# Get failure logs
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view "$RUN_ID" --log

# Extract error signature
ERROR=$(gh run view "$RUN_ID" --log | grep -i "error:" | head -1)

# Search for related issues
gh issue list --search "$ERROR label:ci"

# Find patches in related issues
$HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL
```

### Pattern 3: Dependency Resolution

**When:** Package/module conflicts occur.

**Skill combination:**
1. `systematic-debugging` - Identify conflicting package
2. `github-cli` - Search package repo for version conflicts
3. `github-cli` - Find gists with resolution patterns
4. `web-search` - Check official docs for deprecation notices

**Example:**
```bash
# Identify problematic dependency
# Then search package repository
gh issue list --repo PACKAGE_REPO --search "version conflict MODULE_NAME"

# Find community workarounds in gists
$HOME/.claude/skills/github-cli/scripts/gh-gist-finder.sh "MODULE_NAME downgrade" "javascript"
```

### Pattern 4: Claude Code Setup Issues

**When:** Claude Code configuration, hooks, or plugins fail.

**Skill combination:**
1. `silent-hook-debugging` - Check hook execution
2. `remembering-conversations` - Find prior Claude Code setup discussions
3. `github-cli` - Search Claude Code repo and plugin repos
4. `github-cli` - Find gists with working configurations

**Example:**
```bash
# Search prior conversations about Claude Code setup
~/.claude/skills/remembering-conversations/tool/search-conversations "hook not executing"

# Search Claude Code repository
gh issue list --repo anthropics/claude-code --search "hook configuration"

# Find community configuration gists
$HOME/.claude/skills/github-cli/scripts/gh-gist-finder.sh "claude-code hook" "yaml"
```

## Escalation Decision Tree

```
Start Debugging
      |
      v
Local code search fails? ----No----> Implement solution locally
      |
      Yes
      v
Check prior conversations (remembering-conversations)
      |
      Relevant discussion found? ----Yes----> Apply solution from history
      |
      No
      v
Search GitHub community (github-cli)
      |
      Solution found? ----Yes----> Extract and apply patch
      |
      No
      v
Search external docs (web-search, research-docs-grounding)
      |
      Solution found? ----Yes----> Implement based on docs
      |
      No
      v
Consider: Root cause may be unique/new
      |
      Create GitHub issue or discussion
```

## Best Practices

1. **Always search conversations first** - Prior solutions often work
2. **Search closed issues** - Solved issues contain patches
3. **Check gists for workarounds** - Community solutions often there
4. **Document found solutions** - Add to REQUESTS.md for skill creation
5. **Cross-reference sources** - Issue may link to gist with better solution
6. **Verify patch safety** - Review code before applying extracted patches
