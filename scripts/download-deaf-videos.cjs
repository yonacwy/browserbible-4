#!/usr/bin/env node
/**
 * Download deaf bible videos from Deaf Bible Society API
 *
 * Usage:
 *   node scripts/download-deaf-videos.cjs                    # Download ALL translations (default)
 *   node scripts/download-deaf-videos.cjs list               # List available translations
 *   node scripts/download-deaf-videos.cjs <translation_id>   # Download a specific translation
 *
 * Examples:
 *   node scripts/download-deaf-videos.cjs                    # Downloads all translations
 *   node scripts/download-deaf-videos.cjs list               # Shows list of translations
 *   node scripts/download-deaf-videos.cjs aslv               # Download American Sign Language Version
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.deafbiblesociety.com';

const arg = process.argv[2];

/**
 * Fetch a URL and return the response body
 */
function fetch(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : require('http');
    protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        // Handle relative redirects
        if (redirectUrl.startsWith('/')) {
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        return fetch(redirectUrl).then(resolve).catch(reject);
      }
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
 * Download a file to disk
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : require('http');

    const request = protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
        }
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const totalSize = parseInt(res.headers['content-length'], 10);
      let downloaded = 0;

      res.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize) {
          const pct = Math.round((downloaded / totalSize) * 100);
          process.stdout.write(`\r  Downloading: ${pct}%`);
        }
      });

      res.pipe(file);

      file.on('finish', () => {
        file.close();
        process.stdout.write('\r');
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => {setTimeout(resolve, ms)});
}

/**
 * Sanitize filename
 */
function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

/**
 * Book name to 3-letter code mapping
 */
const BOOK_CODES = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
  'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
  'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
  'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
  'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
  'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
  '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
};

/**
 * Get all countries
 */
async function getCountries() {
  const data = await fetch(`${API_BASE}/v2/deafbible/countries`);
  return JSON.parse(data);
}

/**
 * Get translations for a country
 */
async function getTranslationsForCountry(countryId) {
  try {
    const data = await fetch(`${API_BASE}/v2/deafbible/countries/${countryId}`);
    const translations = JSON.parse(data);
    return Array.isArray(translations) ? translations : [];
  } catch (err) {
    return [];
  }
}

/**
 * Get all translations across all countries
 */
async function getAllTranslations() {
  console.log('Fetching countries...');
  const countries = await getCountries();
  console.log(`Found ${countries.length} countries\n`);

  const allTranslations = [];

  for (const country of countries) {
    const countryId = country.id;
    const countryName = country.name;

    try {
      const translations = await getTranslationsForCountry(countryId);

      for (const t of translations) {
        if (t.translation_shortcode) {
          allTranslations.push({
            id: t.translation_shortcode.toLowerCase(),
            shortcode: t.translation_shortcode,
            title: t.title || countryName,
            subtitle: t.subtitle || '',
            country: countryName,
            countryId: countryId,
            type: t.translation_type || ''
          });
        }
      }
    } catch (err) {
      // Skip countries that fail
    }

    await sleep(50); // Be polite
  }

  return allTranslations;
}

/**
 * List available translations
 */
async function listTranslations() {
  console.log('Fetching available deaf bible translations...\n');

  const translations = await getAllTranslations();

  console.log('Available Deaf Bible Translations:');
  console.log('==================================\n');

  translations.forEach(t => {
    console.log(`  ${t.id.padEnd(12)} - ${t.title} (${t.country})`);
  });

  console.log(`\nTotal: ${translations.length} translations`);
  console.log('\nUsage:');
  console.log('  node scripts/download-deaf-videos.cjs              # Download ALL');
  console.log('  node scripts/download-deaf-videos.cjs list         # List translations');
  console.log('  node scripts/download-deaf-videos.cjs <id>         # Download specific');
}

/**
 * Download timestamps for all books in a translation
 */
