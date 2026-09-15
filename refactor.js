const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.astro')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const astroFiles = getAllFiles(pagesDir);

astroFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const titleMatch = content.match(/title=["'](.*?)["']/s);
  const descriptionMatch = content.match(/description=["'](.*?)["']/s);
  const metaTagsMatch = content.match(/<MetaTags[^>]*\/>/s);
  
  if (titleMatch && descriptionMatch && metaTagsMatch) {
    const title = titleMatch[1];
    const description = descriptionMatch[1];
    
    // Remove MetaTags import
    content = content.replace(/import MetaTags from '..\/components\/MetaTags.astro';\n/g, '');
    
    // Remove MetaTags component usage
    content = content.replace(metaTagsMatch[0], '');
    
    // Update BaseLayout to include props
    content = content.replace(/<BaseLayout>/, `<BaseLayout title="${title}" description="${description}"${file.endsWith('404.astro') ? ' robots="noindex"' : ''}>`);
    
    fs.writeFileSync(file, content);
    console.log(`Refactored ${file}`);
  }
});
