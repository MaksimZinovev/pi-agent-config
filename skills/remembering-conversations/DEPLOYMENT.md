# Conversation Search Deployment Guide

Quick reference for deploying and maintaining the conversation indexing system.

## Initial Deployment

**For first-time setup, see:** `SETUP.md` (beginner-friendly)

```bash
# 1. Configure API credentials in ~/.config/env/.env.keys
# (See SETUP.md for details)
# 2. Reload shell to load environment variables
source ~/.zshrc

cd ~/.claude/skills/remembering-conversations/tool

# 3. Install hook
./install-hook

# 4. Verify environment variables
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# 5. Index existing conversations
./index-conversations --cleanup

# 6. Verify index health
./index-conversations --verify

# 7. Test search
./search-conversations "test query"
```

**Expected results:**
- Hook installed at `~/.claude/hooks/sessionEnd`
- Summaries created for all conversations (50-120 words each)
- Search returns relevant results in <1 second
- No verification errors

## Ongoing Maintenance

### Automatic (No Action Required)

- Hook runs after every session ends
- New conversations indexed in background (<30 sec per conversation)
- Summaries generated automatically

### Weekly Health Check

```bash
cd ~/.claude/skills/remembering-conversations/tool
./index-conversations --verify
```

If issues found:
```bash
./index-conversations --repair
```

### After System Changes

| Change | Action |
|--------|--------|
| Moved conversation archive | Update paths in hook, run `--rebuild` |
| Updated API configuration | Update `~/.config/env/.env.keys`, reload shell, re-index |
| Changed database schema | Backup DB, run `--rebuild` |
| Hook not running | Check executable: `chmod +x ~/.claude/hooks/sessionEnd` |

## Recovery Scenarios

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| **Missing summaries** | `--verify` shows "Missing summaries: N" | `--repair` regenerates missing summaries |
| **Orphaned DB entries** | `--verify` shows "Orphaned entries: N" | `--repair` removes orphaned entries |
| **Outdated indexes** | `--verify` shows "Outdated files: N" | `--repair` re-indexes modified files |
| **Corrupted database** | Errors during search/verify | `--rebuild` (re-indexes everything, requires confirmation) |
| **Hook not running** | No summaries for new conversations | See Troubleshooting below |
| **Slow indexing** | Takes >30 sec per conversation | Check API configuration, network, logs |

## Monitoring

### Health Checks

```bash
# Check hook installed and executable
ls -l ~/.claude/hooks/sessionEnd

# Check environment variables are set
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# Check recent conversations
ls -lt ~/.config/superpowers/conversation-archive/*/*.jsonl | head -5

# Check database size
ls -lh ~/.config/superpowers/conversation-index/db.sqlite

# Full verification
cd ~/.claude/skills/remembering-conversations/tool
./index-conversations --verify
```

### Expected Behavior Metrics

- **Hook execution:** Within seconds of session end
- **Indexing speed:** <30 seconds per conversation
- **Summary length:** 50-120 words
- **Search latency:** <1 second
- **Verification:** 0 errors when healthy (empty conversations are OK)

### Log Output

Normal indexing:
```
Initializing database...
Loading embedding model...
Processing project: my-project (3 conversations)
  Summary: 87 words
  Indexed conversation.jsonl: 5 exchanges
✅ Indexing complete! Conversations: 3, Exchanges: 15
```

Verification with issues:
```
Verifying conversation index...
Verified 100 conversations.

=== Verification Results ===
Missing summaries: 2
Orphaned entries: 0
Outdated files: 1
Corrupted files: 0

Run with --repair to fix these issues.
```

## Troubleshooting

### Hook Not Running

**Symptoms:** New conversations not indexed automatically

**Diagnosis:**
```bash
# 1. Check hook exists and is executable
ls -l ~/.claude/hooks/sessionEnd
# Should show: -rwxr-xr-x ... sessionEnd

# 2. Check environment variables are set
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"

# 3. Check $SESSION_ID is set during sessions
echo $SESSION_ID
# Should show: session ID when in active session

# 4. Check indexer exists
ls -l ~/.claude/skills/remembering-conversations/tool/index-conversations
# Should show: -rwxr-xr-x ... index-conversations

# 5. Test hook manually
SESSION_ID=test-$(date +%s) ~/.claude/hooks/sessionEnd
```

**Fix:**
```bash
# Make hook executable
chmod +x ~/.claude/hooks/sessionEnd

# Reinstall if needed
cd ~/.claude/skills/remembering-conversations/tool
./install-hook

# Ensure environment variables are loaded
source ~/.zshrc  # or ~/.bashrc
```

### Summaries Failing (Z.AI / GLM Models)

**Symptoms:** Verify shows missing summaries, repair fails

**Diagnosis:**
```bash
# Check environment variables are set
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:+SET}"
echo "ANTHROPIC_BASE_URL: ${ANTHROPIC_BASE_URL:-not set}"
echo "ANTHROPIC_DEFAULT_HAIKU_MODEL: ${ANTHROPIC_DEFAULT_HAIKU_MODEL:-not set}"

# Verify credentials in .env.keys
grep "ANTHROPIC_AUTH_TOKEN\|ANTHROPIC_BASE_URL" ~/.config/env/.env.keys

# Try manual indexing with logging
cd ~/.claude/skills/remembering-conversations/tool
./index-conversations --session <uuid> 2>&1 | tee index.log
grep -i error index.log
```

