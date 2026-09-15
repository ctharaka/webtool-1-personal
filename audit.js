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
const report = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  const titleMatches = content.match(/<title>(.*?)<\/title>/gi);
  const metaDescMatches = content.match(/<meta name="description" content="(.*?)"/gi);
  const canonicalMatches = content.match(/<link rel="canonical" href="(.*?)"/gi);
  const robotsMatches = content.match(/<meta name="robots" content="(.*?)"/gi);

  report.push({
    file: path.relative(distDir, file),
    titleCount: titleMatches ? titleMatches.length : 0,
    metaDescCount: metaDescMatches ? metaDescMatches.length : 0,
    canonicalCount: canonicalMatches ? canonicalMatches.length : 0,
    robots: robotsMatches ? robotsMatches[0] : 'missing',
    titles: titleMatches,
  });
});

console.log(JSON.stringify(report, null, 2));
