# DESIGN.md

osaka-kenpo — Design System

## 1. Visual Theme & Atmosphere

Warm and approachable legal text viewer. Rose pink headers on cream parchment backgrounds make law articles feel less intimidating. Osaka dialect text appears in handwriting font (Klee One), creating a deliberate contrast between formal legal content and friendly local expression. The design says: "law doesn't have to be scary."

Inspirations: Japanese educational sites, warm stationery, legal document readability.

## 2. Color Palette & Roles

CSS custom properties + Tailwind extended colors.

| Variable          | Hex       | Usage                            |
| ----------------- | --------- | -------------------------------- |
| `--primary-color` | `#E94E77` | Headers, buttons, accents, brand |
| `--cream-color`   | `#FFF8DC` | Page background                  |
| `--brown-color`   | `#8B4513` | Secondary accent text            |
| Primary hover     | `#d63d6b` | Button hover (opacity-80)        |
| Badge pink        | `#ed6b8a` | Special card badges              |
| Amazon orange     | `#FF9900` | Amazon link button               |

Neutrals: `text-gray-800` body, `text-gray-500` / `text-gray-400` meta/labels.

## 3. Typography Rules

### Font Families

| Context       | Family                                        |
| ------------- | --------------------------------------------- |
| UI/body       | `system-ui, sans-serif`                       |
| Osaka dialect | `"Klee One", cursive` (Google Fonts, 400/600) |

### Type Scale

| Element       | Size                    | Weight | Notes                     |
| ------------- | ----------------------- | ------ | ------------------------- |
| Page title    | `text-2xl`              | bold   | Primary color             |
| Section title | `text-2xl`              | bold   | Primary color, border-b-2 |
| Article label | `text-lg`               | bold   | Primary color             |
| Body text     | `text-base` → `text-lg` | 400    | `leading-relaxed`         |
| Small         | `text-sm`               | 400    |                           |
| Extra small   | `text-xs`               | 400    | Badges, meta              |

Ruby annotations: `0.6em` for furigana.

`.osaka-text` class: Klee One font, primary color, normal weight.

## 4. Component Stylings

### Law Cards (Home Grid)

- Height: `128px` fixed
- Background: `#E94E77`
- Border radius: `rounded-lg` (8px)
- Shadow: `0 0 20px rgba(0,0,0,0.1)`
- Hover: `bg-opacity-80`
- Preparing state: `bg-gray-400`
- Badge: absolute top-left, `rounded-full`, `px-2 py-1`

### Article List Items

- Background: white
- Border-left: `4px solid #E94E77`
- Border radius: `rounded-lg`
- Shadow: `0 0 15px rgba(0,0,0,0.05)`, hover `0 0 20px rgba(0,0,0,0.1)`
- Padding: `p-6`
- Transition: `transition-shadow`

### Content Sections

- Background: white
- Border radius: `rounded-lg`
- Shadow: `0 0 20px rgba(0,0,0,0.08)`
- Padding: `p-8`
- Title: `border-b-2` in primary color

### Commentary Section

- Border: `2px solid red-400`
- Label: absolute top, circular red badge with lightbulb icon
- Padding: `p-6 pt-8`

### Buttons

