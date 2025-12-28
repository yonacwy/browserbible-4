/**
 * Resource Imports (i18n translations)
 * Loads all language resource files
 */

import { registerResource } from '../core/registry.js';

// English (default)
import en from './en.esm.js';
registerResource('en', en);

// Top 12 languages by total speakers
import zhCN from './zh-CN.esm.js';
registerResource('zh-CN', zhCN);

import hi from './hi.esm.js';
registerResource('hi', hi);

import es from './es.esm.js';
registerResource('es', es);

import fr from './fr.esm.js';
registerResource('fr', fr);

import ar from './ar.esm.js';
registerResource('ar', ar);

import bn from './bn.esm.js';
registerResource('bn', bn);

import pt from './pt.esm.js';
registerResource('pt', pt);

import ru from './ru.esm.js';
registerResource('ru', ru);

import ur from './ur.esm.js';
registerResource('ur', ur);

import id from './id.esm.js';
registerResource('id', id);

import de from './de.esm.js';
registerResource('de', de);

import ja from './ja.esm.js';
registerResource('ja', ja);
