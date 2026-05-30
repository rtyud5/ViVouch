---
name: Vietnamese Commerce Standard
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3d4943'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#6d7a73'
  outline-variant: '#bccac1'
  surface-tint: '#006c4e'
  primary: '#00694c'
  on-primary: '#ffffff'
  primary-container: '#008560'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dbae'
  secondary: '#b7131a'
  on-secondary: '#ffffff'
  secondary-container: '#db322f'
  on-secondary-container: '#fffbff'
  tertiary: '#7b5500'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b6b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86f8c9'
  primary-fixed-dim: '#68dbae'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#ffdeac'
  tertiary-fixed-dim: '#ffba38'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
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
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  price-display:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 16px
  gutter: 12px
  section-gap: 32px
---

## Brand & Style

The design system is engineered to foster trust and efficiency within the high-velocity Vietnamese voucher and deals market. The aesthetic is **Corporate / Modern**, prioritizing clarity, lightning-fast recognition of value, and a sense of "prestige-utility."

The visual language balances the professional stability required for financial transactions with the vibrant energy of retail discovery. We lean into high-quality white space to prevent the "cluttered" look often found in discount platforms, ensuring that every deal feels like a curated opportunity rather than noise. The emotional response is one of reliability, accessibility, and excitement.

## Colors

The palette is anchored by a flagship **Forest Green (#1D9E75)**, symbolizing growth, prosperity, and financial safety. This color is used for primary actions, success states, and brand-heavy UI elements.

To drive conversion, we utilize a **Urgency Red (#E53935)** specifically for discount badges and countdown timers. This secondary color provides a sharp, high-contrast focal point against the clean white background. A **Warning Gold (#FFB300)** is reserved for expiring deals or exclusive member tiers. Neutrals are kept cool and crisp to ensure the primary green and secondary red remain the focal points of the user journey.

## Typography

The design system utilizes **Be Vietnam Pro**, a typeface meticulously crafted for the Vietnamese language. Its tall x-height and open counters handle complex diacritics with ease, maintaining exceptional legibility even in dense voucher descriptions.

Headlines use bold weights with tighter letter-spacing to create a strong visual anchor. Body copy prioritizes a comfortable line height for readability. We introduce a specific `price-display` role to ensure that the "Deal Value" is always the most prominent text element on any card or detail page.

## Layout & Spacing

This design system follows an **8px hard grid** to ensure mathematical consistency. The layout is **Fluid**, adapting seamlessly from mobile handhelds to desktop browsers.

- **Mobile:** Uses a 4-column grid with 16px side margins. Key categories utilize horizontal scrolling (carousels) to maximize vertical screen real estate.
- **Desktop:** Scales to a 12-column centered grid with a max-width of 1200px.
- **Spacing Rhythm:** Use `16px` (base * 2) for most internal card padding and `24px` or `32px` for vertical separation between logical content sections.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Ambient Shadows**. 

The background remains a flat `#FFFFFF` or a very light `#F9FAFB`. Surface elements (like voucher cards) use a subtle, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to appear slightly lifted. This creates a tactile quality that encourages tapping. For high-priority alerts or modals, we use a slightly more aggressive shadow and a soft backdrop blur to focus the user’s attention. Avoid heavy borders; use 1px light gray strokes (#E0E0E0) only when items need separation on a white background.

## Shapes

The design system employs a **Rounded** shape language. This softens the "corporate" feel, making the platform feel more approachable for daily consumer use.

Standard buttons and input fields use a `0.5rem` (8px) radius. Larger containers like voucher cards use `1rem` (16px) to emphasize their role as primary content objects. Discount badges use a "semi-pill" shape—rounded on one side or fully rounded to stand out from the rectangular nature of the grid.

## Components

### Voucher Cards
The hero component of the system. Each card features a high-quality image, a `secondary-color` (Red) discount badge in the top-right corner, and a clear "Claim" or "Use Now" button in the `primary-color`.

### Bottom Navigation
For mobile devices, a persistent bottom bar with four main actions: Home, Explore, My Vouchers, and Profile. Icons are 24px, using a 2px stroke weight for a modern look.

### Countdown Timers
Used for flash deals. These feature a light gray background with bold red text. The format is `HH:MM:SS`, updating in real-time to drive urgency.

### Horizontal Category Scroll
A row of circular or soft-square icons with labels underneath. These use a sub-surface color (very light green or gray) to indicate they are tappable filters.

### Input Fields
Clean, outlined boxes with 8px corner radius. On focus, the border shifts to the `primary-color` (Green) with a 2px stroke.

### Buttons
- **Primary:** Solid green with white text.
- **Secondary:** Outlined green with green text.
- **Urgent:** Solid red (reserved for "Ending Soon" or "Limited Stock").