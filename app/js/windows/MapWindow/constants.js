/**
 * MapWindow Constants
 * Map bounds, SVG dimensions, and location classifications
 */

export const MAP_BOUNDS = {
  minLat: 8,
  maxLat: 47,
  minLon: -8,
  maxLon: 78
};

export const SVG_WIDTH = 1200;
export const SVG_HEIGHT = 800;
export const PADDING = 40;
export const CONTENT_WIDTH = SVG_WIDTH - 2 * PADDING;
export const CONTENT_HEIGHT = SVG_HEIGHT - 2 * PADDING;

export const IMPORTANT_LOCATIONS = new Set([
  'Rome', 'Athens', 'Corinth', 'Ephesus', 'Antioch', 'Alexandria',
  'Thessalonica', 'Philippi', 'Galatia', 'Colossae', 'Patmos',
  'Crete', 'Malta', 'Puteoli', 'Cyprus', 'Iconium', 'Lystra', 'Derbe',
  'Troas', 'Miletus', 'Caesarea Philippi', 'Decapolis', 'Petra'
]);

export const DEMOTED_LOCATIONS = new Set([
  'Most Holy Place', 'Most Holy Place 2', 'Holy Place', 'Holy Place 2',
  'Mount Seir 1',
  'Valley of the Son of Hinnom', 'Zorah', 'Valley of the Arnon',
  'Kadesh-barnea', 'Mount Hor', 'Shephelah', 'Succoth',
  'Jazer', 'Jabesh-gilead', 'Tirzah',
  'Hazor', 'Ziklag', 'Gezer', 'Rabbah', 'Ramah',
  'Ashkelon', 'Megiddo', 'Aroer', 'Ekron', 'Lachish',
  'Mahanaim?', 'Kiriath-jearim?'
]);

// Zoom thresholds for icon visibility (6 tiers)
export const ZOOM_THRESHOLDS = {
  1: 0,   // Tier 1 - Major locations (always visible)
  2: 8,   // Tier 2 - Important locations
  3: 24,  // Tier 3 - Notable locations
  4: 48,  // Tier 4 - Moderate locations
  5: 72,  // Tier 5 - Minor locations
  6: 96   // Tier 6 - Minimal locations (visible at max zoom)
};

// Icon sizes for each tier (in pixels)
export const ICON_SIZES = {
  1: 42,  // Tier 1 (Major locations)
  2: 38,  // Tier 2 (Important locations)
  3: 34,  // Tier 3 (Notable locations)
  4: 30,  // Tier 4 (Moderate locations)
  5: 26,  // Tier 5 (Minor locations)
  6: 22   // Tier 6 (Minimal locations)
};

// Collision detection settings
export const COLLISION_DETECTION_ENABLED = false; // Disabled - use sizing instead to prevent geographic displacement
export const COLLISION_OFFSET_MAX = 8; // Maximum offset in pixels to prevent overlap
export const COLLISION_GRID_SIZE = 50; // Spatial grid size for performance optimization
