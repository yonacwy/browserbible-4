#!/usr/bin/env node
/**
 * Generate HTML files from deaf bible video manifests
 *
 * This script reads the deaf-videos-* directories and generates
 * browserbible-compatible HTML chapter files with video elements.
 *
 * Usage:
 *   node scripts/generate-deaf-html.cjs                    # Generate ALL deaf bibles
 *   node scripts/generate-deaf-html.cjs list               # List available translations
 *   node scripts/generate-deaf-html.cjs <translation_id>   # Generate a specific translation
 *
 * Examples:
 *   node scripts/generate-deaf-html.cjs                    # Generates all translations
 *   node scripts/generate-deaf-html.cjs list               # Shows list of translations
 *   node scripts/generate-deaf-html.cjs aslv               # Generate American Sign Language Version
 */

const fs = require('fs');
const path = require('path');

const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');
const VIDEO_BASE_URL = 'https://video.dbs.org/deaf';

const arg = process.argv[2];

/**
 * Book name to 2-letter code mapping (used in HTML files)
 * These match the codes used in the existing deaf_CSNSLV files
 */
const BOOK_CODES_2LETTER = {
  'Genesis': 'GN', 'Exodus': 'EX', 'Leviticus': 'LV', 'Numbers': 'NM', 'Deuteronomy': 'DT',
  'Joshua': 'JS', 'Judges': 'JG', 'Ruth': 'RT', '1 Samuel': 'S1', '2 Samuel': 'S2',
  '1 Kings': 'K1', '2 Kings': 'K2', '1 Chronicles': 'C1', '2 Chronicles': 'C2',
  'Ezra': 'ER', 'Nehemiah': 'NH', 'Esther': 'ES', 'Job': 'JB', 'Psalms': 'PS',
  'Proverbs': 'PR', 'Ecclesiastes': 'EC', 'Song of Solomon': 'SS', 'Isaiah': 'IS',
  'Jeremiah': 'JR', 'Lamentations': 'LM', 'Ezekiel': 'EZ', 'Daniel': 'DN',
  'Hosea': 'HS', 'Joel': 'JL', 'Amos': 'AM', 'Obadiah': 'OB', 'Jonah': 'JO',
  'Micah': 'MC', 'Nahum': 'NM', 'Habakkuk': 'HK', 'Zephaniah': 'ZP', 'Haggai': 'HG',
  'Zechariah': 'ZC', 'Malachi': 'ML',
  'Matthew': 'MT', 'Mark': 'MK', 'Luke': 'LK', 'John': 'JN', 'Acts': 'AC',
  'Romans': 'RM', '1 Corinthians': 'O1', '2 Corinthians': 'O2', 'Galatians': 'GL',
  'Ephesians': 'EP', 'Philippians': 'PP', 'Colossians': 'CL', '1 Thessalonians': 'H1',
  '2 Thessalonians': 'H2', '1 Timothy': 'T1', '2 Timothy': 'T2', 'Titus': 'TT',
  'Philemon': 'PM', 'Hebrews': 'HB', 'James': 'JM', '1 Peter': 'P1', '2 Peter': 'P2',
  '1 John': 'J1', '2 John': 'J2', '3 John': 'J3', 'Jude': 'JD', 'Revelation': 'RV'
};

/**
 * International book name mappings to English
 * Maps book names from various languages to their English equivalents
 */
