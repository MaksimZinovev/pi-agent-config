# Batch Operations

Administrative workflows for bulk GitHub operations. These patterns are useful for repository maintenance but less critical for debugging workflows.

## PR Label Management

### Add Label to Multiple PRs

```bash
# Add "needs-review" label to all open PRs
gh pr list --search "state:open" --json number --jq '.[].number' | \
    while read pr_number; do
        gh pr edit "$pr_number" --add-label "needs-review"
    done
```

### Remove Label from Multiple PRs

```bash
# Remove "wip" label from merged PRs
gh pr list --search "state:closed label:wip" --json number --jq '.[].number' | \
    while read pr_number; do
        gh pr edit "$pr_number" --remove-label "wip"
    done
```

### Batch Label by Search Criteria

```bash
# Label all PRs with "api" in title
gh pr list --search "state:open api" --json number --jq '.[].number' | \
    while read pr_number; do
        gh pr edit "$pr_number" --add-label "api-change"
    done
```

## Issue Management

### Bulk Close Stale Issues

```bash
# Close issues inactive for 30+ days
gh issue list --search "state:open updated:<30d" --json number --jq '.[].number' | \
    while read issue_number; do
        gh issue close "$issue_number" --comment "Auto-closing due to inactivity"
    done
```

### Add Comment to Multiple Issues

```bash
# Add status update to all open issues with "bug" label
gh issue list --search "state:open label:bug" --json number --jq '.[].number' | \
    while read issue_number; do
        gh issue comment "$issue_number" --body "Investigating this issue, updates coming soon."
    done
```

### Reopen Multiple Issues

```bash
# Reopen all issues closed in last week with "reopen" label
gh issue list --search "state:closed label:reopen updated:>7d" --json number --jq '.[].number' | \
    while read issue_number; do
        gh issue reopen "$issue_number"
    done
```

## CI Monitoring

### Monitor CI for All Open PRs

```bash
# Check CI status for all open PRs
gh pr list --state open --json number,headRefName --jq '.[] | "\(.number) \(.headRefName)"' | \
    while read -r number branch; do
        echo "Checking PR #$number ($branch)"
        RUN_ID=$(gh run list --branch="$branch" --limit 1 --json databaseId --jq '.[0].databaseId')
        if [ -n "$RUN_ID" ]; then
            STATUS=$(gh run view "$RUN_ID" --json conclusion --jq '.conclusion')
            echo "  CI Status: $STATUS"
        else
            echo "  No CI runs found"
        fi
    done
```

### Trigger Workflow on Multiple Repos

```bash
# Trigger CI workflow across multiple repos
for repo in owner/repo1 owner/repo2 owner/repo3; do
    echo "Triggering workflow on $repo"
    gh workflow run ci.yml --repo "$repo" --ref main
done
```

### Cancel All Pending Runs

```bash
# Cancel all workflow runs with "pending" status
gh run list --json databaseId,status --jq '.[] | select(.status == "pending") | .databaseId' | \
    while read run_id; do
        echo "Canceling run $run_id"
        gh run cancel "$run_id"
    done
```

## Repository Operations

### Batch Clone Repositories

```bash
# Clone all repos from an organization
gh repo list org-name --limit 100 --json name --jq '.[].name' | \
    while read repo_name; do
        echo "Cloning $repo_name"
        gh repo clone "org-name/$repo_name"
    done
```

### Add Team to Multiple Repositories

```bash
# Add team as collaborator to multiple repos
gh repo list owner --json name --jq '.[].name' | \
    while read repo_name; do
        echo "Adding team to $repo_name"
        gh api repos/owner/$repo_name/teams/team-name/slug --method PUT
    done
```

## Release Management

### Create Release Across Multiple Repos

```bash
# Create release with same tag across multiple repos
TAG="v1.2.3"
for repo in owner/repo1 owner/repo2; do
    echo "Creating release $TAG for $repo"
    gh release create "$TAG" --repo "$repo" --title "Release $TAG" --notes "Release notes"
done
```

### List Latest Releases from Multiple Repos

```bash
# Check latest releases for dependency updates
for repo in owner/repo1 owner/repo2 owner/repo3; do
    echo "Latest release for $repo:"
    gh release list --repo "$repo" --limit 1
done
```

## Comment Operations

### Find All Comments by User

```bash
# Find all issue/PR comments by specific user
USER="username"
gh issue list --search "commenter:$USER" --json number,title --jq '.[] | "#\(.number): \(.title)"'
gh pr list --search "commenter:$USER" --json number,title --jq '.[] | "#\(.number): \(.title)"'
```

### Bulk Delete Comments

```bash
# Delete bot comments (use with caution)
gh issue list --search "commenter:app/bot" --json number --jq '.[].number' | \
    while read issue_number; do
        # Get comment IDs and delete
        gh api repos/owner/repo/issues/$issue_number/comments --jq '.[].id' | \
            while read comment_id; do
                gh api /repos/owner/repo/issues/comments/$comment_id --method DELETE
            done
    done
```

## Automation Patterns

### Safe Batch Operations

Add confirmation prompts for destructive operations:

```bash
# Batch close with confirmation
gh issue list --search "state:open label:stale" --json number,title --jq '.[] | "\(.number) \(.title)"' | \
    while read -r number title; do
        echo "Close issue #$number: $title? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            gh issue close "$number"
        fi
    done
```

### Dry-Run Mode

Preview changes before executing:

```bash
# Preview label additions
gh pr list --search "state:open" --json number,title --jq '.[] | "#\(.number): \(.title) → add label: needs-review"'

# Execute after confirmation
# gh pr list --search "state:open" --json number --jq '.[].number' | ...
```

### Logging

Log batch operations for audit trail:

```bash
LOGFILE="batch-operations-$(date +%Y%m%d).log"

echo "[$(date)] Starting batch label operation" | tee -a "$LOGFILE"

gh pr list --search "state:open" --json number --jq '.[].number' | \
    while read pr_number; do
        echo "[$(date)] Adding label to PR #$pr_number" | tee -a "$LOGFILE"
        gh pr edit "$pr_number" --add-label "needs-review" 2>&1 | tee -a "$LOGFILE"
    done
```

## Best Practices

1. **Use search filters** - Target specific items to avoid unintended changes
2. **Dry-run first** - Preview matching items before executing
3. **Add confirmations** - Interactive prompts for destructive operations
4. **Log operations** - Maintain audit trail for batch changes
5. **Rate limiting** - Add delays between API calls to avoid hitting limits
6. **Error handling** - Continue on individual failures, report summary at end
