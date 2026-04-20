# AI/Agent Integration Guide

Guide for integrating ck into LLM workflows, MCP servers, and AI agent pipelines.

## Overview

ck is designed for AI-friendly workflows with structured output modes and MCP server integration.

## Structured Output Formats

### JSONL (Recommended for Agents)

**JSONL = Newline-delimited JSON** - one JSON object per line.

```bash
# Basic JSONL output
ck --jsonl "database" src/

# JSONL without snippets (reduces token usage)
ck --jsonl --no-snippet "database" src/

# JSONL with limit and threshold
ck --jsonl --topk 5 --threshold 0.7 "api" src/
```

**Output Format:**
```jsonl
{"file": "src/database.ts", "line": 42, "score": 0.85, "snippet": "function connect() {...}"}
{"file": "src/db/client.ts", "line": 15, "score": 0.82, "snippet": "const client = new Pool()"}
```

**Why JSONL?**
- **Streaming:** Process results line-by-line, no need to buffer full output
- **Error-resilient:** One bad result doesn't break parsing (skip and continue)
- **Memory-efficient:** Don't load entire response into context
- **Standard:** De facto format for LLM/AI pipelines (OpenAI, Anthropic, etc.)

### JSON Output

Traditional JSON array format (legacy, for simple scripts).

```bash
# Single JSON array
ck --json "database" src/

# JSON v1 schema
ck --json-v1 "database" src/
```

**Output Format:**
```json
[
  {"file": "src/database.ts", "line": 42, "score": 0.85, "snippet": "..."},
  {"file": "src/db/client.ts", "line": 15, "score": 0.82, "snippet": "..."}
]
```

**When to use JSON (not JSONL):**
- Small result sets (<100 items)
- Simple script integration (not streaming)
- Legacy compatibility

---

## MCP Server Integration

ck includes built-in MCP server support for Claude Code, Cursor, and other MCP-compatible clients.

### Starting the MCP Server

```bash
# Start MCP server (default settings)
ck --serve

# Start with custom index path
INDEX_PATH=/custom/path ck --serve

# Start with specific model
CK_MODEL=nomic-v1.5 ck --serve
```

### MCP Tools

The ck MCP server provides these tools:

#### 1. `semantic_search`

Search by concept/meaning using embeddings.

```json
{
  "query": "error handling",
  "path": "src/",
  "topk": 10,
  "threshold": 0.6,
  "scores": true,
  "full_section": false
}
```

**Parameters:**
- `query` (required): Search query
- `path` (optional): Directory to search (default: current)
- `topk` (optional): Max results (default: 10)
- `threshold` (optional): Min score 0.0-1.0 (default: 0.6)
- `scores` (optional): Include scores in output
- `full_section` (optional): Return complete code sections

**Use when:** Searching by intent, concept, or meaning.

#### 2. `regex_search`

Traditional grep-style pattern matching.

```json
{
  "query": "throw new Error",
  "path": "src/",
  "case_insensitive": false,
  "context_lines": 0
}
```

**Parameters:**
- `query` (required): Regex pattern
- `path` (optional): Directory to search (default: current)
- `case_insensitive` (optional): Ignore case (default: false)
- `context_lines` (optional): Lines of context (default: 0)

**Use when:** Exact pattern matching, known keywords.

#### 3. `hybrid_search`

Combines regex and semantic for best of both.

```json
{
  "query": "auth",
  "path": "src/",
  "topk": 10,
  "threshold": 0.03,
  "scores": true
}
```

**Parameters:** Similar to `semantic_search`, but threshold range is 0.01-0.05 for RRF.

**Use when:** Uncertain, want both precision + recall.

#### 4. `index_status`

Check index status and statistics.

```json
{
  "path": "src/"
}
```

**Returns:**
- Indexed file count
- Index size
- Last update time
- Model used

**Use when:** Verifying index before search, debugging.

#### 5. `reindex`

Force index rebuild.

```json
{
  "path": "src/",
  "model": "nomic-v1.5"
}
```

**Parameters:**
- `path` (optional): Directory to index (default: current)
- `model` (optional): Model to use (default: bge-small)

**Use when:** Code changed, switching models, troubleshooting.

#### 6. `health_check`

Verify MCP server is running.

```json
{}
```

**Returns:** Server status and version info.

### MCP Configuration for Claude Desktop

Add to Claude Desktop MCP config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ck": {
      "command": "ck",
      "args": ["--serve"],
      "env": {
        "INDEX_PATH": "/path/to/codebase",
        "CK_MODEL": "nomic-v1.5"
      }
    }
  }
}
```

### MCP Configuration for Cursor

Add to Cursor MCP settings:

**macOS:** `~/Library/Application Support/Cursor/User/globalStorage/mcp_servers.json`

```json
{
  "ck": {
    "command": "ck",
    "args": ["--serve"],
    "env": {
      "INDEX_PATH": "/path/to/codebase"
    }
  }
}
```

---

## Token Optimization

Strategies for reducing token usage in AI workflows.

### 1. Use `--no-snippet`

Exclude code snippets when you only need file locations:

```bash
# Before: 5000 tokens (with snippets)
ck --jsonl "error handling" src/

