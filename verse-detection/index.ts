/**
 * Verse Detection Extension for Browser Bible 4
 *
 * A standalone extension that detects Bible verse references in text
 * using regular expressions. Supports full book names and abbreviations.
 *
 * Features:
 * - Multi-language support (10 languages)
 * - Auto-detect document language from HTML
 * - Hover popups with verse content
 * - Direct verse linking
 * - Configurable display modes
 * - Integration with Browser Bible 4's text loading system
 *
 * Supported Languages:
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
 * Quick Start:
 *
 *   // Full initialization with popup support
 *   import { initVerseDetection } from './verse-detection/index.js';
 *
 *   const verseSystem = await initVerseDetection(app, {
 *     displayMode: 'both',  // 'link', 'popup', or 'both'
 *     popup: {
 *       showDelay: 300,
 *       maxWidth: 400
 *     }
 *   });
 *
 *   // Process text content
 *   const html = verseSystem.processText('Read John 3:16 and Rom 8:28');
 *
 *   // Or process a container element
 *   verseSystem.processContainer(document.querySelector('.content'));
 *
 * Basic Detection Only:
 *
 *   import { createVerseDetector } from './verse-detection/index.js';
 *
 *   const detector = createVerseDetector({ language: 'es' });
 *   const verses = detector.detectVerses('Lee Juan 3:16');
 *
 * As Browser Bible 4 Plugin:
 *
 *   import { VerseDetectionPlugin } from './verse-detection/index.js';
 *   import { registerPlugin } from './core/registry.js';
 *
 *   registerPlugin('VerseDetectionPlugin', (app) => VerseDetectionPlugin(app));
 */

// Main plugin and detection
export {
	VerseDetectionPlugin,
	createVerseDetector,
	initVerseDetection,
	BOOK_NAMES,
	SUPPORTED_LANGUAGES,
	DEFAULT_LANGUAGE,
	getBookNames,
	getCombinedBookNames,
	detectDocumentLanguage,
	default
} from './VerseDetectionPlugin.js';

// Types from VerseDetectionPlugin
export type {
	ParsedChapter,
	ParsedVerseReference,
	VerseDetectionPluginOptions,
	VerseDetectionPluginAPI,
	InitializedVerseDetection
} from './VerseDetectionPlugin.js';

// Configuration
export { config, mergeConfig } from './config.js';

// Types from config
export type {
	DisplayMode,
	ContentSourceType,
	PopupPosition,
	ContentSourceConfig,
	VersionLinkingConfig,
	PopupConfig,
	LinkConfig,
	StylingConfig,
	LanguageConfig,
	DetectionConfig,
	AppIntegrationConfig,
	VerseDetectionConfig,
	PartialVerseDetectionConfig
} from './config.js';

// Popup system
export { VersePopup, createVersePopup } from './VersePopup.js';

// Types from VersePopup
export type {
	BookCode,
	ParsedReference,
	TextInfo,
	BrowserBibleApp,
	TextLoader
} from './VersePopup.js';

// Types from bookNames
export type {
	CanonicalBookName,
	LanguageCode,
	BookNamePatterns,
	BookNamesByLanguage
} from './bookNames.js';
