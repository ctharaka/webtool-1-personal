const fs = require('fs');
const path = require('path');

const privacyDir = path.join(__dirname, 'src', 'pages', 'privacy-tools');
if (!fs.existsSync(privacyDir)) {
  fs.mkdirSync(privacyDir, { recursive: true });
}

// 1. privacy-tools/index.astro
const privacyIndex = `---
/**
 * privacy-tools/index.astro — Privacy & Security Tools Hub
 * Landing page for the Privacy & Security category.
 */
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Privacy & Security Tools — FreeFileTools"
  description="Free browser-based privacy tools. Remove EXIF metadata, strip GPS data from photos, and clean your files locally. No uploads. No server. 100% private."
  canonicalURL="https://freefiletool.app/privacy-tools/"
>
  <script type="application/ld+json" is:inline>
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy & Security Tools",
    "description": "Free browser-based tools to protect your privacy. Remove image metadata, strip GPS coordinates, and clean files locally.",
    "url": "https://freefiletool.app/privacy-tools/"
  }
  </script>

  <section class="hub-hero">
    <div class="hub-hero__badge">🛡️ Privacy First</div>
    <h1 class="hub-hero__title">Privacy Tools for Your Files</h1>
    <p class="hub-hero__subtitle">
      Clean, protect, and prepare your files without sending them to a server.
      All processing happens locally in your browser.
    </p>
  </section>

  <section class="tools-hub" aria-label="Privacy and Security Tools">
    <h2 class="category-title">Available Tools</h2>

    <div class="tools-grid">
      <!-- EXIF Remover -->
      <a href="/privacy-tools/exif-remover" class="tool-card tool-card--featured">
        <div class="tool-card__icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="tool-card__body">
          <h3 class="tool-card__title">Free EXIF Remover</h3>
          <p class="tool-card__desc">
            Remove hidden camera data, GPS coordinates, and timestamps from JPG, PNG, and WebP images.
            Batch processing with ZIP download. Your photos never leave your device.
          </p>
          <span class="tool-card__formats">JPG · PNG · WebP · Batch · ZIP</span>
        </div>
        <span class="tool-card__cta" aria-label="Open EXIF Remover tool">Remove EXIF Data &rarr;</span>
      </a>

      <!-- Coming Soon placeholder -->
      <div class="tool-card tool-card--coming-soon" aria-label="PDF Metadata Remover — Coming Soon">
        <div class="tool-card__icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="tool-card__body">
          <span class="coming-soon-badge">Coming Soon</span>
          <h3 class="tool-card__title">PDF Metadata Remover</h3>
          <p class="tool-card__desc">Strip author, creation date, and software information from PDF documents before sharing.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="why-section" aria-labelledby="why-title">
    <h2 class="section-title" id="why-title">Why Privacy Matters for Your Files</h2>
    <p class="section-subtitle">Images and documents often carry more information than you realise.</p>
    <div class="why-grid">
      <div class="why-item">
        <div class="why-item__icon" aria-hidden="true">📍</div>
        <div>
          <h3 class="why-item__title">Location Data</h3>
          <p class="why-item__desc">Photos taken with smartphones often include precise GPS coordinates that can reveal where you live, work, or travel.</p>
        </div>
      </div>
      <div class="why-item">
        <div class="why-item__icon" aria-hidden="true">🕐</div>
        <div>
          <h3 class="why-item__title">Timestamps</h3>
          <p class="why-item__desc">Capture date and time metadata can identify when and where you were when a photo was taken.</p>
        </div>
      </div>
      <div class="why-item">
        <div class="why-item__icon" aria-hidden="true">📷</div>
        <div>
          <h3 class="why-item__title">Device Information</h3>
          <p class="why-item__desc">Camera model, software version, and serial numbers embedded in image files can be used to fingerprint your device.</p>
        </div>
      </div>
      <div class="why-item">
        <div class="why-item__icon" aria-hidden="true">🔒</div>
        <div>
          <h3 class="why-item__title">100% In-Browser</h3>
          <p class="why-item__desc">Every tool on this page processes your files locally. Nothing is sent to our servers or third parties.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="related-section" aria-labelledby="related-title">
    <h2 class="section-title" id="related-title">Related Tools</h2>
    <p class="section-subtitle">Optimise and convert your cleaned images using our other free browser-side tools.</p>
    <div class="related-grid">
      <a href="/compress-image" class="related-card">
        <span class="related-card__name">Image Compressor</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/image-converter" class="related-card">
        <span class="related-card__name">Image Converter</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/png-to-webp" class="related-card">
        <span class="related-card__name">PNG to WebP</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/jpg-to-webp" class="related-card">
        <span class="related-card__name">JPG to WebP</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
    </div>
  </section>
</BaseLayout>

<style>
  .hub-hero {
    text-align: center;
    padding: var(--space-12) 0 var(--space-10);
  }

  .hub-hero__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--color-accent-400);
    background: color-mix(in srgb, var(--color-accent-400) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-accent-400) 30%, transparent);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .hub-hero__title {
    font-size: clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl));
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    line-height: var(--line-height-tight);
    letter-spacing: var(--letter-spacing-tight);
    margin-bottom: var(--space-4);
  }

  .hub-hero__subtitle {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    max-width: 52ch;
    margin: 0 auto;
    line-height: var(--line-height-loose);
  }

  .tools-hub {
    padding: var(--space-12) 0;
    border-top: 1px solid var(--border-default);
  }

  .category-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-6);
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
  }

  .tool-card {
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    text-decoration: none;
    color: inherit;
    transition: transform var(--transition-base), border-color var(--transition-base);
  }

  a.tool-card:hover {
    transform: translateY(-3px);
    border-color: var(--color-brand-400);
  }

  .tool-card--featured {
    border-color: color-mix(in srgb, var(--color-brand-400) 40%, var(--border-default));
  }

  .tool-card--coming-soon {
    opacity: 0.6;
    cursor: default;
  }

  .tool-card__icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-brand-500) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-brand-400) 30%, transparent);
    color: var(--color-brand-300);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .tool-card__body {
    flex: 1;
  }

  .tool-card__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .tool-card__desc {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: var(--line-height-loose);
    margin-bottom: var(--space-3);
  }

  .tool-card__formats {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    font-family: monospace;
  }

  .tool-card__cta {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-brand-400);
    margin-top: auto;
  }

  .coming-soon-badge {
    display: inline-block;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-bold);
    background: color-mix(in srgb, var(--color-accent-400) 15%, transparent);
    color: var(--color-accent-300);
    border-radius: var(--radius-full);
    padding: 2px 10px;
    border: 1px solid color-mix(in srgb, var(--color-accent-400) 30%, transparent);
    margin-bottom: var(--space-2);
  }

  .why-section {
    padding: var(--space-12) 0;
    border-top: 1px solid var(--border-default);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .section-subtitle {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin-bottom: var(--space-8);
  }

  .why-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-5);
  }

  .why-item {
    display: flex;
    gap: var(--space-4);
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
  }

  .why-item__icon {
    font-size: var(--font-size-2xl);
    flex-shrink: 0;
    line-height: 1;
  }

  .why-item__title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  .why-item__desc {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: var(--line-height-loose);
  }

  .related-section {
    padding: var(--space-12) 0;
    border-top: 1px solid var(--border-default);
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-4);
  }

  .related-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    text-decoration: none;
    color: inherit;
    transition: border-color var(--transition-fast), transform var(--transition-fast);
  }

  .related-card:hover {
    border-color: var(--color-brand-400);
    transform: translateY(-2px);
  }

  .related-card__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
  }

  .related-card__arrow {
    color: var(--color-brand-400);
    font-weight: var(--font-weight-bold);
  }
</style>
`;