# After: 500 tokens (no snippets)
ck --jsonl --no-snippet "error handling" src/
```

**Trade-off:** You'll need to read files separately for code content.

### 2. Limit Results with `--topk`

Reduce result count for large codebases:

```bash
# Before: 100 results = 10k tokens
ck --jsonl "api" src/

# After: 10 results = 1k tokens
ck --jsonl --topk 10 "api" src/
```

**Recommendation:** Start with `--topk 10`, increase if needed.

### 3. Increase Threshold for Precision

Filter low-quality results:

```bash
# High precision: fewer, better results
ck --jsonl --threshold 0.8 "database" src/

# Very high precision: exact matches only
ck --jsonl --threshold 0.9 "api" src/
```

### 4. Use `--full-section` Strategically

Only when you need complete code blocks:

```bash
# For understanding patterns (needs full context)
ck --sem "error handling" --full-section src/

# For locating references (just need locations)
ck --sem "MyClass" --no-snippet src/
```

---

## Parsing JSONL Output

### Python Example

```python
import json

def search_ck(query: str, path: str = ".") -> list[dict]:
    """Run ck search and parse JSONL output."""
    result = subprocess.run(
        ["ck", "--jsonl", query, path],
        capture_output=True,
        text=True,
        check=True
    )

    results = []
    for line in result.stdout.strip().split("\n"):
        if line:
            results.append(json.loads(line))

    return results

# Usage
results = search_ck("error handling", "src/")
for r in results:
    print(f"{r['file']}:{r['line']} (score: {r['score']})")
```

### Node.js Example

```javascript
import { execSync } from 'child_process';

function searchCK(query, path = '.') {
  const output = execSync(`ck --jsonl "${query}" ${path}`, {
    encoding: 'utf-8'
  });

  return output
    .trim()
    .split('\n')
    .filter(line => line)
    .map(line => JSON.parse(line));
}

// Usage
const results = searchCK('error handling', 'src/');
results.forEach(r => {
  console.log(`${r.file}:${r.line} (score: ${r.score})`);
});
```

### Bash Example

```bash
# Process JSONL output with jq
ck --jsonl "error handling" src/ | jq -r '.[] | "\(.file):\(.line) - \(.score)"'

# Count results
ck --jsonl "api" src/ | wc -l

# Filter by score
ck --jsonl "database" src/ | jq 'select(.score > 0.8)'
```

---

## Workflow Patterns

### Pattern 1: Multi-Stage Search

Start broad, then refine:

```python
# Stage 1: Broad semantic search
broad_results = search_ck("error handling", "src/")

# Stage 2: Filter by score
high_quality = [r for r in broad_results if r['score'] > 0.8]

# Stage 3: Read specific files for details
for result in high_quality[:5]:
    content = read_file(result['file'])
    # Analyze content...
```

### Pattern 2: Hybrid Fallback

Try semantic, fallback to hybrid:

```python
def smart_search(query: str, path: str = "src/") -> list:
    # Try semantic first (faster, more precise)
    results = search_ck(f"--sem --jsonl {query}", path)

    # Fallback to hybrid if too few results
    if len(results) < 3:
        results = search_ck(f"--hybrid --jsonl {query}", path)

    return results
```

### Pattern 3: Iterative Refinement

Adjust threshold based on results:

```python
def adaptive_search(query: str, path: str = "src/") -> list:
    # Start with default threshold
    results = search_ck(f"--sem --jsonl --threshold 0.6 {query}", path)

    # Too many results? Increase precision
    if len(results) > 20:
        results = search_ck(f"--sem --jsonl --threshold 0.8 {query}", path)

    # Too few results? Increase recall
    if len(results) < 3:
        results = search_ck(f"--sem --jsonl --threshold 0.4 {query}", path)

    return results
```

### Pattern 4: Test Discovery

Find all tests related to a feature:

```python
def find_tests(feature: str, test_dir: str = "tests/") -> list:
    # Semantic search for concept
    results = search_ck(
        f"--sem --jsonl --threshold 0.6 '{feature} test'",
        test_dir
    )

    # Also try lexical search for exact matches
    lexical = search_ck(
        f"--lex --jsonl '{feature}'",
        test_dir
    )

    # Combine and deduplicate
    combined = {r['file']: r for r in results + lexical}
    return list(combined.values())
```

---

## Error Handling

### Common Issues

#### 1. Index Not Built

**Error:** `Index not found for path`

**Solution:** Build index first
```bash
ck --index src/
```

#### 2. No Results

**Problem:** Search returns empty

**Solutions:**
```bash
# Lower threshold
ck --sem "query" --threshold 0.4 src/

# Try hybrid
ck --hybrid "query" src/

# Try lexical
ck --lex "query" src/