- Primary: `bg-[#E94E77] hover:bg-opacity-80 text-white rounded-lg font-bold`
- Secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800`
- Ghost: `bg-gray-100 hover:bg-200 text-gray-700`

### View Mode Toggle

- Track: `w-16 h-8 bg-gray-200 rounded-full`
- Knob: `bg-[#E94E77] h-6 rounded-full shadow-md`
- Transition: `transition-transform`

### Speaker Button

- Size: `48px` circle
- Base: `bg-gray-100 hover:bg-gray-200`
- Active: `animate-pulse bg-blue-100 text-blue-600`

### Menu Sidebar

- Width: `w-72`
- Background: `gradient from-[#E94E77] to-[#d63d66]`
- Slide animation: `transition-transform` with `translateX`
- Backdrop: `bg-black bg-opacity-50`

## 5. Layout Principles

### Container

- `container mx-auto px-4`
- Article content: `max-w-4xl mx-auto`

### Grid

- Home page cards: `grid-cols-1 md:grid-cols-3 gap-4`

### Spacing

| Token   | Value                 |
| ------- | --------------------- |
| `p-6`   | Card/section padding  |
| `p-8`   | Large section padding |
| `mb-4`  | Card spacing          |
| `mb-8`  | Section spacing       |
| `mt-16` | Menu top padding      |

### Header/Footer

- Background: `#E94E77`
- Text: white
- Header: `px-4 pt-0.5 pb-1.5`, flex with hamburger/logo/toggle

## 6. Depth & Elevation

### Shadows

- Cards: `0 0 20px rgba(0,0,0,0.1)` (soft, spread)
- Articles: `0 0 15px rgba(0,0,0,0.05)` (subtle)
- Content: `0 0 20px rgba(0,0,0,0.08)` (consistent)
- Share popup: `shadow-xl`
- Speaker: `shadow-sm` → `shadow-md` on hover

### Border Radius

| Component | Radius             |
| --------- | ------------------ |
| Cards     | `rounded-lg` (8px) |
| Badges    | `rounded-full`     |
| Buttons   | `rounded-lg`       |
| Toggle    | `rounded-full`     |

### Z-Index

- Fixed buttons (back/share): `z-10`
- Menu sidebar: `z-20` + backdrop

## 7. Do's and Don'ts

### Do

- Use Klee One handwriting font exclusively for Osaka dialect text
- Apply `#E94E77` rose pink as the sole brand accent
- Keep content sections on white with soft spread shadows
- Use `border-b-2` in primary color under section titles
- Apply `leading-relaxed` on law article body text for readability
- Include furigana (ruby annotations) at `0.6em`
- Use `transition-shadow` on article hover

### Don't

- Use Klee One for UI chrome — it's only for dialect content
- Apply dark theme — this is a warm, light-only design
- Use sharp shadows (the spread shadow style is deliberate)
- Place borders on cards — shadows handle depth
- Override the cream background with pure white for the page

### Transitions

| Context      | Property  | Duration |
| ------------ | --------- | -------- |
| Card hover   | shadow    | default  |
| Text switch  | opacity   | 500ms    |
| Button state | colors    | default  |
| Menu slide   | transform | default  |
| Speaker      | all       | 200ms    |

## 8. Responsive Behavior

### Breakpoints

| Name | Value | Changes                   |
| ---- | ----- | ------------------------- |
| sm   | 640px | Text size, flex direction |
| md   | 768px | Grid 1→3 columns          |

### Mobile

- Single-column cards
- Hamburger menu
- Fixed action buttons (share, back, toggle)
- Full-width content with `px-4`

## 9. Agent Prompt Guide

### Color Quick Reference

```
Primary rose:    #E94E77
Cream bg:        #FFF8DC
Brown accent:    #8B4513
Primary hover:   #d63d6b
```

### When generating UI for this project

- Rose pink (`#E94E77`) is the brand — headers, buttons, accents, header/footer bg
- Cream (`#FFF8DC`) page background. White for content cards
- Klee One cursive font for Osaka dialect text only (`.osaka-text` class)
- System sans-serif for all other text
- Soft spread shadows (`0 0 20px rgba(0,0,0,0.08-0.1)`) — no hard shadows
- `leading-relaxed` on body text for law article readability
- `border-l-4` primary color accent on article list items
- Ruby annotations for furigana reading aids
- Mobile-first with hamburger menu navigation
- Keyboard support: spacebar toggles original/osaka text

### Color Emotion Reference

- **Rose (#E94E77):** Warmth, approachability, breaking legal formality
- **Cream (#FFF8DC):** Parchment, tradition, gentle reading surface
- **Brown (#8B4513):** Earthiness, groundedness, secondary emphasis
