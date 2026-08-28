# 🌱 Kuri'a Design System

A comprehensive, token-based design system built on a 3-layer **GTC architecture** (Globals → Tokens → Components) for the Kuri'a admin dashboard platform.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Layer 3: Component Tokens  (25 components)         │
│  components/*.json                                  │
│  References → Layer 2 tokens                        │
├─────────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens   (light + dark modes)    │
│  tokens/*.json                                      │
│  References → Layer 1 globals                       │
├─────────────────────────────────────────────────────┤
│  Layer 1: Global Primitives (raw values)            │
│  globals/*.json                                     │
│  Color scales, spacing, typography, etc.            │
└─────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Generate CSS from JSON tokens
node build.js

# Output: design-system.css
```

Include in your HTML:
```html
<link rel="stylesheet" href="design-system/design-system.css">
```

## File Structure

```
design-system/
├── globals/                    # Layer 1: Primitives
│   ├── colors.json             # 6 color scales × 11 steps
│   ├── typography.json         # Font families, sizes, weights
│   ├── spacing.json            # 8px base unit scale
│   ├── elevation.json          # Box shadow scale
│   ├── borders.json            # Border widths & radii
│   ├── motion.json             # Duration & easing curves
│   ├── opacity.json            # Opacity scale
│   └── z-index.json            # Stacking layers
│
├── tokens/                     # Layer 2: Semantic
│   ├── color.json              # Light mode colors
│   ├── color.dark.json         # Dark mode overrides
│   ├── typography.json         # Heading/body/label presets
│   ├── spacing.json            # Layout & component spacing
│   └── elevation.json          # Semantic shadows & radii
│
├── components/                 # Layer 3: Components (25)
│   ├── button.json             # 5 variants, 3 sizes
│   ├── card.json               # 3 variants
│   ├── input.json              # Text, textarea, states
│   ├── navbar.json             # Top navigation bar
│   ├── sidebar.json            # Admin sidebar
│   ├── modal.json              # Dialog/modal
│   ├── badge.json              # Status indicators
│   ├── alert.json              # Info/success/warning/error
│   ├── table.json              # Data tables
│   ├── tabs.json               # Tab navigation
│   ├── avatar.json             # User avatars, groups
│   ├── tooltip.json            # Hover tooltips
│   ├── toast.json              # Notifications
│   ├── pagination.json         # Page navigation
│   ├── skeleton.json           # Loading placeholders
│   ├── breadcrumb.json         # Path navigation
│   ├── dropdown.json           # Select menus
│   ├── toggle.json             # Switch controls
│   ├── stat-card.json          # KPI cards
│   ├── progress.json           # Progress bars
│   ├── form-field.json         # Form field wrapper
│   ├── search.json             # Search input
│   ├── file-upload.json        # File upload zone
│   ├── stepper.json            # Multi-step wizard
│   └── empty-state.json        # Empty placeholders
│
├── breakpoints.json            # Responsive breakpoints
├── build.js                    # Build pipeline
└── design-system.css           # Generated output
```

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Spacing base** | 8px | Industry standard, clean multiples |
| **Body font** | Inter | Excellent legibility at all sizes |
| **Heading font** | Outfit | Modern geometric, great for dashboards |
| **Primary color** | Green (agri-themed) | Aligned with Kuri'a brand identity |
| **Dark mode** | Automatic + manual | `prefers-color-scheme` + `data-theme` |
| **Token format** | JSON with `{ref}` syntax | Framework-agnostic, easy to parse |

## Usage

### CSS Custom Properties
All tokens are available as CSS custom properties:

```css
.my-card {
  background: var(--token-color-bg-surface);
  border: 1px solid var(--token-color-border-default);
  border-radius: var(--token-radius-lg);
  box-shadow: var(--token-elevation-card);
  padding: var(--token-spacing-component-lg);
}
```

### Dark Mode
Dark mode activates automatically via `prefers-color-scheme` or manually:

```html
<!-- Force dark -->
<html data-theme="dark">

<!-- Force light -->
<html data-theme="light">

<!-- Or use CSS class -->
<html class="dark">
```

### Utility Classes
Generated utility classes for common patterns:

```html
<h1 class="heading-xl text-heading">Dashboard</h1>
<p class="body-md text-secondary">Welcome back</p>
<div class="bg-surface rounded-lg shadow-card">...</div>
```

### Responsive
Tokens with `responsive` blocks auto-generate `@media` overrides:

```json
{
  "fontSize": "{global.typography.fontSize.4xl}",
  "responsive": {
    "mobile":  { "fontSize": "{global.typography.fontSize.2xl}" },
    "tablet":  { "fontSize": "{global.typography.fontSize.3xl}" }
  }
}
```

## Stats

| Metric | Count |
|--------|-------|
| Global primitives | 179 |
| Semantic tokens (light) | 172 |
| Dark mode overrides | 42 |
| Component tokens | 718 |
| **Total CSS properties** | **1,069** |
| Responsive overrides | 23 |
| Components | 25 |
| Output size | ~90 KB |

## Extending

### Adding a new component

1. Create `components/your-component.json`:
```json
{
  "component": {
    "your-component": {
      "_meta": { "description": "Your component description" },
      "bg": "{token.color.bg.surface}",
      "border-radius": "{token.radius.md}"
    }
  }
}
```

2. Run `node build.js` to regenerate CSS.

### Adding a new color scale

1. Add the scale to `globals/colors.json`
2. Create semantic mappings in `tokens/color.json` and `tokens/color.dark.json`
3. Rebuild.

## License

Internal — Kuri'a Platform Team
