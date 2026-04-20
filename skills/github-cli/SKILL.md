---
name: github-cli
description: This skill should be used when searching GitHub issues, gists, and discussions for community-driven debugging solutions, error fixes, and patches. It covers GitHub CLI (gh) workflows for discovering community solutions, finding existing patches for common issues, searching issue comments for troubleshooting insights, and accessing code snippets from gists. Use when standard debugging approaches fail, when encountering errors that may have community solutions, when searching for existing patches or workarounds, when local grep/search returns 0 results, when debug logs show "0 items", "null", or empty arrays, when facing unfamiliar error codes or stack traces, when troubleshooting Claude Code customization, setup, optimization, or issues, or when leveraging GitHub's collective knowledge for troubleshooting.
---

# GitHub CLI

## Quick Start

**Prerequisites:**
- Install `gh` CLI: `brew install gh` (macOS) or https://cli.github.com/
- Authenticate with read-write scope: `gh auth login --scopes repo,workflow`
- Verify: `gh auth status`

**Core debugging pattern:** Search GitHub community resources when local debugging fails.

Example operations:
- Search issues for error solutions: `gh issue list --search "error message"`
- Find gists with code snippets: `gh gist list --search "language:python pattern"`
- View issue comments for patches: `gh issue view 123 --json comments --jq '.comments[].body'`

## When to Use This Skill

**Escalation Triggers:**
- Local grep/search returns 0 results
- Debug logs show "0 items", "null", or empty arrays
- Unfamiliar error codes or stack traces
- Standard troubleshooting fails

**Debugging Stack:**
1. Local investigation (systematic-debugging skill)
2. Community resources (github-cli skill) ← You are here
3. External docs (web-search, research-docs-grounding)

## Debugging with GitHub Community

### When to Search GitHub Community

**Escalation triggers** - search GitHub community sources when:
- Local code search returns 0 results
- Stack traces contain unfamiliar error codes
- Documentation search yields no matches
- Debug logs show "unknown", "undefined", "null", or zero-count results
- Standard troubleshooting approaches fail

### Search Issues for Error Solutions

Search for existing issues with the same error:

```bash
# Search by error message
gh issue list --search "error: failed to initialize"

# Search in specific repository
gh issue list --repo owner/repo --search "authentication failed"

# Search closed issues (solutions often there)
gh issue list --search "error message" --state closed --limit 20

# Search issue comments for solutions
gh issue view 123 --json comments --jq '.comments[] | select(.body | contains("solution") or contains("fix") or contains("patch")) | .body'
```

### Find Patches in Issue Comments

Extract code patches from issue discussions:

**Use the extraction script:**
```bash
~/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL
```
This automatically extracts diff/patch blocks from comments.

**Manual extraction:**
```bash
# View all comments for an issue
gh issue view ISSUE_URL --json comments --jq '.comments[].body'

# Extract diff/patch blocks from comments
gh issue view ISSUE_URL --json comments --jq '.comments[].body' | \
  grep -A 20 '```diff' | grep -B 5 '```'
```

### Search Gists for Code Snippets

Gists often contain community patches and workarounds not in official docs:

```bash
# Search gists by query
gh gist list --search "lsp server configuration"

# Search by language
gh gist list --search "language:typescript error handler"

# View gist content
gh gist view GIST_ID

# Get raw content for patching
gh gist view GIST_ID --raw > patch.diff

# Clone gist for local review
gh gist clone GIST_ID

# Use bundled script for comprehensive gist search
$HOME/.claude/skills/github-cli/scripts/gh-gist-finder.sh "error pattern" "python"
```

### Multi-Source Community Scan

Search all GitHub community sources at once:

```bash
# Use bundled script for comprehensive search
$HOME/.claude/skills/github-cli/scripts/gh-debug-scan.sh "TypeError: Cannot read property"

# Manually search all sources
ERROR="your error message"
gh issue list --search "$ERROR" --state all --limit 20
gh gist list --search "$ERROR"
gh search code "$ERROR" --limit 20
# Note: Use gh api for advanced queries (e.g., /repos/{owner}/{repo}/discussions)
```

