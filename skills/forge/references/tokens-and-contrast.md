# AtlasKit Token Selection & Contrast Audit

Reference data for choosing correct AtlasKit design tokens. Use when styling status indicators, pills, badges, or any small colored UI element in Forge apps.

## Background Token Classes (NOT for indicators)

These tokens are designed for large page backgrounds. On white (#FFFFFF), they have ~1:1 contrast.

| Token | Hex | Approx. Luminance | Contrast on #FFF | WCAG AA (3:1) | WCAG AA Text (4.5:1) |
|-------|-----|-------------------|------------------|---------------|---------------------|
| `color.background.success` | #EFFFD6 | 0.946 | 1.05:1 | ❌ | ❌ |
| `color.background.danger` | #FFEBE6 | ~0.950 | 1.05:1 | ❌ | ❌ |
| `color.background.discovery` | #EAE6FF | ~0.930 | 1.08:1 | ❌ | ❌ |
| `color.background.neutral` | #F4F5F7 | ~0.960 | 1.04:1 | ❌ | ❌ |

## Foreground Token Classes (FOR indicators)

| Token | Purpose | Expected Contrast | WCAG |
|-------|---------|-------------------|------|
| `color.icon.success` | Bold green | ≥3:1 | ✅ |
| `color.icon.danger` | Bold red | ≥3:1 | ✅ |
| `color.icon.discovery` | Bold purple | ≥3:1 | ✅ |
| `color.icon.subtle` | Bold gray | ≥3:1 | ✅ |
| `color.text.success` | Green text | ≥4.5:1 | ✅ |
| `color.text.danger` | Red text | ≥4.5:1 | ✅ |
| `color.text.discovery` | Purple text | ≥4.5:1 | ✅ |

## Lozenge vs Pill Pattern

**Lozenge** (AtlasKit component): Has text content + background, built-in contrast via text color.
```tsx
<Lozenge appearance="success">Passed</Lozenge>  // ✅ Good for status text
```

**Pill** (custom Box): Small colored rectangle, NO text. Must use icon tokens for background.
```tsx
// ❌ Bad — background token on white = invisible
<Box xcss={{ backgroundColor: "color.background.success", width: "20px", height: "10px" }} />

// ✅ Good — icon token, visible
<Box xcss={{ backgroundColor: "color.icon.success", width: "20px", height: "10px" }} />
```

## WCAG Quick Reference

| Element Type | Minimum Contrast | Standard |
|-------------|-----------------|----------|
| Normal text (<18pt) | 4.5:1 | WCAG AA |
| Large text (≥18pt or ≥14pt bold) | 3:1 | WCAG AA |
| Non-text UI components | 3:1 | WCAG AA 1.4.11 |
| Minimum target size | 24×24px | WCAG 2.5.8 |

## Contrast Ratio Formula

```
L = 0.2126 × R_lin + 0.7152 × G_lin + 0.0722 × B_lin
Contrast = (L_lighter + 0.05) / (L_darker + 0.05)
Where:  R_lin = ((R_srgb / 255 + 0.055) / 1.055) ^ 2.4
```

## Measured Values — Template

When auditing a live Forge app, measure and record values in this format:

| Element | Property | Measured Value | WCAG Pass? |
|---------|----------|---------------|------------|
| [Status pill] | Width × Height | e.g. 20×10px | ❌ too small |
| [Status pill] | Background color | e.g. rgb(239, 255, 214) | ❌ 1.05:1 |
| [Status lozenge] | Text color | e.g. rgb(0, 102, 0) | ✅ 4.5:1 |
| [Empty column] | Content | null render | ❌ collapsed |

Fill this table during each audit. Replace project-specific data.