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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove unverified WebAssembly claims where JS engine is used
  content = content.replace(/WebAssembly and JavaScript/g, 'JavaScript and HTML5 Canvas');
  content = content.replace(/WebAssembly engines/g, 'client-side JavaScript engines');
  content = content.replace(/WebAssembly and HTML5 Canvas/g, 'HTML5 Canvas and JavaScript');

  // 2. Fix AcroForm contradictory statements
  content = content.replace(/While form content and annotations are preserved,\s*active AcroForms may be flattened into static visual pages\./g, 'Active AcroForms and interactive form fields are flattened into static visual page content.');
  content = content.replace(/form fields \(AcroForms\) will be preserved in output pages but flattened into standard page content/g, 'interactive form fields (AcroForms) are flattened into standard static page content');

  // 3. Tested limits
  content = content.replace(/up to 100 MB or 200 pages process smoothly/g, 'tested with files up to 50 MB and 50 pages');
  content = content.replace(/up to 100 MB/g, 'up to 50 MB');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Phase 0 copy fixes applied.');
