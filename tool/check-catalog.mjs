import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('catalog.json', root), 'utf8'));
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

console.log(`Verified ${ids.size} catalogue entries and recordings.`);