## Quick Debug Commands

One-liners for fast investigation:

```bash
# Check if issue exists for your error
gh issue list --search "error message" --state all --limit 5

# Find gists with code snippets
gh gist list --search "pattern" --limit 5

# Search issue comments for "patch" or "fix"
gh api /repos/owner/repo/issues/comments --jq '.[] | select(.body | test("patch|fix"))'
```

### CI Failure Investigation

When CI fails with known errors:

```bash
# Get failure logs
gh run view RUN_ID --log

# Extract error signature
gh run view RUN_ID --log | grep -i "error:" | head -1

# Search for related issues
gh issue list --search "ci failure error signature"

# Check workflow runs for similar failures
gh run list --workflow=WORKFLOW_NAME --json conclusion,title

# Find patches in related issues
$HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL
```

## Integration with Other Skills

### Remembering-Conversations Coordination

Before executing GitHub searches for debugging:

1. Use `remembering-conversations` skill to find prior discussions about the error
2. Extract search terms, repo names, and successful solutions from conversation history
3. Combine conversation insights with GitHub search

```bash
# Example workflow combining skills
# 1. Search conversations first
~/.claude/skills/remembering-conversations/tool/search-conversations "LSP error"

# 2. Use insights from conversations to refine GitHub search
# If conversation mentioned "typescript-language-server", target that repo:
gh issue list --repo microsoft/vscode --search "LSP initialization failed"
```

**For detailed coordination patterns:** See `references/skill-coordination.md`

### Debugging Skill Stack

Use skills in layered approach:

1. **Layer 1: Local Investigation**
   - Use code-search for local codebase
   - Use systematic-debugging for log analysis

2. **Layer 2: Community Resources** (trigger: zero local results)
   - Use `github-cli` to search issues/gists
   - Use `remembering-conversations` for prior context

3. **Layer 3: External Resources**
   - Use web-search for documentation
   - Use `github-cli` for finding repos with similar solutions

## Core Operations

### Authentication & Configuration

**Required scope for this skill:**

```bash
gh auth login --scopes repo,workflow
```

Verify authentication:
```bash
gh auth status
```

**Check authentication before operations:**

```bash
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated. Run 'gh auth login' first."
    exit 1
fi
```

### Repository Management

**View repository info:**
```bash
gh repo view
gh repo view owner/repo
```

**Clone repository:**
```bash
gh repo clone owner/repo && cd owner/repo
```

### Issue & PR Operations

**List and view:**
```bash
gh issue list --limit 50 --state all
gh pr list --state open --limit 20
gh issue view 123
gh pr view 456
```

**Create:**
```bash
gh issue create --title "Bug description" --body "Steps to reproduce..."
gh pr create --base main --title "Fix bug" --body "Description"
```

**Search with filters:**
```bash
gh pr list --search "state:open label:bug"
gh issue list --search "state:open label:enhancement"
```

## CI/CD with GitHub Actions

### Basic Workflow Operations

**List and view runs:**
```bash
gh run list --limit 10
gh run view 456 --log
```

**Trigger workflow:**
```bash
gh workflow run ci.yml --ref main
```

**Monitor runs:**
```bash
gh run watch 456 --exit-status
```

**List workflows:**
```bash
gh workflow list
gh workflow view ci.yml
```

## Advanced Features

### GitHub API Access

**Query API directly:**
```bash
gh api /repos/:owner/:repo/pulls
gh api /user/repos --jq '.[].name'
```

**Pagination:**
```bash
gh api /repos/owner/repo/issues --paginate --jq '.[].title'
```

### Search & Filtering

**Search code:**
```bash
gh search code "query" --repo owner/repo
```

