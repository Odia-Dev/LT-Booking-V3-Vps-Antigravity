# Design System Guide

This document defines the interface aesthetics, typography, color palettes, and component states utilized across the Laxmi Toyota Platform V3.

---

## 1. Brand Guidelines & Color Palettes

The platform adopts a premium dark mode layout matching the vehicle catalog showcase, contrasted by Toyota brand highlights.

### Core Palettes
* **Primary / Accent Red**: `#eb0a1e` (Toyota Brand Red)
* **Background Dark**: `#09090b` (Deep Obsidian / Slate-950)
* **Background Card / Panels**: `#18181b` (Carbon Grey / Slate-900)
* **Borders / Separators**: `#27272a` (Zinc Border / Zinc-800)
* **Body Text**: `#f4f4f5` (Zinc-100)
* **Muted Labels**: `#a1a1aa` (Zinc-400)

### Status Swatches
* **ACTIVE / SUCCESS**: `#10b981` (Emerald Green)
* **INACTIVE / WARNING**: `#f59e0b` (Amber Gold)
* **ARCHIVED / DANGER**: `#ef4444` (Rose Red)

---

## 2. Typography

* **Headings**: Roboto / Outfit / System Sans-serif (Bold / Black weight for maximum impact)
* **Body & UI**: Inter / Geist / System Sans-serif (Regular / Medium weight)
* **Code / Technical ID Reference**: JetBrains Mono / Source Code Pro

---

## 3. Responsive Breakpoints

* **Mobile**: `w < 640px` (Stacked controls, collapsing sidebar navigation)
* **Tablet**: `640px <= w < 1024px` (Grid layout adjusts, sidebar collapses to narrow icons)
* **Desktop**: `1240px <= w` (Fully extended lists, fixed left sidebar navigation)

---

## 4. UI Elements & Component States

### Buttons
* **Primary Brand Action**: Gradient from `#e11d48` to `#be123c` with hover brightness scaling.
* **Secondary Action**: Border `#27272a` with dark background `#09090b` scaling to background `#18181b`.
* **Destructive Action**: Crimson border with semi-transparent red fill.

### CMS Tables
* All tables must utilize a dark background `#18181b/35` with subtle thin borders to divide data records.
* Alternating rows should not have high contrast difference.
* Loading state displays a rotating dashed spinner in brand accent red.
