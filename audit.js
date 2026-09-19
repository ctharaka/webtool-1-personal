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
const outboundMap = new Map(); // source -> set of target routes

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

  // 2. Trailing slash check & link tracking
  const aHrefRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let match;
  const outboundSet = new Set();

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

      const targetRoute = cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
      outboundSet.add(targetRoute);

      if (!linkMap.has(targetRoute)) linkMap.set(targetRoute, new Set());
      linkMap.get(targetRoute).add(route);
    }
  }

  outboundMap.set(route, outboundSet);

  // Check outgoing links for tool pages (excluding guides, category hubs, legal)
  const isGuide = route.startsWith('/guides/');
  const isLegal = ['/about/', '/contact/', '/privacy-policy/', '/terms/'].includes(route);
  const isHub = ['/', '/image-tools/', '/pdf/', '/text-tools/', '/audio-tools/', '/privacy-tools/'].includes(route);

  if (!isGuide && !isLegal && !isHub && route !== '/404/') {
    if (outboundSet.size < 6) {
      errors.push(`[Tool Link Audit] Tool page "${route}" has only ${outboundSet.size} outgoing links (minimum 6 required).`);
      hasErrors = true;
    }
  }

  // Check guide pages link to at least 3 tools
  if (isGuide && route !== '/guides/') {
    let toolLinkCount = 0;
    outboundSet.forEach(target => {
      if (!target.startsWith('/guides/') && !['/about/', '/contact/', '/privacy-policy/', '/terms/', '/'].includes(target)) {
        toolLinkCount++;
      }
    });
    if (toolLinkCount < 3) {
      errors.push(`[Guide Link Audit] Guide page "${route}" links to only ${toolLinkCount} tools (minimum 3 required).`);
      hasErrors = true;
    }
  }
});

// 3. Check inbound links (minimum 3 required, excluding /404/)
pageRoutes.forEach(route => {
  if (route !== '/' && route !== '/404/') {
    const inbound = linkMap.get(route) ? linkMap.get(route).size : 0;
    if (inbound < 3) {
      errors.push(`[Inbound Link Audit] Route "${route}" has only ${inbound} inbound links (minimum 3 required).`);
      hasErrors = true;
    }
  }
});

// 4. Click depth check (everything reachable in <= 3 clicks from '/')
const clickDepth = new Map();
const queue = ['/'];
clickDepth.set('/', 0);

while (queue.length > 0) {
  const current = queue.shift();
  const depth = clickDepth.get(current);
  const neighbours = outboundMap.get(current) || new Set();

  neighbours.forEach(next => {
    if (!clickDepth.has(next)) {
      clickDepth.set(next, depth + 1);
      queue.push(next);
    }
  });
}

pageRoutes.forEach(route => {
  if (route !== '/404/') {
    const depth = clickDepth.get(route);
    if (depth === undefined || depth > 3) {
      errors.push(`[Click Depth Audit] Route "${route}" click depth is ${depth === undefined ? 'unreachable' : depth} (>3 clicks from home).`);
      hasErrors = true;
    }
  }
});

if (hasErrors) {
  console.error("❌ AUDIT FAILED with errors:\n" + errors.slice(0, 35).join("\n"));
  if (errors.length > 35) console.error(`...and ${errors.length - 35} more errors.`);
  process.exit(1);
} else {
  console.log(`✅ AUDIT PASSED! All ${htmlFiles.length} pages verified for metadata, trailing slashes, 3+ inbound links, tool/guide link density, and <=3 click depth.`);
}
