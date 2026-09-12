<!-- ijfw-schema: v1 -->
# Knowledge Base
---
type: decision
summary: Redirect /sitemap.xml to /sitemap-index.xml for canonical consistency.
stored: 2026-09-12T12:16:56.019Z
hash: 5559f3d4cc8f
---
<!-- hash:5559f3d4cc8f -->
The production URL /sitemap.xml was serving a stale sitemap with the legacy domain. I implemented a 301 redirect in public/_redirects to point to the Astro-generated /sitemap-index.xml. This ensures consistency between robots.txt and the actual sitemap architecture. Local dist/ verification confirms all canonical URLs are correct.
