import { Point, Intensity, Segment, SegmentRange, CacheConfig } from './types';

/**
 * Manages a collection of intensity segments over a timeline.
 * Each segment represents a period with a specific intensity value.
 * Segments are stored as [point, intensity] pairs, where:
 * - point: The starting point of the segment
 * - intensity: The intensity value for the segment
 * 
 * The class ensures that:
 * 1. Segments are always sorted by their starting points
 * 2. No unnecessary zero-intensity segments are kept
 * 3. Overlapping segments are properly merged
 */
export class IntensitySegments {
  /** Array of [point, intensity] pairs representing the segments */
  public segments: Segment[];
  
  /** Cache for intensity values at specific points */
  private intensityCache: Map<Point, { value: Intensity; timestamp: number }>;
  
  /** Cache configuration */
  private cacheConfig: Required<CacheConfig>;

  /**
   * Creates a new IntensitySegments instance
   * @param cacheConfig Optional cache configuration
   */
  constructor(cacheConfig?: CacheConfig) {
    this.segments = [];
    this.intensityCache = new Map();
    this.cacheConfig = {
      maxSize: cacheConfig?.maxSize ?? 1000,
      ttl: cacheConfig?.ttl ?? 5000, // 5 seconds default TTL
    };
  }

  /**
   * Validates time range parameters
   * @throws {TypeError} If parameters are not numbers
   * @throws {RangeError} If parameters are invalid
   */
  private validateTimeRange(from: Point, to: Point): void {
    if (typeof from !== 'number' || typeof to !== 'number') {
      throw new TypeError('Invalid type: time points must be numbers');
    }
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      throw new RangeError('Invalid range: time points must be finite numbers');
    }
    if (from >= to) {
      throw new RangeError('Invalid range: start time must be less than end time');
    }
  }

  /**
   * Validates intensity parameter
   * @throws {TypeError} If parameter is not a number
   * @throws {RangeError} If parameter is invalid
   */
  private validateIntensity(intensity: Intensity): void {
    if (typeof intensity !== 'number') {
      throw new TypeError('Invalid type: intensity must be a number');
    }
    if (!Number.isFinite(intensity)) {
      throw new RangeError('Invalid range: intensity must be a finite number');
    }
  }

  /**
   * Binary search for the segment containing a specific time point
   * @param time The time point to search for
   * @returns Index of the segment containing the time point, or -1 if not found
   */
  private binarySearch(time: Point): number {
    let left = 0;
    let right = this.segments.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const [point] = this.segments[mid];

      if (point === time) {
        return mid;
      }

      if (point < time) {
        if (mid === this.segments.length - 1 || this.segments[mid + 1][0] > time) {
          return mid;
        }
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return right;
  }

  /**
   * Clears the intensity cache
   */
  private clearCache(): void {
    this.intensityCache.clear();
  }

  /**
   * Updates the cache with a new value
   */
  private updateCache(point: Point, intensity: Intensity): void {
    // Remove expired entries
    const now = Date.now();
    for (const [key, { timestamp }] of this.intensityCache) {
      if (now - timestamp > this.cacheConfig.ttl) {
        this.intensityCache.delete(key);
      }
    }

    // Ensure cache doesn't exceed max size
    if (this.intensityCache.size >= this.cacheConfig.maxSize) {
      const oldestKey = Array.from(this.intensityCache.keys())[0];
      if (oldestKey !== undefined) {
        this.intensityCache.delete(oldestKey);
      }
    }

    // Add new value
    this.intensityCache.set(point, { value: intensity, timestamp: now });
  }

  /**
   * Gets the intensity value at a specific time point
   * @param time The time point to get the intensity for
   * @returns The intensity value at the specified time
   */
  getIntensityAt(time: Point): Intensity {
    this.validateTimeRange(time, time + 1);

    // Check cache first
    const cached = this.intensityCache.get(time);
    if (cached && Date.now() - cached.timestamp <= this.cacheConfig.ttl) {
      return cached.value;
    }

    // If not in cache, perform binary search
    const index = this.binarySearch(time);
    const intensity = index >= 0 ? this.segments[index][1] : 0;

    // Update cache
    this.updateCache(time, intensity);

    return intensity;
  }

  /**
   * Gets the segment containing a specific time point
   * @param time The time point to get the segment for
   * @returns The segment containing the time point, or null if not found
   */
  getSegmentAt(time: Point): SegmentRange | null {
    this.validateTimeRange(time, time + 1);

    if (this.segments.length === 0) {
      return null;
    }

    const index = this.binarySearch(time);
    if (index < 0) {
      return null;
    }

    const [start, intensity] = this.segments[index];
    const end = index < this.segments.length - 1 ? this.segments[index + 1][0] : Infinity;

    // Return null if the point is after the last non-zero segment
    if (intensity === 0 && time > start) {
      return null;
    }

    return { start, end, intensity };
  }

  /**
   * Adds an intensity change to a specified range.
   * The intensity is added to any existing intensities in the range.
   * 
   * @param from Starting point of the range
   * @param to Ending point of the range
   * @param amount Intensity value to add (can be negative)
   * @throws {TypeError | RangeError} If parameters are invalid
   */
  add(from: Point, to: Point, amount: Intensity): void {
    this.validateTimeRange(from, to);
    this.validateIntensity(amount);

    // Clear cache as segments are being modified
    this.clearCache();

    // Pre-allocate arrays for better performance
    const points = new Array<Point>(this.segments.length * 2 + 2);
    const intensities = new Array<Intensity>(points.length);
    let index = 0;

    // Add existing segment change points
    for (let i = 0; i < this.segments.length; i++) {
      const [start, intensity] = this.segments[i];
      points[index] = start;
      intensities[index] = intensity;
      index++;

      if (i < this.segments.length - 1) {
        const [nextStart] = this.segments[i + 1];
        points[index] = nextStart;
        intensities[index] = -intensity;
        index++;
      }
    }

    // Add new intensity changes
    points[index] = from;
    intensities[index] = amount;
    index++;
    points[index] = to;
    intensities[index] = -amount;
    index++;

    // Create final changes map
    const changes = new Map<Point, Intensity>();
    for (let i = 0; i < index; i++) {
      const point = points[i];
      changes.set(point, (changes.get(point) || 0) + intensities[i]);
    }
    
    this.applyChanges(changes);
  }

  /**
   * Sets the intensity for a specified range.
   * Any existing intensities in the range are overridden.
   * 
   * @param from Starting point of the range
   * @param to Ending point of the range
   * @param amount New intensity value for the range
   * @throws {TypeError | RangeError} If parameters are invalid
   */
  set(from: Point, to: Point, amount: Intensity): void {
    this.validateTimeRange(from, to);
    this.validateIntensity(amount);

    // Clear cache as segments are being modified
    this.clearCache();

    const newSegments: Segment[] = [];
    
    // Add segments before the range
    for (const [point, intensity] of this.segments) {
      if (point < from) {
        newSegments.push([point, intensity]);
      } else {
        break;
      }
    }
    
    // Add the new range with the specified intensity
    newSegments.push([from, amount]);
    
    // Find the intensity that should continue after 'to'
    let afterIntensity = 0;
    for (let i = this.segments.length - 1; i >= 0; i--) {
      if (this.segments[i][0] <= to) {
        afterIntensity = this.segments[i][1];
        break;
      }
    }
    
    // Add the end point of the range
    newSegments.push([to, afterIntensity]);
    
    // Add segments after the range
    for (const [point, intensity] of this.segments) {
      if (point > to) {
        newSegments.push([point, intensity]);
      }
    }
    
    // Clean up and normalize segments
    const changes = new Map<Point, Intensity>();
    for (let i = 0; i < newSegments.length; i++) {
      const [start, intensity] = newSegments[i];
      changes.set(start, (changes.get(start) || 0) + intensity);
      
      if (i < newSegments.length - 1) {
        const [nextStart] = newSegments[i + 1];
        changes.set(nextStart, (changes.get(nextStart) || 0) - intensity);
      }
    }
    
    this.applyChanges(changes);
  }

  /**
   * Applies a set of intensity changes to create a new set of segments.
   * This method:
   * 1. Converts point changes to segments
   * 2. Removes unnecessary zero-intensity segments
   * 3. Ensures segments are properly connected
   * 
   * @param changes Map of points to their intensity changes
   */
  private applyChanges(changes: Map<Point, Intensity>): void {
    // Sort points and calculate cumulative intensities
    const points = Array.from(changes.keys()).sort((a, b) => a - b);
    const newSegments = new Array<Segment>(points.length);
    let currentIntensity = 0;
    
    // Generate all segments
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      currentIntensity += changes.get(point) || 0;
      newSegments[i] = [point, currentIntensity];
    }
    
    // Process segments to remove unnecessary zeros
    const finalSegments: Segment[] = [];
    let foundNonZero = false;
    
    for (let i = 0; i < newSegments.length; i++) {
      const [point, intensity] = newSegments[i];
      const nextIntensity = i < newSegments.length - 1 ? newSegments[i + 1][1] : 0;
      
      if (!foundNonZero && intensity === 0) continue;
      if (intensity !== 0) foundNonZero = true;
      
      if (intensity !== 0 || nextIntensity !== 0 || foundNonZero) {
        finalSegments.push([point, intensity]);
      }
    }
    
    // Remove trailing zero segments if they're unnecessary
    while (finalSegments.length > 0 && 
           finalSegments[finalSegments.length - 1][1] === 0 && 
           finalSegments[finalSegments.length - 2]?.[1] === 0) {
      finalSegments.pop();
    }
    
    this.segments = finalSegments;
  }

  /**
   * Returns a string representation of the segments
   */
  toString(): string {
    return JSON.stringify(this.segments);
  }
}