---
name: Indigo Nexus
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
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  status-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
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
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-velocity partner environments where precision and clarity are paramount. The aesthetic follows a **Corporate Modern** approach with a focus on high-fidelity utility. It prioritizes information density without sacrificing visual breathing room, ensuring that partners can validate credentials and manage vouchers with absolute confidence.

The personality is professional, authoritative, and technologically advanced. By utilizing a refined palette of deep indigos and crisp neutrals, the UI evokes a sense of security and institutional trust. The visual language uses subtle tonal layering and precise geometry to guide the user’s eye toward primary actions and critical status indicators.

## Colors

The color architecture is built around a dominant Indigo primary, signifying stability and logic. 
- **Primary (Indigo):** Used for main action buttons, active states, and brand-heavy components.
- **Secondary (Purple):** Reserved for accent elements, specialized categories, or interactive highlights to provide visual variety.
- **Semantic Logic:** Success (Green) and Error (Red) are high-chroma tokens designed to stand out against the Indigo/Neutral backdrop. Success indicates a valid voucher, while Error indicates expiration or invalidity.
- **Surface Gradients:** Subtle linear gradients (Primary to Secondary) may be used sparingly on large headers or primary validation cards to reinforce the brand's premium feel.

## Typography

This design system utilizes a tiered typographic scale to manage complex data. 
- **Hanken Grotesk** is used for headlines to provide a sharp, contemporary professional look. 
- **Inter** serves as the workhorse for body text, chosen for its exceptional legibility in data-heavy portal environments. 
- **JetBrains Mono** is introduced for labels and voucher codes, leveraging its monospaced nature to ensure characters like '0' and 'O' or '1' and 'I' are easily distinguishable during manual entry or verification.

## Layout & Spacing

The layout employs a **Fixed Grid** system for desktop (12 columns) and a **Fluid Grid** for mobile (4 columns). 
- **Validation Focus:** For the voucher validation screen, content should be centered in a narrow container (max-width: 600px) to minimize eye travel and focus the partner on the input and result.
- **Rhythm:** An 8px linear scale governs all padding and margins. Vertical rhythm is strictly enforced to maintain a clean "ledger" feel in list views.
- **Safe Areas:** On mobile devices, ensure a minimum 20px horizontal margin to prevent content from touching screen edges.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. 
- **Level 0 (Background):** The base neutral surface.
- **Level 1 (Cards):** Soft white surfaces with a 1px border (#E2E8F0) and an ultra-diffused shadow (0px 4px 20px rgba(79, 70, 229, 0.05)).
- **Level 2 (Modals/Validation Pop-ups):** Higher contrast elevation with a more pronounced Indigo-tinted shadow to pull the element forward.
- **Interactive Depth:** Buttons use a subtle inner-glow (top-down) to appear slightly raised, providing a tactile "pressable" affordance.

## Shapes

The shape language is **Rounded**, striking a balance between the rigidity of enterprise software and the approachability of modern SaaS.
- **Standard UI Elements:** (Inputs, Buttons) use a 0.5rem (8px) radius.
- **Large Containers:** (Voucher Cards, Main Content Areas) use 1rem (16px) radius.
- **Status Tags:** Use a fully pill-shaped (rounded-full) geometry to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Indigo fill with white text. High-contrast and center-stage.
- **Secondary:** Indigo outline with a subtle lavender-tinted background on hover.
- **Validation Action:** Large, full-width buttons on mobile for "Check Voucher" actions.

### Input Fields
- **Voucher Input:** Large-format typography (18px+) with a persistent Indigo focus ring. 
- **States:** Standard, Hover, Focus (Indigo 2pt ring), and Error (Red 2pt ring).

### Validation Cards
- **Success State:** Large green checkmark icon, semi-transparent green background tint for the card header, and bold "VALID" status text.
- **Error State:** Large red 'X' or alert icon, semi-transparent red background tint, and "INVALID" or "EXPIRED" status text.

### Chips/Tags
- Used for quick metadata (e.g., "Single Use," "Multi-use," "VIP"). These use the Secondary Purple color at 10% opacity with 100% opacity text.

### Lists
- Partner transaction history should use a zebra-stripe pattern or subtle separators. Each row should have a clear "Status" chip using the semantic color tokens.