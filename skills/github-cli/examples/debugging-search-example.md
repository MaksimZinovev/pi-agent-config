# Debugging Search Example: LSP Server Initialization Failure

This example demonstrates a real-world debugging workflow using GitHub CLI to find community solutions.

## Problem Scenario

```
Error: LSP server failed to initialize
Total LSP servers loaded: 0
```

Local debugging approaches failed:
- Configuration files appear correct
- Plugin is installed
- No obvious errors in logs
- Standard troubleshooting steps didn't help

## Workflow: Finding Community Solutions

### Step 1: Use gh-debug-scan.sh for Multi-Source Search

```bash
$HOME/.claude/skills/github-cli/scripts/gh-debug-scan.sh "LSP server failed to initialize"
```

**Output:**
```
=== GitHub Community Debug Scan ===
Searching for: LSP server failed to initialize

[1/3] Searching issues...
#1234: LSP initialization fails [closed]
  https://github.com/example/vscode-extension/issues/1234
#5678: Zero LSP servers loaded [open]
  https://github.com/example/vscode-extension/issues/5678

[2/3] Searching gists...
abc123def LSP server patch
  Updated: 2025-12-15

[3/3] Searching discussions...
LSP server configuration guide
  https://github.com/example/org/discussions/90
```

### Step 2: View Issue Comments for Patches

```bash
gh issue view 1234 --json comments --jq '.comments[].body'
```

**Found in comments:**
```diff
diff --git a/src/client.js b/src/client.js
index 1234567..abcdefg 100644
--- a/src/client.js
+++ b/src/client.js
@@ -42,7 +42,7 @@ function initialize() {
-    return;
+    servers.push(new Server(options));
 }
```

### Step 3: Extract Patch

```bash
$HOME/.claude/skills/github-cli/scripts/gh-extract-patches.sh 1234
```

**Output:**
```
=== Extracting Patches from Issue #1234 ===

Found code patches:
----------------------------------------
diff --git a/src/client.js b/src/client.js
[...patch content...]
----------------------------------------

Patch saved to: patch-1234.diff
```

### Step 4: View Gist for Alternative Solution

```bash
gh gist view abc123def --raw
```

**Gist contains:** Alternative approach using different initialization pattern.

### Step 5: Apply Solution

```bash
# Apply the patch
git apply patch-1234.diff

# Or manually implement the fix based on gist
```

## Key Insights

1. **Escalation trigger worked**: Debug logs showing "0 servers" led to GitHub search
2. **Closed issues had solutions**: Solved issues often contain working patches
3. **Multiple solutions available**: Both issue patch and gist provided options
4. **Quick verification**: Patch was only 15 lines - easy to review and test

## Related Skills Used

- **systematic-debugging**: Identified "0 servers" as smoking gun
- **remembering-conversations**: Found prior similar debugging session
- **github-cli**: Used for multi-source community search and patch extraction

## Result

The root cause was an empty `initialize()` function that returned early. The community patch added the missing server initialization code, resolving the issue that had taken 6+ hours to debug locally.
