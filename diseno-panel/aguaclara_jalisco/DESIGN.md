---
name: AguaClara Jalisco
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#414751'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727782'
  outline-variant: '#c1c7d2'
  surface-tint: '#0e60a6'
  primary: '#00477f'
  on-primary: '#ffffff'
  primary-container: '#0b5fa5'
  on-primary-container: '#bfd9ff'
  inverse-primary: '#a2c9ff'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#7cf2f3'
  on-secondary-container: '#006e6f'
  tertiary: '#703500'
  on-tertiary: '#ffffff'
  tertiary-container: '#944800'
  on-tertiary-container: '#ffccac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#7ff5f5'
  secondary-fixed-dim: '#60d8d9'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f50'
  tertiary-fixed: '#ffdcc7'
  tertiary-fixed-dim: '#ffb787'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#723600'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-key-info:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-prominent:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  label-badge:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies a public-utility aesthetic focused on civic utility, radical clarity, and accessibility for multi-generational citizens in Guadalajara, Jalisco. The personality is reassuring, reliable, and completely devoid of bureaucratic friction or tech jargon. It addresses critical, often stressful infrastructure situations (water shortages, quality issues) by delivering calm, high-legibility, and immediately actionable data.

The style combines **accessible civic minimalism** with **tactile clarity**:
- **Radical Readability:** High-contrast elements, generous line heights, and large touch targets engineered intentionally for older adults and individuals operating mobile devices under bright sunlight.
- **Accountless Frictionless Flow:** Visual affordances prioritize fast, immediate completion of reporting flows with zero login barriers.
- **Sensory Redundancy:** Color is never the sole conveyor of status or urgency; iconography, shapes, and clear Spanish text badges work together at every touchpoint.

## Colors

The palette establishes an immediate connection to municipal water infrastructure through deep trust and clarity:

- **Primary (`#0B5FA5` - Azul Profundo):** Anchors headers, primary interactive buttons, and critical active states. Provides robust contrast against light backgrounds.
- **Secondary / Accent (`#19A7A8` - Aqua Claro):** Used for supplementary visual cues, supporting links, focus highlights, and secondary informative metrics.
- **Canvas Neutral (`#F8FAFC` - Blanco Hielo):** Calming, glare-reducing off-white background that prevents eye fatigue.
- **Card Neutral (`#FFFFFF` - Blanco Puro):** Dedicated base for content containers and interactive surfaces to separate elevation layers crisply.
- **Text & Structure Neutrals:** Primary text (`#0F172A`) ensures maximum WCAG AAA contrast; muted labels use `#334155`; subtle borders use `#CBD5E1`.

### Civic Status Indicators (Severity Scale)
Status indicators must always be paired with textual labels and explicit semantic shapes/icons:
- **Pocos reportes (`#16A34A`):** Low incident volume; paired with a checkmark symbol.
- **Reportes moderados (`#D97706`):** Elevated notices; paired with a gentle triangle caution symbol.
- **Muchos reportes (`#DC2626`):** Critical community disruption; paired with a bold octagonal hazard symbol.
- **Sin datos suficientes (`#64748B`):** Insufficient data; paired with a neutral dash/circle symbol.
- **Falta de agua (`#0284C7`):** Explicit service suspension state; paired with a distinct crossed-out water drop symbol.

## Typography

Typography is set exclusively in **Inter** to leverage its tall x-height, open apertures, and exceptional legibility across both budget mobile displays and desktop environments.

- **Baseline Floor:** No text element intended for public reading falls below `16px`. Subtext or captions that traditionally appear at `12px` or `14px` are eliminated; auxiliary text maintains `15px-16px` with bolded weights to assist senior citizens and low-vision users.
- **Key Information Priority:** Address inputs, colonias/neighborhood headers, incident summaries, and submission confirmations use `body-key-info` (`18px`, medium weight) to prevent ambiguity.
- **Numbers and Data:** Tabular figures are enabled by default for water incident statistics and report counts, ensuring predictable alignment across municipal tables and cards.

## Layout & Spacing

The layout utilizes a structured, responsive fluid container with constrained maximum reading widths:

- **Touch Safety:** Vertical gaps between distinct interactive items maintain a minimum of `1rem` (16px) separation to avoid mis-taps.
- **Form Factor Breakpoints:**
  - **Mobile (< 640px):** Single-column layout. Margin is `1rem` (16px). Form components and status banners extend edge-to-edge within standard safe areas.
  - **Tablet (640px - 1024px):** 6-column fluid grid. Margin is `1.5rem` (24px). Split layout for report input and live neighborhood report summary.
  - **Desktop (> 1024px):** 12-column grid capped at a maximum width of `1120px` to maintain focused line length. Margin expands to `2.5rem` (40px).
