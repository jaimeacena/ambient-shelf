import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
const generatedFile = new URL('lib/ambient_shelf.dart', root);
const categories = new Set(['nature', 'music', 'noise']);
const ids = new Set();
const files = new Set();

const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const https = (value) => nonempty(value) && URL.canParse(value) && new URL(value).protocol === 'https:';
const positiveInt = (value) => Number.isSafeInteger(value) && value > 0;

if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.tracks) || !catalog.tracks.length) {
  throw new Error('Expected a nonempty version 1 catalogue.');
}

for (const { id, titles, category, file, bytes, sha256, durationMs, loudnessLufs, license, source } of catalog.tracks) {
  if (!nonempty(id) || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id) || ids.has(id) ||
      !nonempty(titles?.es) || !nonempty(titles?.en) || !categories.has(category) ||
      typeof file !== 'string' || !/^audio\/[a-z0-9-]+\.mp3$/.test(file) || files.has(file) ||
      !positiveInt(bytes) || !positiveInt(durationMs) || !Number.isFinite(loudnessLufs) ||
      loudnessLufs >= 0 || typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(sha256) ||
      !nonempty(license?.id) || !https(license?.url) || !nonempty(source?.author) ||
      !nonempty(source?.title) || !https(source?.url) || !nonempty(source?.changes)) {
    throw new Error(`Invalid catalogue entry: ${id}`);
  }
  ids.add(id);
  files.add(file);
  const audio = await readFile(new URL(file, root));
  if (audio.length !== bytes || createHash('sha256').update(audio).digest('hex') !== sha256) {
    throw new Error(`Size or SHA-256 mismatch: ${file}`);
  }
}

const audioFiles = await readdir(new URL('audio/', root));
if (audioFiles.length !== files.size || audioFiles.some((file) => !files.has(`audio/${file}`))) {
  throw new Error('The audio directory must match the catalogue.');
}

const dartString = (value) => JSON.stringify(value).replaceAll('$', '\\$');
const rows = catalog.tracks.map((track) => `  (
    id: ${dartString(track.id)},
    titleEs: ${dartString(track.titles.es)},
    titleEn: ${dartString(track.titles.en)},
    category: ${dartString(track.category)},
    file: ${dartString(track.file)},
    loudnessLufs: ${track.loudnessLufs},
  ),`).join('\n');
const generated = `// Generated from catalog.json by tool/check-catalog.mjs.

const tracks = <({
  String id,
  String titleEs,
  String titleEn,
  String category,
  String file,
  double loudnessLufs,
})>[
${rows}
];
`;

if (process.argv.includes('--write')) {
  await mkdir(new URL('lib/', root), { recursive: true });
  await writeFile(generatedFile, generated);
} else if ((await readFile(generatedFile, 'utf8')).replaceAll('\r\n', '\n') !== generated) {
  throw new Error('The Dart catalogue is outdated. Run node tool/check-catalog.mjs --write.');
}

console.log(`Verified ${ids.size} catalogue entries and recordings.`);
