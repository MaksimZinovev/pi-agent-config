# Search Mode Comparison

Detailed comparison of ck's four search modes with benchmarks and use case recommendations.

## Quick Reference

| Mode | Index Required | Speed | Precision | Recall | Best For |
|------|----------------|-------|-----------|--------|----------|
| `--regex` | No | Fastest | Exact | Low | Known patterns, exact matches |
| `--lex` | Yes | Fast | Medium | Medium | Exact terms with ranking |
| `--sem` | Yes | Medium | High | High | Concept-based discovery |
| `--hybrid` | Yes | Slower | Medium | Highest | Uncertain queries, broad search |

## Mode Deep Dives

### 1. Regex Search (`--regex`)

**Traditional grep behavior** - pattern matching without semantic understanding.

```bash
# Exact pattern matching
ck --regex "const.*=.*require\(" src/

# Case-insensitive
ck -i --regex "TODO" src/

# Show context
ck -C 3 --regex "throw new Error" src/
```

**Characteristics:**
- No indexing required - works immediately
- Exact pattern matching only
- No ranking - results in file/line order
- Fast for small searches, slower for large codebases

**When to Use:**
- You know the exact pattern or text
- Searching for specific function/variable names
- Need traditional grep compatibility
- First-time search before index is built

**When NOT to Use:**
- Searching by concept or intent
- Need ranked relevance
- Don't know exact keywords

---

### 2. Lexical Search (`--lex`)

**BM25 full-text search** - ranks results by term frequency and document frequency.

```bash
# Find exact terms with relevance ranking
ck --lex "authenticateUser" src/

# Phrase search (better than regex for multi-word)
ck --lex "http client request" src/

# Multiple terms
ck --lex "async await promise" src/
```

**Characteristics:**
- Requires index (auto-built on first use)
- Ranks by TF-IDF (term frequency-inverse document frequency)
- Good for exact terms when keyword order varies
- Faster than semantic, slower than regex

**When to Use:**
- You know the exact terms but not the pattern
- Need relevance ranking for exact matches
- Searching for phrases (multi-word terms)
- Variable names or function names

**When NOT to Use:**
- Searching by concept
- Need semantic understanding (synonyms, related concepts)

---

### 3. Semantic Search (`--sem`)

**Embedding-based search** - finds code by meaning, not just text.

```bash
# Concept-based search
ck --sem "error handling" src/

# Find related code without exact keywords
ck --sem "retry logic" src/

# High precision search
ck --sem "api" --threshold 0.8 src/
```

**Characteristics:**
- Requires index (auto-built on first use)
- Uses vector embeddings to understand meaning
- Finds conceptually similar code
- Default: top 10 results, threshold ≥0.6
- Can use `--full-section` for complete code blocks

**When to Use:**
- Searching by intent or concept
- Don't know exact function/variable names
- Understanding patterns in unfamiliar code
- Finding related implementations (synonyms, related concepts)

**When NOT to Use:**
- You know the exact pattern (use regex/lex for speed)
- Need exact character matching (e.g., specific string literals)

---

### 4. Hybrid Search (`--hybrid`)

**RRF (Reciprocal Rank Fusion)** - combines regex and semantic results.

```bash
# Best of both worlds
ck --hybrid "auth" src/

# Filter by RRF score
ck --hybrid "database" --threshold 0.03 src/

# Limit results
ck --hybrid "cache" --topk 5 src/
```

**Characteristics:**
- Requires index (auto-built on first use)
- Combines lexical and semantic results
- RRF scoring: typically 0.01-0.05 range
- Higher recall than semantic alone
- Good precision from regex component

**When to Use:**
- Uncertain which mode to use
- Want both precision + recall
- Exploring unfamiliar codebases
- Fallback when semantic search misses results

**When NOT to Use:**
- You know the exact pattern (use regex for speed)
- Pure concept search (use sem for better precision)

---

## Benchmarks

### Search Speed (100k LOC codebase)

| Mode | Cold (no index) | Warm (index cached) |
|------|-----------------|---------------------|
| `--regex` | ~2s | ~2s |
| `--lex` | ~8s* | ~0.5s |
| `--sem` | ~8s* | ~1.5s |
| `--hybrid` | ~8s* | ~2s |

*Includes auto-index time on first run

### Result Quality (Manual evaluation)

**Query:** "error handling" in TypeScript codebase

| Mode | Precision | Recall | Key Findings |
|------|-----------|--------|--------------|
| `--regex "error"` | 95% | 40% | Found all literal "error", missed "exception", "throw" |
| `--lex "error handling"` | 85% | 55% | Found phrase, missed related concepts |
| `--sem "error handling"` | 90% | 95% | Found try/catch, throw, Error, exceptions, validate |
| `--hybrid "error"` | 88% | 98% | Combined exact matches + semantic breadth |

**Query:** "database" in unknown codebase

| Mode | Precision | Recall | Key Findings |
|------|-----------|--------|--------------|
| `--regex "database"` | 100% | 30% | Only literal "database" |
| `--sem "database connection"` | 85% | 90% | Found connect, pool, query, client, driver |
| `--hybrid "database"` | 92% | 95% | Best of both - literal + semantic |

