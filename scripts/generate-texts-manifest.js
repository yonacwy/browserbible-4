#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const textsDir = path.resolve(process.cwd(), 'app/content/texts');
const outFile = path.resolve(textsDir, 'texts.json');

async function readInfo(folder) {
  const candidates = [
    path.join(textsDir, folder, 'info.json'),
    path.join(textsDir, folder, 'html_chapterized', 'info.json')
  ];
  for (const p of candidates) {
    try {
      const txt = await fs.readFile(p, 'utf8');
      return JSON.parse(txt);
    } catch (e) {
      // continue
    }
  }
  return null;
}

async function main() {
  const entries = await fs.readdir(textsDir, { withFileTypes: true });
  const textInfoData = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const name = ent.name;
    if (name === 'commentaries') continue;
    if (name.startsWith('.')) continue;
    const info = await readInfo(name);
    if (info && info.id) {
      textInfoData.push({ id: info.id, name: info.name || name, providerName: 'local' });
    } else {
      // fallback: add simple entry using folder name
      textInfoData.push({ id: name, name, providerName: 'local' });
    }
  }

  const out = { textInfoData };
  await fs.writeFile(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('Wrote', outFile, 'with', textInfoData.length, 'entries');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
