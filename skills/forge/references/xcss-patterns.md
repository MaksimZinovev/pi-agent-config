# UI Kit xcss Patterns for Forge

## Column Layout Pattern

Use `<Box xcss={...}>` for fixed-percentage columns inside `<Inline>`:

```tsx
const COL_WIDTHS = {
  name: "45%",
  status: "15%",
  date: "15%",
  actions: "25%",
} as const;

const columnStyles = {
  name: xcss({ width: COL_WIDTHS.name }),
  status: xcss({ width: COL_WIDTHS.status }),
  date: xcss({ width: COL_WIDTHS.date }),
  actions: xcss({ width: COL_WIDTHS.actions }),
};

// In JSX
<Inline alignBlock="center" space="space.100">
  <Box xcss={columnStyles.name}><Text>{name}</Text></Box>
  <Box xcss={columnStyles.status}><Lozenge>{status}</Lozenge></Box>
  // ...
</Inline>
```

**Common mistake:** Using `Inline` with `space="space.100"` and `spread="space-between"` for table-like layouts → columns don't align when content varies. Use fixed `%` widths instead.

## Status Indicator Patterns

### Lozenge (has text — use background tokens are OK)
```tsx
// ✅ Lozenge has text contrast built-in
<Lozenge appearance="success">Passed</Lozenge>
<Lozenge appearance="removed">Failed</Lozenge>
<Lozenge appearance="inprogress">Blocked</Lozenge>
<Lozenge appearance="default">Not run</Lozenge>
```

### Pill (no text — MUST use icon tokens)
```tsx
// ❌ BAD — background token on small element = invisible on white
<Box xcss={{ backgroundColor: "color.background.success", width: "20px", height: "10px", borderRadius: "radius.small" }} />

// ✅ GOOD — icon token = bold, visible color
<Box xcss={{ backgroundColor: "color.icon.success", width: "24px", height: "16px", borderRadius: "radius.small" }} />

// ✅ BEST — with aria-label and tooltip for accessibility
<Tooltip content="Run 3: Passed" position="mouse">
  <Box xcss={{ backgroundColor: "color.icon.success", width: "24px", height: "16px", borderRadius: "radius.small" }}
       aria-label="Run 3: Passed" />
</Tooltip>
```

### Minimum pill dimensions (WCAG 2.5.8)
- Minimum target: **24×24px** for interactive elements
- Minimum visible: **16px height** for non-interactive indicators
- Never below **10px height** — barely visible, fails size requirements

## Empty State Pattern

```tsx
// ❌ BAD — renders null, column disappears
const historyPills = recentStatuses.length > 0 ? <Inline>...</Inline> : null;

// ✅ GOOD — shows placeholder
const historyPills = recentStatuses.length > 0
  ? <Inline alignBlock="center" space="space.050">{recentStatuses.map(...)}</Inline>
  : <Text color="subtlest">—</Text>;
```

## Hover States

For row hover highlighting in scenario tables:
```tsx
const rowStyles = xcss({
  borderBottomColor: "color.border",
  borderBottomStyle: "solid",
  borderBottomWidth: "border.width",
  paddingBlock: "space.100",
  paddingInline: "space.150",
  ":hover": {
    backgroundColor: "color.background.neutral.subtle",
  },
});
```

## Column Header Row

Match data row column widths exactly:
```tsx
export const TableHeader = () => (
  <Box xcss={rowStyles}>
    <Inline alignBlock="center" shouldWrap space="space.100">
      <Box xcss={columnStyles.name}><Text size="small" weight="semibold" color="subtlest">Name</Text></Box>
      <Box xcss={columnStyles.status}><Text size="small" weight="semibold" color="subtlest">Status</Text></Box>
      // ... matching widths ...
    </Inline>
  </Box>
);
```