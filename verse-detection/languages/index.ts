/**
 * Language-specific book name patterns
 *
 * Usage options:
 *
 * 1. Import all languages (no tree-shaking):
 *    import { bookNamesByLanguage } from 'verse-detection/languages';
 *
 * 2. Import specific languages (tree-shakeable):
 *    import { en } from 'verse-detection/languages/en';
 *    import { es } from 'verse-detection/languages/es';
 */

import type { BookNamePatterns, CanonicalBookName, LanguageCode } from './types.js';

// Re-export types
export type { BookNamePatterns, CanonicalBookName, LanguageCode } from './types.js';

// Import all language modules
import { en } from './en.js';
import { es } from './es.js';
import { pt } from './pt.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { ru } from './ru.js';
import { ar } from './ar.js';
import { hi } from './hi.js';
import { zh } from './zh.js';
import { id } from './id.js';

// Re-export individual languages for selective imports
export { en } from './en.js';
export { es } from './es.js';
export { pt } from './pt.js';
export { fr } from './fr.js';
export { de } from './de.js';
export { ru } from './ru.js';
export { ar } from './ar.js';
export { hi } from './hi.js';
export { zh } from './zh.js';
export { id } from './id.js';

/**
 * All book name patterns organized by language code
 */
export type BookNamesByLanguage = {
	[key in LanguageCode]: BookNamePatterns;
};

export const bookNamesByLanguage: BookNamesByLanguage = {
	en,
	es,
	pt,
	fr,
	de,
	ru,
	ar,
	hi,
	zh,
	id
};

/**
 * Get book patterns for a specific language
 */
export function getLanguagePatterns(languageCode: LanguageCode): BookNamePatterns {
	return bookNamesByLanguage[languageCode];
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): LanguageCode[] {
	return Object.keys(bookNamesByLanguage) as LanguageCode[];
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): code is LanguageCode {
	return code in bookNamesByLanguage;
}

export default bookNamesByLanguage;
