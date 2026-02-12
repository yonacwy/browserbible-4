/**
 * Multi-language Bible book name patterns
 *
 * Supports the top 10 world languages:
 * - English (en)
 * - Spanish (es)
 * - Portuguese (pt)
 * - French (fr)
 * - German (de)
 * - Russian (ru)
 * - Arabic (ar)
 * - Hindi (hi)
 * - Chinese Simplified (zh)
 * - Indonesian (id)
 *
 * Each language maps canonical book names to arrays of acceptable variations/abbreviations
 *
 * Usage options:
 *
 * 1. Import all languages (default):
 *    import { BOOK_NAMES, getBookNames } from 'verse-detection';
 *
 * 2. Import specific languages for tree-shaking:
 *    import { en } from 'verse-detection/languages/en';
 *    import { es } from 'verse-detection/languages/es';
 */

// Re-export types from languages module
export type {
	CanonicalBookName,
	LanguageCode,
	BookNamePatterns
} from './languages/types.js';

// Import types for local use
import type {
	CanonicalBookName,
	LanguageCode,
	BookNamePatterns
} from './languages/types.js';

// Import language modules
import {
	bookNamesByLanguage,
	getSupportedLanguages,
	isLanguageSupported
} from './languages/index.js';

/** Book names organized by language */
export type BookNamesByLanguage = Record<LanguageCode, BookNamePatterns>;

/**
 * All book name patterns organized by language code
 * @see languages/index.ts for tree-shakeable individual language imports
 */
export const BOOK_NAMES: BookNamesByLanguage = bookNamesByLanguage;

/** Supported language codes */
export const SUPPORTED_LANGUAGES: LanguageCode[] = getSupportedLanguages();

/** Default language */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Get book names for a specific language
 * @param langCode - Language code (e.g., 'en', 'es', 'zh')
 * @returns Book name patterns for that language
 */
export function getBookNames(langCode: string | null | undefined): BookNamePatterns {
	const lang = (langCode?.toLowerCase()?.split('-')[0] ?? DEFAULT_LANGUAGE) as LanguageCode;
	return BOOK_NAMES[lang] || BOOK_NAMES[DEFAULT_LANGUAGE];
}

/**
 * Get book names for multiple languages combined
 * @param langCodes - Array of language codes
 * @returns Combined book name patterns
 */
export function getCombinedBookNames(langCodes: string[]): Partial<Record<CanonicalBookName, string[]>> {
	const combined: Partial<Record<CanonicalBookName, string[]>> = {};

	for (const langCode of langCodes) {
		const names = getBookNames(langCode);
		for (const [canonical, variations] of Object.entries(names) as [CanonicalBookName, string[]][]) {
			if (!combined[canonical]) {
				combined[canonical] = [];
			}
			for (const variation of variations) {
				if (!combined[canonical]!.includes(variation)) {
					combined[canonical]!.push(variation);
				}
			}
		}
	}

	return combined;
}

// Re-export for convenience - these allow tree-shakeable individual imports
export { isLanguageSupported, getSupportedLanguages };

export default BOOK_NAMES;
