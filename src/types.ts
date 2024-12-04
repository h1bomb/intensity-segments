/**
 * Represents a point in time
 */
export type Point = number;

/**
 * Represents an intensity value
 */
export type Intensity = number;

/**
 * Represents a segment with a point and its corresponding intensity
 * [point, intensity]
 */
export type Segment = [Point, Intensity];

/** Segment object type with start, end, and intensity */
export interface SegmentRange {
  start: Point;
  end: Point;
  intensity: Intensity;
}

/** Cache configuration type */
export interface CacheConfig {
  /** Maximum size of the cache */
  maxSize?: number;
  /** Time to live in milliseconds */
  ttl?: number;
}
