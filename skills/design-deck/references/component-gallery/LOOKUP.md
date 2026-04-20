# Component Lookup

Resolve user vocabulary to canonical component names.

## How to Use

1. **User names a component** → Check the Alias Index for direct mapping
2. **Term is marked ⚠️** → Read the Disambiguation section for that term
3. **User describes intent** ("I need something that...") → Use the Intent Clusters
4. **Still unclear** → Ask a clarifying question before generating options

---

## Alias Index

One line per term. Format: `term → Component` or `term → ⚠️ [ambiguous options]`

```
accordion → Accordion
action bar → Button group
action menu → Dropdown menu
activity indicator → Spinner
alert → Alert
anchor → Link
app bar → Header
autocomplete → Combobox
avatar → Avatar

badge → Badge
banner → Alert
blank slate → Empty state
box → Card
breadcrumb → Breadcrumbs
breadcrumbs → Breadcrumbs
bubble → Popover
btn → Button
button → Button
button bar → Button group
button group → Button group
button toggle → Segmented control

calendar → Datepicker
callout → Alert
card → Card
carousel → Carousel
check box → Checkbox
checkbox → Checkbox
checkmark → Checkbox
chip → ⚠️ [Badge, Combobox (multi-select)]
chips → ⚠️ [Badge, Combobox (multi-select)]
collapse → Accordion
collapsible → Accordion
combo box → Combobox
combobox → Combobox
completion bar → Progress bar
container → Card
context menu → Dropdown menu
crumbs → Breadcrumbs

date input → Datepicker
date picker → Datepicker
date selector → Datepicker
datepicker → Datepicker
dialog → Modal
disclosure → Accordion
divider → Separator
dot → Badge
drawer → Drawer
dropdown → ⚠️ [Select, Combobox, Dropdown menu]
dropdown menu → Dropdown menu
dropzone → File upload

empty state → Empty state
error message → Alert
expand → Accordion
expandable → Accordion
expander → Accordion

file input → File upload
file picker → File upload
file selector → File upload
file upload → File upload
filterable select → Combobox
floating panel → Popover
fold → Accordion
foldable → Accordion
footer → Footer

gallery → Carousel
grouped buttons → Button group

header → Header
hero → Hero
hero banner → Hero
horizontal rule → Separator
hover card → Popover
hr → Separator
hyperlink → Link

image slider → Carousel
info box → Alert
info bubble → Popover
initials → Avatar
inline message → Alert
input → ⚠️ [Text input, or any form control]

jumbotron → Hero

label → ⚠️ [Badge, or form label (not a component)]
left nav → Navigation
lightbox → Modal
line → Separator
link → Link
list → ⚠️ [List, Table, Cards]
list view → List
listing → List
listbox → Select
loader → ⚠️ [Spinner, Progress bar, Skeleton]
loading → ⚠️ [Spinner, Progress bar, Skeleton]
loading bar → Progress bar
loading indicator → Spinner
loading placeholder → Skeleton
loading spinner → Spinner

main nav → Navigation
masthead → Header
menu → ⚠️ [Navigation, Dropdown menu]
message → Alert
modal → Modal
modal dialog → Modal
more menu → Dropdown menu
multi-select → Select (multi) or Combobox (multi)
multi-step → Stepper

nav → Navigation
navbar → Header
navigation → Navigation
navigation bar → Header
navigation path → Breadcrumbs
no data → Empty state
no results → Empty state
notice → Alert
notification → ⚠️ [Alert, Toast]
notification badge → Badge

off-canvas → Drawer
omnibar → Search input
option button → Radio button
option buttons → Segmented control
options menu → Dropdown menu
overlay → ⚠️ [Modal, Drawer, Popover]
overflow menu → Dropdown menu

page footer → Footer
page navigation → Pagination
page numbers → Pagination
pager → Pagination
pagination → Pagination
panel → ⚠️ [Card, Drawer, Popover]
path → Breadcrumbs
percentage bar → Progress bar
picker → ⚠️ [Select, Combobox, Datepicker]
pill → Badge
pill toggle → Segmented control
placeholder → Skeleton
placeholder state → Empty state
pop-up → ⚠️ [Modal, Popover, Tooltip]
popover → Popover
popup → ⚠️ [Modal, Popover, Tooltip]
popup menu → Dropdown menu
primary navigation → Navigation
profile image → Avatar
profile photo → Avatar
profile picture → Avatar
progress → Progress bar
progress bar → Progress bar
progress indicator → Progress indicator
progress steps → Stepper

radio → Radio button
radio button → Radio button
radio group → Radio button
range input → Slider
range slider → Slider
rating → Rating
review stars → Rating
rotator → Carousel

score → Rating
scrubber → Slider
search → Search input
search bar → Search input
search box → Search input
search field → Search input
search input → Search input
search select → Combobox
searchable dropdown → Combobox
segment → Segmented control
segmented control → Segmented control
select → Select
select box → Select
select input → Select
separator → Separator
sheet → Drawer
showyhideything → Accordion
shimmer → Skeleton
side nav → Navigation
side navigation → Navigation
side panel → Drawer
sidebar → ⚠️ [Navigation, Drawer]
single select → Radio button
site footer → Footer
site header → Header
site nav → Navigation
skeleton → Skeleton
skeleton loader → Skeleton
slide-over → Drawer
slider → Slider
slideshow → Carousel
snackbar → Toast
spinner → Spinner
splash → Hero
star rating → Rating
stars → Rating
status indicator → Badge
stepper → Stepper
steps → Stepper
submit button → Button
switch → Toggle
switcher → Segmented control
swiper → Carousel

tab → Tabs
table → Table
tabs → Tabs
tag → ⚠️ [Badge, Combobox (multi-select)]
tag input → Combobox (multi-select with visible tags)
tags → ⚠️ [Badge, Combobox (multi-select)]
text area → Textarea
text field → Text input
text input → Text input
text link → Link
textarea → Textarea
throbber → Spinner
tick box → Checkbox
tile → Card
timeline → ⚠️ [Progress indicator, Stepper]
toast → Toast
toggle → Toggle
toggle group → Segmented control
toolbar → Button group
toolbar buttons → Button group
tooltip → Tooltip
top bar → Header
track → Slider
trail → Breadcrumbs
tree → Tree view
tree view → Tree view
typeahead → Combobox

upload → File upload
user icon → Avatar
user image → Avatar

warning → Alert
wizard → Stepper
workflow → Stepper

zero state → Empty state
```