# Check index status
ck --status src/
```

#### 3. MCP Server Not Responding

**Problem:** MCP tools timeout

**Solutions:**
```bash
# Check server is running
ps aux | grep "ck --serve"

# Check port availability
lsof -i :PORT

# Restart with verbose logging
CK_DEBUG=1 ck --serve
```

#### 4. JSON Parse Errors

**Problem:** Invalid JSON in output

**Solution:** Use error-resilient parsing
```python
for line in output.split("\n"):
    try:
        result = json.loads(line)
        results.append(result)
    except json.JSONDecodeError:
        # Skip malformed lines
        continue
```

---

## Performance Tips

### 1. Pre-Build Index

Before running agent workflow, build index:

```bash
# Build index in CI/CD
ck --index --model nomic-v1.5 src/
```

### 2. Use Appropriate Model

```bash
# Fast for simple searches
ck --index --model bge-small src/

# Better quality for complex patterns
ck --index --model nomic-v1.5 src/

# Best for code-specific understanding
ck --index --model jina-code src/
```

### 3. Cache Common Queries

Store results of frequent searches:

```python
import hashlib
from pathlib import Path

def cached_search(query: str, path: str = "src/") -> list:
    cache_key = hashlib.md5(f"{query}:{path}".encode()).hexdigest()
    cache_file = Path(f".ck_cache/{cache_key}.jsonl")

    # Check cache
    if cache_file.exists():
        with open(cache_file) as f:
            return [json.loads(line) for line in f]

    # Run search
    results = search_ck(query, path)

    # Cache results
    cache_file.parent.mkdir(exist_ok=True)
    with open(cache_file, 'w') as f:
        for result in results:
            f.write(json.dumps(result) + "\n")

    return results
```

### 4. Parallel Searches

For multiple independent queries:

```python
from concurrent.futures import ThreadPoolExecutor

def parallel_searches(queries: list[str], path: str = "src/") -> dict:
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            q: executor.submit(search_ck, q, path)
            for q in queries
        }

        return {
            q: f.result()
            for q, f in futures.items()
        }

# Usage
results = parallel_searches([
    "error handling",
    "authentication",
    "database"
])
```

---

## Integration Examples

### Example 1: Claude Code Skill Integration

```python
# In your skill code
import subprocess

def find_similar_code(concept: str) -> str:
    """Find code by semantic search."""
    result = subprocess.run(
        ["ck", "--jsonl", "--no-snippet", "--sem", concept, "src/"],
        capture_output=True,
        text=True
    )

    files = []
    for line in result.stdout.strip().split("\n"):
        if line:
            data = json.loads(line)
            files.append(f"{data['file']}:{data['line']}")

    return "\n".join(files)
```

### Example 2: Cursor Extension

```javascript
// In Cursor extension
const { execSync } = require('child_process');

function provideSemanticCompletions(query) {
  const output = execSync(
    `ck --jsonl --topk 5 --threshold 0.7 "${query}" src/`,
    { encoding: 'utf-8' }
  );

  return output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const { file, line, score } = JSON.parse(line);
      return {
        label: `${file}:${line}`,
        detail: `Similarity: ${(score * 100).toFixed(0)}%`,
        uri: file,
        range: { start: { line: line - 1 }, end: { line: line - 1 } }
      };
    });
}
```

### Example 3: GitHub Action

```yaml
name: Code Search
on: [issue_comment]

jobs:
  search:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install ck
        run: cargo install ck-cli

      - name: Search codebase
        run: |
          QUERY="${{ github.event.comment.body }}"
          ck --jsonl --sem "$QUERY" src/ > results.jsonl

      - name: Post results
        run: |
          # Post results.jsonl as comment
          gh issue comment ${{ github.event.issue.number }} --body-file results.jsonl
```

---

## Advanced: MCP Tool Wrappers

Create higher-level tools combining multiple ck operations:

```python
from mcp import Server

app = Server("ck-enhanced")

@app.tool()
def comprehensive_search(query: str, path: str = "src/") -> str:
    """Search with automatic mode selection and fallback."""
    # Try semantic first
    results = subprocess.run(
        ["ck", "--jsonl", "--sem", query, path],
        capture_output=True,
        text=True
    )

    semantic_count = len(results.stdout.strip().split("\n"))

    # Fallback to hybrid if too few results
    if semantic_count < 3:
        results = subprocess.run(
            ["ck", "--jsonl", "--hybrid", query, path],
            capture_output=True,
            text=True
        )

    return results.stdout

@app.tool()
def find_tests(feature: str) -> str:
    """Find all tests related to a feature."""
    results = []

    # Semantic search
    results.append(subprocess.run(
        ["ck", "--jsonl", "--sem", f"{feature} test", "tests/"],
        capture_output=True,
        text=True
    ).stdout)

    # Lexical search
    results.append(subprocess.run(
        ["ck", "--jsonl", "--lex", feature, "tests/"],
        capture_output=True,
        text=True
    ).stdout)

    return "\n".join(results)
```