const BOOK_NAME_ALIASES = {
  // Spanish (including combining character variants)
  'Génesis': 'Genesis', 'Génesis': 'Genesis', 'Ge\u0301nesis': 'Genesis',
  'Exodo': 'Exodus', 'Éxodo': 'Exodus',
  'Levítico': 'Leviticus', 'Números': 'Numbers', 'Nu\u0301meros': 'Numbers', 'Deuteronomio': 'Deuteronomy',
  'Josué': 'Joshua', 'Jueces': 'Judges', 'Rut': 'Ruth',
  '1 de Samuel': '1 Samuel', '2 de Samuel': '2 Samuel',
  '1 Reyes': '1 Kings', '2 Reyes': '2 Kings',
  'Salmos': 'Psalms', 'Proverbios': 'Proverbs',
  'Isaías': 'Isaiah', 'Jeremías': 'Jeremiah',
  'Jonás': 'Jonah', 'Jonás': 'Jonah',
  'Mateo': 'Matthew', 'Marcos': 'Mark', 'Lucas': 'Luke', 'Juan': 'John',
  'Hechos': 'Acts', 'Romanos': 'Romans',
  '1 Corintios': '1 Corinthians', '2 Corintios': '2 Corinthians',
  'Gálatas': 'Galatians', 'Efesios': 'Ephesians', 'Filipenses': 'Philippians',
  'Colosenses': 'Colossians', '1 Tesalonicenses': '1 Thessalonians', '2 Tesalonicenses': '2 Thessalonians',
  '1 Timoteo': '1 Timothy', '2 Timoteo': '2 Timothy', 'Tito': 'Titus',
  'Filemón': 'Philemon', 'Filemón': 'Philemon',
  'Santiago': 'James', '1 Pedro': '1 Peter', '2 Pedro': '2 Peter',
  '1 Juan': '1 John', '2 Juan': '2 John', '3 Juan': '3 John',
  'Judas': 'Jude', 'Apocalipsis': 'Revelation',

  // German
  'Matthäus': 'Matthew', 'Markus': 'Mark', 'Lukas': 'Luke', 'Johannes': 'John',
  'Apostelgeschichte': 'Acts', 'Römerbriefe': 'Romans',
  '1 Korinther Briefe': '1 Corinthians', '2 Korinther': '2 Corinthians',
  'Galater': 'Galatians', 'Philipper': 'Philippians',
  '1 Thessalonicher': '1 Thessalonians', '2 Thessalonicher': '2 Thessalonians',
  '1 Könige': '1 Kings', '2 Könige': '2 Kings',
  'Richter': 'Judges', 'Hjob': 'Job', 'Psalmen': 'Psalms', 'Sprichwörter': 'Proverbs',
  'Jesaja': 'Isaiah', 'Jeremia': 'Jeremiah', 'Hesekiel': 'Ezekiel', 'Ezechiel': 'Ezekiel',
  'Jona': 'Jonah', 'Micha': 'Micah', 'Zefanja': 'Zephaniah', 'Sacharja': 'Zechariah',
  'Maleachi': 'Malachi', '2 Petrus': '2 Peter', 'Offenbarung': 'Revelation',
  'Numeri': 'Numbers', 'Deuteronomium': 'Deuteronomy',

  // French
  'Genèse': 'Genesis', 'Exode': 'Exodus', 'Marc': 'Mark', 'Luc': 'Luke',
  'Jean': 'John', 'Actes': 'Acts',

  // Portuguese/Romanian
  'Matei': 'Matthew', 'Marcu': 'Mark', 'Luca': 'Luke', 'Ioan': 'John',
  'Faptele': 'Acts', 'Romani': 'Romans',

  // Danish/Swedish/Norwegian
  'Johannes Evangeliet': 'John', 'Apostlenes Gerninger': 'Acts',
  '1 Johannesbrev': '1 John', '2 Johannesbrev': '2 John', '3 Johannesbrev': '3 John',
  '1 Thessaloniker Brevet': '1 Thessalonians', '2 Thessaloniker Brevet': '2 Thessalonians',
  'Jonas': 'Jonah', 'Rutt': 'Ruth',

  // Estonian
  '1. Moosese raamat': 'Genesis', '2. Moosese raamat': 'Exodus',
  'Markuse': 'Mark', 'Luuka': 'Luke', 'Apostlite teod': 'Acts',
  'Roomlastele': 'Romans', '1.Korintlastele': '1 Corinthians',
  'Koguja': 'Ecclesiastes', 'Joona': 'Jonah', 'Malaki': 'Malachi',

  // Russian/Ukrainian/Cyrillic
  'Буття': 'Genesis', 'Вихід': 'Exodus',
  'Матвія': 'Matthew', 'Матай': 'Matthew', 'Матеј': 'Matthew',
  'Марко': 'Mark', 'Марк': 'Mark', 'Марқа': 'Mark',
  'Лука': 'Luke', 'Eвангелие от Луки': 'Luke', 'Евангелие от Луки': 'Luke',
  'Євангеліє від Луки': 'Luke',
  'Євангеліє від Марка': 'Mark', 'Евангелие от Марка': 'Mark',
  'Іван': 'John', 'Івана': 'John', 'Јован': 'John',
  'Діяння': 'Acts', 'Дії': 'Acts',
  'Римлян': 'Romans',
  '1 Коринтян': '1 Corinthians', '2 Коринтян': '2 Corinthians',
  '1 е Івана': '1 John', '2 е Івана': '2 John', '3 е Івана': '3 John',
  '1 Тимофія': '1 Timothy', '2 Тимофія': '2 Timothy',
  'Титу': 'Titus', 'Якова': 'James', 'Юда': 'Jude',
  'Данііл': 'Daniel', 'Даніїл': 'Daniel',
  'Псалом': 'Psalms', 'Псалми': 'Psalms',
  '1 Царств': '1 Samuel', '2 Царств': '2 Samuel',
  '1 Подшоҳон': '1 Kings', '2 Подшоҳон': '2 Kings',
  'Масалҳо': 'Proverbs', 'Юнус': 'Jonah',

  // Georgian
  'მათე': 'Matthew', 'მათ': 'Matthew',
  'მარკოზი': 'Mark', 'მარ': 'Mark',
  'ლუკა': 'Luke',
  'იოანე': 'John',
  'საქმეები': 'Acts',
  'რომაელთა': 'Romans',

  // Armenian
  ' DELAYS': 'Luke', 'Ղdelays': 'Luke', 'Ղdelays': 'Luke', 'Ղdelays': 'Luke',

  // Azerbaijani/Turkish
  'Yaradılış': 'Genesis', 'Gelip çykyş': 'Genesis',
  'Matta': 'Matthew', 'Marka': 'Mark', 'Luka': 'Luke',
  'Həvarilərin işləri': 'Acts',
  'Filipililərə': 'Philippians',
  'Titə': 'Titus',
  '1 Yəhya': '1 John', '2 Yəhya': '2 John', '3 Yəhya': '3 John',
  'Yəhya': 'John', 'Yəhuda': 'Jude',

  // Japanese
  '創世記': 'Genesis', '出エジプト記': 'Exodus', 'レビ記': 'Leviticus',
  'ルツ記': 'Ruth', 'エステル 記': 'Esther', 'ヨナ書': 'Jonah',
  'マタイによる福音書': 'Matthew', 'マルコによる福音書': 'Mark',
  'ルカによる福音書': 'Luke', 'ヨハネによる福音書': 'John',
  '使徒言行録': 'Acts',
  'ガラテヤの信徒への手紙': 'Galatians',
  'フィリピの信徒への手紙': 'Philippians',
  'コロサイの信徒への手紙': 'Colossians',
  'テサロニケの信徒への手紙一': '1 Thessalonians',
  'テサロニケの信徒への手紙二': '2 Thessalonians',
  'テトスへの手紙': 'Titus',
  'フィレモンへの手紙': 'Philemon',
  'ヤコブの手紙': 'James',

  // Korean
  '창세기': 'Genesis', '룻기': 'Ruth',
  '마가복음': 'Mark', '사사기': 'Judges', '욥기': 'Job',
  '다니엘': 'Daniel', '요나': 'Jonah', '요한복음': 'John',

  // Latin/Dutch
  'Marcus': 'Mark', 'Mates': 'Matthew',

  // Generic variations
  'Ester': 'Esther', 'Filimon': 'Philemon', 'Filemon': 'Philemon',
  'Marko': 'Mark',
  'Ղdelays': 'Acts', 'Ղdelays': 'Acts'
};

