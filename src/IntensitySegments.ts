import { Point, Intensity, Segment } from './types';

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

  constructor() {
    this.segments = [];
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

      // If not the last segment, add the next segment's start point as current segment's end
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
      
      // If not the last segment, add the next segment's start point as current segment's end
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
      
      // Skip leading zeros until we find a non-zero intensity
      if (!foundNonZero && intensity === 0) continue;
      if (intensity !== 0) foundNonZero = true;
      
      // Keep segment if it's meaningful
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