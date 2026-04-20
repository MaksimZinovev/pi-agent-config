#!/usr/bin/env bash
set -euo pipefail

PI_DIR="$HOME/.pi/agent"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$PI_DIR/backup/$(date +%Y%m%d-%H%M%S)"

# ── Config files to symlink (repo → ~/.pi/agent/) ──
SYMLINK_FILES=(
  settings.json
  models.json
  AGENTS.md
  keybindings.json
  fancy-footer.json
  pi-permissions.jsonc
  promptsmith-settings.json
)

# ── Directories to symlink (repo → ~/.pi/agent/) ──
SYMLINK_DIRS=(
  skills
  extensions
)

# ── mcp.json is NOT symlinked — generated from template via envsubst ──

# ── Setup ──
echo "🔗 pi-agent-config setup"
echo "   Repo:  $REPO_DIR"
echo "   Pi dir: $PI_DIR"
echo ""

# ── 1. Backup existing files ──
echo "📦 Backing up existing files to $BACKUP_DIR ..."
mkdir -p "$BACKUP_DIR"
for f in "${SYMLINK_FILES[@]}"; do
  if [[ -f "$PI_DIR/$f" && ! -L "$PI_DIR/$f" ]]; then
    cp -p "$PI_DIR/$f" "$BACKUP_DIR/$f"
    echo "   backed up $f"
  fi
done
# Backup mcp.json (will be generated from template)
if [[ -f "$PI_DIR/mcp.json" && ! -L "$PI_DIR/mcp.json" ]]; then
  cp -p "$PI_DIR/mcp.json" "$BACKUP_DIR/mcp.json"
  echo "   backed up mcp.json"
fi
# Backup directories that will be symlinked
for d in "${SYMLINK_DIRS[@]}"; do
  if [[ -d "$PI_DIR/$d" && ! -L "$PI_DIR/$d" ]]; then
    cp -a "$PI_DIR/$d" "$BACKUP_DIR/$d"
    echo "   backed up $d/"
  fi
done

# ── 2. Symlink config files ──
echo ""
echo "🔗 Symlinking config files ..."
for f in "${SYMLINK_FILES[@]}"; do
  if [[ -f "$REPO_DIR/$f" ]]; then
    rm -f "$PI_DIR/$f"
    ln -s "$REPO_DIR/$f" "$PI_DIR/$f"
    echo "   linked $f → $REPO_DIR/$f"
  else
    echo "   ⚠️  skipped $f (not in repo)"
  fi
done

# ── 3. Symlink directories ──
echo ""
echo "🔗 Symlinking directories ..."
for d in "${SYMLINK_DIRS[@]}"; do
  if [[ -d "$REPO_DIR/$d" ]]; then
    if [[ -d "$PI_DIR/$d" && ! -L "$PI_DIR/$d" ]]; then
      rm -rf "$PI_DIR/$d"
    fi
    ln -sf "$REPO_DIR/$d" "$PI_DIR/$d"
    echo "   linked $d/ → $REPO_DIR/$d"
  else
    echo "   ⚠️  skipped $d/ (not in repo)"
  fi
done

# ── 4. Generate mcp.json from template ──
# The repo tracks mcp.json.template with ${GITHUB_TOKEN} placeholder.
# We generate the real mcp.json with the env var substituted —
# this file is NEVER symlinked, never git-tracked.
echo ""
echo "🔐 Generating mcp.json from template ..."
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  envsubst < "$REPO_DIR/mcp.json.template" > "$PI_DIR/mcp.json"
  echo "   mcp.json generated (GITHUB_TOKEN injected)"
else
  # Fallback: if user has a backup with the real token, restore it
  if [[ -f "$BACKUP_DIR/mcp.json" ]]; then
    cp "$BACKUP_DIR/mcp.json" "$PI_DIR/mcp.json"
    echo "   ⚠️  GITHUB_TOKEN not set — restored mcp.json from backup"
  else
    echo "   ⚠️  GITHUB_TOKEN not set and no backup — copying template as-is"
    cp "$REPO_DIR/mcp.json.template" "$PI_DIR/mcp.json"
    echo "   ⚠️  You MUST set GITHUB_TOKEN and re-run, or manually edit $PI_DIR/mcp.json"
  fi
fi

# ── 5. Install as pi package ──
echo ""
echo "📦 Installing as pi package ..."
if command -v pi >/dev/null 2>&1; then
  pi install "$REPO_DIR"
  echo "   installed — skills/extensions loaded from repo"
else
  echo "   ⚠️  pi CLI not found. Run manually: pi install $REPO_DIR"
fi

echo ""
echo "✅ Done! Config linked to $PI_DIR"
echo "   Edit files in $REPO_DIR → Pi sees changes instantly."
echo "   Rollback: cp -a $BACKUP_DIR/* $PI_DIR/"