**Fix:**
```bash
# Update .env.keys with correct credentials
nano ~/.config/env/.env.keys

# Reload shell to load new environment
source ~/.zshrc

# Re-index missing summaries
./index-conversations --repair
```

### Summaries Failing (Anthropic Models)

**Symptoms:** Verify shows missing summaries, repair fails

**Diagnosis:**
```bash
# Check API key
echo $ANTHROPIC_API_KEY
# Should show: sk-ant-...

# Try manual indexing with logging
./index-conversations 2>&1 | tee index.log
grep -i error index.log
```

**Fix:**
```bash
# Set API key in .env.keys
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.config/env/.env.keys

# Reload shell
source ~/.zshrc

# Check for rate limits (wait and retry)
sleep 60 && ./index-conversations --repair
```

### Search Not Finding Results

**Symptoms:** `./search-conversations "query"` returns no results

**Diagnosis:**
```bash
cd ~/.claude/skills/remembering-conversations/tool

# 1. Verify conversations indexed
./index-conversations --verify

# 2. Check database exists and has data
ls -lh ~/.config/superpowers/conversation-index/db.sqlite
# Should be > 100KB if conversations indexed

# 3. Try text search (exact match)
./search-conversations --text "exact phrase from conversation"

# 4. Check for corruption
sqlite3 ~/.config/superpowers/conversation-index/db.sqlite "SELECT COUNT(*) FROM exchanges;"
# Should show number > 0
```

**Fix:**
```bash
# If database missing or corrupt
./index-conversations --rebuild

# If specific conversations missing
./index-conversations --repair

# If still failing, check embedding model
rm -rf ~/.cache/transformers  # Force re-download
./index-conversations
```

### Database Corruption

**Symptoms:** Errors like "database disk image is malformed"

**Fix:**
```bash
# 1. Backup current database
cp ~/.config/superpowers/conversation-index/db.sqlite ~/.config/superpowers/conversation-index/db.sqlite.backup

# 2. Rebuild from scratch
./index-conversations --rebuild
# Confirms with: "Are you sure? [yes/NO]:"
# Type: yes

# 3. Verify rebuild
./index-conversations --verify
```

## Commands Reference

```bash
cd ~/.claude/skills/remembering-conversations/tool

# Index all conversations
./index-conversations

# Index specific session (called by hook)
./index-conversations --session <session-id>

# Index only unprocessed conversations
./index-conversations --cleanup

# Verify index health
./index-conversations --verify

# Repair issues found by verify
./index-conversations --repair

# Rebuild everything (with confirmation)
./index-conversations --rebuild

# Search conversations (semantic)
./search-conversations "query"

# Search conversations (text match)
./search-conversations --text "exact phrase"

# Install/reinstall hook
./install-hook
```

## API Configuration Reference

### Z.AI (GLM Models)

Add to `~/.config/env/.env.keys`:
```bash
# Z.AI Anthropic-compatible API (for remembering-conversations skill)
ANTHROPIC_AUTH_TOKEN=your-zai-token-here
ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL=glm-4.5-air
ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7
```

Then reload shell: `source ~/.zshrc`

### Anthropic Models

Add to `~/.config/env/.env.keys`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Then reload shell: `source ~/.zshrc`

## Files and Directories

```
~/.claude/
├── hooks/
│   └── sessionEnd                 # Hook that triggers indexing
└── skills/remembering-conversations/
    ├── SETUP.md                   # Beginner setup guide
    ├── SKILL.md                   # Main documentation
    ├── INDEXING.md                # Index management
    ├── DEPLOYMENT.md              # This file
    └── tool/
        ├── index-conversations    # Main indexer
        ├── search-conversations   # Search interface
        ├── install-hook           # Hook installer
        ├── test-deployment.sh     # End-to-end tests
        ├── src/                   # TypeScript source
        └── prompts/
            └── search-agent.md    # Subagent template

~/.config/
├── env/
│   └── .env.keys                 # API credentials
└── superpowers/
    ├── conversation-archive/      # Archived conversations
    │   └── <project>/
    │       ├── <uuid>.jsonl      # Conversation file
    │       └── <uuid>-summary.txt # AI summary (50-120 words)
    └── conversation-index/
        └── db.sqlite             # SQLite database with embeddings
```

## Deployment Checklist

### Initial Setup
- [ ] API credentials in `~/.config/env/.env.keys`
- [ ] Shell reloaded: `source ~/.zshrc`
- [ ] Environment variables verified: `echo $ANTHROPIC_AUTH_TOKEN`
- [ ] Hook installed: `./install-hook`
- [ ] Dependencies installed: `npm install`
- [ ] Existing conversations indexed: `./index-conversations --cleanup`
- [ ] Verification clean: `./index-conversations --verify`
- [ ] Search working: `./search-conversations "test"`

### Ongoing
- [ ] Weekly: Run `--verify` and `--repair` if needed
- [ ] After system changes: Re-verify
- [ ] Monitor: Check hook runs (summaries appear for new conversations)

### Testing
- [ ] Run end-to-end tests: `./test-deployment.sh`
- [ ] All scenarios pass
- [ ] Manual search test: `./search-conversations "your query"`