---

## Disambiguation

When a term is marked ⚠️ above, use these rules to resolve it.

### dropdown

| User's Context | Component |
|----------------|-----------|
| "dropdown in a form" / "select a value" | **Select** |
| "dropdown with search" / "type to filter" | **Combobox** |
| "dropdown menu" / "actions" / "click to show options" | **Dropdown menu** |

**Clarifying question:** "Is this for selecting a form value, or for showing actions/navigation?"

### popup / overlay / pop-up

| User's Context | Component |
|----------------|-----------|
| "blocks the page" / "confirmation" / "important" | **Modal** |
| "appears near the button" / "details on click" | **Popover** |
| "slides in from the side" / "panel" | **Drawer** |
| "hint on hover" / "small label" | **Tooltip** |

**Clarifying question:** "Should it block interaction with the page, or appear near a trigger element?"

### loading / loader

| User's Context | Component |
|----------------|-----------|
| "don't know how long" / "indeterminate" | **Spinner** |
| "shows percentage" / "progress" / "determinate" | **Progress bar** |
| "shows layout while loading" / "placeholder" | **Skeleton** |

**Clarifying question:** "Is the wait duration known (progress bar) or unknown (spinner)? Or do you want a layout preview (skeleton)?"

### notification

| User's Context | Component |
|----------------|-----------|
| "inline" / "stays on page" / "persistent" | **Alert** |
| "pops up briefly" / "auto-dismiss" / "temporary" | **Toast** |

**Clarifying question:** "Should it stay visible until dismissed, or disappear automatically?"

### dialog

| User's Context | Component |
|----------------|-----------|
| "shows content" / "form" / "information" | **Modal** |
| "requires decision" / "confirm/cancel" / "destructive action" | **Modal** (alert dialog pattern) |

Usually both map to Modal. The distinction is in the content and dismissal behavior, not the component.

### menu

| User's Context | Component |
|----------------|-----------|
| "site navigation" / "main menu" / "pages" | **Navigation** |
| "actions on click" / "context menu" / "more options" | **Dropdown menu** |

**Clarifying question:** "Is this for site/app navigation, or for contextual actions?"

### sidebar

| User's Context | Component |
|----------------|-----------|
| "always visible" / "navigation links" / "left nav" | **Navigation** (vertical layout) |
| "slides in" / "temporary" / "overlay" | **Drawer** |

**Clarifying question:** "Is it always visible, or does it slide in when triggered?"

### list

