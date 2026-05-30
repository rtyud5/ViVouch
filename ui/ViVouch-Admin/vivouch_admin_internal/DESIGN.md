---
name: ViVouch Admin Internal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#534434'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#00658b'
  on-tertiary: '#ffffff'
  tertiary-container: '#1abdff'
  on-tertiary-container: '#004966'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7fd0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: Courier Prime
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  sidebar-width: 260px
  container-padding: 32px
  gutter: 24px
  row-height-dense: 40px
  row-height-standard: 56px
---

## Brand & Style
The design system for the admin dashboard is engineered for high-utility oversight and system management. While the partner portal focuses on growth, the admin identity emphasizes **authority, precision, and operational clarity**. 

The design style is **Corporate Modern with a High-Density focus**. It utilizes a clean, systematic interface to handle complex data sets without overwhelming the user. The aesthetic is professional and utilitarian, using deep contrast in the navigation to anchor the user, while providing a spacious, light-filled workspace for data analysis and management tasks. The emotional response should be one of control and reliability.

## Colors
The palette is dominated by three functional zones:
- **Action (Amber #F59E0B):** Used exclusively for primary actions, status alerts requiring attention, and active states. It distinguishes the Admin role from other platform tiers.
- **Navigation (Navy #0F172A):** Applied to the sidebar to create a rigid, professional frame that recedes visually, allowing content to take center stage.
- **Workspace (Gray/White):** A scale of cool grays (Slate) provides a neutral backdrop for complex data visualizations. `Slate-50` is used for the main background, with `White` reserved for cards and surface containers.

Success, Error, and Warning states should follow standard utility conventions (Green, Red, Yellow) but with slightly desaturated tones to maintain the dashboard's professional gravity.

## Typography
This design system utilizes **Be Vietnam Pro** to maintain platform-wide consistency while shifting toward more structured, smaller scales to support information density. 

- **Weight Strategy:** Use `SemiBold (600)` for section headers and `Medium (500)` for labels to ensure legibility against the Slate color palette.
- **Density:** Body text is set to 14px by default to maximize the information visible in data tables and property panels.
- **Technical Data:** For ID strings, API keys, or transaction hashes, use a monospaced fallback (Courier Prime) at 13px to aid in character recognition.

## Layout & Spacing
The layout follows a **Fixed Sidebar / Fluid Content** model. 
- **The Sidebar:** Fixed at 260px. It remains collapsed to icons on tablet views (768px - 1024px).
- **Grid:** A 12-column fluid grid system is used within the main content area.
- **Density:** Spacing is tighter than the Partner Portal. Use a 4px base unit. Component-level margins should stay within the 8px-16px range to ensure more "above the fold" data.
- **Breakpoints:** 
    - Desktop: 1280px+ (Full 12 columns)
    - Tablet: 768px - 1279px (8 columns, collapsed sidebar)
    - Mobile: Below 768px (4 columns, hidden sidebar with hamburger menu).

## Elevation & Depth
Elevation is used sparingly to maintain a "flat-plus" professional aesthetic. 
- **Level 0 (Base):** `Slate-50` background.
- **Level 1 (Cards):** White background with a 1px `Slate-200` border. No shadow or an extremely subtle 2px blur shadow (#000000 0.05 opacity).
- **Level 2 (Active/Hover):** Applied to cards or dropdowns on interaction. Use a soft, 8px ambient shadow.
- **Sidebars & Modals:** The sidebar uses color contrast (Navy) rather than shadow to define depth. Modals use a heavy 24px blur shadow and a 40% opacity backdrop overlay.

## Shapes
The design system adopts a **Soft (4px)** corner radius for most UI elements. This keeps the interface feeling modern but maintains the architectural structure required for high-density tables and dashboard widgets. 

- **Buttons & Inputs:** 4px radius (Soft).
- **Cards & Containers:** 8px radius (rounded-lg).
- **Status Badges:** Use a full pill-shape (999px) to distinguish them from interactive buttons.

## Components
- **KPI Cards:** Large `display-lg` numbers in Navy, with 12px `label-md` descriptors in Slate. Include a small sparkline or percentage change indicator in the bottom right.
- **Data Tables:** The core of the admin experience. Use `row-height-dense` (40px) with 1px `Slate-100` bottom borders. Headers should be `Slate-50` with uppercase `label-md` typography.
- **Buttons:**
    - **Primary:** Amber background, white text. 
    - **Secondary:** Transparent with `Slate-200` border, Navy text.
    - **Ghost:** No border, Navy text (used for table actions).
- **Inputs:** White background with 1px `Slate-300` border. On focus, the border transitions to Amber with a 2px soft outer glow.
- **Sidebar Nav:** Items should have a transparent background with Slate-400 text. The active state uses a left-side 4px Amber vertical border and White text.
- **Status Chips:** High-contrast background (e.g., desaturated Green for "Paid") with bold, centered text for immediate recognition.