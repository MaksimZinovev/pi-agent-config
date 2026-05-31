---
name: forge
description: "Atlassian Forge app development — UI Kit, Custom UI, AtlasKit tokens, xcss layouts, Jira modules, and accessibility. Use this skill whenever you're building, debugging, or inspecting a Forge app, choosing AtlasKit design tokens, styling with xcss, working with Jira issue panels or Custom UI bridges, or auditing contrast/accessibility in Atlassian UI. Also use for forge deploy, forge tunnel, and any browser inspection of Forge iframe content."
---

# Forge App Development

Atlassian Forge UI Kit patterns, Custom UI bridge, AtlasKit tokens, and Jira module development.

**Progressive disclosure** — start with Lessons and Quick Reference below, then follow references for deep dives.

## Lessons Learned

1. **`color.background.*` tokens are for page backgrounds, NOT indicators** — They render as light pastels (~1.05:1 contrast on white). For pills, badges, icons, and status indicators, use `color.icon.*` or `color.text.*` instead, which are bold and saturated. See [tokens-and-contrast.md](references/tokens-and-contrast.md).

2. **Always verify rendered output visually** — AtlasKit tokens resolve differently in UI Kit vs Custom UI. Design docs may claim "sufficient contrast" but only live browser inspection confirms it. Use chrome-devtools MCP (`take_snapshot`, `take_screenshot`) first. Use `playwright-cli` only for writing tests or when MCP can't access iframes.

3. **Forge apps render in cross-origin iframes** — You CANNOT access the iframe DOM from the parent page (`SecurityError`). Use chrome-devtools `take_snapshot` (pierces iframes) first, or `playwright-cli --headed` frame API (`page.frame()`) as fallback. See [browser-inspection.md](references/browser-inspection.md).

4. **Always clean up browser sessions before starting** — Run `playwright-cli session-stop-all` before browser work. Stale sessions cause invisible/headless browsers.

5. **Pills/badges under 16px height fail WCAG 2.5.8** — Minimum target: 24×24px for interactive, 3:1 contrast for non-text UI. See [tokens-and-contrast.md](references/tokens-and-contrast.md).

6. **Empty states need placeholders** — When data-driven elements (pills, badges, lists) have zero items, render a placeholder (`—`, `No data`), not `null`. Null collapses the column and breaks layout.

7. **Design specs must define measurable thresholds** — "Sufficient size and contrast" is untestable. Specify: minimum contrast ratio (3:1 non-text, 4.5:1 text), minimum dimensions (24×16px), and token classes (`color.icon.success`, not `color.background.success`).

## Task Selection

| Task | Reference | Key Patterns |
|------|-----------|-------------|
| Token selection & contrast | [tokens-and-contrast.md](references/tokens-and-contrast.md) | background vs icon tokens, WCAG ratios |
| UI Kit xcss styling | [xcss-patterns.md](references/xcss-patterns.md) | Column layouts, Box/Inline/Stack, responsive |
| Jira issue panel modules | [issue-panel.md](references/issue-panel.md) | Module registration, context API, CustomUI bridge |
| Browser inspection of Forge apps | [browser-inspection.md](references/browser-inspection.md) | Iframe access, chrome-devtools, playwright frames |
| Deploy & test cycle | [deploy-test.md](references/deploy-test.md) | forge deploy, tunnel, environment variables |

## Quick Reference — AtlasKit Color Tokens

**NEVER for small status indicators** (1:1 contrast on white):
```
color.background.success  → #EFFFD6 (1.05:1 ❌)
color.background.danger   → #FFEBE6 (1.04:1 ❌)
color.background.discovery → #EAE6FF (1.08:1 ❌)
color.background.neutral  → #F4F5F7 (1.04:1 ❌)
```

**USE for indicators** (≥3:1 contrast on white):
```
color.icon.success       → Bold green  ✅
color.icon.danger        → Bold red    ✅
color.icon.discovery     → Bold purple ✅
color.icon.subtle        → Bold gray   ✅
```

Full data: [tokens-and-contrast.md](references/tokens-and-contrast.md).

## Browser Tool Hierarchy

**Primary: Chrome DevTools MCP** — `take_snapshot`, `take_screenshot`, `click`, `fill`, `navigate_page` for all page interaction and inspection. Snapshot pierces iframes.

**Secondary: Playwright CLI** — only for writing/running test files or JS evaluation inside iframes (`page.frame()`).

```bash
# Always clean stale sessions first
playwright-cli session-stop-all

# Headed mode for login-required pages
playwright-cli --headed open "https://<site>.atlassian.net/browse/<KEY>-<NUM>"
```

## xcss Column Layout

Use `<Box xcss={...}>` with fixed-percentage widths inside `<Inline>`:

```tsx
const COL_WIDTHS = { col1: "45%", col2: "25%", col3: "30%" } as const;
const columnStyles = {
  col1: xcss({ width: COL_WIDTHS.col1 }),
  col2: xcss({ width: COL_WIDTHS.col2 }),
  col3: xcss({ width: COL_WIDTHS.col3 }),
};
```

**Common mistake:** `Inline` with `space="space.100"` for table layouts → inconsistent columns. Use fixed `%` widths with `<Box xcss>` wrappers instead.

See [xcss-patterns.md](references/xcss-patterns.md) for status indicators, empty states, and hover patterns.