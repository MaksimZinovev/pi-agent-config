#!/usr/bin/env bash
# Trigger a GitHub Actions workflow
# Usage: ./run_workflow.sh <workflow-name> [branch]
# Example: ./run_workflow.sh ci.yml main

set -e

WORKFLOW_NAME="${1}"
BRANCH="${2:-main}"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI is not installed. Install from https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub. Run 'gh auth login' first."
    exit 1
fi

if [ -z "$WORKFLOW_NAME" ]; then
    echo "Error: Workflow name is required"
    echo "Usage: $0 <workflow-name> [branch]"
    echo "Example: $0 ci.yml main"
    exit 1
fi

echo "Triggering workflow: $WORKFLOW_NAME on branch: $BRANCH"
echo "---"

# Trigger workflow
RUN_ID=$(gh workflow run "$WORKFLOW_NAME" --ref "$BRANCH" --json runId --jq '.runId')

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
    echo "❌ Failed to trigger workflow"
    exit 1
fi

echo "✅ Workflow triggered successfully!"
echo "Run ID: $RUN_ID"
echo ""
echo "View status with: gh run view $RUN_ID"
echo "Watch logs with: gh run watch $RUN_ID"