**Search issues:**
```bash
gh issue list --search "state:open label:bug"
gh issue list --search "mentions:@me"
```

### Secret Management

```bash
gh secret list
echo "value" | gh secret set SECRET_NAME
gh secret remove SECRET_NAME
```

## Common Debugging Workflow

### Feature Branch PR Creation

```bash
# Ensure branch is up to date
git fetch origin main
git rebase origin/main

# Create PR
gh pr create \
    --base main \
    --title "Feature: Add user authentication" \
    --body "Closes #123. Implements OAuth2 flow."
```

**For advanced workflows:** See `references/advanced-workflows.md`

## Troubleshooting

### Systematic Debugging

**1. Check Installation:**
```bash
gh --version
```

**2. Verify Authentication:**
```bash
gh auth status
```

Expected output:
- ✓ Logged in to github.com
- ✓ GitHub account: <username>
- ✓ Token scopes: repo, workflow

**3. Test Basic Commands:**
```bash
gh repo view
gh issue list --limit 1
gh api /user
```

**4. Check Permissions:**
```bash
gh auth token
gh auth refresh --scopes repo,workflow
```

### Common Error Patterns

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `gh: command not found` | Not in PATH | Install via Homebrew: `brew install gh` |
| `401 Unauthorized` | Token expired | Run `gh auth login` |
| `GraphQL: Resource not found` | Invalid repo/owner format | Use `OWNER/REPO` format |
| `Your token has not been granted` | Missing scopes | Re-auth with `--scopes repo,workflow` |
| `Could not resolve to a Repository` | Repo access issue | Verify permissions and repo exists |

### Silent Debugging Pattern

Wrap `gh` commands for error handling:

```bash
# Function to run gh commands with error handling
gh_silent() {
    output=$(gh "$@" 2>&1)
    exit_code=$?

    if [ $exit_code -ne 0 ]; then
        echo "Error: gh $*"
        echo "$output"
        exit $exit_code
    fi

    echo "$output"
}

# Usage
gh_silent pr create --title "Test" --body "Body"
```

### Enable Debug Mode

```bash
# Enable verbose output
GH_DEBUG=1 gh <command>

# View exit codes
echo $?  # After any gh command
# 0 = success, 1 = general error, 4 = auth required, 5 = not found
```

## Examples Directory

Tested, executable scripts in `examples/`:

- **create_pr_from_branch.sh**: Quick PR creation from current branch
- **list_prs_by_status.sh**: List PRs with state filtering
- **run_workflow.sh**: Trigger GitHub Actions workflow

### Asset Validation

Test each example script:

```bash
# Test PR listing (read-only, safe)
cd /path/to/repo
$HOME/.claude/skills/github-cli/examples/list_prs_by_status.sh open

# Test workflow trigger (requires workflow file)
$HOME/.claude/skills/github-cli/examples/run_workflow.sh ci.yml main
```

Scripts use portable paths (`$HOME`) and validate prerequisites before execution.

## Scripts Directory

Utility scripts in `scripts/` for debugging workflows:

- **gh-debug-scan.sh**: Multi-source GitHub search for error solutions
- **gh-extract-patches.sh**: Extract code patches from issue comments
- **gh-gist-finder.sh**: Search gists for code snippets by language/pattern

### Script Usage

```bash
# Comprehensive community scan
$HOME/.claude/skills/github-cli/scripts/gh-debug-scan.sh "error message"

# Extract patches from issue
$HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh ISSUE_URL

# Find code snippets in gists
$HOME/.claude/skills/github-cli/scripts/gh-gist-finder.sh "pattern" "language"
```

**For advanced administrative operations:** See `references/batch-operations.md`

## References

Additional documentation in `references/`:

- **skill-coordination.md**: Patterns for combining skills
- **advanced-workflows.md**: Complex GitHub workflows
- **github-cli-commands.md**: Complete command reference
- **batch-operations.md**: Batch updates and bulk operations (PR labels, issue management)