| User's Context | Component |
|----------------|-----------|
| "display items" / "show data" | **List** |
| "rows and columns" / "sortable" / "structured data" | **Table** |
| "visual items" / "thumbnails" / "grid" | **Cards** |
| "select from options" | **Select** or **Radio button** |

**Clarifying question:** "Is this for displaying data, or for user selection?"

### panel

| User's Context | Component |
|----------------|-----------|
| "content container" / "section" / "box" | **Card** |
| "slides from side" / "temporary" | **Drawer** |
| "appears near trigger" / "floating" | **Popover** |

**Clarifying question:** "Is this a static content container, or does it appear/disappear?"

### chip / chips / tag / tags

| User's Context | Component |
|----------------|-----------|
| "status label" / "category" / "read-only" | **Badge** |
| "user can add/remove" / "multi-select" / "input" | **Combobox** (multi-select) |

**Clarifying question:** "Are these labels for display, or can users add/remove them?"

### picker

| User's Context | Component |
|----------------|-----------|
| "select from list" | **Select** or **Combobox** |
| "choose a date" | **Datepicker** |
| "choose a file" | **File upload** |
| "choose a color" | **Color picker** (specialized) |

**Clarifying question:** "What type of value is being picked — a list option, date, file, or color?"

### label

| User's Context | Component |
|----------------|-----------|
| "status indicator" / "category" / "count" | **Badge** |
| "form field label" | Not a component — part of form field markup |

### input

Almost always **Text input**, but clarify if the context suggests:
- Date → **Datepicker**
- File → **File upload**
- Search → **Search input** or **Combobox**
- Number with range → **Slider**
- Selection → **Select**, **Combobox**, or **Radio button**

### timeline

| User's Context | Component |
|----------------|-----------|
| "progress through steps" / "wizard" / "multi-step" | **Stepper** or **Progress indicator** |
| "chronological events" / "activity feed" / "history" | **List** (styled with connectors) |

**Clarifying question:** "Is this showing progress through steps, or a chronological list of events?"

Note: A true "timeline" showing events isn't a standalone component in most systems — use a styled **List** with visual connectors.

---

## Intent Clusters

When users describe what they're trying to accomplish rather than naming a component.

### "I need users to pick/choose/select..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Few options (2-5), all visible | **Radio button** | Vertical list, one selection |
| Few options, inline/compact | **Segmented control** | Horizontal, button-like |
| Many options (6+) | **Select** | Hidden until clicked |
| Many options, searchable | **Combobox** | Type to filter |
| Multiple selections, few items | **Checkbox** | List of checkboxes |
| Multiple selections, many items | **Combobox** (multi) or **Select** (multi) | Compact, removable tags |
| Binary on/off | **Toggle** | Immediate effect |
| Binary yes/no in a form | **Checkbox** | Submit with form |

**Key question:** How many options, and can they select multiple?

### "I need to show/reveal/expand content..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Multiple collapsible sections | **Accordion** | Stack of expandable panels |
| Single expandable section | **Accordion** (1 item) | Or custom disclosure |
| Details near a trigger | **Popover** | Click to show, click away to dismiss |
| Hint text on hover | **Tooltip** | Brief, non-interactive |
| Important content, blocks page | **Modal** | Centered, with backdrop |
| Supplementary content, lots of space | **Drawer** | Slides from edge |
| Preview on hover | **Popover** or **Tooltip** | Depends on content size |

**Key question:** How important is it, and should it block the page?

### "I need to show status/feedback..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Inline message, stays visible | **Alert** | Info, success, warning, error |
| Brief notification, auto-dismiss | **Toast** | Bottom or top corner |
| Action completed | **Toast** | "Saved successfully" |
| Error that needs attention | **Alert** | Inline near the problem |
| Loading, unknown duration | **Spinner** | Indeterminate |
| Loading, known progress | **Progress bar** | 0-100% |
| Loading, preserve layout | **Skeleton** | Gray shapes matching content |
| No content to show | **Empty state** | Illustration + message + action |

**Key question:** Transient or persistent? Blocking or informational?

### "I need navigation..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Switch between views, same page | **Tabs** | Content below tabs |
| Site/app pages | **Navigation** or **Header** | Links to different pages |
| Show where user is | **Breadcrumbs** | Hierarchical path |
| Large result set | **Pagination** | Page numbers or prev/next |
| Deep hierarchy | **Tree view** | Expandable nodes |
| Secondary navigation | **Navigation** | Persistent left panel |
| Mobile navigation | **Drawer** | Hamburger menu → slide-in |
| Multi-step flow / wizard | **Stepper** or **Progress indicator** | Shows completed/current/upcoming steps |

