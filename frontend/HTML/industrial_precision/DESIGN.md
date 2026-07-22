---
name: Industrial Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#534433'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#867461'
  outline-variant: '#d9c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#fca311'
  on-primary-container: '#663f00'
  inverse-primary: '#ffb95f'
  secondary: '#525e7d'
  on-secondary: '#ffffff'
  secondary-container: '#cdd9fe'
  on-secondary-container: '#525f7e'
  tertiary: '#5c5f62'
  on-tertiary: '#ffffff'
  tertiary-container: '#b4b6ba'
  on-tertiary-container: '#44484b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b9c6ea'
  on-secondary-fixed: '#0d1b36'
  on-secondary-fixed-variant: '#3a4664'
  tertiary-fixed: '#e0e2e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1f'
  on-tertiary-fixed-variant: '#44474a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system evolves the "Industrial Steel" aesthetic into a high-clarity, professional environment optimized for productivity and operational oversight. It balances the rugged utility of industrial workspaces with the sophisticated cleanliness of modern enterprise software. 

The visual style is **Corporate Modern with a Tactile edge**. It prioritizes high-contrast legibility and structural integrity. By moving away from dark-mode glows toward a refined light-mode palette, the system evokes a sense of reliability, transparency, and precision. The emotional response is one of "ordered efficiency"—where the interface feels like a well-calibrated physical instrument.

## Colors
The palette is anchored by a sterile **off-white (#fcfcfc)** base, providing a high-key canvas that reduces visual fatigue. 

*   **Primary Accent:** The "Industrial Steel" yellow (#fca311) is reserved for critical interactive states and focus indicators. On light backgrounds, it must be paired with dark text for accessibility.
*   **Deep Navy (#14213d):** Used for primary typography and structural "heavy" elements like sidebars or headers to maintain the industrial weight.
*   **Functional Greys:** Light grey (#f3f4f6) and mid-grey (#e5e7eb) define container boundaries and disabled states.
*   **Data Visualization:** Chart colors transition from neon glows to solid, saturated tones. Use Navy for primary trends, Steel Yellow for highlights, and a muted Teal or Slate for secondary data points.

## Typography
The system utilizes **IBM Plex Sans** for its engineered, technical character that remains highly legible in dense data environments. It provides a systematic, corporate feel that aligns with industrial engineering.

To reinforce the "instrumentation" feel, **JetBrains Mono** is used for labels, data points, and metadata. This monospaced font ensures that numerical values align vertically in tables and dashboards, aiding rapid scanning of technical information. Primary text should always use the Navy (#14213d) color to ensure AAA contrast ratios.

## Layout & Spacing
The layout follows a **structured fluid grid** based on an 8px rhythm. Content is organized into modular "panels" that mimic the compartmentalized nature of industrial control units.

*   **Grid:** A 12-column grid for desktop with 20px gutters. 
*   **Breakpoints:** Mobile (under 600px), Tablet (600px - 1024px), Desktop (1024px+).
*   **Density:** The design system supports high-density layouts. Use 'sm' (8px) and 'md' (16px) spacing for internal component padding to allow more data on screen without clutter.

## Elevation & Depth
In this light theme, depth is communicated through **Tonal Layering and Low-Contrast Outlines** rather than heavy shadows or glows.

*   **Surface Tiers:** The main background is #fcfcfc. Cards and modals sit on top using white (#ffffff) with a subtle 1px border (#e5e7eb).
*   **Shadows:** Use extremely soft, ambient shadows (0px 4px 12px rgba(20, 33, 61, 0.08)) to lift active elements like dropdowns or hovering cards. 
*   **Interaction:** Focus states use a 2px solid stroke of the Industrial Yellow (#fca311) to provide clear visual feedback without relying on color alone.

## Shapes
The shape language is **Soft (0.25rem)**. This maintains a disciplined, "machined" look that feels intentional and sturdy. 

*   **Standard Elements:** Buttons, inputs, and small cards use a 4px (0.25rem) radius.
*   **Large Containers:** Main content areas or modals can use up to 8px (0.5rem) to slightly soften the technical edge.
*   **Strictness:** Avoid pill shapes or circles unless used for status indicators or avatars, as they break the rigid industrial grid.

## Components
Consistent application of the industrial-light aesthetic across core elements:

*   **Buttons:**
    *   *Primary:* Solid Navy (#14213d) background with White text for maximum authority.
    *   *Action:* Industrial Yellow (#fca311) background with Navy text, used for primary calls to action or "Start/Go" functions.
    *   *Secondary:* White background with a 1px border (#e5e7eb) and Navy text.
*   **Input Fields:** Use a subtle grey background (#f3f4f6) with a bottom-only 2px border that turns Industrial Yellow on focus. This mimics industrial labeling.
*   **Cards:** White background, 1px light border, no shadow unless in a "raised" or "hover" state. 
*   **Chips/Badges:** Use JetBrains Mono for text. Backgrounds should be very light tints of the status color (e.g., light amber for warnings) with high-contrast text.
*   **Data Tables:** Use alternating row stripes (Zebra striping) with #fcfcfc and #f3f4f6. Header rows should be Navy with White text for clear structural hierarchy.
*   **Charts:** Lines should be 2px thick. Use solid fills with 10% opacity for area charts. Ensure grid lines are faint (#e5e7eb) to keep focus on the data.