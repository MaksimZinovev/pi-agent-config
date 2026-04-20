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
# Also backup mcp.json (will be generated from template)
if [[ -f "$PI_DIR/mcp.json" && ! -L "$PI_DIR/mcp.json" ]]; then
  cp -p "$PI_DIR/mcp.json" "$BACKUP_DIR/mcp.json"
  echo "   backed up mcp.json"
fi

# ── 2. Symlink config files ──
echo ""
echo "🔗 Symlinking config files ..."
for f in "${SYMLINK_FILES[@]}"; do
  if [[ -f "$REPO_DIR/$f" ]]; then
    rm -f "$PI_DIR/$f"
    ln -s "$REPO_DIR/$f" "$PI_DIR/$f"
    echo "   linked $f → $REPO_DIR/$f"
  else
    echo "   skipped $f (not in repo)"
  fi
done

# ── 3. Generate mcp.json from template ──
# The repo tracks mcp.json with ${GITHUB_TOKEN} placeholder.
# We generate the real mcp.json with the env var substituted.
echo ""
echo "🔐 Generating mcp.json from template ..."
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  envsubst < "$REPO_DIR/mcp.json" > "$PI_DIR/mcp.json"
  echo "   mcp.json generated (GITHUB_TOKEN injected)"
else
  # Fallback: if user has a backup with the real token, restore it
  if [[ -f "$BACKUP_DIR/mcp.json" ]]; then
    cp "$BACKUP_DIR/mcp.json" "$PI_DIR/mcp.json"
    echo "   ⚠️  GITHUB_TOKEN not set — restored mcp.json from backup"
  else
    echo "   ⚠️  GITHUB_TOKEN not set and no backup — mcp.json may be incomplete"
    cp "$REPO_DIR/mcp.json" "$PI_DIR/mcp.json"
  fi
fi

# ── 4. Install as pi package (skills + extensions loaded live) ──
echo ""
echo "📦 Installing as pi package ..."
if command -v pi >/dev/null 2>&1; then
  pi install "$REPO_DIR"
  echo "   installed — skills/extensions loaded from repo"
else
  echo "   ⚠️  pi CLI not found. Run manually: pi install $REPO_DIR"
fi

# ── 5. Symlink remaining directories ──
echo ""
echo "🔗 Symlinking data directories ..."
for d in memory git; do
  if [[ -d "$REPO_DIR/$d" ]]; then
    # Backup if it's a real directory
    if [[ -d "$PI_DIR/$d" && ! -L "$PI_DIR/$d" ]]; then
      cp -a "$PI_DIR/$d" "$BACKUP_DIR/$d"
      rm -rf "$PI_DIR/$d"
      echo "   backed up $d/"
    fi
    ln -s "$REPO_DIR/$d" "$PI_DIR/$d"
    echo "   linked $d/ → $REPO_DIR/$d"
  fi
done

echo ""
echo "✅ Done! Config linked to $PI_DIR"
echo "   Edit files in $REPO_DIR → Pi sees changes instantly."
echo "   Rollback: cp -a $BACKUP_DIR/* $PI_DIR/"