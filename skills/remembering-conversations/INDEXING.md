# Managing Conversation Index

Index, archive, and maintain conversations for search.

## Quick Start

**For first-time setup, see:** `SETUP.md`

**Install auto-indexing hook:**
```bash
cd ~/.claude/skills/remembering-conversations/tool
./install-hook
```

**Index all conversations:**
```bash
./index-conversations --cleanup
```

## Features

- **Automatic indexing** via sessionEnd hook (install once, forget)
- **Semantic search** across all past conversations
- **AI summaries** (GLM models via Z.AI, or Anthropic Claude)
- **Recovery modes** (verify, repair, rebuild)
- **Permanent archive** at `~/.config/superpowers/conversation-archive/`

## Setup

### 1. Configure API Credentials

**Add to `~/.config/env/.env.keys`:**
```bash
# Z.AI Anthropic-compatible API (for remembering-conversations skill)
ANTHROPIC_AUTH_TOKEN=your-zai-token-here
ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air
ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7
```

**Reload your shell:**
```bash
source ~/.zshrc  # or ~/.bashrc
```

### 2. Install Hook

```bash
cd ~/.claude/skills/remembering-conversations/tool
./install-hook
```

The hook inherits environment variables from your shell (loaded via `.env.keys`).

### 3. Index Existing Conversations

```bash
cd ~/.claude/skills/remembering-conversations/tool

# Verify environment variables are set
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# Index only unindexed conversations (faster)
./index-conversations --cleanup
```

See `SETUP.md` for detailed setup instructions.

## Index Modes

```bash
# Index all (first run or full rebuild)
./index-conversations

# Index specific session (used by hook)
./index-conversations --session <uuid>

# Process only unindexed (missing summaries)
./index-conversations --cleanup

# Check index health
./index-conversations --verify

# Fix detected issues
./index-conversations --repair

# Nuclear option (deletes DB, re-indexes everything)
./index-conversations --rebuild
```

## Recovery Scenarios

| Situation | Command |
|-----------|---------|
| Missed conversations | `--cleanup` |
| Hook didn't run | `--cleanup` |
| Updated conversation | `--verify` then `--repair` |
| Corrupted database | `--rebuild` |
| Index health check | `--verify` |

## Troubleshooting

**Hook not running:**
- Check: `ls -l ~/.claude/hooks/sessionEnd` (should be executable)
- Test: `SESSION_ID=test-$(date +%s) ~/.claude/hooks/sessionEnd`
- Re-install: `./install-hook`

**Summaries failing (Z.AI/GLM):**
- Check credentials in `~/.config/env/.env.keys`
- Verify environment: `echo $ANTHROPIC_AUTH_TOKEN`
- Reload shell: `source ~/.zshrc`
- Try manual indexing:
  ```bash
  cd ~/.claude/skills/remembering-conversations/tool
  ./index-conversations --session <uuid>
  ```

**Summaries failing (Anthropic):**
- Check API key: `echo $ANTHROPIC_API_KEY`
- Check logs in ~/.config/superpowers/conversation-index/
- Try manual: `./index-conversations --session <uuid>`

**Search not finding results:**
- Verify indexed: `./index-conversations --verify`
- Try text search: `./search-conversations --text "exact phrase"`
- Rebuild if needed: `./index-conversations --rebuild`

**Environment variables not set:**
- Verify credentials in `~/.config/env/.env.keys`
- Check that `.env.keys` is loaded in your `~/.zshrc` or `~/.bashrc`
- Reload shell: `source ~/.zshrc`

## Excluding Projects

To exclude specific projects from indexing (e.g., meta-conversations), create:

`~/.config/superpowers/conversation-index/exclude.txt`
```
# One project name per line
# Lines starting with # are comments
-Users-yourname-Documents-some-project
```

Or set env variable:
```bash
export CONVERSATION_SEARCH_EXCLUDE_PROJECTS="project1,project2"
```

## Storage

- **Archive:** `~/.config/superpowers/conversation-archive/<project>/<uuid>.jsonl`
- **Summaries:** `~/.config/superpowers/conversation-archive/<project>/<uuid>-summary.txt`
- **Database:** `~/.config/superpowers/conversation-index/db.sqlite`
- **Exclusions:** `~/.config/superpowers/conversation-index/exclude.txt` (optional)
- **Credentials:** `~/.config/env/.env.keys`

## Technical Details

- **Embeddings:** @xenova/transformers (all-MiniLM-L6-v2, 384 dimensions, local/free)
- **Vector search:** sqlite-vec (local/free)
- **Summaries:**
  - **Z.AI (GLM):** glm-4.5-air (Haiku), glm-4.7 (Sonnet)
  - **Anthropic:** claude-3-haiku with claude-3-5-sonnet fallback (~$0.01-0.02/conversation)
- **Parser:** Handles multi-message exchanges and sidechains

## See Also

- **`SETUP.md`** - Beginner-friendly setup guide
- **`SKILL.md`** - Search modes and usage
- **`DEPLOYMENT.md`** - Production deployment guide
