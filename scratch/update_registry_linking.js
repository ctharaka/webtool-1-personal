import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/lib/tools/registry.ts', 'utf8');

// Add nextSteps and relatedGuides to interface
content = content.replace(
  `  relatedSlugs: string[];\n  seoTitle: string;`,
  `  relatedSlugs: string[];\n  nextSteps?: string[];\n  relatedGuides?: string[];\n  seoTitle: string;`
);

fs.writeFileSync('src/lib/tools/registry.ts', content, 'utf8');
console.log('Registry interface updated.');