/**
 * Normalize book name - try to find English equivalent
 */
function normalizeBookName(bookName) {
  if (!bookName) return null;

  // Normalize Unicode (NFC form) to handle combining characters
  const normalized = bookName.normalize('NFC');

  // Remove Unicode replacement characters (U+FFFD) for partial matching
  const withoutReplacements = normalized.replace(/\uFFFD+/g, '');

  // Check if already English
  if (BOOK_CODES_2LETTER[normalized]) {
    return normalized;
  }

  // Check aliases
  if (BOOK_NAME_ALIASES[normalized]) {
    return BOOK_NAME_ALIASES[normalized];
  }

  // Also try the original form
  if (BOOK_CODES_2LETTER[bookName]) {
    return bookName;
  }
  if (BOOK_NAME_ALIASES[bookName]) {
    return BOOK_NAME_ALIASES[bookName];
  }

  // Try case-insensitive match on aliases
  const lowerName = bookName.toLowerCase();
  for (const [alias, english] of Object.entries(BOOK_NAME_ALIASES)) {
    if (alias.toLowerCase() === lowerName) {
      return english;
    }
  }

  // Try partial matching for common patterns (use version without replacement chars)
  const testString = withoutReplacements || normalized;
  const patterns = [
    { regex: /gene|genè|génesis|bereshit|创世/i, book: 'Genesis' },
    { regex: /exod|exode|éxodo|出埃及/i, book: 'Exodus' },
    { regex: /levit|levítico|利未/i, book: 'Leviticus' },
    { regex: /numb|númer|民数/i, book: 'Numbers' },
    { regex: /deut|deuteron|申命/i, book: 'Deuteronomy' },
    { regex: /josh|josué|约书亚/i, book: 'Joshua' },
    { regex: /judg|juec|juíz|士师/i, book: 'Judges' },
    { regex: /ruth|rut|rutt|路得/i, book: 'Ruth' },
    { regex: /1.*sam|撒母耳记上/i, book: '1 Samuel' },
    { regex: /2.*sam|撒母耳记下/i, book: '2 Samuel' },
    { regex: /1.*k[io]ng|1.*rey|列王纪上/i, book: '1 Kings' },
    { regex: /2.*k[io]ng|2.*rey|列王纪下/i, book: '2 Kings' },
    { regex: /1.*chron|历代志上/i, book: '1 Chronicles' },
    { regex: /2.*chron|历代志下/i, book: '2 Chronicles' },
    { regex: /esth|ester|以斯帖/i, book: 'Esther' },
    { regex: /^job$|hiob|hjob|约伯/i, book: 'Job' },
    { regex: /psalm|salmo|诗篇/i, book: 'Psalms' },
    { regex: /prover|箴言/i, book: 'Proverbs' },
    { regex: /eccles|传道/i, book: 'Ecclesiastes' },
    { regex: /isai|isaí|以赛亚/i, book: 'Isaiah' },
    { regex: /jerem|耶利米书/i, book: 'Jeremiah' },
    { regex: /lamen|哀歌/i, book: 'Lamentations' },
    { regex: /ezek|hesek|以西结/i, book: 'Ezekiel' },
    { regex: /dani|但以理|данi|даніл/i, book: 'Daniel' },
    { regex: /hose|何西阿/i, book: 'Hosea' },
    { regex: /joel|约珥/i, book: 'Joel' },
    { regex: /amos|阿摩司/i, book: 'Amos' },
    { regex: /obad|俄巴底亚/i, book: 'Obadiah' },
    { regex: /jona|יונה|约拿/i, book: 'Jonah' },
    { regex: /mica|弥迦/i, book: 'Micah' },
    { regex: /nahu|那鸿/i, book: 'Nahum' },
    { regex: /habak|哈巴谷/i, book: 'Habakkuk' },
    { regex: /zeph|西番雅/i, book: 'Zephaniah' },
    { regex: /hagg|哈该/i, book: 'Haggai' },
    { regex: /zech|sachar|撒迦利亚/i, book: 'Zechariah' },
    { regex: /malac|malak|玛拉基/i, book: 'Malachi' },
    { regex: /matth|mateo|matte|мат|马太|მათ/i, book: 'Matthew' },
    { regex: /mark|marc|марк|马可|მარ.*ოზი|მარკოზ/i, book: 'Mark' },
    { regex: /luk|luc|luka|路加|ლუკა| DELAYS|Ղ/i, book: 'Luke' },
    { regex: /john|jean|juan|joan|јован|иоан|иван|约翰福音/i, book: 'John' },
    { regex: /acts|acte|hecho|hechos|fapte|使徒/i, book: 'Acts' },
    { regex: /roman|römer|罗马/i, book: 'Romans' },
    { regex: /1.*corint|哥林多前/i, book: '1 Corinthians' },
    { regex: /2.*corint|哥林多后/i, book: '2 Corinthians' },
    { regex: /galat|gálat|加拉太/i, book: 'Galatians' },
    { regex: /ephes|efes|以弗所/i, book: 'Ephesians' },
    { regex: /philip|filipe|腓立比/i, book: 'Philippians' },
    { regex: /coloss|colos|歌罗西/i, book: 'Colossians' },
    { regex: /1.*thess|帖撒罗尼迦前/i, book: '1 Thessalonians' },
    { regex: /2.*thess|帖撒罗尼迦后/i, book: '2 Thessalonians' },
    { regex: /1.*tim|提摩太前/i, book: '1 Timothy' },
    { regex: /2.*tim|提摩太后/i, book: '2 Timothy' },
    { regex: /titu|tito|titə|提多/i, book: 'Titus' },
    { regex: /philem|filem|腓利门/i, book: 'Philemon' },
    { regex: /hebre|希伯来/i, book: 'Hebrews' },
    { regex: /jame|santiag|雅各/i, book: 'James' },
    { regex: /1.*pet|彼得前/i, book: '1 Peter' },
    { regex: /2.*pet|彼得后/i, book: '2 Peter' },
    { regex: /1.*j[ou]h?n|1.*иоан|1.*иван|约翰一书/i, book: '1 John' },
    { regex: /2.*j[ou]h?n|2.*иоан|2.*иван|约翰二书/i, book: '2 John' },
    { regex: /3.*j[ou]h?n|3.*иоан|3.*иван|约翰三书/i, book: '3 John' },
    { regex: /jude|judas|юда|犹大/i, book: 'Jude' },
    { regex: /revel|apoc|offenb|启示录/i, book: 'Revelation' },
  ];

  for (const { regex, book } of patterns) {
    if (regex.test(testString) || regex.test(bookName)) {
      return book;
    }
  }

  return null;
}

