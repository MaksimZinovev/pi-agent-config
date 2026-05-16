# TUI Input Debugging Reference

## Key Path: Input Event Flow
Terminal → `tui.handleInput(data)` → `focusedComponent.handleInput(data)` → `CustomEditor.handleInput(data)`

CustomEditor priority order (before reaching Editor's autocomplete handler):
1. `onExtensionShortcut?.(data)` — extension-registered keybindings (returns true = consumed)
2. App keybindings (escape, exit, clipboard)
3. Other app action handlers
4. `super.handleInput(data)` — Editor (handles Tab, autocomplete, text editing)

## Critical Bug Pattern: Ctrl+I = Tab
Terminals send Tab as `\t` which is the same byte as Ctrl+I. `matchesKey("\t", "ctrl+i")` returns **true**.
Any extension registering `ctrl+i` as a shortcut will **silently consume all Tab keypresses**,
preventing Editor autocomplete from ever firing. Debug logs in Editor won't help —
input never reaches Editor.handleInput.

## Debugging Checklist
1. Add `console.error("[X-DEBUG]")` to **CustomEditor.handleInput** (not just Editor.handleInput)
2. Check `onExtensionShortcut` — log all keypress data and which shortcut matched
3. `isShowingAutocomplete()` — use this guard to protect autocomplete-related keypresses
4. Verify fork build: `grep -c "DEBUG_STRING" packages/coding-agent/dist/modes/interactive/interactive-mode.js`
   Built JS must contain your debug strings or you're running the wrong binary.
5. Skill/extension commands go through `onSubmit` handler (line ~2091 interactive-mode.ts),
   not just Editor autocomplete — fix both paths.