- **Component Padding:** Standard cards employ `space-lg` (24px) internally on desktop and `space-md` (16px) on small screens to preserve a spacious, approachable civic feel.

## Elevation & Depth

To preserve extreme clarity and assist older users with spatial orientation, this design system avoids heavy drop shadows, frosted blurs, or ambiguous skeuomorphism. It utilizes **crisp tonal layering and ambient soft depth**:

- **Ground Level (Canvas):** `#F8FAFC` background provides a soft foundation.
- **Surface Level 1 (Cards & Modals):** Pure `#FFFFFF` surfaces paired with a dual-layer, diffuse ambient shadow:
  - `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04);`
  - Contours are framed with a hairline border (`1px solid #E2E8F0`) to ensure card boundaries remain discernible even on displays with shifted contrast calibrations.
- **Elevated Interactive Level 2 (Floating Action Buttons & Dialogs):**
  - `box-shadow: 0 4px 6px rgba(15, 23, 42, 0.08), 0 10px 24px rgba(15, 23, 42, 0.08);`
  - Used sparingly for the primary "Reportar falla" bottom action bar on mobile devices.

## Shapes

The design uses a friendly, calibrated geometry (`roundedness: 2`):

- **Cards & Primary Containers:** Standardized at `16px` border-radius (`rounded-lg`), delivering a soft, non-intimidating appearance that encourages community participation.
- **Buttons, Form Inputs, and Action Trays:** Sized with `12px` to `16px` radius, maintaining consistency with card curvatures.
- **Status Badges & Chips:** Finished with full pill caps (`9999px`) to create an immediate visual distinction between actionable controls and informative status indicators.

## Components

### Buttons & Touch Targets
- **Dimensions:** Strict minimum height of `52px` (exceeding standard `48px` minimum) with horizontal padding of `24px` to facilitate thumb interactions for older adults.
- **Primary Button:** `#0B5FA5` background, `#FFFFFF` text, `16px` bold label. Interactive hover states darken to `#094C84`; active states depress with a subtle scale transform (`0.99`). Focus ring uses a `3px solid #19A7A8` offset outline.
- **Secondary Button:** Outlined with `2px solid #0B5FA5`, transparent background, `#0B5FA5` text.
- **Tertiary / Simple Button:** Text-only action with minimum `48px` clickable tap box, underlined link styling with minimum `16px` font.

### Status Badges & Chips
- **Structural Rule:** Badges never rely on color alone. Each badge features a leading SVG icon, a high-contrast background tint, dark legible text, and a `1px` border matching the hue.
- **Badge Types:**
  - **Pocos reportes:** `#DCFCE7` background, `#14532D` text, checkmark icon, `#86EFAC` border.
  - **Reportes moderados:** `#FEF3C7` background, `#78350F` text, alert triangle icon, `#FCD34D` border.
  - **Muchos reportes:** `#FEE2E2` background, `#7F1D1D` text, warning octagon icon, `#FCA5A5` border.
  - **Sin datos suficientes:** `#F1F5F9` background, `#334155` text, circle dash icon, `#CBD5E1` border.
  - **Falta de agua:** `#E0F2FE` background, `#0369A1` text, crossed droplet icon, `#7DD3FC` border.

### Cards
- **Base Style:** `#FFFFFF` background, `16px` border-radius, `1px solid #E2E8F0`, and ambient low-opacity shadow.
- **Colonia / Neighborhood Card:** Displays the neighborhood name in `headline-sm`, active service status badge in the top right, last update timestamp in `body-base` (`#475569`), and verified incident tally in bold `18px`.

### Input Fields & Controls
- **Text Inputs & Dropdowns:** Minimum height of `52px`, `16px` text input, `2px` resting border (`#94A3B8`), and clear placeholder text in conversational Spanish.
- **Focus State:** `2px solid #0B5FA5` with an outer soft aqua focus halo (`#19A7A8` at 40% opacity).
- **Checkboxes & Radios:** Scaled up to `24px × 24px` minimum hit boxes with `12px` text labels beside them. Tap box surface padding extends to full `48px` touch target.

### Specialized Civic Components
- **Neighborhood Search Bar:** Prominent search input with built-in clear button (`X`), autocomplete suggestions with `20px` vertical list spacing, and immediate keyboard accessibility.
- **No-Account Incident Form:** Linear stepper or single-page view featuring big radio tiles for common issues (*"No hay agua en toda la calle"*, *"Baja presión"*, *"Agua turbia/sucia"*), accompanied by large, descriptive water iconography.