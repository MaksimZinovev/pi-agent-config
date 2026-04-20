#!/usr/bin/env bash
# Create a GitHub pull request from the current branch
# Usage: ./create_pr_from_branch.sh <base-branch> <title>
# Example: ./create_pr_from_branch.sh main "Add new feature"

set -e

BASE_BRANCH="${1:-main}"
PR_TITLE="${2:-Update from $(git branch --show-current)}"
CURRENT_BRANCH=$(git branch --show-current)

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

# Create PR
echo "Creating PR from $CURRENT_BRANCH to $BASE_BRANCH..."
gh pr create \
    --base "$BASE_BRANCH" \
    --title "$PR_TITLE" \
    --body "Automated PR creation from $CURRENT_BRANCH"

echo "✅ PR created successfully!"
