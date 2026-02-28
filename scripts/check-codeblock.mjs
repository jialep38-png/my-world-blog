import { readFile } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const target = path.join(distDir, 'archive', 'markdown-guide', 'index.html');

const hasClass = (html, className) => {
  const pattern = new RegExp(`class="[^"]*\\b${className}\\b`, 'i');
  return pattern.test(html);
};

const getTagsByClass = (html, tag, className) => {
  const pattern = new RegExp(`<${tag}[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'gi');
  return Array.from(html.matchAll(pattern)).map((match) => match[0]);
};

const checks = [
  {
    id: 'code-block.wrapper',
    test: (html) => hasClass(html, 'code-block')
  },
  {
    id: 'code-block.toolbar',
    test: (html) => hasClass(html, 'code-toolbar')
  },
  {
    id: 'code-block.data-attrs',
    test: (html) => {
      const blocks = getTagsByClass(html, 'div', 'code-block');
      return blocks.some((tag) => /data-lines\s*=/.test(tag) && /data-lang\s*=/.test(tag));
    }
  },
  {
    id: 'code-copy.button',
    test: (html) => {
      const buttons = getTagsByClass(html, 'button', 'code-copy');
      return buttons.some((tag) => /aria-label\s*=/.test(tag) && /data-state\s*=/.test(tag));
    }
  },
  {
    id: 'code-lines.class',
    test: (html) => hasClass(html, 'line')
  }
];

try {
  const html = await readFile(target, 'utf8');
  const failed = checks.filter((item) => !item.test(html));

  if (failed.length > 0) {
    console.error('Code block check failed:');
    for (const item of failed) {
      console.error(`- missing ${item.id}`);
    }
    process.exit(1);
  }

  console.log('Code block check passed.');
} catch (err) {
  console.error('Code block check failed: unable to read build output.');
  console.error(`Expected file: ${target}`);
  console.error('Run `npm run build` first.');
  process.exit(1);
}
