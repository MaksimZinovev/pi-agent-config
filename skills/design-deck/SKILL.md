---
name: design-deck
description: Present visual options for architecture, UI, and code decisions with high-fidelity side-by-side previews. For comparing approaches visually — code diffs, diagrams, UI mockups, images — not for gathering structured input (use interview for that). Supports previewBlocks (code, mermaid, image, html), previewHtml, generate-more loops, and plan/PRD-driven flows.
---

> **`design_deck` is a direct tool — call it directly, not via MCP.**

# Design Deck Workflow

Use this skill when the task requires presenting multiple visual directions and collecting explicit user choices. Load this skill before building any deck to get the full format reference.

**Design deck vs interview:** The design deck is for *visual* comparisons — rendered UI mockups, architecture diagrams, syntax-highlighted code, images. If the options are just text, use `interview` with `single`-type questions instead. It's faster, doesn't open a browser, and displays text natively. The deck adds value only when you need to *see* the difference, not just read it.

## Entry Points

Three slash commands cover the main flows:

- `/deck` — General purpose. Reads codebase and plan/PRD context, presents visual options. If the request is underspecified and no plan exists, interviews the user in depth first.
- `/deck-plan <path>` — Reads a plan or PRD, identifies decision points, and presents visual options for each.
- `/deck-discover` — Two-phase: in-depth interview first to gather requirements, then design deck from responses. Use when starting from scratch with no plan.

## When to Build a Deck Directly

Build a deck directly when there's enough context to produce meaningful visual options:

- A plan or PRD exists that outlines what needs to be built
- The user asked for specific visual options (e.g., "show me 3 ways to redesign the sidebar")
- The conversation has already established clear constraints

Interview first when requirements are genuinely ambiguous, multi-dimensional, or missing critical constraints — goals, audience, aesthetics, technical boundaries. Don't force discovery when you already have what you need.

## Plan/PRD-Driven Flow

When working from an existing plan or PRD:

1. Read the plan in full. Also read the actual codebase files it references — not just the sections mentioned, but enough surrounding code to understand the real state.
2. Identify the key design and architecture decisions embedded in the plan. Not every section is a decision — focus on points where multiple viable approaches exist.
3. Build a slide for each decision point. Options should be faithful to the plan's goals but offer genuinely different approaches.
4. Reference specific plan sections in `aside` text and recommendations.

## Slide Structure

Build 1 decision per slide.

Provide 2-4 options per slide that are genuinely distinct in direction, not tiny variants.

Each slide supports an optional `columns` property (1, 2, 3, or 4) to override the auto-detected grid. **Omit `columns` by default** — the auto-layout picks 2 or 3 columns based on option count, which is correct for most content. Only override to `columns: 1` when options contain wide architecture diagrams or detailed code that genuinely needs full viewport width. Use `columns: 4` when presenting many small, comparable items (e.g., icon sets, color swatches).

Each slide supports an optional `context` property — a string displayed below the title that frames the decision for the user.

Each option must include:
- `label`
- Either `previewHtml` or `previewBlocks` (exactly one, not both)
- `description` (optional — short rationale shown on hover)
- `aside` (optional — explanatory text rendered below the preview with styled typography, supports `\n` for line breaks)
- `recommended` (optional)

## previewHtml vs previewBlocks

Use `previewHtml` for rich, custom UI mockups with inline styles. This is the original approach and works for anything that needs full HTML control.

Use `previewBlocks` when the preview is composed of standard block types. Each block is a typed object in an array:

- `{ "type": "html", "content": "<div>...</div>" }` — raw HTML snippet
- `{ "type": "mermaid", "content": "graph LR\n  A-->B" }` — Mermaid diagram (flowchart, sequence, ER, etc.)
- `{ "type": "code", "code": "const x = 1;", "lang": "ts" }` — syntax-highlighted code block
- `{ "type": "image", "src": "/absolute/path.png", "alt": "description", "caption": "optional" }` — image from disk

Blocks render in order, stacked vertically. Mix block types freely within one option.

Mermaid blocks accept an optional `theme` object to override default Mermaid theme variables per-block: `{ "type": "mermaid", "content": "...", "theme": { "primaryColor": "#..." } }`.

## Image Blocks

Image blocks reference absolute file paths on disk. The server copies the file into a temp directory and serves it via `/assets/`. The browser never sees the original path.

If `surf` CLI is available, generate images for architecture diagrams:

```bash
which surf
surf gemini "isometric microservices architecture, blue nodes, dark bg" \
  --generate-image /tmp/deck-arch.png --aspect-ratio 4:3
```

Then reference the file in the image block. If `surf` isn't installed, use mermaid or code blocks instead.

## previewHtml Guidance

`previewHtml` should be a self-contained HTML snippet that renders realistic UI inside the deck card.

No iframes. The deck injects `previewHtml` directly into `.preview` via `innerHTML`.

Keep snippets production-like, readable, and complete enough for side-by-side comparison.

## Creating Distinctive Options

