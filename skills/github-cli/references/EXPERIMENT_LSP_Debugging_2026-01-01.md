# Experiment: GitHub CLI Skill - Real-World LSP Debugging Test

**Date:** 2026-01-01
**Test Type:** Simulated real debugging scenario using github-cli skill
**Problem:** Claude Code LSP not working for TypeScript (v2.0.76)

---

## Problem Given to Agent

**Symptoms:**
- Error: "No LSP server available for file type: .ts"
- goToDefinition fails, hover fails, documentSymbol fails
- Debug logs show "0 pending" in LSP registry
- vtsls binary exists but LSP can't connect

**Environment:**
- Claude Code: v2.0.76 (npm-global)
- typescript-language-server: v5.1.3
- vtsls: v0.3.0
- Plugin: `vtsls@claude-code-lsps` v0.1.0

**Instructions:**
Use the github-cli skill to research potential solutions from GitHub community resources.
- DO NOT apply any changes - only research and report
- Provide proposed solution plan with confidence level
- DO NOT give obvious hints about cli.js patch

---

## Agent Performance Metrics

| Metric | Value |
|--------|-------|
| **Total Time** | ~3.5 minutes |
| **Tools Used** | 43 |
| **Tokens Used** | ~1.26M |
| **Status** | ✅ Completed successfully |

---

## What the Agent Discovered

### Root Cause Identified
- Race condition in LSP Manager initialization
- Last working version: v2.0.67
- Broken versions: v2.0.69-v2.0.76
- LSP Manager registers 0 servers before plugins finish loading

### Key GitHub Issues Found
- #13952 - Original race condition report
- #15168 - System-wide LSP failure (WSL2, v2.0.76)
- #15202 - Timing bug confirmed with debug logs
- #15531 - Multi-language LSP failure (PHP + TypeScript)
- #15914 - Windows-specific LSP failures

### Critical Solution Found: Community Patch Gist

**URL:** https://gist.github.com/Zamua/f7ca58ce5dd9ba61279ea195a01b190c

**What it does:**
- Patches the empty `initialize()` function in `cli.js`
- Uses JavaScript AST parsing (acorn) to find and patch the right functions
- Makes LSP Manager actually load and register servers from plugins

**Usage:**
```bash
curl -O https://gist.githubusercontent.com/Zamua/f7ca58ce5dd9ba61279ea195a01b190c/raw/apply-claude-code-2.0.76-lsp-fix.sh
chmod +x apply-claude-code-2.0.76-lsp-fix.sh
./apply-claude-code-2.0.76-lsp-fix.sh
```

### Alternative Solutions Proposed

1. **Community Patch Script** (HIGH Confidence) - Patch cli.js
2. **Downgrade to v2.0.67** (VERY HIGH Confidence) - Most stable
3. **Alternative LSP Plugin Markets** (MEDIUM Confidence) - Piebald-AI, ktnyt/cclsp

---

## Comparison with Actual Solution

The agent found the **exact same solution** that was previously documented:

| Finding | Agent Found | Actual Solution |
|---------|-------------|-----------------|
| Root Cause | Race condition in LSP Manager | ✅ Match |
| Critical Gist | f7ca58ce5dd9ba61279ea195a01b190c | ✅ Match |
| GitHub Issues | #13952, #15168, #15202, #15531, #15914 | ✅ Match |
| Broken Versions | v2.0.69-v2.0.76 | ✅ Match |
| Working Version | v2.0.67 | ✅ Match |
| Fix Location | cli.js initialize() function | ✅ Match |

---

## Skill Components Used

| Component | Used | Effectiveness |
|-----------|-------|---------------|
| `gh-debug-scan.sh` | ✅ 3 times | Found relevant issues quickly |
| `gh issue list` | ✅ Multiple | Searched Claude Code repo |
| `gh issue view` | ✅ Multiple | Examined specific issues |
| `gh api /repos/.../comments` | ✅ Multiple | Found patch mentions |
| `gh gist view` | ✅ Yes | Retrieved the actual patch |
| `gh search code` | ✅ Yes | Searched for vtsls references |
| `gh search repos` | ✅ Yes | Found community marketplaces |

---

## Research Timeline

| Time | Action |
|------|--------|
| 0:00 | Started, read github-cli skill docs |
| 0:30 | Ran gh-debug-scan.sh with 3 search terms |
| 1:00 | Found LSP issues in Claude Code repo |
| 1:30 | Viewing specific issues (15168, 15914, 15202) |
| 2:00 | Found gist f7ca58ce5dd9ba61279ea195a01b190c |
| 2:30 | Researched community marketplaces |
| 3:00 | Analyzing and compiling findings |
| 3:30 | Report complete |

---

## Agent's Confidence Assessments

| Solution | Confidence | Actual Accuracy |
|----------|-----------|-----------------|
| Community patch script | HIGH | ✅ Accurate - this was the actual fix |
| Downgrade to v2.0.67 | VERY HIGH | ✅ Accurate - most stable option |
| Alternative marketplaces | MEDIUM | ✅ Accurate - requires additional setup |

---

## Key Success Factors

1. **No hints were given** - Agent wasn't told about cli.js or the gist
2. **Multi-source search** - Cross-referenced issues, gists, repos, code
3. **Systematic approach** - Used skill's scripts before manual searching
4. **Found community patch** - The gist solved the problem completely

---

## Comparison: Manual Investigation vs. Skill-Assisted

| Aspect | Manual (from memory) | Skill-Assisted |
|--------|---------------------|----------------|
| Time Taken | 6+ hours | ~3.5 minutes |
| Sources Checked | Similar | Similar |
| Solution Found | Same gist | Same gist |
| Confidence | Post-hoc | Pre-apply |

**Speed improvement:** ~100x faster (6 hours → 3.5 minutes)

---

## Conclusion

The github-cli skill successfully solved a complex, multi-hour debugging problem in under 4 minutes by leveraging GitHub community resources. The agent:
1. Found the exact patch that fixed the issue
2. Identified multiple alternative solutions
3. Provided accurate confidence assessments
4. Required no prior knowledge of the solution

This demonstrates the skill's effectiveness for real-world debugging scenarios where community resources contain the solution.
