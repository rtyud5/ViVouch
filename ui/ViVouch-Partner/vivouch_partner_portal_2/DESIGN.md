---
name: ViVouch Partner Portal
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
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
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
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
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for the **ViVouch Partner Portal**, a B2B platform where Vietnamese merchants manage voucher campaigns and track performance. The brand personality is professional, efficient, and growth-oriented. It distances itself from the playful, consumer-facing side of the business to establish a "command center" environment that feels reliable and high-utility.

The aesthetic follows a **Modern Corporate** style with a focus on data density and clarity. It utilizes a predominantly white and light-gray palette to ensure that data visualizations and KPI metrics remain the focal point. The interface feels structured and rhythmic, emphasizing organized information architecture over decorative flair.

## Colors

The palette is anchored by a deep **Indigo (#6366F1)** as the primary brand color, signaling intelligence and stability. This distinguishes the partner portal from the consumer app's green branding. 

- **Primary:** Used for key actions, active navigation states, and primary brand moments.
- **Surface & On-Surface:** The background is a clean white, with text using a deep slate-navy to maintain high legibility and a professional tone.
- **Outline:** A light gray used for borders on cards, input fields, and table dividers to create structure without visual noise.
- **Surface Container:** A subtle off-white used for sidebars and background grounding for dashboard cards.

## Typography

The design system utilizes **Be Vietnam Pro** exclusively. This typeface offers a contemporary, approachable feel while maintaining the technical precision required for a data-heavy SaaS platform.

- **Headlines:** Use Semi-Bold (600) and Bold (700) weights with slight negative letter-spacing for a modern, compact look.
- **Body:** Standardized at 14px for optimal information density in tables and dashboard grids.
- **Labels:** Use Medium (500) and Semi-Bold (600) weights for metadata, table headers, and navigation items to ensure clear hierarchy.

## Layout & Spacing

The design system employs a **Fixed-Fluid Hybrid** layout. A fixed-width sidebar (260px) persists on the left, while the main content area utilizes a fluid 12-column grid with a maximum container width of 1440px to prevent excessive line lengths on ultra-wide monitors.

- **Grid:** 12 columns with 24px gutters.
- **Margins:** 32px page margins on desktop, reducing to 16px on mobile.
- **Rhythm:** An 8px-based spatial system ensures vertical consistency between dashboard widgets and form elements.

## Elevation & Depth

This design system uses a **Tonal Layering** approach combined with **Ambient Shadows** to define hierarchy. 

- **Level 0 (Base):** The main background (`surface_container`) is flat.
- **Level 1 (Cards):** Dashboard KPI cards and data containers use a white `surface` background with a 1px `outline` and a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Overlays):** Modals and dropdown menus use a more pronounced shadow (0px 10px 15px rgba(0,0,0,0.1)) to lift them clearly above the dashboard content.

## Shapes

The shape language is consistently **Rounded** to provide a modern SaaS feel that is professional yet friendly.

- **Standard Elements:** Buttons, Input fields, and Cards utilize an 8px (`0.5rem`) corner radius.
- **Large Elements:** Modals and large feature banners utilize a 16px (`1rem`) corner radius.
- **Pills:** Status badges (e.g., "Active", "Expired") utilize a fully rounded (999px) radius to distinguish them from interactive buttons.

## Components

### Sidebar Navigation
The sidebar uses a light-gray background (`surface_container`) to provide contrast against white dashboard cards. Active links are highlighted with the `primary` color for the icon and text, and a 3px vertical "indicator" bar on the leading edge.

### KPI Cards
KPI cards feature a 24px padding. Large metrics use `headline-md` in `on_surface` color, with secondary "trend" labels (e.g., +12%) using `label-md` in `success` or `error` colors.

### Data Tables
Tables use a flat design with `outline` borders. The header row uses a `surface_container` background with `label-sm` text in `secondary` color. Rows have a subtle hover state change to a lighter gray.

### Input Fields
Fields have an 8px radius, a 1px `outline` border, and a 14px `body-md` font size. On focus, the border transitions to `primary` with a subtle 2px indigo glow (ring).

### Activity Timelines
A vertical 2px `outline` stroke connects chronological events. Each event point is a small circle using the `primary` color, with event details using `body-md` and timestamps using `label-md` in the `secondary` color.

### Charts
Line charts should use a 2px stroke width for the data line in `primary` color, with a semi-transparent Indigo gradient fill below the line for "Area" styles.