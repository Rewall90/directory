/**
 * Map configuration constants for consistent zoom levels and behavior
 */
export const MAP_CONFIG = {
  /** Center of Norway */
  NORWAY_CENTER: [65, 13] as [number, number],

  /** Initial zoom level - shows full Norway */
  INITIAL_ZOOM: 5,

  /** Zoom level when filtering by region/city */
  REGION_ZOOM: 8,

  /** Zoom level when viewing a specific course */
  DETAIL_ZOOM: 13,

  /** Minimum allowed zoom */
  MIN_ZOOM: 3,

  /** Maximum allowed zoom */
  MAX_ZOOM: 18,

  /** Clustering configuration */
  CLUSTER: {
    /** Max radius for clustering markers (in pixels) */
    MAX_RADIUS: 80,

    /** Disable clustering at this zoom level */
    DISABLE_AT_ZOOM: 13,
  },
} as const;

/** Tile layer configuration */
export const TILE_CONFIG = {
  URL: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>',
  MAX_ZOOM: 20,
} as const;

/** Map UI configuration constants */
export const MAP_UI_CONFIG = {
  /** Precision for displaying coordinates (decimal places) */
  COORDINATE_PRECISION: 4,

  /** Z-index for map controls */
  CONTROLS_Z_INDEX: 1000,
} as const;
