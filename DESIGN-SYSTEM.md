# MiniForge — Design System Specification

## 1. Design Philosophy & References
MiniForge combines the accessibility and drag-and-drop simplicity of **Canva**, the visual hierarchy and precision of **Figma**, and the high-density workspace ergonomics of **Linear**.

The design language is strictly restrained, professional, and content-first.

---

## 2. Color Palette & Tokens
| Token | Hex Value | Semantic Usage |
|---|---|---|
| **Primary Accent** | `#D4146E` | Highlights, active states, primary CTA buttons, selection rings |
| **Primary Dark** | `#171717` | Text headings, dark mode badges, primary toolbars, active layers |
| **Canvas Background** | `#FFFFFF` | Frame backgrounds, white card surfaces, editor canvas |
| **Surface Neutral** | `#F7F7F8` | Canvas work area, secondary toolbars, sidebar backgrounds |
| **Subtle Border** | `#E8E8EA` | Frame dividers, table borders, panel separators |
| **Muted Text** | `#777777` | Metadata, microcopy, timestamps, field hints |
| **Success Emerald** | `#10B981` | Positive inventory, verified signatures, published status |
| **Warning Amber** | `#F59E0B` | Low stock warnings, beginner education guides |
| **Error Crimson** | `#EF4444` | Deletion actions, validation errors, out-of-stock badges |

> **Brand Restraint Rule**: Pink (`#D4146E`) is reserved strictly for meaningful interactive affordances. Never paint entire panels or background cards pink.

---

## 3. Typography & Scale
- **Primary Typeface**: `Inter, sans-serif` (Google Fonts).
- **Scale**:
  - `Display / Page Title`: 20px / 24px (Bold, -0.02em tracking)
  - `Section Heading`: 14px / 18px (Bold, -0.01em tracking)
  - `Body Text`: 12px / 16px (Regular / Medium)
  - `Caption / Microcopy`: 10px / 14px (Medium, uppercase letterspacing on labels)
  - `Code / Tokens`: 11px font-mono

---

## 4. UI Components & Layout Specs
- **Header**: Fixed height `56px` (`h-14`), white background, bottom border `#E8E8EA`.
- **Sidebars**: `256px` to `288px` (`w-64` to `w-72`), clean accordion sections with 1-click collapse.
- **Buttons**:
  - `Primary`: `#D4146E` background, white text, 6px border-radius, active scale `0.99`.
  - `Secondary / Outline`: White background, `#E8E8EA` border, `#171717` text, hover `#F7F7F8`.
  - `Ghost`: Transparent background, hover `#F7F7F8`, text `#777777`.
- **Canvas Viewport Frames**:
  - Mobile: `w-[390px]`, min-height `720px`, rounded-2xl (`16px`), phone notch & simulated status bar.
  - Tablet: `w-[768px]`, min-height `720px`, rounded-xl (`12px`).
  - Desktop: `max-w-5xl`, min-height `720px`, rounded-xl (`12px`).
- **Toasts**: Dark surface `#171717`, 4000ms auto-dismiss, bottom-right stack.