/**
 * Book name to 3-letter code mapping (used in timestamps files)
 */
const BOOK_CODES_3LETTER = {
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
 * Canonical book order for the Bible
 */
const BOOK_ORDER = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms',
  'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
  'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
  'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
  'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

/**
 * Get available deaf video translations
 */
function getAvailableTranslations() {
  const translations = [];
  const entries = fs.readdirSync(DOWNLOADS_DIR);

  for (const entry of entries) {
    if (entry.startsWith('deaf-videos-')) {
      const id = entry.replace('deaf-videos-', '');
      const metadataPath = path.join(DOWNLOADS_DIR, entry, 'metadata.json');

      if (fs.existsSync(metadataPath)) {
        translations.push({
          id,
          dir: entry,
          metadataPath
        });
      }
    }
  }

  return translations;
}

/**
 * List available translations
 */
function listTranslations() {
  const translations = getAvailableTranslations();

  console.log('Available Deaf Bible Translations with Video Data:');
  console.log('='.repeat(50));
  console.log('');

  for (const t of translations) {
    // Try to get more info from metadata
    try {
      const metadata = JSON.parse(fs.readFileSync(t.metadataPath, 'utf8'));
      const videoCount = metadata.length || 0;
      const books = [...new Set(metadata.map(v => v.book).filter(Boolean))];
      console.log(`  ${t.id.padEnd(12)} - ${videoCount} videos, ${books.length} books`);
    } catch (err) {
      console.log(`  ${t.id.padEnd(12)} - (metadata error)`);
    }
  }

  console.log('');
  console.log(`Total: ${translations.length} translations`);
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/generate-deaf-html.cjs              # Generate ALL');
  console.log('  node scripts/generate-deaf-html.cjs list         # List translations');
  console.log('  node scripts/generate-deaf-html.cjs <id>         # Generate specific');
}

/**
 * Parse verse range from title like "Genesis 1:1-31; 2:1-4" or "Luke 1:5-25"
 */
function parseVerseRange(title) {
  if (!title) return null;

  // Match patterns like "Book Chapter:Verse-Verse" or "Book Chapter:Verse"
  const match = title.match(/(\d+):(\d+)(?:-(\d+))?/);
  if (match) {
    return {
      chapter: parseInt(match[1], 10),
      verseStart: parseInt(match[2], 10),
      verseEnd: match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10)
    };
  }
  return null;
}