// 2. privacy-tools/exif-remover.astro
const exifRemover = `---
/**
 * privacy-tools/exif-remover.astro
 * Free EXIF Remover — strips image metadata client-side using HTML5 Canvas.
 */
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Free EXIF Remover — Remove Image Metadata Online"
  description="Remove EXIF data, GPS location, and hidden metadata from JPG, PNG, and WebP images directly in your browser. No uploads. Batch support. Free."
  canonicalURL="https://freefiletool.app/privacy-tools/exif-remover/"
>
  <!-- Structured Data: FAQPage + HowTo -->
  <script type="application/ld+json" is:inline>
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "name": "How to Remove EXIF Data from Images Online",
        "description": "Strip hidden metadata from your photos using the FreeFileTools EXIF Remover — 100% in your browser.",
        "step": [
          { "@type": "HowToStep", "name": "Select Images", "text": "Drop one or more JPG, PNG, or WebP images into the upload zone or click to browse." },
          { "@type": "HowToStep", "name": "Process", "text": "Click 'Remove EXIF from All' — each image is decoded and re-encoded via an in-browser canvas, stripping the original metadata." },
          { "@type": "HowToStep", "name": "Download", "text": "Download each clean image individually or grab all files as a ZIP archive." }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What is EXIF data?", "acceptedAnswer": { "@type": "Answer", "text": "EXIF (Exchangeable Image File Format) is metadata automatically embedded in image files by cameras and smartphones. It can include the camera model, lens settings, date, time, and GPS location where the photo was taken." } },
          { "@type": "Question", "name": "Why should I remove EXIF data from photos?", "acceptedAnswer": { "@type": "Answer", "text": "Sharing photos online with EXIF intact can inadvertently reveal your location, the device you used, and when the photo was taken. Removing it before publishing protects your personal privacy." } },
          { "@type": "Question", "name": "Can EXIF data reveal my location?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. If your phone's camera had GPS enabled when the photo was taken, the image may contain precise GPS coordinates. This tool removes those coordinates along with other EXIF fields." } },
          { "@type": "Question", "name": "Does FreeFileTools upload my photos?", "acceptedAnswer": { "@type": "Answer", "text": "No. All processing happens entirely in your browser using the HTML5 Canvas API. Your photos never leave your device and are never sent to any server." } },
          { "@type": "Question", "name": "Does removing EXIF reduce image quality?", "acceptedAnswer": { "@type": "Answer", "text": "The canvas re-encoding process preserves visual quality. For JPEG output the tool uses a high-quality setting. There may be a very slight difference from the original encoding, but it is not perceptible in normal use." } },
          { "@type": "Question", "name": "What image formats are supported?", "acceptedAnswer": { "@type": "Answer", "text": "JPG/JPEG, PNG, and WebP are supported. The output format matches the input format by default." } },
          { "@type": "Question", "name": "Can I remove metadata from multiple images at once?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Drag and drop multiple files at once or select them in the file picker. The tool queues all files and processes them as a batch." } },
          { "@type": "Question", "name": "Is the EXIF remover free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The tool is completely free with no sign-up, no file size cap beyond browser memory limits, and no watermarks added to your images." } },
          { "@type": "Question", "name": "Does the tool work on mobile phones?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The interface is fully responsive and the HTML5 Canvas API is supported on all modern Android and iOS browsers." } },
          { "@type": "Question", "name": "What information is removed from my images?", "acceptedAnswer": { "@type": "Answer", "text": "The canvas re-encoding approach removes common embedded metadata including EXIF fields (camera make/model, lens, settings), GPS coordinates, timestamps, software tags, and thumbnail previews embedded in the file. It produces a clean re-encoded image without any of the original metadata container." } }
        ]
      }
    ]
  }
  </script>

  <!-- HERO -->
  <section class="exif-hero">
    <div class="exif-hero__badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      100% Browser-Based · No Uploads · Free
    </div>
    <h1 class="exif-hero__title">Remove EXIF Data from Images Online</h1>
    <p class="exif-hero__subtitle">
      Remove hidden photo metadata, including location information, directly in your browser. Your images never leave your device.
    </p>
  </section>

  <!-- TOOL -->
  <section class="tool-section" id="tool" aria-label="EXIF Remover Tool">
    <div class="upload-zone" id="exif-zone" data-state="idle" data-allowed-types='["jpg","jpeg","png","webp"]'>
      <input type="file" class="upload-zone__input" id="exif-zone-input" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple aria-hidden="true" tabindex="-1" />

      <!-- STATE: idle -->
      <div class="upload-zone__state upload-zone__idle" role="button" tabindex="0" aria-label="Upload images to remove EXIF data. Accepted formats: JPG, PNG, WebP">
        <div class="upload-zone__icon" aria-hidden="true">
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" rx="12" stroke="var(--color-brand-400)" stroke-width="2" stroke-dasharray="6 4" opacity="0.7"/>
            <path d="M24 14v14M17 21l7-7 7 7" stroke="var(--color-brand-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="upload-zone__heading">Choose Images</p>
        <p class="upload-zone__sub">or drag &amp; drop · JPG, PNG, WebP · Batch supported</p>
        <div class="privacy-pill" aria-label="Privacy notice">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Your photos never leave your device
        </div>
      </div>

      <!-- STATE: dragover -->
      <div class="upload-zone__state upload-zone__dragover" aria-hidden="true">
        <div class="upload-zone__icon">
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" rx="12" stroke="var(--color-accent-400)" stroke-width="2.5"/>
            <path d="M24 14v14M17 21l7-7 7 7" stroke="var(--color-accent-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="upload-zone__heading">Release to add images</p>
      </div>

      <!-- STATE: validating -->
      <div class="upload-zone__state upload-zone__validating">
        <div class="upload-zone__spinner" aria-hidden="true"></div>
        <p class="upload-zone__heading">Validating files&hellip;</p>
      </div>

      <!-- STATE: options (queue) -->
      <div class="upload-zone__state upload-zone__options">
        <div class="batch-header">
          <h2 class="batch-title">Ready to clean (<span class="file-count">0</span> files)</h2>
          <button type="button" class="add-more-btn">+ Add More</button>
        </div>
        <div class="queue-list"></div>
        <div class="action-row">
          <button type="button" class="convert-btn primary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Remove EXIF from All
          </button>
        </div>
        <p class="tool-disclaimer">
          <em>Removes common embedded image metadata such as EXIF information. Processing happens locally in your browser.</em>
        </p>
      </div>

      <!-- STATE: processing -->
      <div class="upload-zone__state upload-zone__processing">
        <div class="upload-zone__spinner" aria-hidden="true"></div>
        <p class="upload-zone__heading">Removing metadata&hellip;</p>
        <p class="upload-zone__sub progress-text">Processing 1 of 1&hellip;</p>
      </div>

      <!-- STATE: download -->
      <div class="upload-zone__state upload-zone__download">
        <div class="success-badge" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--color-success-500)" stroke-width="2.5"/>
            <path d="M16 24l6 6 10-12" stroke="var(--color-success-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="upload-zone__heading">Metadata Removed!</p>
        <p class="upload-zone__sub stats-text"></p>
        <div class="converted-list"></div>
        <div class="download-actions">
          <button type="button" class="download-zip-btn primary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download All (.zip)
          </button>
          <button type="button" class="reset-btn secondary-btn">Process Another Batch</button>
        </div>
      </div>

      <!-- STATE: error -->
      <div class="upload-zone__state upload-zone__error">
        <div class="upload-zone__icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="var(--color-error-400)" stroke-width="2"/>
            <path d="M18 18l12 12M30 18L18 30" stroke="var(--color-error-400)" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="upload-zone__heading" style="color:var(--color-error-400)">Could Not Process Files</p>
        <p class="upload-zone__sub error-message"></p>
        <button type="button" class="retry-btn secondary-btn">Try Again</button>
      </div>

      <div class="sr-only" aria-live="polite" id="exif-zone-announcer"></div>
      <div class="upload-zone__toast" id="exif-zone-toast" role="alert" aria-live="assertive"></div>
    </div>
  </section>

  <!-- WHY USE THIS -->
  <section class="why-section" aria-labelledby="why-heading">
    <h2 class="section-title" id="why-heading">Why Remove Image Metadata?</h2>
    <div class="why-grid">
      <div class="why-card">
        <div class="why-card__icon" aria-hidden="true">📍</div>
        <h3 class="why-card__title">Remove Location Information</h3>
        <p class="why-card__desc">Photos can contain GPS coordinates and other embedded information. Strip location data before sharing.</p>
      </div>
      <div class="why-card">
        <div class="why-card__icon" aria-hidden="true">👤</div>
        <h3 class="why-card__title">Protect Personal Information</h3>
        <p class="why-card__desc">Clean metadata before sharing images publicly. Camera details and timestamps can reveal your habits and hardware.</p>
      </div>
      <div class="why-card">
        <div class="why-card__icon" aria-hidden="true">🌐</div>
        <h3 class="why-card__title">Prepare Images for Online Publishing</h3>
        <p class="why-card__desc">Remove unnecessary metadata before uploading photos to websites, forums, marketplaces, and social platforms.</p>
      </div>
      <div class="why-card">
        <div class="why-card__icon" aria-hidden="true">🔒</div>
        <h3 class="why-card__title">Process Privately</h3>
        <p class="why-card__desc">Images are processed locally instead of being uploaded to a server. Zero network transfer of your photo data.</p>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="how-section" aria-labelledby="how-heading">
    <h2 class="section-title" id="how-heading">How It Works</h2>
    <div class="steps-row">
      <div class="step">
        <div class="step__num" aria-hidden="true">1</div>
        <h3 class="step__title">Select Your Images</h3>
        <p class="step__desc">Drop JPG, PNG, or WebP files into the tool, or click to browse. Batch selection is supported.</p>
      </div>
      <div class="step__divider" aria-hidden="true">&rarr;</div>
      <div class="step">
        <div class="step__num" aria-hidden="true">2</div>
        <h3 class="step__title">Remove Metadata</h3>
        <p class="step__desc">Each image is decoded and re-rendered via an in-browser HTML5 Canvas, cleanly stripping embedded EXIF tags.</p>
      </div>
      <div class="step__divider" aria-hidden="true">&rarr;</div>
      <div class="step">
        <div class="step__num" aria-hidden="true">3</div>
        <h3 class="step__title">Download Clean Images</h3>
        <p class="step__desc">Download each sanitized image individually or export the entire batch in a single convenient ZIP archive.</p>
      </div>
    </div>
  </section>

  <!-- FAQ SECTION -->
  <section class="faq-section" aria-labelledby="faq-heading">
    <h2 class="section-title" id="faq-heading">Frequently Asked Questions</h2>
    <div class="faq-accordion" role="list">

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">What is EXIF data?</summary>
        <div class="faq-answer">
          <p>EXIF (Exchangeable Image File Format) is metadata automatically embedded in image files by cameras and smartphones. It typically includes the camera make and model, lens settings, shutter speed, ISO, date and time the photo was taken, and — if GPS was enabled on the device — precise location coordinates.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Why should I remove EXIF data from photos?</summary>
        <div class="faq-answer">
          <p>When you share images online, anyone who downloads them can read the embedded metadata using free tools. This can reveal where you live or work, what device you own, and when photos were taken. Removing EXIF data before publishing protects your personal privacy, especially for images shared on social media, public forums, or classifieds.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Can EXIF data reveal my location?</summary>
        <div class="faq-answer">
          <p>Yes. If your phone or camera had location tagging enabled when the photo was captured, the image file likely contains exact GPS coordinates. This tool removes GPS metadata completely as part of the canvas rasterization process.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Does FreeFileTools upload my photos?</summary>
        <div class="faq-answer">
          <p>No. All processing happens entirely in your browser using client-side JavaScript and the HTML5 Canvas API. Your photos never leave your device and are never transmitted to any external server.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Does removing EXIF reduce image quality?</summary>
        <div class="faq-answer">
          <p>The canvas re-encoding approach maintains excellent visual fidelity. JPEG images are re-encoded at high quality (92%), PNG files retain lossless pixel accuracy, and WebP preserves sharpness. While re-encoding is technically lossy for JPEGs, the visual difference is imperceptible for everyday use.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">What image formats are supported?</summary>
        <div class="faq-answer">
          <p>We support JPG/JPEG, PNG, and WebP. The output format matches the input format so your image extensions remain consistent.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Can I remove metadata from multiple images at once?</summary>
        <div class="faq-answer">
          <p>Yes. You can select or drop multiple images at once. The tool queues them in a batch, processes them sequentially in your browser, and lets you download individual files or a ZIP archive containing all cleaned images.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Is the EXIF remover free?</summary>
        <div class="faq-answer">
          <p>Yes. The tool is 100% free with no registration, no subscription, and no watermarks.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">Does the tool work on mobile phones?</summary>
        <div class="faq-answer">
          <p>Yes. The tool is fully responsive and works directly within modern mobile web browsers including Chrome on Android and Safari on iOS.</p>
        </div>
      </details>

      <details class="faq-details" role="listitem">
        <summary class="faq-summary">What information is removed from my images?</summary>
        <div class="faq-answer">
          <p>The tool removes embedded metadata containers including EXIF tags, GPS location, camera model and settings, capture date and time, thumbnail previews, and software headers by drawing the image pixels to an HTML5 canvas and re-exporting a fresh file.</p>
        </div>
      </details>

    </div>
  </section>

  <!-- INTERNAL LINKS -->
  <section class="related-section" aria-labelledby="related-heading">
    <h2 class="section-title" id="related-heading">Continue Optimizing Your Images</h2>
    <p class="section-subtitle">After removing metadata, you can compress or convert your clean images using these free tools.</p>
    <div class="related-grid">
      <a href="/compress-image" class="related-card">
        <span>Compress your image</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/image-converter" class="related-card">
        <span>Convert your image</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/png-to-webp" class="related-card">
        <span>PNG to WebP</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/jpg-to-webp" class="related-card">
        <span>JPG to WebP</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/pdf-tools/compress-pdf" class="related-card">
        <span>Compress PDF</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
      <a href="/privacy-tools" class="related-card">
        <span>All Privacy Tools</span>
        <span class="related-card__arrow">&rarr;</span>
      </a>
    </div>
  </section>
</BaseLayout>

<script>
  import JSZip from 'jszip';

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  const EXT_MAP = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const MAX_FILE = 50 * 1024 * 1024;
  const MAX_BATCH = 200 * 1024 * 1024;

  const zone        = /** @type {HTMLElement} */ (document.getElementById('exif-zone'));
  const input       = /** @type {HTMLInputElement} */ (document.getElementById('exif-zone-input'));
  const announcer   = document.getElementById('exif-zone-announcer');
  const toastEl     = document.getElementById('exif-zone-toast');
  const idleArea    = zone?.querySelector('.upload-zone__idle');
  const queueListEl = zone?.querySelector('.queue-list');
  const fileCountEl = zone?.querySelector('.file-count');
  const convertBtn  = zone?.querySelector('.convert-btn');
  const addMoreBtn  = zone?.querySelector('.add-more-btn');
  const retryBtn    = zone?.querySelector('.retry-btn');
  const resetBtn    = zone?.querySelector('.reset-btn');
  const zipBtn      = zone?.querySelector('.download-zip-btn');
  const progressTxt = zone?.querySelector('.progress-text');
  const convertedListEl = zone?.querySelector('.converted-list');
  const statsTxt    = zone?.querySelector('.stats-text');
  const errorMsgEl  = zone?.querySelector('.error-message');

  /** @type {File[]} */
  let queue = [];
  /** @type {{file:File, blob:Blob, url:string, filename:string, origSize:number, newSize:number}[]} */
  let results = [];
  let createdUrls = [];
  let dragCounter = 0;

  function setState(s) { if (zone) zone.dataset.state = s; }
  function announce(msg) { if (announcer) announcer.textContent = msg; }

  function showToast(msg, isError = true) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = \`upload-zone__toast \${isError ? 'upload-zone__toast--error' : 'upload-zone__toast--info'} upload-zone__toast--visible\`;
    clearTimeout(/** @type {any} */(toastEl)._t);
    /** @type {any} */(toastEl)._t = setTimeout(() => { if (toastEl) toastEl.className = 'upload-zone__toast'; }, 5000);
  }

  function revokeAll() {
    createdUrls.forEach(u => URL.revokeObjectURL(u));
    createdUrls = [];
  }

  zone?.addEventListener('dragenter', e => {
    e.preventDefault();
    if (zone.dataset.state === 'idle') { dragCounter++; setState('dragover'); }
  });
  zone?.addEventListener('dragover', e => e.preventDefault());
  zone?.addEventListener('dragleave', e => {
    e.preventDefault();
    if (zone.dataset.state === 'dragover') {
      dragCounter--;
      if (dragCounter <= 0) { dragCounter = 0; setState('idle'); }
    }
  });
  zone?.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    const files = Array.from(/** @type {DragEvent} */(e).dataTransfer?.files || []);
    if (files.length) handleFiles(files);
  });

  idleArea?.addEventListener('click', () => input?.click());
  idleArea?.addEventListener('keydown', e => {
    if (/** @type {KeyboardEvent} */(e).key === 'Enter' || /** @type {KeyboardEvent} */(e).key === ' ') { e.preventDefault(); input?.click(); }
  });
  addMoreBtn?.addEventListener('click', () => input?.click());
  input?.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    if (files.length) handleFiles(files);
    input.value = '';
  });
  retryBtn?.addEventListener('click', resetToIdle);
  resetBtn?.addEventListener('click', resetToIdle);

  function handleFiles(newFiles) {
    setState('validating');
    const valid = [], skipped = [];
    let batchBytes = queue.reduce((s, f) => s + f.size, 0);

    for (const f of newFiles) {
      if (!ALLOWED.includes(f.type)) { skipped.push(\`\${f.name}: unsupported format\`); continue; }
      if (f.size > MAX_FILE)         { skipped.push(\`\${f.name}: exceeds 50 MB\`); continue; }
      if (batchBytes + f.size > MAX_BATCH) { skipped.push(\`\${f.name}: batch limit reached\`); continue; }
      if (!queue.some(q => q.name === f.name && q.size === f.size)) {
        valid.push(f);
        batchBytes += f.size;
      }
    }
    if (skipped.length) showToast(\`\${skipped.length} file(s) skipped: \${skipped[0]}\${skipped.length > 1 ? \` (+\${skipped.length-1} more)\` : ''}\`, true);
    if (!valid.length && !queue.length) { showError('No valid images found. Please use JPG, PNG, or WebP files.'); return; }
    queue.push(...valid);
    renderQueue();
    setState('options');
    announce(\`\${queue.length} image(s) ready.\`);
  }

  function renderQueue() {
    if (!queueListEl) return;
    if (fileCountEl) fileCountEl.textContent = String(queue.length);
    while (queueListEl.firstChild) queueListEl.removeChild(queueListEl.firstChild);
    queue.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'queue-item';

      const icon = document.createElement('div');
      icon.className = 'queue-item__icon';
      icon.textContent = f.name.split('.').pop()?.toUpperCase() ?? 'IMG';

      const details = document.createElement('div');
      details.className = 'queue-item__details';

      const name = document.createElement('span');
      name.className = 'queue-item__name';
      name.textContent = f.name;

      const meta = document.createElement('span');
      meta.className = 'queue-item__meta';
      meta.textContent = formatBytes(f.size);

      details.append(name, meta);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'queue-item__remove';
      rm.setAttribute('aria-label', \`Remove \${f.name}\`);
      rm.textContent = '×';
      rm.addEventListener('click', () => {
        queue.splice(i, 1);
        if (!queue.length) resetToIdle(); else renderQueue();
      });

      item.append(icon, details, rm);
      queueListEl.appendChild(item);
    });
  }

  convertBtn?.addEventListener('click', async () => {
    if (!queue.length) return;
    setState('processing');
    announce('Removing metadata…');
    results = [];
    revokeAll();

    try {
      for (let i = 0; i < queue.length; i++) {
        const file = queue[i];
        if (progressTxt) progressTxt.textContent = \`Processing \${i + 1} of \${queue.length}…\`;
        await new Promise(r => setTimeout(r, 20));

        const blob = await stripExif(file);
        const ext = EXT_MAP[file.type] || 'jpg';
        const baseName = file.name.replace(/\\.[^.]+$/, '');
        const filename = \`\${sanitize(baseName)}_clean.\${ext}\`;
        const url = URL.createObjectURL(blob);
        createdUrls.push(url);
        results.push({ file, blob, url, filename, origSize: file.size, newSize: blob.size });
      }
      showDownload();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Processing failed.');
    }
  });

  async function stripExif(file) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width  = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable.');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const mimeType = file.type === 'image/png' ? 'image/png' : (file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');
    const quality  = mimeType === 'image/png' ? undefined : 0.92;

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error(\`Could not encode \${file.name}\`));
      }, mimeType, quality);
    });
  }

  function showDownload() {
    if (!convertedListEl) return;
    while (convertedListEl.firstChild) convertedListEl.removeChild(convertedListEl.firstChild);

    let totalOrig = 0, totalNew = 0;
    results.forEach(r => {
      totalOrig += r.origSize;
      totalNew  += r.newSize;

      const row = document.createElement('div');
      row.className = 'converted-item-row';

      const details = document.createElement('div');
      details.className = 'converted-item__details';

      const nameEl = document.createElement('span');
      nameEl.className = 'converted-item__name';
      nameEl.textContent = r.filename;

      const metaEl = document.createElement('span');
      metaEl.className = 'converted-item__meta';
      metaEl.textContent = \`\${formatBytes(r.origSize)} → \${formatBytes(r.newSize)}\`;

      details.append(nameEl, metaEl);

      const link = document.createElement('a');
      link.href = r.url;
      link.download = r.filename;
      link.className = 'converted-item__download-link';
      link.textContent = 'Download';
      link.addEventListener('click', () => {
        const idx = createdUrls.indexOf(r.url);
        if (idx !== -1) createdUrls.splice(idx, 1);
        setTimeout(() => URL.revokeObjectURL(r.url), 60000);
      }, { once: true });

      row.append(details, link);
      convertedListEl.appendChild(row);
    });

    if (statsTxt) {
      const saved = totalOrig > 0 ? Math.round((1 - totalNew / totalOrig) * 100) : 0;
      statsTxt.textContent = \`\${results.length} image(s) cleaned · \${formatBytes(totalOrig)} → \${formatBytes(totalNew)}\${saved > 0 ? \` (\${saved}% smaller)\` : ''}\`;
    }

    setState('download');
    announce(\`Done. \${results.length} image(s) cleaned.\`);
  }

  zipBtn?.addEventListener('click', async () => {
    if (!results.length) return;
    const zip = new JSZip();
    results.forEach(r => zip.file(r.filename, r.blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    createdUrls.push(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clean-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  function showError(msg) {
    setState('error');
    if (errorMsgEl) errorMsgEl.textContent = msg;
    announce(\`Error: \${msg}\`);
  }

  function resetToIdle() {
    revokeAll();
    queue = [];
    results = [];
    if (input) input.value = '';
    dragCounter = 0;
    setState('idle');
    announce('Ready to upload images.');
  }

  function formatBytes(bytes) {
    if (bytes < 1024)       return \`\${bytes} B\`;
    if (bytes < 1048576)    return \`\${(bytes/1024).toFixed(1)} KB\`;
    return \`\${(bytes/1048576).toFixed(1)} MB\`;
  }

  function sanitize(name) {
    return name.replace(/[^a-zA-Z0-9_\\-\\.]/g, '_').substring(0, 80);
  }
</script>

<style>
  .exif-hero {
    text-align: center;
    padding: var(--space-12) 0 var(--space-8);
  }

  .exif-hero__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--color-accent-400);
    background: color-mix(in srgb, var(--color-accent-400) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-accent-400) 30%, transparent);
    border-radius: var(--radius-full);
    padding: var(--space-1) var(--space-4);
    margin-bottom: var(--space-5);
  }

  .exif-hero__title {
    font-size: clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl));
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    line-height: var(--line-height-tight);
    letter-spacing: var(--letter-spacing-tight);
    margin-bottom: var(--space-4);
  }

  .exif-hero__subtitle {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    max-width: 54ch;
    margin: 0 auto;
    line-height: var(--line-height-loose);
  }

  .tool-section {
    max-width: 42rem;
    margin: 0 auto var(--space-16);
  }

  .upload-zone {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    padding: var(--space-8);
    border: 2px dashed var(--border-subtle);
    border-radius: var(--radius-xl);
    background: var(--surface-1);
    transition: border-color var(--transition-base), background var(--transition-base), box-shadow var(--transition-base);
    text-align: center;
  }

  .upload-zone__input {
    position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none;
  }

  .upload-zone__state { display: none; flex-direction: column; align-items: center; width: 100%; max-width: 32rem; gap: var(--space-4); animation: fadeUp .25s ease-out; }
  .upload-zone[data-state='idle']       .upload-zone__idle,
  .upload-zone[data-state='dragover']   .upload-zone__dragover,
  .upload-zone[data-state='validating'] .upload-zone__validating,
  .upload-zone[data-state='options']    .upload-zone__options,
  .upload-zone[data-state='processing'] .upload-zone__processing,
  .upload-zone[data-state='download']   .upload-zone__download,
  .upload-zone[data-state='error']      .upload-zone__error { display: flex; }

  .upload-zone__idle { cursor: pointer; border-radius: var(--radius-lg); padding: var(--space-4); outline: none; }
  .upload-zone__idle:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-400) 40%, transparent); }
  .upload-zone[data-state='idle']:hover { border-color: var(--color-brand-400); box-shadow: var(--shadow-glow); }
  .upload-zone[data-state='dragover'] { border-color: var(--color-accent-400); border-style: solid; background: color-mix(in srgb, var(--color-accent-400) 8%, var(--surface-1)); }
  .upload-zone[data-state='options'], .upload-zone[data-state='download'] { border-style: solid; border-color: var(--border-default); }
  .upload-zone[data-state='error'] { border-color: var(--color-error-400); border-style: solid; }

  .upload-zone__heading { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary); }
  .upload-zone__sub     { font-size: var(--font-size-sm); color: var(--text-secondary); }

  .privacy-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: var(--font-size-xs); color: var(--color-success-400);
    background: color-mix(in srgb, var(--color-success-500) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-success-400) 30%, transparent);
    border-radius: var(--radius-full); padding: 4px 12px;
    margin-top: var(--space-2);
  }

  .upload-zone__spinner {
    width: 40px; height: 40px; border: 3px solid var(--border-default);
    border-top-color: var(--color-brand-400); border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .batch-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
  .batch-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); color: var(--text-secondary); }
  .add-more-btn { background: transparent; border: none; color: var(--color-brand-400); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; }
  .add-more-btn:hover { text-decoration: underline; }
  .queue-list { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; max-height: 200px; overflow-y: auto; }
  .queue-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); background: var(--surface-2); border: 1px solid var(--border-default); border-radius: var(--radius-md); text-align: left; }
  .queue-item__icon { font-size: 10px; font-weight: var(--font-weight-bold); background: var(--surface-3); color: var(--color-brand-300); padding: 4px 6px; border-radius: var(--radius-sm); }
  .queue-item__details { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .queue-item__name { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .queue-item__meta { font-size: 11px; color: var(--text-muted); }
  .queue-item__remove { background: transparent; border: none; color: var(--text-muted); font-size: var(--font-size-lg); cursor: pointer; line-height: 1; padding: 0 4px; }
  .queue-item__remove:hover { color: var(--color-error-400); }

  .action-row { width: 100%; }
  .tool-disclaimer { font-size: var(--font-size-xs); color: var(--text-muted); text-align: center; line-height: var(--line-height-loose); }

  .primary-btn {
    display: inline-flex; align-items: center; gap: var(--space-2);
    background: linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500));
    color: #fff; border: none; border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-6); font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold); cursor: pointer; width: 100%;
    justify-content: center; transition: opacity var(--transition-fast);
  }
  .primary-btn:hover { opacity: .9; }
  .secondary-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid var(--border-default);
    color: var(--text-secondary); border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-6); font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold); cursor: pointer; width: 100%;
    transition: border-color var(--transition-fast);
  }
  .secondary-btn:hover { border-color: var(--color-brand-400); color: var(--text-primary); }

  .success-badge { margin-bottom: var(--space-2); }
  .stats-text { font-size: var(--font-size-sm); color: var(--text-secondary); }
  .converted-list { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; max-height: 220px; overflow-y: auto; }
  .converted-item-row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); background: var(--surface-2); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
  .converted-item__details { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .converted-item__name { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .converted-item__meta { font-size: 11px; color: var(--text-muted); }
  .converted-item__download-link { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-brand-400); text-decoration: none; white-space: nowrap; flex-shrink: 0; }
  .converted-item__download-link:hover { text-decoration: underline; }
  .download-actions { display: flex; flex-direction: column; gap: var(--space-3); width: 100%; }

  .upload-zone__toast { position: absolute; bottom: var(--space-4); left: 50%; transform: translateX(-50%); background: var(--surface-3); border-radius: var(--radius-lg); padding: var(--space-2) var(--space-4); font-size: var(--font-size-xs); white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .2s; }
  .upload-zone__toast--visible { opacity: 1; }
  .upload-zone__toast--error { border: 1px solid var(--color-error-400); color: var(--color-error-400); }
  .upload-zone__toast--info  { border: 1px solid var(--border-default); color: var(--text-secondary); }

  .why-section, .how-section, .faq-section, .related-section {
    padding: var(--space-12) 0;
    border-top: 1px solid var(--border-default);
  }

  .section-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-6);
  }

  .section-subtitle {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    margin-bottom: var(--space-8);
  }

  .why-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-5);
  }

  .why-card {
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
  }

  .why-card__icon { font-size: var(--font-size-2xl); margin-bottom: var(--space-3); }
  .why-card__title { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-2); }
  .why-card__desc { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-loose); }

  .steps-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .step {
    flex: 1;
    min-width: 160px;
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
  }

  .step__num {
    width: 36px; height: 36px; border-radius: 50%;
    background: color-mix(in srgb, var(--color-brand-500) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-brand-400) 40%, transparent);
    color: var(--color-brand-300);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    display: grid; place-items: center;
    margin-bottom: var(--space-3);
  }

  .step__title { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin-bottom: var(--space-2); }
  .step__desc  { font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-loose); }

  .step__divider {
    font-size: var(--font-size-2xl);
    color: var(--text-muted);
    padding-top: var(--space-6);
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .step__divider { display: none; }
    .steps-row { flex-direction: column; }
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-4);
  }

  .related-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface-1);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-4) var(--space-5);
    text-decoration: none;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
  }

  .related-card:hover { border-color: var(--color-brand-400); color: var(--text-primary); transform: translateY(-2px); }
  .related-card__arrow { color: var(--color-brand-400); font-weight: var(--font-weight-bold); flex-shrink: 0; }

  .faq-accordion { display: flex; flex-direction: column; gap: var(--space-3); }
  .faq-answer a { color: var(--color-brand-400); text-decoration: underline; }
</style>
`;

// 3. components/ExifStripZone.astro
const exifStripZone = `---
/**
 * ExifStripZone.astro
 * Thin wrapper around UploadZone configured specifically for EXIF stripping.
 */
import UploadZone from './UploadZone.astro';

export interface Props {
  id?: string;
}

const { id = 'exif-upload-zone' } = Astro.props;
---

<UploadZone
  id={id}
  allowedTypes={['jpg', 'jpeg', 'png', 'webp']}
  defaultFormat="webp"
/>
`;

fs.writeFileSync(path.join(privacyDir, 'index.astro'), privacyIndex, 'utf8');
console.log('Successfully wrote src/pages/privacy-tools/index.astro');

fs.writeFileSync(path.join(privacyDir, 'exif-remover.astro'), exifRemover, 'utf8');
console.log('Successfully wrote src/pages/privacy-tools/exif-remover.astro');

fs.writeFileSync(path.join(__dirname, 'src', 'components', 'ExifStripZone.astro'), exifStripZone, 'utf8');
console.log('Successfully wrote src/components/ExifStripZone.astro');

