# Prioritized Recovery Backlog — FreeFileTools

This prioritized backlog lists identified fixes and optimization opportunities necessary to secure, stabilize, and prepare the FreeFileTools codebase for ongoing feature work.

---

## P0 — Critical & Production Blocking
*(No immediate production-blocking issues remain after Phase 0. The domain migration, sitemaps, robots.txt, and metadata are 100% stable.)*

---

## P1 — Serious Functionality, UX, or SEO Problems

### 1. Tailwind Content Configuration Warning
*   **Problem**: Build issues warnings: `The content option in your Tailwind CSS configuration is missing or empty.` This might lead to unused utilities or missing visual styles in production files because Tailwind can't locate class configurations.
*   **Affected File**: `tailwind.config.mjs` (or similar Tailwind configuration file).
*   **Proposed Solution**: Add proper purge paths pointing to `src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`.
*   **Risk**: Low. Safe, predictable design improvement.
*   **Complexity**: Very Low.
*   **Estimated Effort**: 5 mins.

### 2. Focus Highlighting on Dropzones & Forms
*   **Problem**: In transition/upload states, keyboard focus is occasionally lost or invisible on the file selector click areas, leading to WCAG 2.1 compliance failure.
*   **Affected File**: `src/components/UploadZone.astro`, `src/pages/optimization-lab.astro`
*   **Proposed Solution**: Enhance stylesheet outline rules on `:focus-visible` elements across selectors and buttons.
*   **Risk**: Extremely Low. No logic changes.
*   **Complexity**: Low.
*   **Estimated Effort**: 30 mins.

---

## P2 — Important Improvements

### 3. Progressive Frame Web Worker for Optimization Lab
*   **Problem**: Large image generation (>15MB) in `/optimization-lab` triggers consecutive canvas compression loops sequentially, freezing the main browser interface and cursor feedback during conversion.
*   **Affected File**: `src/pages/optimization-lab.astro`, `src/lib/converter.js`
*   **Proposed Solution**: Introduce lightweight worker-style asynchronous handling or simple timeout fragmentation to allow the UI to refresh progress metrics smoothly between variant compilations.
*   **Risk**: Low. Need to make sure canvas elements are accessed from standard thread.
*   **Complexity**: Medium.
*   **Estimated Effort**: 3 hours.

---

## P3 — Nice-To-Have / Styling

### 4. Consolidated Custom Banner for Error Output
*   **Problem**: Unhandled exceptions during file parsing display basic alert banners without a polished empty/error layout state that matches the core brand theme.
*   **Affected File**: `src/components/UploadZone.astro`
*   **Proposed Solution**: Polish the `.upload-zone__error` container layout to show a more descriptive error panel.
*   **Risk**: Very Low.
*   **Complexity**: Low.
*   **Estimated Effort**: 1 hour.

---

## P4 — Future Scale (Phase 5+)

### 5. Multi-format batch routing (AVIF conversion, Web Assembly decoders)
*   **Problem**: Next-gen compression features like AVIF conversion depend on native browser engines, which can fail silently on older Safari/Firefox browsers.
*   **Affected File**: `src/lib/converter.js`
*   **Proposed Solution**: Integrate modern browser detection warning before AVIF option load, or bundle a lightweight WASM decoder for wider support.
*   **Risk**: Medium. Increases bundle size.
*   **Complexity**: High.
*   **Estimated Effort**: 1-2 days.
