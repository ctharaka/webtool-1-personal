# FreeFileTools — PDF Tool & Search Intent Map

This document defines the SEO architecture, search intent, internal linking structure, structured data, and implementation status for the native PDF cluster on **[https://freefiletool.app](https://freefiletool.app/)**.

---

## Tool & Search Intent Matrix

| Route | Primary Search Intent | Target Keywords | Canonical URL | Schema | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/pdf` | PDF Hub / Navigation | free online pdf tools, pdf tools in browser, client-side pdf editor | `https://freefiletool.app/pdf` | `CollectionPage`, `ItemList` | **Active / Production** |
| `/pdf/merge` | Combine multiple PDFs | merge pdf online free, combine pdf files, join pdf in browser | `https://freefiletool.app/pdf/merge` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/split` | Extract pages from PDF | split pdf online, split pdf pages, extract pages from pdf | `https://freefiletool.app/pdf/split` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/compress` | Reduce PDF byte size | compress pdf online, reduce pdf file size, shrink pdf in browser | `https://freefiletool.app/pdf/compress` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/jpg-to-pdf` | Convert JPG photos to PDF | jpg to pdf, convert jpg to pdf online, jpeg to pdf document | `https://freefiletool.app/pdf/jpg-to-pdf` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/png-to-pdf` | Convert PNG graphics to PDF | png to pdf, convert png to pdf, transparent png to pdf | `https://freefiletool.app/pdf/png-to-pdf` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/pdf-to-jpg` | Extract PDF pages as JPG | pdf to jpg, convert pdf pages to jpg, export pdf to jpeg | `https://freefiletool.app/pdf/pdf-to-jpg` | `HowTo`, `FAQPage` | **Active / Production** |
| `/pdf/pdf-to-png` | Extract PDF pages as PNG | pdf to png, convert pdf to png, extract pdf to png lossless | `https://freefiletool.app/pdf/pdf-to-png` | `HowTo`, `FAQPage` | **Active / Production** |

---

## Detailed Tool Profiles & Internal Linking Mesh

### 1. `/pdf` — PDF Tools Category Hub
- **Primary Purpose**: The centralized landing hub that organizes all PDF capabilities into four logical categories (Organize & Manage, Compress & Optimize, Image to PDF, PDF to Image).
- **Incoming Internal Links**:
  - Global Header Navigation: "PDF Tools" (`/pdf`)
  - Global Footer: "All PDF Tools" (`/pdf`)
  - Home Page (`/`): "Browser-Side PDF Tools" section + "Explore All 7 PDF Tools" button
  - Image Tools Hub (`/image-tools`): "Need PDF Utilities?" cross-category card
  - All 7 individual PDF tool pages via breadcrumb / related links
- **Outgoing Internal Links**:
  - `/pdf/merge`, `/pdf/split`, `/pdf/compress`, `/pdf/jpg-to-pdf`, `/pdf/png-to-pdf`, `/pdf/pdf-to-jpg`, `/pdf/pdf-to-png`
  - `/image-tools`, `/optimization-lab`

---

### 2. `/pdf/merge` — Merge PDF Files
- **Primary Purpose**: Sequentially combine two or more PDF documents into a single consolidated PDF directly in browser memory with visual reordering controls.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - `/` (Home featured tools grid)
  - Global Footer ("Merge PDF")
  - `/pdf/split` (Related tools)
  - `/pdf/compress` (Related tools)
  - `/pdf/jpg-to-pdf` (Related tools)
  - `/pdf/png-to-pdf` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/split`, `/pdf/compress`, `/pdf/jpg-to-pdf`, `/pdf/pdf-to-jpg`

---

### 3. `/pdf/split` — Split PDF Pages
- **Primary Purpose**: Slices PDF pages into individual documents or extracts custom page intervals (e.g. `1-3, 5, 8-10`) with ZIP multi-file packaging.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - Global Footer ("Split PDF")
  - `/pdf/merge` (Related tools)
  - `/pdf/compress` (Related tools)
  - `/pdf/pdf-to-jpg` (Related tools)
  - `/pdf/pdf-to-png` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/merge`, `/pdf/compress`, `/pdf/pdf-to-jpg`, `/pdf/pdf-to-png`

---

### 4. `/pdf/compress` — Compress PDF
- **Primary Purpose**: Optimizes internal PDF object streams and clears redundant structural metadata without downsampling vector fonts or line clarity.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - `/` (Home featured tools grid)
  - Global Footer ("Compress PDF")
  - `/compress-image` (Related tools cross-link)
  - `/image-tools` ("Need PDF Utilities?" cross-link)
  - `/pdf/merge` (Related tools)
  - `/pdf/split` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/merge`, `/pdf/split`, `/compress-image`, `/optimization-lab`

---

### 5. `/pdf/jpg-to-pdf` — JPG to PDF Converter
- **Primary Purpose**: Converts single or multiple JPEG photographs into a multi-page PDF document with exact image sizing or standardized A4 margins.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - `/` (Home featured tools grid)
  - Global Footer ("JPG to PDF")
  - `/jpg-to-webp` (Related tools cross-link)
  - `/image-tools` (Cross-link card)
  - `/pdf/png-to-pdf` (Related tools)
  - `/pdf/pdf-to-jpg` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/png-to-pdf`, `/pdf/pdf-to-jpg`, `/pdf/merge`, `/pdf/compress`, `/jpg-to-webp`

---

### 6. `/pdf/png-to-pdf` — PNG to PDF Converter
- **Primary Purpose**: Converts high-resolution and transparent PNG graphics into clean PDF pages, preserving 8-bit alpha channels.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - Global Footer
  - `/png-to-webp` (Related tools cross-link)
  - `/pdf/jpg-to-pdf` (Related tools)
  - `/pdf/pdf-to-png` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/jpg-to-pdf`, `/pdf/pdf-to-png`, `/pdf/merge`, `/pdf/compress`, `/png-to-webp`

---

### 7. `/pdf/pdf-to-jpg` — PDF to JPG Converter
- **Primary Purpose**: Renders vector PDF pages to crisp JPEG images (108 DPI / 144 DPI) via HTML5 Canvas with automated ZIP download for multi-page documents.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - `/` (Home featured tools grid)
  - Global Footer ("PDF to JPG")
  - `/pdf/pdf-to-png` (Related tools)
  - `/pdf/jpg-to-pdf` (Related tools)
  - `/pdf/split` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/pdf-to-png`, `/pdf/jpg-to-pdf`, `/pdf/compress`, `/pdf/merge`

---

### 8. `/pdf/pdf-to-png` — PDF to PNG Converter
- **Primary Purpose**: Renders vector PDF pages to lossless PNG graphics, ensuring sharp text edges and line diagrams without JPEG compression artifacts.
- **Incoming Internal Links**:
  - `/pdf` (Hub)
  - Global Footer
  - `/pdf/pdf-to-jpg` (Related tools)
  - `/pdf/png-to-pdf` (Related tools)
  - `/pdf/split` (Related tools)
- **Outgoing Internal Links**:
  - `/pdf` (Hub)
  - `/pdf/pdf-to-jpg`, `/pdf/png-to-pdf`, `/pdf/compress`, `/pdf/merge`
