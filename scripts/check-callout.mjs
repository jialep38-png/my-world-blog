import { readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const target = path.join(distDir, 'archive', 'markdown-guide', 'index.html');

const checks = [
  {
    id: 'callout.tip',
    pattern: /class="[^"]*\bcallout\b[^"]*\btip\b/
  },
  {
    id: 'callout-title',
    pattern: /class="[^"]*\bcallout-title\b/
  }
];

try {
  const html = await readFile(target, 'utf8');
  const failed = checks.filter((item) => !item.pattern.test(html));

  if (failed.length > 0) {
    console.error('Callout check failed:');
    for (const item of failed) {
      console.error(`- missing ${item.id}`);
    }
    process.exit(1);
  }

  console.log('Callout check passed.');
} catch (err) {
  console.error('Callout check failed: unable to read build output.');
  console.error(`Expected file: ${target}`);
  console.error('Run `npm run build` first.');
  process.exit(1);
}