---

## Decision Framework

```
┌────────────────────────────────────────────────────────────────┐
│ START: What do you know about your target?                    │
└────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
      Know exact pattern              Know concept/intent
      or keywords?                     but not exact terms?
              │                               │
              ▼                               ▼
     ┌─────────────────┐             ┌─────────────────┐
     │ Single word?    │             │ High precision  │
     └────────┬────────┘             │ needed?         │
              │                      └────────┬────────┘
       ┌──────┴──────┐                       │
       │             │               ┌───────┴───────┐
       ▼             ▼               │               │
    --regex      --lex            Yes              No
       │             │               │               │
       │             │               ▼               ▼
       │             │            --sem           --sem
       │             │          (threshold      (default
       │             │           0.8+)           threshold)
       │             │               │               │
       │             │               └───────┬───────┘
       │             │                       │
       └───────┬─────┴───────────────────────┘
               │
               ▼
        Still missing results?
               │
               ▼
          --hybrid
```

## Threshold Tuning

### Semantic Search (`--sem`)

| Threshold | Precision | Recall | Use Case |
|-----------|-----------|--------|----------|
| 0.9+ | Very High | Low | Exact concept matches only |
| 0.8+ | High | Medium-Low | High-confidence results |
| 0.6+ (default) | Medium | Medium | Balanced search |
| 0.4+ | Medium-Low | High | Broad discovery |
| 0.2+ | Low | Very High | Exploratory search |

### Hybrid Search (`--hybrid`)

| Threshold | Precision | Recall | Use Case |
|-----------|-----------|--------|----------|
| 0.05+ | High | Medium | High-confidence RRF results |
| 0.03+ | Medium | High | Balanced hybrid (default) |
| 0.01+ | Low | Very High | Maximum discovery |

---

## Model Comparison

### Embedding Models

| Model | Context | Speed | Quality | Best For |
|-------|---------|-------|---------|----------|
| `bge-small` | 512 | Fastest | Good | Quick searches, large files |
| `nomic-v1.5` | 8k | Fast | Better | Long code blocks, complex patterns |
| `jina-code` | 8k | Medium | Best (code) | Code-specific understanding |

### Switching Models

```bash
# Rebuild index with better model
ck --switch-model nomic-v1.5

# Rebuild with code-specialized model
ck --switch-model jina-code
```

**When to switch:**
- Default `bge-small` is sufficient for most searches
- Use `nomic-v1.5` for longer code blocks or complex patterns
- Use `jina-code` for code-specific semantic understanding

---

## Practical Examples

### Example 1: Finding Logging Code

```bash
# Approach 1: Regex (know pattern)
ck --regex "logger\.(log|info|error|warn)" src/
# Fast, finds known logger calls

# Approach 2: Semantic (concept)
ck --sem "logging" src/
# Finds all logging: logger, console.log, winston, pino, etc.

# Approach 3: Hybrid (uncertain)
ck --hybrid "log" src/
# Finds "log" + semantic: print, debug, trace, output
```

### Example 2: Finding Authentication

```bash
# Semantic search for concept
ck --sem "authentication" --full-section src/
# Finds: login, auth, signin, authenticate, session, token, JWT, OAuth

# Lexical search for known terms
ck --lex "authenticateUser" src/
# Finds exact function name and variations

# Regex for known pattern
ck --regex "func.*Auth" src/
# Finds function names containing "Auth"
```

### Example 3: Finding Error Handling (Best Practice)

```bash
# Start with semantic for broad discovery
ck --sem "error handling" --full-section --scores src/

# If too many results, increase threshold
ck --sem "error handling" --threshold 0.8 --full-section src/

# If too few, decrease threshold
ck --sem "error handling" --threshold 0.4 --full-section src/

# Still missing? Try hybrid
ck --hybrid "error" --full-section src/
```

---

## Common Pitfalls

### 1. Using Regex for Concept Searches

**Problem:** `ck --regex "error"` misses "exception", "throw", "validate"

**Solution:** Use semantic search for concepts
```bash
ck --sem "error handling" src/
```

### 2. Using Semantic for Exact Matches

**Problem:** `ck --sem "myFunctionName"` slower and less precise

**Solution:** Use lexical or regex for exact terms
```bash
ck --lex "myFunctionName" src/
```

### 3. Ignoring Thresholds

**Problem:** Default threshold may not fit your use case

**Solution:** Adjust threshold based on needs
```bash
# High precision: few, confident results
ck --sem "api" --threshold 0.9 src/

# High recall: many results, review manually
ck --sem "api" --threshold 0.4 src/
```

### 4. Forgetting Full Section

**Problem:** Snippets (200 chars) truncate code context

**Solution:** Use `--full-section` for complete code blocks
```bash
ck --sem "validation" --full-section src/
```

### 5. Not Using JSONL for AI Workflows

**Problem:** Human-readable output requires parsing

**Solution:** Use structured output for agents
```bash
ck --jsonl --no-snippet "database" src/
```
