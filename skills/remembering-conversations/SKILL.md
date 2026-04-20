---
name: remembering-conversations
description: Searches previous conversations for facts, patterns, and decisions using semantic or text search. Use when partner mentions "we discussed this before", debugging familiar issues, or seeking historical context, when user asked to check recent error, help resolve the issue.
---

# Remembering Conversations

Search archived conversations using semantic similarity or exact text matching.

**Core principle:** Search before reinventing.

**Announce:** "I'm searching previous conversations for [topic]."

**Setup:** See `SETUP.md` for beginner-friendly installation guide.

## What This Does

- **Automatically indexes** your conversations when sessions end (via hook)
- **Generates AI summaries** using GLM models (Z.AI) or Anthropic Claude
- **Enables semantic search** - find conversations by meaning, not just keywords

## Quick Start

**For first-time setup, see:** `SETUP.md`

**To search conversations:**
```bash
~/.claude/skills/remembering-conversations/tool/search-conversations "your query"
```

## When to Use

**Search when:**
- Your human partner mentions "we discussed this before"
- Debugging similar issues
- Looking for architectural decisions or patterns
- Before implementing something familiar

**Don't search when:**
- Info in current conversation
- Question about current codebase (use Grep/Read)

## In-Session Use

**Always use subagents** (50-100x context savings). See `skills/using-skills` for workflow.

**Manual/CLI use:** Direct search (below) for humans outside Claude Code sessions.

## Direct Search (Manual/CLI)

**Tool location:** `~/.claude/skills/remembering-conversations/tool/search-conversations`

**Modes:**
```bash
search-conversations "query"              # Vector similarity (default)
search-conversations --text "exact"       # Exact string match
search-conversations --both "query"       # Both modes
```

**Flags:**
```bash
--after YYYY-MM-DD    # Filter by date
--before YYYY-MM-DD   # Filter by date
--limit N             # Max results (default: 10)
--help                # Full usage
```

**Examples:**
```bash
# Semantic search
search-conversations "React Router authentication errors"

# Find git SHA
search-conversations --text "a1b2c3d4"

# Time range
search-conversations --after 2025-09-01 "refactoring"
```

Returns: project, date, conversation summary, matched exchange, similarity %, file path.

**For details:** Run `search-conversations --help`

## File Locations

| Item | Path |
|------|------|
| Skill directory | `~/.claude/skills/remembering-conversations/` |
| Hook | `~/.claude/hooks/sessionEnd` |
| Indexer | `tool/index-conversations` |
| Search CLI | `tool/search-conversations` |
| Database | `~/.config/superpowers/conversation-index/db.sqlite` |
| Archive | `~/.config/superpowers/conversation-archive/` |

## Documentation

- **`SETUP.md`** - Beginner-friendly setup guide (start here!)
- **`INDEXING.md`** - Index management and recovery commands
- **`DEPLOYMENT.md`** - Production deployment and maintenance