/**
 * Get the MP4 filename for a video entry
 */
function getVideoFilename(video, translationId) {
  // Construct filename the same way download-deaf-videos.cjs does
  const book = (video.book || 'Unknown').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  const chapter = String(video.chapter || 1).padStart(3, '0');
  const title = (video.title || video.bbb_id || 'video').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  return `${book}_${chapter}_${title}.mp4`;
}

/**
 * Generate HTML files for a translation
 */
function generateTranslation(translationId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating HTML for translation: ${translationId}`);
  console.log('='.repeat(60));

  const sourceDir = path.join(DOWNLOADS_DIR, `deaf-videos-${translationId}`);
  const outputDir = path.join(DOWNLOADS_DIR, `deaf_${translationId.toUpperCase()}`);

  // Check source exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    return { generated: 0, failed: 0 };
  }

  // Load metadata
  const metadataPath = path.join(sourceDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error(`metadata.json not found in ${sourceDir}`);
    return { generated: 0, failed: 0 };
  }

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (err) {
    console.error(`Failed to parse metadata.json: ${err.message}`);
    return { generated: 0, failed: 0 };
  }

  if (!Array.isArray(metadata) || metadata.length === 0) {
    console.error('No videos in metadata.json');
    return { generated: 0, failed: 0 };
  }

  console.log(`Found ${metadata.length} videos in metadata`);

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Organize videos by book and chapter
  const bookChapters = {};
  const booksInTranslation = new Set();

  for (const video of metadata) {
    const rawBookName = video.book;
    if (!rawBookName) continue;

    // Normalize international book names to English
    const bookName = normalizeBookName(rawBookName);
    if (!bookName) {
      console.warn(`Unknown book: ${rawBookName}`);
      continue;
    }

    booksInTranslation.add(bookName);
    const bookCode = BOOK_CODES_2LETTER[bookName];
    if (!bookCode) {
      console.warn(`No code for book: ${bookName} (from ${rawBookName})`);
      continue;
    }

    // Store original name for display
    video._normalizedBook = bookName;
    video._originalBook = rawBookName;

    const chapter = video.chapter || 1;
    const key = `${bookCode}${chapter}`;

    if (!bookChapters[key]) {
      bookChapters[key] = {
        bookName,
        bookCode,
        chapter,
        videos: []
      };
    }

    bookChapters[key].videos.push(video);
  }

  // Sort videos within each chapter by verse
  for (const key of Object.keys(bookChapters)) {
    bookChapters[key].videos.sort((a, b) => {
      const aRange = parseVerseRange(a.title || a.parseable_title);
      const bRange = parseVerseRange(b.title || b.parseable_title);
      const aVerse = aRange ? aRange.verseStart : 0;
      const bVerse = bRange ? bRange.verseStart : 0;
      return aVerse - bVerse;
    });
  }

  // Build mapping from normalized names to original (localized) names
  const originalBookNames = {};
  for (const video of metadata) {
    if (video._normalizedBook && video._originalBook) {
      originalBookNames[video._normalizedBook] = video._originalBook;
    }
  }

  // Generate info.json
  const sortedBooks = BOOK_ORDER.filter(b => booksInTranslation.has(b));
  const divisionCodes = sortedBooks.map(b => BOOK_CODES_2LETTER[b]);
  // Use localized names for display
  const divisionNames = sortedBooks.map(b => originalBookNames[b] || b);

  // Get all sections (chapter IDs) in order
  const sections = [];
  for (const bookName of sortedBooks) {
    const bookCode = BOOK_CODES_2LETTER[bookName];
    const chaptersForBook = Object.keys(bookChapters)
      .filter(k => k.startsWith(bookCode))
      .map(k => ({
        key: k,
        chapter: parseInt(k.replace(bookCode, ''), 10)
      }))
      .sort((a, b) => a.chapter - b.chapter);

    for (const ch of chaptersForBook) {
      sections.push(ch.key);
    }
  }

  const info = {
    langName: translationId.toUpperCase(),
    nameEnglish: '',
    abbr: translationId.toUpperCase(),
    id: `deaf_${translationId.toUpperCase()}`,
    lang: translationId.toUpperCase(),
    langNameEnglish: '',
    name: `Deaf Bible (${translationId.toUpperCase()})`,
    dir: 'ltr',
    type: 'deafbible',
    cssClass: 'bible-video',
    divisionNames: divisionNames,
    divisions: divisionCodes,
    sections: sections
  };

  fs.writeFileSync(
    path.join(outputDir, 'info.json'),
    JSON.stringify(info, null, 2)
  );
  console.log(`Generated info.json with ${sections.length} sections`);

  // Generate HTML files for each chapter
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < sections.length; i++) {
    const sectionId = sections[i];
    const chapterData = bookChapters[sectionId];

    if (!chapterData) {
      console.warn(`No data for section: ${sectionId}`);
      failed++;
      continue;
    }

    const prevId = i > 0 ? sections[i - 1] : '';
    const nextId = i < sections.length - 1 ? sections[i + 1] : '';

    try {
      const html = generateChapterHtml(
        chapterData,
        sectionId,
        prevId,
        nextId,
        translationId,
        info.id,
        info.lang
      );

      fs.writeFileSync(path.join(outputDir, `${sectionId}.html`), html);
      generated++;
    } catch (err) {
      console.error(`Failed to generate ${sectionId}.html: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nTranslation ${translationId} complete!`);
  console.log(`  Generated: ${generated} HTML files`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Output: ${outputDir}`);

  return { generated, failed };
}

