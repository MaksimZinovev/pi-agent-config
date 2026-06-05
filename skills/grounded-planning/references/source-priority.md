# Source Priority Details

Detailed instructions for each evidence source. Read this only when you need specifics for a source you're about to use.

## Context7 (Library Docs)

### Workflow

1. **Resolve** the library ID first:
```bash
mcporter call 'context7.resolve-library-id(query: "your topic", libraryName: "library-name")'
```

2. **Query** docs using the resolved ID:
```bash
mcporter call 'context7.query-docs(query: "your topic", libraryId: "/org/project", mode: "info")'
```

### Parameters

| Parameter | Values | When to Use |
|-----------|--------|-------------|
| `mode` | `info` (default) | Conceptual guides, architecture, narrative docs |
| `mode` | `code` | API references, code examples, exact signatures |
| `topic` | e.g., `hooks`, `routing` | Focus documentation on a specific subtopic |
| `page` | `1` (default) | Start here; only go to page 2+ after two page=1 failures |
| `tokens` | default | Adjust if results are too short/long |

### Selection Criteria

When multiple libraries match:
- Name similarity to the query (exact matches prioritized)
- Description relevance to the query's intent
- Documentation coverage (higher Code Snippet count = better)
- Trust score (prioritize 7–10)

## DeepWiki (Repo Understanding)

### Primary: Ask a Question

```bash
# Best for open-ended "how does X work" questions
deepwiki_ask_question(repoName: "owner/repo", question: "How does the middleware pipeline work?")
```

### Fallback Workflow (if ask_question fails)

1. **Verify** the repo is indexed:
```bash
deepwiki_read_wiki_structure(repoName: "owner/repo")
```

2. **Read** specific documentation pages:
```bash
deepwiki_read_wiki_contents(repoName: "owner/repo", wikiPage: "architecture")
```

3. **Last resort**: Use GitHub CLI for unindexed repos:
```bash
gh repo view owner/repo
gh api repos/owner/repo/contents
```

### When to Use DeepWiki vs GitHub

| Use DeepWiki | Use GitHub MCP |
|-------------|----------------|
| Understanding architecture and design | Reading specific source files |
| "How does X component work?" | Finding specific code patterns |
| Getting an overview of a new repo | Checking issue discussions and PRs |
| Learning design decisions and trade-offs | Finding CHANGELOG entries and release notes |

## GitHub MCP

### Key Operations

```bash
# Search for code across repos
github_search_code(q: "repo:owner/repo middleware")

# Get specific file contents
github_get_file_contents(owner: "owner", repo: "repo", path: "src/index.ts")

# Search issues and discussions
github_search_issues(q: "repo:owner/repo middleware ordering")

# Get specific issue/PR details
github_get_issue(owner: "owner", repo: "repo", number: 123)
```

### When to Use Each

| Need | Tool |
|------|------|
| Find how a feature is implemented | `github_search_code` + `github_get_file_contents` |
| Find known issues or bugs | `github_search_issues` with `is:issue` |
| Find discussions about design decisions | `github_search_issues` with `is:discussions` |
| Check recent changes | `github_list_commits` + `github_get_pull_request_files` |
| Read CHANGELOG | `github_get_file_contents(path: "CHANGELOG.md")` |

## Web Search

```bash
# General query
web_search(query: "fastapi middleware ordering best practice")

# Version-specific (use freshness)
web_search(query: "react 19 migration guide", freshness: "pm")  # past month

# Error messages
web_search(query: "TypeError: Cannot read properties of undefined react 19")
```

### Tips

- Keep queries to 5-8 words for best results
- Use `freshness: "pm"` for version-related or recent-change queries
- For error messages, paste the error directly as the query
- After finding a relevant URL, use `web_fetch` to get full content

## Web Fetch

```bash
# Get content from a specific URL
web_fetch(url: "https://fastapi.tiangolo.com/tutorial/middleware/")
```

### When to Use

- Only for URLs found during earlier search steps
- When a search result snippet is insufficient and full content is needed
- Always cite the URL as the source

## Local Documentation ($LLMSTXT_HOME)

```bash
cd $LLMSTXT_HOME
tree -L 1                    # See available topics
tree -L 2 circleci/          # Drill into a topic
```

### Search Strategies

```bash
# Find relevant files
grep -rl "middleware" $LLMSTXT_HOME/

# Read relevant sections
cat $LLMSTXT_HOME/fastapi/middleware.md
```

Always check local docs first — they're the fastest source and often the most relevant for your environment.