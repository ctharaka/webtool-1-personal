import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scratch/inventory_raw.json', 'utf8'));
const { pages, linkMap: rawLinkMap, outboundMap: rawOutboundMap } = raw;

const linkMap = new Map(rawLinkMap.map(([k, v]) => [k, new Set(v)]));
const outboundMap = new Map(rawOutboundMap.map(([k, v]) => [k, new Set(v)]));

// Check duplicate titles & descriptions
const titleCounts = new Map();
const descCounts = new Map();

pages.forEach(p => {
  if (p.title) titleCounts.set(p.title, (titleCounts.get(p.title) || 0) + 1);
  if (p.desc) descCounts.set(p.desc, (descCounts.get(p.desc) || 0) + 1);
});

const duplicateTitles = Array.from(titleCounts.entries()).filter(([k, v]) => v > 1);
const duplicateDescs = Array.from(descCounts.entries()).filter(([k, v]) => v > 1);

let md = `# Site Inventory & SEO Audit

Total Indexable Pages Analyzed: ${pages.length}

## Summary Metrics
- **Duplicate Titles**: ${duplicateTitles.length}
- **Duplicate Descriptions**: ${duplicateDescs.length}

## Pages Overview

| Route | Word Count | Inbound Links | Outbound Links | Schema | Title |
| --- | --- | --- | --- | --- | --- |
`;

pages.forEach(p => {
  // calculate inbound links matching both /route and /route/
  const key1 = p.route;
  const key2 = p.route === '/' ? '/' : p.route + '/';
  const inSet1 = linkMap.get(key1) || new Set();
  const inSet2 = linkMap.get(key2) || new Set();
  const inboundCount = new Set([...inSet1, ...inSet2]).size;

  const outboundCount = (outboundMap.get(p.route) || new Set()).size;

  const isOrphan = inboundCount === 0 && p.route !== '/';
  const orphanTag = isOrphan ? ' ⚠️ ORPHAN' : '';

  md += `| \`${p.route}\`${orphanTag} | ${p.words} | ${inboundCount} | ${outboundCount} | ${p.hasSchema ? '✅' : '❌'} | ${p.title} |\n`;
});

if (duplicateTitles.length > 0) {
  md += `\n## Duplicate Titles\n`;
  duplicateTitles.forEach(([t, count]) => {
    md += `- "${t}" (${count} pages)\n`;
  });
}

if (duplicateDescs.length > 0) {
  md += `\n## Duplicate Meta Descriptions\n`;
  duplicateDescs.forEach(([d, count]) => {
    md += `- "${d}" (${count} pages)\n`;
  });
}

fs.writeFileSync('INVENTORY.md', md);
console.log('INVENTORY.md generated successfully!');
