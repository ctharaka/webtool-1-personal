import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = getAllFiles(path.resolve('src'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace href="/path" with href="/path/"
  content = content.replace(/href=["'](\/[^"']*)["']/g, (m, href) => {
    if (
      href === '/' ||
      href.startsWith('/#') ||
      href.startsWith('//') ||
      /\.[a-zA-Z0-9]+$/.test(href.split('?')[0].split('#')[0])
    ) {
      return m;
    }
    const [base, extra] = href.split(/([?#].*)/);
    if (!base.endsWith('/')) {
      return `href="${base}/${extra || ''}"`;
    }
    return m;
  });

  // Replace canonicalURL="https://freefiletool.app/path"
  content = content.replace(/(canonicalURL=["']https:\/\/freefiletool\.app\/[^"']*)(["'])/g, (m, p1, p2) => {
    const clean = p1.split('?')[0].split('#')[0];
    if (clean !== 'https://freefiletool.app/' && !clean.endsWith('/') && !/\.[a-zA-Z0-9]+$/.test(clean)) {
      return `${p1}/${p2}`;
    }
    return m;
  });

  // Replace route: '/path' in registry.ts
  content = content.replace(/route:\s*['"](\/[^'"]*)['"]/g, (m, r) => {
    if (r !== '/' && !r.endsWith('/') && !/\.[a-zA-Z0-9]+$/.test(r)) {
      return `route: '${r}/'`;
    }
    return m;
  });

  // Normalize Brand Name FreeFileTools -> FreeFileTool
  content = content.replace(/FreeFileTools/g, 'FreeFileTool');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Updated ${count} files with trailing slashes & brand normalization.`);
