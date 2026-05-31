# Browser Inspection of Forge Apps

## The Problem

Forge Custom UI apps render inside a **cross-origin iframe** with a CDN URL like:
```
https://<hash>-<hash>.cdn.prod.atlassian-dev.net/<app-id>/<env-id>/<module-id>/...
```

You **cannot** access the iframe DOM from the parent page:
```js
// ❌ This throws SecurityError
document.getElementById('iFrameResizer0').contentDocument
```

## Solutions

### 1. Chrome DevTools MCP (Primary — Use First)

```javascript
// List pages
chrome_devtools_list_pages

// Take snapshot (pierces iframes, shows accessibility tree)
chrome_devtools_take_snapshot

// Take visual screenshot
chrome_devtools_take_screenshot

// Click, fill, navigate using element uids from snapshot
chrome_devtools_click({ uid: "..." })
chrome_devtools_fill({ uid: "...", value: "..." })
chrome_devtools_navigate_page({ url: "..." })
```

**Important:** `take_snapshot` pierces iframes in the accessibility tree — use it first for structure. Use `take_screenshot` for visual verification.

### 2. Playwright CLI (Secondary — For Tests & Frame JS Evaluation)

```bash
# Start fresh headed session
playwright-cli session-stop-all
playwright-cli --headed open "https://instance.atlassian.net/browse/KEY-1"

# Take snapshot (includes iframe content via accessibility tree)
playwright-cli --headed snapshot

# Take visual screenshot
playwright-cli --headed screenshot

# Extract CSS from WITHIN the iframe using run-code
playwright-cli --headed run-code "const frame = page.frame('iFrameResizer0'); const result = await frame.evaluate(() => { /* your JS here */ }); console.log(JSON.stringify(result));"
```

Use playwright-cli when you need `page.frame()` for JS evaluation inside iframes, or for writing/running tests.

### 3. Inspecting Pill/Badge Colors

For small UI elements inside Forge iframes, use `playwright-cli --headed run-code` with the frame API:

```javascript
// Find and measure all small colored elements (pills, dots, badges)
const frame = page.frame('iFrameResizer0');
const pills = await frame.evaluate(() => {
  const all = document.querySelectorAll('*');
  const r = [];
  for (const el of all) {
    const s = getComputedStyle(el);
    const w = parseFloat(s.width);
    const h = parseFloat(s.height);
    if (w > 2 && w <= 40 && h > 2 && h <= 40 && s.borderRadius !== '0px'
        && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      r.push({
        tag: el.tagName,
        cls: String(el.className || '').substring(0, 80),
        w, h,
        bg: s.backgroundColor,
        br: s.borderRadius,
        bc: s.borderColor,
        innerText: (el.innerText || '').substring(0, 30)
      });
    }
  }
  return r;
});
```

### 4. Extracting Computed Styles by CSS Class

```javascript
// Find specific Forge app elements by CSS class pattern
const elements = await frame.evaluate(() => {
  const pills = document.querySelectorAll('[class*="css-"]');
  return Array.from(pills).map(el => ({
    cls: el.className,
    bg: getComputedStyle(el).backgroundColor,
    color: getComputedStyle(el).color,
    w: el.offsetWidth,
    h: el.offsetHeight
  }));
});
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| `SecurityError: Blocked a frame` | Use `page.frame()` instead of `contentDocument` |
| Agent runs headless (invisible browser) | Always use `playwright-cli --headed` |
| Stale session from previous agent | Run `playwright-cli session-stop-all` first |
| Forge iframe ID changes | Search by `iframe[src*="cdn.prod.atlassian"]` pattern |
| Element refs change between snapshots | Re-snapshot before every interaction |