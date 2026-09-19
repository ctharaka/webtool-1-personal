const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = getAllFiles(distDir);
let hasErrors = false;
const errors = [];

const pageRoutes = new Set();
const linkMap = new Map(); // target -> set of source routes

htmlFiles.forEach(file => {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  let route = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (route !== '/' && !route.endsWith('/')) {
    route += '/';
  }
  pageRoutes.add(route);
});

htmlFiles.forEach(file => {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  let route = '/' + relPath.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (route !== '/' && !route.endsWith('/')) {
    route += '/';
  }

  // 1. Meta check
  const titleMatches = content.match(/<title>(.*?)<\/title>/gi);
  const metaDescMatches = content.match(/<meta name="description" content="(.*?)"/gi);
  const canonicalMatches = content.match(/<link rel="canonical" href="(.*?)"/gi);
  const robotsMatches = content.match(/<meta name="robots" content="(.*?)"/gi);

  if (!titleMatches || titleMatches.length !== 1) {
    errors.push(`[${relPath}] Invalid title count: ${titleMatches ? titleMatches.length : 0}`);
    hasErrors = true;
  }

  if (!metaDescMatches || metaDescMatches.length !== 1) {
    errors.push(`[${relPath}] Invalid meta description count: ${metaDescMatches ? metaDescMatches.length : 0}`);
    hasErrors = true;
  }

  if (!canonicalMatches || canonicalMatches.length !== 1) {
    errors.push(`[${relPath}] Invalid canonical count: ${canonicalMatches ? canonicalMatches.length : 0}`);
    hasErrors = true;
  }

  // 2. Trailing slash check on internal hrefs
  const aHrefRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let match;
  while ((match = aHrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (
      href.startsWith('/') &&
      !href.startsWith('//') &&
      !href.startsWith('/#') &&
      !/\.[a-zA-Z0-9]+$/.test(href.split('?')[0].split('#')[0])
    ) {
      const cleanPath = href.split('?')[0].split('#')[0];
      if (cleanPath !== '/' && !cleanPath.endsWith('/')) {
        errors.push(`[${relPath}] Internal link missing trailing slash: "${href}"`);
        hasErrors = true;
      }

      // Track link for orphan check
      const targetRoute = cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
      if (!linkMap.has(targetRoute)) linkMap.set(targetRoute, new Set());
      linkMap.get(targetRoute).add(route);
    }
  }
});

// Check orphans (excluding 404 page)
pageRoutes.forEach(route => {
  if (route !== '/' && route !== '/404/' && (!linkMap.has(route) || linkMap.get(route).size === 0)) {
    errors.push(`[Orphan Page] Route "${route}" has 0 inbound internal links.`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error("❌ AUDIT FAILED with errors:\n" + errors.slice(0, 30).join("\n"));
  if (errors.length > 30) console.error(`...and ${errors.length - 30} more errors.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED! All ${htmlFiles.length} pages verified with valid metadata, trailing slashes, and zero orphans.`);
}
