# Component Gallery Reference

Production-grade UI component knowledge — 2,676 real-world examples from 60 components across 100+ design systems, plus best practices and layout patterns.

## File Structure

| File | Purpose |
|------|---------|
| `components.md` | Best practices, common layouts, and aliases for all 60 components |
| `LOOKUP.md` | Vocabulary resolution — maps user terms to canonical component names |
| `components/INDEX.md` | Browsable index of all design system implementations |
| `components/{category}.md` | Design system examples with URLs and preview images |

## When to Read What

| Situation | Read |
|-----------|------|
| Building deck options for a UI component | `components.md` for best practices |
| User's term is ambiguous ("dropdown", "popup") | `LOOKUP.md` to resolve vocabulary |
| Need concrete visual references from real design systems | `components/{category}.md` |
| Want to see how Blueprint/Ant/Carbon implements X | `components/{category}.md` for URLs |

## Categories

- **[Actions](components/actions.md)** (294 examples) — Button, Button group, Dropdown menu, Link, Segmented control
- **[Navigation](components/navigation.md)** (281 examples) — Breadcrumbs, Navigation, Pagination, Skip link, Stepper, Tabs
- **[Inputs](components/inputs.md)** (726 examples) — Checkbox, Combobox, Datepicker, Select, Slider, Text input, Toggle, etc.
- **[Data Display](components/data-display.md)** (663 examples) — Accordion, Avatar, Badge, Card, Table, Tree view, etc.
- **[Feedback](components/feedback.md)** (420 examples) — Alert, Progress bar, Skeleton, Spinner, Toast, Tooltip
- **[Overlays](components/overlays.md)** (170 examples) — Drawer, Modal, Popover
- **[Layout](components/layout.md)** (111 examples) — Footer, Header, Hero, Separator, Stack
- **[Utilities](components/utilities.md)** (11 examples) — Visually hidden

## Design System Visual Languages

Use this table as vocabulary for generating distinct options:

| Design System | Visual Language | Good For |
|---------------|-----------------|----------|
| **98.css** | Windows 95 retro, beveled borders, system fonts | Nostalgic, developer tools |
| **Ant Design** | Clean lines, blue primary, minimal chrome | Modern web apps, dashboards |
| **Blueprint** | Dense, utilitarian, dark-mode native, monospace | Developer tools, data-dense UIs |
| **Carbon** | IBM enterprise, subtle depth, structured grid | Enterprise apps, B2B |
| **Material** | Elevation shadows, ripple effects, bold color | Consumer apps, mobile-first |
| **Chakra** | Composable, accessible defaults, clean aesthetic | React apps, rapid prototyping |
| **Radix** | Unstyled primitives, accessibility-first | Custom design systems |
| **shadcn/ui** | Tailwind-based, copy-paste components | Next.js apps, modern stacks |
| **Spectrum** | Adobe polish, refined interactions | Creative tools |
| **Shoelace** | Web components, themeable | Framework-agnostic projects |

## When to Use Distinct Systems vs Variations

| Context | Approach |
|---------|----------|
| Exploring the design space | **Distinct systems** — Blueprint vs Ant vs 98.css |
| Project has established aesthetic | **Variations within that system** |
| User specifies a style | **Variations of that style** |
| Early exploration, no constraints | **Distinct systems** — maximize range |

## Using the Design System Examples

Each entry in `components/{category}.md` includes:

```
- [ComponentName](url) — DesignSystem · Tech · Features · [preview](imageUrl)
```

**Example from inputs.md:**
```
- [Checkbox](https://ant.design/components/checkbox) — Ant Design · React — Code examples, Open source · [preview](https://component.gallery/_astro/...)
```

Use the URLs to:
- Reference actual documentation when generating options
- View preview images for visual inspiration
- Note the tech stack (React, Vue, Web Components) for context

## Workflow

1. **Resolve vocabulary** — Check `LOOKUP.md` if the user's term is ambiguous
2. **Read best practices** — `components.md` for the component's patterns and layouts
3. **Browse implementations** — `components/{category}.md` for real examples
4. **Generate distinct options** — Apply different design system vocabularies

## Attribution

- Component knowledge from [ui-design-brain](https://github.com/carmahhawwari/ui-design-brain) by [@Carmahhawwari](https://x.com/Carmahhawwari)
- Design system examples from [component.gallery](https://component.gallery) by [Iain Bean](https://iainbean.com)
