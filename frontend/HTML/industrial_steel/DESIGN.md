---
name: Industrial Steel
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d9c3ad'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#a18e79'
  outline-variant: '#534433'
  surface-tint: '#ffb95f'
  primary: '#ffc887'
  on-primary: '#472a00'
  primary-container: '#fca311'
  on-primary-container: '#663f00'
  inverse-primary: '#855300'
  secondary: '#c0c7cf'
  on-secondary: '#2a3138'
  secondary-container: '#434a51'
  on-secondary-container: '#b2b9c1'
  tertiary: '#d1d2d2'
  on-tertiary: '#2f3131'
  tertiary-container: '#b6b6b6'
  on-tertiary-container: '#464848'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#dce3ec'
  secondary-fixed-dim: '#c0c7cf'
  on-secondary-fixed: '#151c22'
  on-secondary-fixed-variant: '#41484e'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '900'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  code-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  border-thick: 2px
  border-heavy: 4px
---

## Brand & Style

This design system is built on the aesthetic of heavy industry, mechanical engineering, and high-utility technical interfaces. It targets professionals in hardware, logistics, and heavy manufacturing who require a UI that feels as durable as the machinery they operate.

The style is a fusion of **Industrial Brutalism** and **Technical Precision**. It prioritizes immediate legibility and structural integrity over soft aesthetics. Expect heavy strokes, visible "fasteners" in the form of grid lines, and a high-contrast environment that mimics safety signage and mechanical schematics. The emotional response is one of reliability, authority, and uncompromising function.

## Colors

The palette is strictly functional, derived from construction sites and factory floors.

- **Carbon Black (#000000):** The primary foundation. All interfaces start from a true black base to maximize contrast and reduce glare in industrial environments.
- **Safety Yellow (#FCA311):** Used exclusively for high-priority actions, warnings, and active states. It is the "caution" light of the interface.
- **Steel Gray (#495057):** The structural mid-tone. Used for panel borders, secondary backgrounds, and inactive UI elements.
- **Platinum White (#E5E5E5):** Reserved for primary typography and high-readability data points against the dark backgrounds.

## Typography

The typography strategy leverages a high-contrast pairing to distinguish between "The Machine" (Data) and "The Authority" (Headlines).

- **Headlines:** Use **Playfair Display**. Its sharp serifs and extreme stroke contrast provide an "Industrial Blueprint" or "Vintage Patent" feel, lending an air of established authority to the interface.
- **Body & Data:** Use **JetBrains Mono**. As a monospaced font, it ensures that technical data, coordinates, and values align perfectly in tables and logs. It emphasizes the technical, programmable nature of the system.
- **Labels:** Always in uppercase with increased letter spacing to mimic stamped metal plates and industrial labeling.

## Layout & Spacing

This design system utilizes a **Fixed Grid** approach that resembles a technical drafting sheet. 

- **The 4px Grid:** All spacing must be a multiple of 4px.
- **Structural Borders:** Rather than using whitespace to separate sections, use **2px Steel Gray** borders. This creates a "panelized" look where every piece of information is boxed into a specific module.
- **Grid Overlays:** In large empty states or backgrounds, a subtle 32px square grid pattern should be visible to reinforce the engineering aesthetic.
- **Desktop:** 12-column layout with 0px gutter (flush panels) or 16px gutter (isolated modules).

## Elevation & Depth

In this design system, depth is communicated through **Stacked Panels** and **Heavy Outlines** rather than shadows.

- **Flat Hierarchy:** Avoid ambient shadows. Depth is achieved by "punching out" or "extruding" surfaces.
- **Inset Troughs:** Use 2px inset borders for input fields and data wells to make them look carved into the interface.
- **Active State Extrusion:** When a button is pressed or an item is active, it should use a high-contrast border (Safety Yellow) or a solid fill, rather than moving "up" in Z-space.
- **Section Headers:** Use a solid Steel Gray bar with inverted text to define the top of a container, similar to a physical control panel.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every element—buttons, cards, input fields, and tags—must have 90-degree corners. Rounded corners are seen as decorative and "soft," which contradicts the industrial narrative. To add visual interest without rounding, use 45-degree "clipped corners" (chamfers) for decorative accents or status indicators.

## Components

### Buttons
- **Primary:** Solid Safety Yellow background, Black text, JetBrains Mono Bold. No rounding. 2px Black inner border.
- **Secondary:** Transparent background, 2px Steel Gray border, White text.
- **Hover State:** Background shifts to White; text remains Black. Immediate transition (no easing).

### Input Fields
- **Style:** Black background with a 2px Steel Gray border. 
- **Focus State:** Border changes to Safety Yellow. 
- **Labels:** Small, uppercase JetBrains Mono, placed directly above the field or integrated into the top border.

### Data Displays (Cards/Panels)
- **Structure:** 2px Steel Gray border on all sides. 
- **Header:** A 24px tall Steel Gray "tab" or bar at the top containing the panel title in JetBrains Mono.
- **Content:** Technical data should be displayed in a monospaced grid.

### Chips & Tags
- **Style:** Small rectangular boxes with 1px borders. 
- **Status:** For "Warning" or "Live" states, use a flashing 8px square "LED" indicator next to the text.

### Progress Bars
- **Style:** Segmented blocks rather than a smooth fill. Each block represents a 5% or 10% increment, mimicking mechanical gauges.