The core principle across all preview types: each option should represent a genuinely different approach, not a surface-level variant of the same idea. If your options differ only in color or wording, they're not distinct enough.

### The Sameness Trap

Recognize when you're generating variants instead of alternatives:

- **Architecture slides:** Three options that are all "microservices with slightly different boundaries" — instead of monolith vs microservices vs serverless
- **Code pattern slides:** Three options using the same paradigm with different variable names — instead of OOP vs functional vs data-oriented
- **UI slides:** Three cards with different colors but identical layout and typography
- **API slides:** Three REST endpoints with different naming conventions — instead of REST vs GraphQL vs RPC

The test: could a stakeholder with strong opinions pick one and reject the others for substantive reasons? If all options would lead to roughly the same implementation, they're not distinct.

### For Architecture & System Design

When presenting architecture options via mermaid diagrams or mixed blocks:

**Vary the structural approach, not the diagram style:**
- Monolith vs microservices vs serverless vs edge-first
- Sync vs async vs event-sourced
- SQL vs document vs graph vs time-series
- Centralized vs federated vs peer-to-peer

**Show different tradeoff priorities:**
- Option A optimizes for simplicity (fewer moving parts)
- Option B optimizes for scale (horizontal distribution)
- Option C optimizes for flexibility (plugin architecture)

**Use diagram type to match the story:**
- Flowcharts for request flows and decision trees
- Sequence diagrams for multi-party interactions
- ER diagrams for data models
- C4-style for system context

### For Code & API Patterns

When presenting code options via code blocks:

**Vary the paradigm or pattern, not the syntax:**
- Imperative vs declarative
- Inheritance vs composition
- Push vs pull (callbacks vs polling)
- Eager vs lazy evaluation
- Mutable vs immutable state

**Show enough code to reveal the philosophy:**
- Don't just show the happy path — include error handling if that's where approaches diverge
- Show the call site, not just the definition, if usage patterns differ
- Include the types/interfaces if the contract is the interesting part

**Make tradeoffs visible in the code itself:**
- Option A: 10 lines, easy to read, but couples X to Y
- Option B: 30 lines, more ceremony, but X and Y are independent
- Option C: 5 lines using library Z, but adds a dependency

### For UI Mockups

When presenting UI options via `previewHtml`, avoid patterns that scream "AI-generated":

**Color anti-patterns:** indigo-500/violet-500/blue-500 as primary, blue-to-purple or pink-to-orange gradients, raw Tailwind defaults without customization.

**Typography anti-patterns:** Inter, Roboto, system-ui, or Arial as the only choice. Uniform sizing with no hierarchy.

**Layout anti-patterns:** Everything centered with uniform padding. Identical cards in a grid. Generic hero with "Welcome to [Product]" and a gradient button.

**Instead, commit to a direction:**
- Brutally minimal (stark typography, no decoration, lots of white space)
- Neo-brutalist (raw borders, asymmetric layouts, clashing scales)
- Terminal/retro (monospace type, phosphor greens, CRT effects)
- Editorial (serif headlines, refined spacing, thin rules)
- Dark luxury (deep blacks, gold accents, subtle gradients)

**Typography that creates hierarchy:**
- Headlines 3-4x larger than body, not 1.5x
- Mix weights dramatically (800 headlines, 300 body)
- Tight letter-spacing for headlines, generous for body

**Palettes with character (not Tailwind defaults):**
- Terminal: `#0d1117` bg, `#c9d1d9` text, `#7ee787` accent
- Warm noir: `#1a1814` bg, `#e8e4dd` text, `#d4a574` gold
- Editorial: `#faf7f2` bg, `#1c1917` text, `#dc2626` accent

**The test for UI distinctiveness:** Would these options appeal to different audiences or brand personalities? If option A and B would both work for the same brand, they're not distinct enough.

### For Images

Image blocks can show AI-generated visuals, screenshots, exported mockups, mood references, or photography direction. Use them when visual fidelity matters more than code-level detail.

**Generate images when useful:**
If `surf` CLI is available, generate architectural or UI visuals:
```bash
surf gemini "isometric database cluster, dark theme, blue nodes" \
  --generate-image /tmp/db-arch.png --aspect-ratio 16:9
```

**When to use images vs other blocks:**
- Use images for: visual style/mood, complex diagrams that mermaid can't express, real UI screenshots, photography or illustration direction
- Use mermaid for: system flows, sequences, ER diagrams — anything the user might want to iterate on structurally
- Use HTML for: interactive-feeling mockups where you want to show hover states, spacing, typography in context

**Make image options distinct:**
- Different visual styles (flat vs isometric vs hand-drawn)
- Different moods (corporate vs playful vs technical)
- Different levels of abstraction (high-level overview vs detailed component)
- Different color palettes that signal different brand directions

**Combine images with other blocks:**
An image showing the visual direction paired with a code block showing the implementation approach, or a mermaid diagram showing data flow alongside a generated image showing the UI that flow produces.

### Component Gallery Reference