**Key question:** Same page or different pages? How deep is the hierarchy?

### "I need to display data..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Rows and columns, structured | **Table** | Sortable, filterable |
| Visual items, thumbnails | **Cards** | Grid or list layout |
| Simple list of items | **List** | Text-focused |
| User identity | **Avatar** | Image or initials |
| Status or count | **Badge** | Small, inline |
| Score or rating | **Rating** | Stars or similar |
| Sequence of events | **List** (vertical) | Style as timeline with connectors |

### "I need form input for..."

| Constraint | Component | Notes |
|------------|-----------|-------|
| Short text | **Text input** | Single line |
| Long text | **Textarea** | Multi-line |
| Date | **Datepicker** | Calendar UI |
| Date range | **Datepicker** (range variant) | Two dates |
| File | **File upload** | Drag-drop or browse |
| Number in a range | **Slider** | Visual track |
| Search/filter | **Search input** or **Combobox** | With suggestions |

---

## Clarification Templates

When you need to ask before generating options:

### Selection ambiguity
> "How many options will users choose from? And can they select multiple?"

### Disclosure ambiguity
> "Should this overlay the page (modal) or appear near a trigger (popover)?"

### Loading ambiguity
> "Is the loading duration known (progress bar) or unknown (spinner)?"

### Notification ambiguity
> "Should the message stay until dismissed, or disappear automatically?"

### Navigation ambiguity
> "Is this navigation within the same page (tabs) or to different pages?"

### List ambiguity
> "Is this for displaying information, or for user selection?"

---

## Edge Cases

### Hybrid components

Some user requests combine multiple components:

| User Says | Likely Combination |
|-----------|-------------------|
| "searchable dropdown" | **Combobox** (single component) |
| "multi-select with tags" | **Combobox** (multi) or **Select** (multi) |
| "modal with form" | **Modal** containing form components |
| "sidebar navigation" | **Navigation** (vertical) or **Tree view** |
| "loading button" | **Button** with **Spinner** inside |
| "card with actions" | **Card** with **Button group** or **Dropdown menu** |

### Components that don't exist as standalone

| User Says | What They Need |
|-----------|----------------|
| "label" (form) | Part of form field markup, not a component |
| "icon" | Used within other components (Button, Avatar, etc.) |
| "grid" | Layout system, not a component |
| "container" | Usually **Card** or layout wrapper |
| "section" | Layout concept; maybe **Card** or **Separator** |
| "form" | Collection of form components |

### Platform-specific terms

| Term | Web Equivalent |
|------|----------------|
| "action sheet" (iOS) | **Drawer** (bottom) or **Dropdown menu** |
| "snackbar" (Material) | **Toast** |
| "FAB" (Material) | **Button** (floating variant) |
| "bottom sheet" (mobile) | **Drawer** (bottom) |
| "navigation drawer" (Material) | **Drawer** with **Navigation** inside |
| "app bar" (Material) | **Header** |
| "chip" (Material) | **Badge** or **Combobox** (multi) tag |

---

## Quick Reference: Common Confusions

| Often Confused | Key Difference |
|----------------|----------------|
| Select vs Combobox | Combobox is searchable/filterable |
| Radio vs Segmented control | Radio is form-native; segmented is button-like, often toolbar |
| Modal vs Drawer | Modal is centered + blocks; Drawer slides from edge |
| Modal vs Popover | Modal blocks page; Popover is near trigger, doesn't block |
| Tooltip vs Popover | Tooltip is small hint text; Popover has richer content |
| Alert vs Toast | Alert is persistent/inline; Toast is temporary |
| Badge vs Tag | Badge is status/count; Tag often implies removable/input |
| Toggle vs Checkbox | Toggle has immediate effect; Checkbox submits with form |
| Tabs vs Segmented control | Tabs switch content panels; Segmented control is a value selector |
| Accordion vs Tabs | Accordion is vertical, multiple can open; Tabs is horizontal, one at a time |
| Spinner vs Progress bar | Spinner is indeterminate; Progress bar shows percentage |
| Skeleton vs Spinner | Skeleton previews layout; Spinner is generic loading |
| List vs Table | List is simple items; Table has columns and structure |
| Navigation vs Tabs | Navigation goes to pages; Tabs switch content in place |
| Navigation (side) vs Drawer | Side navigation is persistent; Drawer slides in temporarily |

---

## Attribution

Component knowledge sourced from [component.gallery](https://component.gallery) and [ui-design-brain](https://github.com/carmahhawwari/ui-design-brain).
