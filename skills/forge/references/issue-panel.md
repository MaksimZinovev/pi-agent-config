# Jira Issue Panel Module

## Module Registration

Forge app manifest (`manifest.yml`) registers the issue panel:

```yaml
modules:
  jira:issuePanel:
    - key: system-app-tester
      resource: main
      render: native
      title: My App Panel
      icon: https://...icon.png
```

## Context API

The panel receives issue context via `useProductContext()`:

```tsx
const context = useProductContext();
const issueKey = context.platformContext?.issueKey;  // e.g., "DEV-2"
const projectId = context.platformContext?.projectId;
```

## Key Architecture Decisions

1. **UI Kit vs Custom UI**: UI Kit (`render: native`) uses AtlasKit components directly. Custom UI uses iframe + React. UI Kit is preferred for issue panels — simpler deployment, no iframe isolation.

2. **State management**: Use `useState` for local UI state, `useProductContext()` for Jira context, and Forge resolver functions for data fetching.

3. **Column widths in UI Kit**: Use `xcss` with percentage widths on `<Box>` wrappers inside `<Inline>`. DynamicTable has its own `width` property on `HeadCellType[width]`.

## Common Patterns

### Scenario Table (UI Kit)

```tsx
<Stack space="space.0">
  <ScenarioTableHeader />  {/* Column headers matching row widths */}
  {scenarios.map(s => <ScenarioRow key={s.id} item={s} ... />)}
</Stack>
```

### Issue Panel Structure

```tsx
<Section title="App Title">
  <Stack space="space.100">
    <Header heading="Section Title" subheading={`Issue ${issueKey}`} />
    <DataTableSection items={...} onAction={...} />
  </Stack>
</Section>
```

## Data Flow

```
Jira Context (issueKey)
    ↓
useProductContext()
    ↓
Forge Resolver (invoke → API calls)
    ↓
ViewModel (data items)
    ↓
Row → Lozenge, Pill, Button
```