When generating UI component options (tabs, accordions, tree views, buttons, etc.), read `./references/component-gallery/components.md` for best practices, common layouts, and aliases for 60 UI components.

The reference enables three things:
- **Discovery** — list, find, and suggest components for a use case ("I need expandable content" → accordion, disclosure, details)
- **Cross-referencing** — connect related terms (collapse = accordion = disclosure = expander; notification = alert = banner)
- **Design vocabulary** — know what design systems look like (Blueprint = dense, dark-native; Ant = clean, blue primary)

The `INDEX.md` provides a design system vocabulary table (Ant Design, Blueprint, Carbon, Material, etc.) and guidance on when to use distinct systems vs variations.

**Decide based on context:**
- **Distinct systems** (Blueprint vs Ant vs 98.css) when exploring the design space with no established aesthetic
- **Variations within a system** when the project already has a design direction or the user specifies a style

See `./references/component-gallery/INDEX.md` for the decision table and examples.

**Proactively browse real examples:** When you need visual inspiration for a component, fetch the component.gallery page directly:

- https://component.gallery/components/tabs/ — 80+ real tab implementations
- https://component.gallery/components/accordion/ — 100+ accordion examples
- https://component.gallery/components/button/ — 120+ button styles

Each page shows real screenshots from Ant Design, Blueprint, Carbon, Material, Shopify Polaris, and 90+ other design systems. Useful when you need concrete visual references — not required for every deck.

**When user vocabulary is unclear or ambiguous:** Read `./references/component-gallery/LOOKUP.md` to resolve user terms to canonical component names. The lookup file provides:

1. **Alias Index** — Direct mappings like `collapse → Accordion`, `snackbar → Toast`
2. **Disambiguation** — Rules for ambiguous terms like `dropdown` (Select? Combobox? Dropdown menu?) or `popup` (Modal? Popover? Tooltip?)
3. **Intent Clusters** — When users describe what they're trying to do ("I need users to pick from options"), maps constraints to components
4. **Clarification Templates** — Suggested questions when disambiguation is needed

Use the lookup before generating options if the user's component vocabulary seems imprecise or you're unsure which component they mean.

### For Mixed Previews

Many slides benefit from combining block types — a mermaid diagram showing structure alongside a code block showing usage, or an HTML mockup with a code block showing the component API.

When mixing, make sure the combination tells a coherent story:
- Diagram shows the "what," code shows the "how"
- HTML shows the UI, code shows the state management
- Image shows the inspiration, mermaid shows the technical translation

Don't just stack blocks for completeness. Each block should add information the others don't convey.

## After Deck Completes

The tool returns selections as a map of `slideId -> selected option label`.

Use these selections as the implementation contract for the final build.

## Generate-More Loop

When the user clicks generate-more, `design_deck` returns a result instructing which slide needs options and how many, along with the existing option labels.

Generate the requested number of new options, each meaningfully distinct from the existing ones.

Re-invoke with all options in a single call:

`design_deck({ action: "add-options", slideId: "...", options: "[{...}, {...}]" })`

The `add-options` call pushes all options into the live deck and blocks for the next user action. Use `add-options` (plural) for generate-more requests — it takes an array and handles blocking automatically.

### Model Override

The deck shows a model dropdown below the header (when 2+ models are available). Users can pick which model generates new options and optionally save it as the default.

When the generate-more result includes a model instruction (e.g. "Generate using model X via deck_generate"), use the built-in `deck_generate` tool to generate the options with that model:

```
deck_generate({ model: "google/gemini-3.1-pro", task: "Generate JSON deck options..." })
```

Parse the output as the options JSON array and pass it to `add-options`.

The default model can also be set in `~/.pi/agent/settings.json`:

```json
{
  "designDeck": {
    "generateModel": "google/gemini-3.1-pro"
  }
}
```

Priority: browser dropdown selection > settings default > current model (no delegation).

## Example: Architecture Comparison Deck

```json
{
  "title": "Architecture Direction",
  "slides": [
    {
      "id": "arch",
      "title": "System Architecture",
      "context": "Choose the high-level architecture for the backend.",
      "columns": 2,
      "options": [
        {
          "label": "Monolith",
          "description": "Single deployable, shared database",
          "aside": "Simpler to deploy and debug. Good starting point.\nWatch for coupling as the codebase grows.",
          "previewBlocks": [
            { "type": "mermaid", "content": "graph TD\n  Client-->API\n  API-->DB" },
            { "type": "code", "code": "app.listen(3000)", "lang": "ts" }
          ]
        },
        {
          "label": "Microservices",
          "description": "Event-driven, independently deployable",
          "aside": "Independent scaling and deployment per service.\nRequires service mesh, distributed tracing, and eventual consistency patterns.",
          "previewBlocks": [
            { "type": "mermaid", "content": "graph LR\n  Gateway-->Auth\n  Gateway-->Orders\n  Gateway-->Inventory" },
            { "type": "code", "code": "bus.publish('order.created', payload)", "lang": "ts" }
          ],
          "recommended": true
        }
      ]
    }
  ]
}
```