/**
 * Generate HTML for a single chapter
 */
function generateChapterHtml(chapterData, sectionId, prevId, nextId, translationId, textId, lang) {
  const { bookName, bookCode, chapter, videos } = chapterData;

  const lines = [];

  // Opening div
  lines.push(
    `<div class="section deafbible ${bookCode} ${sectionId} ${textId} ${lang} deafbible" ` +
    `dir="ltr" lang="${lang}" data-id="${sectionId}" ` +
    `data-nextid="${nextId}" data-previd="${prevId}">`
  );

  // Chapter title - use original book name if available for localized display
  const displayBookName = videos[0]?._originalBook || bookName;
  lines.push(`<div class="mt">${displayBookName} ${chapter}</div>`);

  // Videos as verses
  for (const video of videos) {
    const title = video.title || video.parseable_title || '';
    const subtitle = video.subtitle || '';
    const verseRange = parseVerseRange(title);

    // Create verse ID
    let verseId = sectionId + '_1';
    if (verseRange) {
      verseId = `${sectionId}_${verseRange.verseStart}`;
    }

    // Build display title (section heading)
    let displayTitle = subtitle || title;
    if (verseRange) {
      const verseRef = verseRange.verseEnd !== verseRange.verseStart
        ? `${chapter}:${verseRange.verseStart}–${verseRange.verseEnd}`
        : `${chapter}:${verseRange.verseStart}`;
      if (subtitle) {
        displayTitle = `${subtitle} (${verseRef})`;
      } else {
        displayTitle = `${verseRef}`;
      }
    }

    // Video URL
    const videoFilename = getVideoFilename(video, translationId);
    const videoUrl = `${VIDEO_BASE_URL}/${translationId}/${videoFilename}`;

    // Generate verse HTML
    lines.push(
      `<span class="v ${verseId}" data-id="${verseId}">` +
      (displayTitle ? `<div class="s">${escapeHtml(displayTitle)}</div>` : '') +
      `<video src="${videoUrl}" preload="none" class="inline-video" controls poster=""></video>` +
      `</span>`
    );
  }

  lines.push('');
  lines.push('</div>');

  return lines.join('\n');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate all translations
 */
function generateAll() {
  const translations = getAvailableTranslations();

  console.log(`Found ${translations.length} translations to generate\n`);

  let totalGenerated = 0;
  let totalFailed = 0;

  for (let i = 0; i < translations.length; i++) {
    const t = translations[i];
    console.log(`\n[${i + 1}/${translations.length}] Processing: ${t.id}`);

    const result = generateTranslation(t.id);
    totalGenerated += result.generated;
    totalFailed += result.failed;
  }

  console.log('\n' + '='.repeat(60));
  console.log('ALL TRANSLATIONS COMPLETE!');
  console.log('='.repeat(60));
  console.log(`  Total Generated: ${totalGenerated} HTML files`);
  console.log(`  Total Failed: ${totalFailed}`);
}

// Main
if (arg === 'list') {
  listTranslations();
} else if (arg) {
  generateTranslation(arg);
} else {
  generateAll();
}
