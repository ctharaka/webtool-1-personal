import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');

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

const htmlFiles = getAllFiles(DIST_DIR);

const pages = [];
const linkMap = new Map(); // href -> set of source pages
const outboundMap = new Map(); // source page -> set of target hrefs

htmlFiles.forEach(file => {
  const relPath = path.relative(DIST_DIR, file).replace(/\\/g, '/');
  let route = '/' + relPath.replace(/index\.html$/, '').replace(/\.html$/, '');
  if (route !== '/' && route.endsWith('/')) {
    route = route.slice(0, -1);
  }
  if (route === '') route = '/';

  const html = fs.readFileSync(file, 'utf8');

  // Word count in text body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ') : '';
  const words = bodyText.trim().split(/\s+/).filter(Boolean).length;

  // Title & Meta Desc
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  // Schema presence
  const hasSchema = html.includes('application/ld+json');

  // Extract all internal links <a href="...">
  const hrefMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)];
  const outbound = new Set();

  hrefMatches.forEach(m => {
    let href = m[1];
    if (href.startsWith('/') && !href.startsWith('//')) {
      // Internal link
      // normalize
      const cleanHref = href.split('#')[0].split('?')[0];
      outbound.add(cleanHref);

      if (!linkMap.has(cleanHref)) {
        linkMap.set(cleanHref, new Set());
      }
      linkMap.get(cleanHref).add(route);
    }
  });

  outboundMap.set(route, outbound);

  pages.push({
    file: relPath,
    route,
    words,
    title,
    desc,
    hasSchema
  });
});

console.log(`Analyzed ${pages.length} pages.`);

// Save inventory raw JSON for compilation
fs.writeFileSync('scratch/inventory_raw.json', JSON.stringify({ pages, linkMap: Array.from(linkMap.entries()).map(([k, v]) => [k, Array.from(v)]), outboundMap: Array.from(outboundMap.entries()).map(([k, v]) => [k, Array.from(v)]) }, null, 2));
