---
name: ViVouch Partner Insight
colors:
  surface: '#faf9fc'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f7'
  surface-container: '#F3EDF7'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#49454F'
  inverse-surface: '#303033'
  inverse-on-surface: '#f2f0f4'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#625b71'
  on-secondary: '#ffffff'
  secondary-container: '#e8def9'
  on-secondary-container: '#686177'
  tertiary: '#633b48'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d5260'
  on-tertiary-container: '#ffcbda'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e8def9'
  secondary-fixed-dim: '#ccc2dc'
  on-secondary-fixed: '#1e192b'
  on-secondary-fixed-variant: '#4a4358'
  tertiary-fixed: '#ffd9e3'
  tertiary-fixed-dim: '#eeb8c8'
  on-tertiary-fixed: '#31111d'
  on-tertiary-fixed-variant: '#633b48'
  background: '#faf9fc'
  on-background: '#1b1b1e'
  surface-variant: '#E7E0EB'
  success-green: '#218838'
  error-red: '#B3261E'
typography:
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max-width: 1440px
---

## Brand & Style
This design system is engineered for a high-density Partner Portal, focusing on clarity, trust, and data-driven decision-making. The brand personality is professional and efficient, yet approachable through its contemporary aesthetics.

The design style follows a **Corporate / Modern** approach with a focus on functional minimalism. It utilizes ample whitespace to prevent cognitive overload in data-rich environments. The interface relies on a sophisticated "Surface-on-Surface" architecture to organize complex information without relying on heavy borders or aggressive shadows.

## Colors
The palette is centered around a deep Indigo Primary (`#6750A4`), used for key actions and brand presence. The background is a clean, near-white neutral to maintain a professional "SaaS" look. 

We utilize a tiered surface system. The main background uses the neutral base, while secondary information and dashboard widgets reside in "Surface Container" tints. This subtle shifts in lightness create logical groupings. Named colors are reserved for status indicators (Success/Error) and specific UI metadata to ensure accessibility standards are met for data visualization.

## Typography
**Be Vietnam Pro** is the sole typeface, providing a contemporary and friendly feel while remaining highly legible in data tables. 

The type hierarchy is designed for utility. Headlines use a heavier weight (`600-700`) to provide strong anchors on dashboard pages. For data-dense views, `body-md` and `label-md` are the workhorse levels. Tighten letter-spacing on larger headlines to maintain a professional, "tucked-in" appearance. Mobile views should automatically scale down large display type to ensure a comfortable reading experience on smaller viewports.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop, centered on the viewport with a max-width of 1440px to ensure data visualizations don't become overly stretched.

A 12-column grid is used for dashboard layouts, allowing for flexible widget sizes (e.g., 3-column, 4-column, or 6-column widths). Spacing follows a 4px base unit. Margins are generous on desktop (32px) to provide "breathing room," but scale down to 16px on mobile. Gutters remain consistent at 24px to ensure distinct separation between data cards.

## Elevation & Depth
This system uses **Tonal Layers** as the primary method of showing depth, complemented by very soft **Ambient Shadows**.

1.  **Level 0 (Background):** Pure white or `#FDFBFF`.
2.  **Level 1 (Card/Container):** Uses a subtle background tint (`#F3EDF7`) or a white surface with a 1px border in `surface-variant`.
3.  **Level 2 (Interactive/Floating):** Applied to buttons or dropdowns. Uses a very diffused, low-opacity shadow (Color: `primary`, Opacity: 8%, Blur: 12px) to suggest interactability without creating visual clutter.

Avoid heavy black shadows; instead, use shadows tinted with the primary indigo to maintain color harmony.

## Shapes
In alignment with the professional yet approachable brand, we use a **Rounded** shape language. 

Standard UI elements like input fields, small buttons, and chips use a `0.5rem` radius. Large structural elements, specifically dashboard cards and container modules, use the `rounded-lg` (1rem) specification to create a distinct, modern silhouette. This softer geometry helps balance the "coldness" often found in data-heavy analytics portals.

## Components

-   **Buttons:** Primary buttons use the `#6750A4` fill with white text. Secondary buttons use a tonal indigo ghost style (indigo text on a light lilac background). Roundedness is strictly 8px (`0.5rem`).
-   **Cards:** The fundamental building block for analytics. Cards should have a white background, 16px padding, and `1rem` corner radius. Use a 1px border of `surface-variant` rather than a shadow for a cleaner look.
-   **Inputs:** Fields should be outlined with a 1px `on-surface-variant` border. On focus, the border thickens and changes to the primary indigo.
-   **Chips/Tags:** Used for status (e.g., "Active", "Pending"). These should be small, use `label-sm` typography, and have a pill-shaped (`rounded-xl`) radius.
-   **Data Tables:** Use `body-md` for row content. Header rows should have a subtle `surface-container` background and `label-md` bolded text. Row separators should be 1px and very faint.
-   **Charts:** When using graphs, start the color sequence with the Primary Indigo, then rotate through the Tertiary and Secondary palettes to maintain brand consistency.