#!/usr/bin/env node
/**
 * Download a deaf bible from biblewebapp.com
 *
 * Usage: node scripts/download-deaf-bible.js <text_id>
 * Example: node scripts/download-deaf-bible.js deaf_CSNSLV
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://biblewebapp.com/study/content/texts';

const textId = process.argv[2];

if (!textId) {
  console.log('Usage: node scripts/download-deaf-bible.js <text_id>');
  console.log('Example: node scripts/download-deaf-bible.js deaf_CSNSLV');
  process.exit(1);
}

const outputDir = path.join(__dirname, '..', 'downloads', textId);

/**
 * Fetch a URL and return the response body
 */
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => {setTimeout(resolve, ms)});
}

async function main() {
  console.log(`Downloading deaf bible: ${textId}`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Fetch info.json
  const infoUrl = `${BASE_URL}/${textId}/info.json`;
  console.log(`Fetching info: ${infoUrl}`);

  let info;
  try {
    const infoData = await fetch(infoUrl);
    info = JSON.parse(infoData);
  } catch (err) {
    console.error(`Failed to fetch info.json: ${err.message}`);
    process.exit(1);
  }

  // Save info.json
  fs.writeFileSync(path.join(outputDir, 'info.json'), JSON.stringify(info, null, 2));
  console.log(`Saved info.json (${info.langName} - ${info.abbr})`);

  const sections = info.sections || [];
  console.log(`Found ${sections.length} sections to download`);

  // Download each section
  let downloaded = 0;
  let failed = 0;

  for (const section of sections) {
    const chapterUrl = `${BASE_URL}/${textId}/${section}.html`;
    const outputFile = path.join(outputDir, `${section}.html`);

    // Skip if already downloaded
    if (fs.existsSync(outputFile)) {
      console.log(`Skipping ${section}.html (already exists)`);
      downloaded++;
      continue;
    }

    try {
      const html = await fetch(chapterUrl);
      fs.writeFileSync(outputFile, html);
      downloaded++;
      console.log(`Downloaded ${section}.html (${downloaded}/${sections.length})`);
    } catch (err) {
      console.error(`Failed to download ${section}.html: ${err.message}`);
      failed++;
    }

    // Be polite - small delay between requests
    await sleep(100);
  }

  console.log(`\nDone! Downloaded ${downloaded} files, ${failed} failed.`);
  console.log(`Output directory: ${outputDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
