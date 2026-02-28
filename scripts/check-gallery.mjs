import { readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const target = path.join(distDir, 'archive', 'markdown-guide', 'index.html');

const getGalleryBlock = (html) => {
  const match = html.match(
    /<ul[^>]*\bclass="[^"]*\bgallery\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/i
  );
  return match ? match[1] : '';
};

const checks = [
  {
    id: 'gallery.list',
    test: (html) => /<ul[^>]*\bclass="[^"]*\bgallery\b/.test(html)
  },
  {
    id: 'gallery.item',
    test: (html) => /<li[\s>]/i.test(getGalleryBlock(html))
  },
  {
    id: 'gallery.figure',
    test: (html) => /<figure[\s>]/i.test(getGalleryBlock(html))
  },
  {
    id: 'gallery.media',
    test: (html) => /<(img|picture)\b/i.test(getGalleryBlock(html))
  }
];

try {
  const html = await readFile(target, 'utf8');
  const failed = checks.filter((item) => !item.test(html));

  if (failed.length > 0) {
    console.error('Gallery check failed:');
    for (const item of failed) {
      console.error(`- missing ${item.id}`);
    }
    process.exit(1);
  }

  console.log('Gallery check passed.');
} catch (err) {
  console.error('Gallery check failed: unable to read build output.');
  console.error(`Expected file: ${target}`);
  console.error('Run `npm run build` first.');
  process.exit(1);
}
