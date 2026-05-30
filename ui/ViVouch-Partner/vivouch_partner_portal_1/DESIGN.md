---
name: ViVouch Partner Portal
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e5'
  on-surface: '#1C1B1D'
  on-surface-variant: '#494551'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#613ed3'
  on-secondary: '#ffffff'
  secondary-container: '#7a5aed'
  on-secondary-container: '#fffbff'
  tertiary: '#4e4357'
  on-tertiary: '#ffffff'
  tertiary-container: '#665a6f'
  on-tertiary-container: '#e3d3ec'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#cbbeff'
  on-secondary-fixed: '#1e0061'
  on-secondary-fixed-variant: '#4b21bd'
  tertiary-fixed: '#edddf6'
  tertiary-fixed-dim: '#d0c1da'
  on-tertiary-fixed: '#21182a'
  on-tertiary-fixed-variant: '#4e4357'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#F8F1F6'
  border-subtle: '#E6E1E5'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin-desktop: 32px
  container-margin-mobile: 16px
  gutter: 24px
  stack-gap: 16px
---

## Brand & Style
The brand personality for this design system is authoritative, efficient, and partner-centric. While the consumer-facing experience is approachable and vibrant, the partner portal pivots toward a **Corporate / Modern** aesthetic that emphasizes productivity and trust. 

The design narrative focuses on a clean, high-utility interface that utilizes significant whitespace to reduce cognitive load. The visual style is rooted in a refined Material-inspired framework, using subtle tonal shifts rather than heavy decorative elements to guide the user. The goal is to create a professional environment where partners feel they are using a robust, enterprise-grade tool for managing their business integrations.

## Colors
This design system uses a palette centered around a professional indigo-purple to distinguish the partner ecosystem from consumer-facing touchpoints. 

- **Primary (#6750A4):** Used for key action buttons, active states, and primary brand indicators.
- **Secondary/Tertiary:** Utilized for accenting data visualizations or categorizing different partner tools.
- **Neutral:** A near-white `#FEFBFF` is the foundation for all backgrounds to maintain a high-contrast, clean workspace.
- **Surface Variant:** Used for card backgrounds and input fields to provide a soft distinction from the main page background.

## Typography
**Be Vietnam Pro** is the sole typeface for this design system, chosen for its contemporary feel and exceptional legibility in data-dense environments. 

Headlines use a semi-bold weight to establish clear hierarchy, while body text maintains a generous line height to ensure readability during long sessions. Mobile typography scales down for headlines to prevent awkward text wrapping, while label styles are optimized for buttons and form headers with slightly increased letter spacing for clarity at smaller sizes.

## Layout & Spacing
The layout follows a systematic 8px grid.

- **Desktop:** Employs a two-column layout. The primary column (left) is used for configuration and form inputs, while the secondary column (right) serves as a sticky "Live Preview" or "Analytics Overview" area.
- **Mobile:** Elements reflow into a single-column stack. The "Live Preview" card, previously in the right column, moves to either the top of the stack (if high priority) or is accessible via a floating toggle.
- **Breakpoints:** Transitions from single to double column occur at 1024px.

## Elevation & Depth
Hierarchy is established through **Tonal Layers** and low-contrast outlines.

- **Level 0 (Background):** `#FEFBFF` - The base canvas.
- **Level 1 (Cards):** Surface is `#F8F1F6` with a 1px border of `#E6E1E5`. No shadows are used for standard containers to keep the UI feeling "flat" and modern.
- **Level 2 (Interactive/Floating):** Subtle ambient shadows (0px 4px 12px rgba(0,0,0,0.05)) are reserved exclusively for dropdown menus and modals to indicate they are temporarily atop the primary workflow.

## Shapes
A **Rounded** (8px) shape language is applied to all primary UI elements. This strikes a balance between the precision of a professional tool and the approachable nature of the brand.

- **Buttons & Inputs:** 8px (`0.5rem`) corner radius.
- **Large Containers/Cards:** 16px (`1rem`) corner radius.
- **Checkboxes:** 4px (`0.25rem`) corner radius for a sharp yet refined appearance.

## Components

### Buttons
- **Filled:** Background `#6750A4` with White text. Used for the primary "Save" or "Publish" actions.
- **Outlined:** 1px border of `#6750A4` with `#6750A4` text. Used for secondary actions like "Cancel" or "Add Item."

### Form Fields
- **Input & Textarea:** Use a light grey/purple surface (`#F8F1F6`) with a bottom-border (2px) that transforms into the primary indigo color on focus. Labels are positioned above the field using the `label-lg` type style.
- **Dropdowns:** Styled similarly to inputs, using a chevron icon to indicate interactivity.
- **Checkboxes:** Filled with primary color when checked, featuring a crisp white tick mark.

### Cards & Live Preview
- **Standard Card:** A subtle border-only container for grouping form elements.
- **Live Preview Card:** Specifically styled with a slight elevation (Level 2 shadow) or a distinct background tint to differentiate "draft" content from the portal's UI. It should mimic the consumer-facing app's appearance (using the brand green if applicable) to provide an accurate representation of the end-user experience.

### Lists & Tables
- Data tables should use the `body-md` style with horizontal dividers only, avoiding vertical borders to maintain the clean, airy aesthetic.