async function downloadTimestamps(translationId, books, outputDir) {
  const timestampsDir = path.join(outputDir, 'timestamps');
  if (!fs.existsSync(timestampsDir)) {
    fs.mkdirSync(timestampsDir, { recursive: true });
  }

  console.log(`Downloading timestamps for ${books.length} books...`);

  let downloaded = 0;
  let failed = 0;

  for (const book of books) {
    const bookCode = BOOK_CODES[book] || book.toUpperCase().slice(0, 3);
    const timestampFile = path.join(timestampsDir, `${bookCode}.json`);

    // Skip if already exists
    if (fs.existsSync(timestampFile)) {
      downloaded++;
      continue;
    }

    try {
      const url = `${API_BASE}/v2/deafbible/translations/${translationId}/${bookCode}/timestamp`;
      const data = await fetch(url);
      fs.writeFileSync(timestampFile, data);
      downloaded++;
      console.log(`  Downloaded timestamps: ${bookCode}`);
    } catch (err) {
      // Some books may not have timestamps
      failed++;
    }

    await sleep(100);
  }

  console.log(`Timestamps: ${downloaded} downloaded, ${failed} unavailable`);
}

/**
 * Download a translation
 */
async function downloadTranslation(id) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Fetching videos for translation: ${id}`);
  console.log('='.repeat(60));

  const outputDir = path.join(__dirname, '..', 'downloads', `deaf-videos-${id}`);

  // Fetch video list
  let videos;
  try {
    const data = await fetch(`${API_BASE}/v2/deafbible/translations/${id}`);
    const parsed = JSON.parse(data);

    // Handle different response formats
    if (Array.isArray(parsed)) {
      videos = parsed;
    } else if (parsed.videos) {
      videos = parsed.videos;
    } else if (parsed.books && Array.isArray(parsed.books)) {
      // Flatten books into videos array
      videos = [];
      for (const book of parsed.books) {
        if (book.videos && Array.isArray(book.videos)) {
          videos.push(...book.videos);
        }
      }
    } else {
      console.error('Unexpected API response format or no videos available');
      return { downloaded: 0, skipped: 0, failed: 0 };
    }
  } catch (err) {
    console.error(`Failed to fetch translation ${id}: ${err.message}`);
    return { downloaded: 0, skipped: 0, failed: 0 };
  }

  if (!videos || videos.length === 0) {
    console.log('No videos found for this translation.');
    return { downloaded: 0, skipped: 0, failed: 0 };
  }

  console.log(`Found ${videos.length} videos to download`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save metadata
  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(videos, null, 2)
  );
  console.log('Saved metadata.json');

  // Get unique books for timestamps
  const books = [...new Set(videos.map(v => v.book).filter(Boolean))];

  // Download timestamps
  if (books.length > 0) {
    await downloadTimestamps(id, books, outputDir);
  }

  // Download each video
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const downloadUrl = video.download || video.download_urls || video.download_url;

    if (!downloadUrl) {
      skipped++;
      continue;
    }

    // Create filename from book/chapter/title
    const book = sanitize(video.book || 'Unknown');
    const chapter = String(video.chapter || i + 1).padStart(3, '0');
    const title = sanitize(video.title || video.bbb_id || `video_${i}`);
    const filename = `${book}_${chapter}_${title}.mp4`;
    const destPath = path.join(outputDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      skipped++;
      downloaded++;
      continue;
    }

    console.log(`[${i + 1}/${videos.length}] Downloading ${filename}`);

    try {
      await downloadFile(downloadUrl, destPath);
      downloaded++;
      console.log(`  Done: ${filename}`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      failed++;
    }

    // Be polite - small delay between requests
    await sleep(200);
  }

  console.log(`\nTranslation ${id} complete!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Output: ${outputDir}`);

  return { downloaded, skipped, failed };
}

/**
 * Download all translations
 */
async function downloadAll() {
  const translations = await getAllTranslations();

  console.log(`\nFound ${translations.length} translations to download\n`);

  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (let i = 0; i < translations.length; i++) {
    const t = translations[i];

    console.log(`\n[${i + 1}/${translations.length}] Processing: ${t.title} (${t.id})`);

    const result = await downloadTranslation(t.id);
    totalDownloaded += result.downloaded;
    totalSkipped += result.skipped;
    totalFailed += result.failed;
  }

  console.log('\n' + '='.repeat(60));
  console.log('ALL TRANSLATIONS COMPLETE!');
  console.log('='.repeat(60));
  console.log(`  Total Downloaded: ${totalDownloaded}`);
  console.log(`  Total Skipped: ${totalSkipped}`);
  console.log(`  Total Failed: ${totalFailed}`);
}

async function main() {
  if (arg === 'list') {
    await listTranslations();
  } else if (arg) {
    await downloadTranslation(arg);
  } else {
    // Default: download all
    await downloadAll();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
