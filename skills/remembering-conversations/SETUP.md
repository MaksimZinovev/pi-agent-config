# Setup Guide: Remembering Conversations

A beginner-friendly guide to setting up conversation search with GLM (Z.AI) models.

## What This Skill Does

- **Indexes your Claude Code conversations** automatically after each session
- **Generates AI summaries** using GLM models (via Z.AI API)
- **Enables semantic search** to find past conversations by meaning, not just keywords

## Prerequisites

1. **Claude Code installed** and working
2. **Z.AI API token** configured in your environment
3. **Node.js 18+** installed (for running the indexing tool)

## Quick Setup (4 Steps)

### Step 1: Configure API Credentials

Add your Z.AI API credentials to `~/.config/env/.env.keys`:

```bash
# Edit your env.keys file
nano ~/.config/env/.env.keys
```

Add these lines:
```bash
# Z.AI Anthropic-compatible API (for remembering-conversations skill)
ANTHROPIC_AUTH_TOKEN=your-zai-token-here
ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air
ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7
```

**Get your token from** `~/.claude/settings.json`:
```bash
grep "ANTHROPIC_AUTH_TOKEN" ~/.claude/settings.json
```

Reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### Step 2: Install Dependencies

Navigate to the skill directory and install npm packages:

```bash
cd ~/.claude/skills/remembering-conversations/tool
npm install
```

Expected output: `added 203 packages`

### Step 3: Install the Auto-Indexing Hook

Run the hook installer:

```bash
./install-hook
```

The hook inherits environment variables from your shell (loaded via `.env.keys`), so no hardcoded credentials are needed.

Verify the hook is installed:

```bash
ls -l ~/.claude/hooks/sessionEnd
# Should show: -rwxr-xr-x ... sessionEnd
```

### Step 4: Index Existing Conversations

```bash
cd ~/.claude/skills/remembering-conversations/tool

# Verify environment variables are set
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# Index conversations that haven't been processed yet
./index-conversations --cleanup
```

Expected output:
```
Found N unprocessed conversations
Generating N summaries (concurrency: 1)...
  ✓ ...filename.jsonl: NN words
...
✅ Processed N conversations
```

### Step 5: Test Search

Verify everything works by searching your conversations:

```bash
./search-conversations "test query"
```

Expected output: List of relevant conversations with summaries.

## Verification Checklist

Run these commands to verify your setup:

```bash
cd ~/.claude/skills/remembering-conversations/tool

# 1. Check environment variables
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# 2. Check hook is installed
ls -l ~/.claude/hooks/sessionEnd
# ✓ Should show: -rwxr-xr-x

# 3. Verify index health
./index-conversations --verify
# ✓ Should show: "Missing summaries: 0" (empty conversations are OK)

# 4. Test search
./search-conversations "your query here"
# ✓ Should return relevant conversations
```

## How It Works

```
┌─────────────────┐
│ Claude Session  │
│   Ends          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ sessionEnd Hook         │
│ (runs automatically)    │
│ • Inherits env vars     │
│   from .env.keys        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ index-conversations     │
│ • Archives conversation │
│ • Generates summary     │
│ • Creates embeddings    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Search Database         │
│ (SQLite + vectors)      │
└─────────────────────────┘
```

## Using Search

**From CLI:**
```bash
cd ~/.claude/skills/remembering-conversations/tool

# Semantic search (find by meaning)
./search-conversations "React authentication bug"

# Exact text search
./search-conversations --text "a1b2c3d4"

# Both modes
./search-conversations --both "git commit"

# Date filtering
./search-conversations --after 2025-01-01 "deployment"

# Limit results
./search-conversations --limit 5 "testing"
```

**From Within Claude Code:**

Use the skill directly:
- "I'm searching previous conversations for [topic]"
- "What did we discuss about [topic]?"

## Maintenance

**Weekly health check:**
```bash
cd ~/.claude/skills/remembering-conversations/tool
./index-conversations --verify
```

**If issues found:**
```bash
./index-conversations --repair
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Hook not running | Check `ls -l ~/.claude/hooks/sessionEnd` is executable |
| API errors | Verify credentials in `~/.config/env/.env.keys` and reload shell |
| No search results | Run `./index-conversations --cleanup` to index conversations |
| "Missing summaries" | Run `./index-conversations --repair` (empty convos are OK) |

## Path Reference

Your skill is at: `~/.claude/skills/remembering-conversations/`

Key files:
- Env config: `~/.config/env/.env.keys` (API credentials)
- Hook: `~/.claude/hooks/sessionEnd`
- Indexer: `~/.claude/skills/remembering-conversations/tool/index-conversations`
- Search: `~/.claude/skills/remembering-conversations/tool/search-conversations`
- Database: `~/.config/superpowers/conversation-index/db.sqlite`
- Archive: `~/.config/superpowers/conversation-archive/`

## Next Steps

1. **Test with a real query**: Search for something you remember discussing
2. **Let it run**: The hook will automatically index new conversations
3. **Check back**: Verify summaries are being created for new sessions

## Support

For more details, see:
- `SKILL.md` - Skill usage and search modes
- `INDEXING.md` - Index management and recovery
- `DEPLOYMENT.md` - Production deployment guide
