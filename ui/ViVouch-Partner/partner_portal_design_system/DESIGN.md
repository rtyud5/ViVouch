---
name: Partner Portal Design System
colors:
  surface: '#fef7ff'
  surface-dim: '#dfd7e4'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1fe'
  surface-container: '#f3ebf8'
  surface-container-high: '#ede5f2'
  surface-container-highest: '#e7e0ec'
  on-surface: '#1d1a23'
  on-surface-variant: '#494551'
  inverse-surface: '#322f38'
  inverse-on-surface: '#f6eefb'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#635a76'
  on-secondary: '#ffffff'
  secondary-container: '#eaddff'
  on-secondary-container: '#69607c'
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
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#cdc1e2'
  on-secondary-fixed: '#1f1730'
  on-secondary-fixed-variant: '#4b425d'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fef7ff'
  on-background: '#1d1a23'
  surface-variant: '#e7e0ec'
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
    letterSpacing: -0.01em
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
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The design system establishes a high-trust, professional environment for B2B partners. It prioritizes clarity and efficiency, utilizing a **Corporate Modern** aesthetic characterized by a clean white canvas, generous whitespace, and purposeful indigo accents. 

The visual language communicates reliability and sophistication. By shifting away from consumer-facing greens to a focused purple/indigo palette, the UI creates a distinct mental model for partners, signaling an administrative and "pro" workspace. The emotional response should be one of competence, focus, and streamlined productivity.

## Colors
The palette is anchored by a deep **Indigo Primary (#6750A4)**, used for key actions, active navigation states, and primary brand markers. 

- **Primary:** Used for buttons, selected tabs, and critical UI indicators.
- **Secondary:** A soft lavender tint used for hover states and subtle container backgrounds.
- **Neutral:** A range of grays ensure high legibility and structural definition.
- **Status Semantic Palette:** 
    - **Draft:** Neutral gray, indicating an incomplete or private state.
    - **Pending:** Warm yellow, requiring attention or processing time.
    - **Active:** Vibrant green, signaling live status.
    - **Paused:** Energetic orange, indicating a temporary halt in operations.

## Typography
This design system utilizes **Be Vietnam Pro** exclusively to maintain a contemporary, approachable yet professional tone. The typeface features a generous x-height and clean geometric details that ensure legibility in data-heavy partner dashboards.

Hierarchy is established through weight shifts (Bold for headlines, Medium for labels) and ample line height to prevent visual fatigue during long sessions. Mobile typography scales down large display headings to maintain readable line lengths on smaller viewports.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid grid**. While the main container has a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors, the internal grid is a 12-column fluid system.

A 4px baseline grid governs all vertical spacing. Gutters are consistently 24px to provide enough breathing room between complex data widgets. On mobile, margins compress to 16px to maximize screen real estate, and 12-column layouts collapse into a single-column stack.

## Elevation & Depth
The system uses **Tonal Layering** supplemented by **Ambient Shadows**. The background is a clean white (#FFFFFF), with primary content containers often using a subtle 1px border (#E0E0E0) to define boundaries.

- **Level 0 (Base):** Page background.
- **Level 1 (Surface):** Cards, data tables, and navigation sidebars. These use a very soft, diffused shadow (0px 2px 8px rgba(0,0,0,0.05)) to lift them slightly from the base.
- **Level 2 (Overlay):** Modals, dropdowns, and tooltips. These use a more pronounced shadow to create clear focus and separation.

## Shapes
A consistent **8px (0.5rem)** corner radius is applied to all primary UI elements including buttons, input fields, cards, and data table containers. This "Rounded" approach balances the professional nature of the portal with a modern, friendly touch. Smaller elements like tags and badges may use a fully rounded (pill) shape for visual distinction.

## Components

### Data Tables
Tables are the backbone of the partner experience. They feature a clean header row with a subtle gray background (#F9FAFB) and 1px bottom border. Rows use a 56px minimum height for touch targets and legibility. Hover states on rows apply a light Indigo tint (#F4F2FF).

### Status Badges
Badges are pill-shaped with a low-opacity background of the status color and a high-contrast text label of the same hue.
- **Draft:** Background 10% Gray, Text 100% Gray.
- **Pending:** Background 10% Yellow, Text 100% Yellow-Dark.
- **Active:** Background 10% Green, Text 100% Green-Dark.
- **Paused:** Background 10% Orange, Text 100% Orange-Dark.

### Progress Bars
Progress bars use a 8px height with a light gray track. The fill uses the Primary Indigo. For multi-step onboarding, the track may include segment markers to indicate discrete stages.

### Pagination
Pagination uses outlined square buttons (8px radius) for page numbers. The active page is highlighted with a Primary Indigo background and white text. "Previous" and "Next" buttons use icons for clarity.

### Input Fields & Buttons
- **Inputs:** 8px radius, 1px border (#D1D5DB). Focus state uses a 2px Primary Indigo ring.
- **Buttons:** Primary buttons are solid Indigo with white text. Secondary buttons are outlined with Indigo text. All buttons have an 8px radius and use `label-md` for text.