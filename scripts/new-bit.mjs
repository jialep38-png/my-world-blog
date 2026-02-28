import fs from 'node:fs';
import path from 'node:path';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatOffset(date) {
  const off = -date.getTimezoneOffset(); // minutes east of UTC
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  const hh = pad2(Math.floor(abs / 60));
  const mm = pad2(abs % 60);
  return `${sign}${hh}:${mm}`;
}

function formatLocalISO(date) {
  const yyyy = date.getFullYear();
  const MM = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${formatOffset(date)}`;
}

const now = new Date();
const yyyy = now.getFullYear();
const MM = pad2(now.getMonth() + 1);
const dd = pad2(now.getDate());
const hh = pad2(now.getHours());
const mm = pad2(now.getMinutes());

const filename = `${yyyy}-${MM}-${dd}-${hh}${mm}.md`;
const dir = path.join(process.cwd(), 'src', 'content', 'bits');
const filepath = path.join(dir, filename);

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(filepath)) {
  console.error(`File already exists: ${filepath}`);
  process.exit(1);
}

const date = formatLocalISO(now);

const template = `---\ndraft: true\ndate: ${date}\ntags: []\nimages: []\n---\n\n`;
fs.writeFileSync(filepath, template, 'utf8');

console.log(`Created: ${filepath}`);
console.log('Next: edit the file and run `npm run dev`');
