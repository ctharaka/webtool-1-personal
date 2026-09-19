/**
 * Helper to ensure all internal links use the canonical trailing-slash format.
 */
export function url(path: string): string {
  if (!path) return '/';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('#') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:')
  ) {
    return path;
  }

  const [base, query] = path.split('?');
  const [cleanPath, hash] = base.split('#');

  // Ignore static assets/files with extensions like .xml, .png, .jpg, .svg, .js, .css
  if (/\.[a-zA-Z0-9]+$/.test(cleanPath)) {
    return path;
  }

  let formatted = cleanPath;
  if (!formatted.endsWith('/')) {
    formatted += '/';
  }

  if (query) formatted += `?${query}`;
  if (hash) formatted += `#${hash}`;

  return formatted;
}
