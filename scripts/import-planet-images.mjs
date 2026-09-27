// Copy only the authored, public photographs. Never import reference images or GLBs.
// Usage: node scripts/import-planet-images.mjs /path/to/my-little-orbit/web
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Pass the original website web/ directory.');
const root = fileURLToPath(new URL('../', import.meta.url));
const images = {
  'yesterday-today': ['cover.webp', 'detail-record.webp', 'detail-feather.webp', 'side.webp', 'back.webp'],
  crossover: ['cover.webp', 'detail-disc.webp', 'detail-proof.webp', 'side.webp', 'back.webp'],
  poem: ['cover.webp', 'detail-inkstone.webp', 'detail-flute.webp', 'side.webp', 'back.webp'],
  'rain-finale': ['cover.webp', 'detail-light.webp', 'detail-veil.webp', 'side.webp', 'back.webp'],
  jielan: ['cover.webp', 'detail-leaves.webp', 'detail-linen.webp', 'side.webp', 'back.webp']
};
const manifest = { source: 'My Little Orbit — original artwork photographs', sourceSite: 'https://jialepang392-web.github.io/my-little-orbit/', importedAt: '2026-09-27', artworks: {} };
for (const [world, names] of Object.entries(images)) {
  const build = JSON.parse(await readFile(resolve(source, 'assets', world, 'build.json'), 'utf8'));
  if (build.status !== 'passed' || !build.exported) throw new Error(`Unverified export: ${world}`);
  const files = {};
  for (const name of names) {
    const original = resolve(source, 'assets', world, name);
    const bytes = await readFile(original);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (build.artifacts[name]?.sha256 !== hash) throw new Error(`Photograph differs from its export: ${world}/${name}`);
    const target = resolve(root, 'src/assets/planets', world, name);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(original, target);
    files[name] = { sha256: hash, bytes: bytes.length };
  }
  manifest.artworks[world] = { sceneVersion: build.sceneVersion, files };
}
await mkdir(resolve(root, 'docs'), { recursive: true });
await writeFile(resolve(root, 'docs/planet-photographs.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${Object.values(images).flat().length} verified photographs.`);
