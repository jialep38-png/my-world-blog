import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) {
  throw new Error('Usage: node scripts/import-orbit-assets.mjs /path/to/my-little-orbit/web');
}
const sourceRoot = path.resolve(process.argv[2]);
const orbitRoot = path.join(projectRoot, 'public/orbit');
const sourceOut = path.join(orbitRoot, 'source');
const vendorOut = path.join(orbitRoot, 'vendor/three/0.180.0');
const threeRoot = path.join(sourceRoot, 'vendor/three/0.180.0');

const entrypoints = [
  'src/yesterday-today/viewer.js',
  'src/crossover/viewer.js',
  'src/rain-finale/viewer.js',
  'src/jielan/viewer.js',
  'src/world.js',
];

const assets = [
  'assets/crossover/title-glyphs.json',
  'assets/rain-finale/title-glyphs.json',
  'assets/jielan/reference-material-atlas.png',
  'assets/jielan/reference-object-atlas.png',
  'assets/textures/collage-atlas.webp',
];

const editions = {
  'yesterday-today': '0.12.3',
  crossover: '0.12.3',
  poem: '0.22.0',
  'rain-finale': '0.12.3',
  jielan: '0.24.0',
};

const sourceModules = new Set();
const vendorModules = new Set();
const manifestFiles = [];
const importPattern = /(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function withoutQuery(specifier) {
  return specifier.split(/[?#]/, 1)[0];
}

function assertInside(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escaped its allowed root: ${candidate}`);
  }
}

async function collectModule(file, kind) {
  const root = kind === 'source' ? sourceRoot : threeRoot;
  const seen = kind === 'source' ? sourceModules : vendorModules;
  const absolute = path.resolve(file);
  assertInside(root, absolute, kind);
  const relative = path.relative(root, absolute).split(path.sep).join('/');
  if (seen.has(relative)) return;
  seen.add(relative);

  const code = await readFile(absolute, 'utf8');
  for (const match of code.matchAll(importPattern)) {
    const specifier = withoutQuery(match[1] ?? match[2]);
    if (specifier === 'three') {
      await collectModule(path.join(threeRoot, 'build/three.module.js'), 'vendor');
    } else if (specifier.startsWith('three/addons/')) {
      await collectModule(path.join(threeRoot, 'examples/jsm', specifier.slice('three/addons/'.length)), 'vendor');
    } else if (specifier.startsWith('.')) {
      await collectModule(path.resolve(path.dirname(absolute), specifier), kind);
    }
  }
}

function patchSource(relative, contents) {
  if (relative !== 'src/world.js') return contents;
  const changes = [
    [
      'onNavigation=()=>{},reducedMotion=false}) {',
      'onNavigation=()=>{},reducedMotion=false,orbitOnly=false}) {',
    ],
    [
      "if(paused||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest('input,textarea,select,[contenteditable=\"true\"]'))return;",
      "if(orbitOnly||paused||event.altKey||event.ctrlKey||event.metaKey||event.target?.closest('input,textarea,select,[contenteditable=\"true\"]'))return;",
    ],
    [
      'const wasPinching=Boolean(pinch),clicked=allowClick&&!wasPinching',
      'const wasPinching=Boolean(pinch),clicked=!orbitOnly&&allowClick&&!wasPinching',
    ],
  ];
  let patched = contents;
  for (const [before, after] of changes) {
    if (!patched.includes(before)) throw new Error(`Poem orbit-only patch no longer matches ${relative}`);
    patched = patched.replace(before, after);
  }
  return patched;
}

async function copyTracked(from, to, metadata) {
  const contents = await readFile(from);
  const output = metadata.transform ? Buffer.from(metadata.transform(contents.toString('utf8'))) : contents;
  await mkdir(path.dirname(to), { recursive: true });
  await writeFile(to, output);
  manifestFiles.push({
    path: path.relative(orbitRoot, to).split(path.sep).join('/'),
    source: path.relative(sourceRoot, from).split(path.sep).join('/'),
    kind: metadata.kind,
    bytes: output.byteLength,
    sha256: createHash('sha256').update(output).digest('hex'),
    ...(metadata.note ? { note: metadata.note } : {}),
  });
}

for (const entry of entrypoints) await collectModule(path.join(sourceRoot, entry), 'source');

await rm(sourceOut, { recursive: true, force: true });
await rm(path.join(orbitRoot, 'vendor'), { recursive: true, force: true });

for (const relative of [...sourceModules].sort()) {
  await copyTracked(path.join(sourceRoot, relative), path.join(sourceOut, relative), {
    kind: 'artwork-module',
    transform: (contents) => patchSource(relative, contents),
    note: relative === 'src/world.js' ? 'Local orbit-only option disables walking and surface-click navigation in the embedded poem viewer.' : undefined,
  });
}

for (const relative of [...vendorModules].sort()) {
  await copyTracked(path.join(threeRoot, relative), path.join(vendorOut, relative), { kind: 'three-module' });
}

await copyTracked(path.join(threeRoot, 'LICENSE'), path.join(vendorOut, 'LICENSE'), { kind: 'license' });
await copyTracked(path.join(sourceRoot, 'licenses/tiny-planets-MIT.txt'), path.join(sourceOut, 'licenses/tiny-planets-MIT.txt'), { kind: 'license' });
for (const relative of assets) {
  await copyTracked(path.join(sourceRoot, relative), path.join(sourceOut, relative), { kind: 'runtime-asset' });
}

manifestFiles.sort((a, b) => a.path.localeCompare(b.path));
const totalBytes = manifestFiles.reduce((sum, file) => sum + file.bytes, 0);
const manifest = {
  version: 1,
  sourceWorkspace: 'My Little Orbit web/ workspace; imported with user authorization.',
  three: {
    version: '0.180.0',
    upstream: 'https://github.com/mrdoob/three.js/tree/r180',
    license: 'MIT',
    licenseFile: 'vendor/three/0.180.0/LICENSE',
  },
  editions,
  exclusions: ['legacy page HTML', 'concept/reference originals except the two textures required by the live jielan model', 'GLB exports', 'posters and downloads', 'private files'],
  totalBytes,
  files: manifestFiles,
};
await writeFile(path.join(orbitRoot, 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const sources = `# Orbit runtime sources\n\n` +
  `Generated by \`node scripts/import-orbit-assets.mjs /path/to/my-little-orbit/web\`. Do not hand-edit files under \`source/\` or \`vendor/\`.\n\n` +
  `- Artwork runtime source: local My Little Orbit \`web/\` workspace.\n` +
  `- Imported editions: ${Object.entries(editions).map(([id, version]) => `\`${id}\` ${version}`).join(', ')}\n` +
  `- Three.js: 0.180.0, MIT; license at \`vendor/three/0.180.0/LICENSE\`.\n` +
  `- Tiny-planets attribution retained at \`source/licenses/tiny-planets-MIT.txt\`.\n` +
  `- Full byte sizes, hashes, source-relative paths, and exclusions are recorded in \`asset-manifest.json\`.\n`;
await writeFile(path.join(orbitRoot, 'SOURCES.md'), sources);

const diskBytes = (await Promise.all(manifestFiles.map(async (file) => (await stat(path.join(orbitRoot, file.path))).size))).reduce((sum, size) => sum + size, 0);
if (diskBytes !== totalBytes) throw new Error(`Manifest byte count mismatch: ${totalBytes} != ${diskBytes}`);
console.log(`Imported ${manifestFiles.length} files (${totalBytes} bytes) for ${Object.keys(editions).length} worlds.`);
