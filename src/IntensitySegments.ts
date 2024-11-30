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
  segments: number[][];

  constructor() {
    this.segments = [];
  }

  /**
   * Adds an intensity change to a specified range.
   * The intensity is added to any existing intensities in the range.
   * 
   * @param from Starting point of the range
   * @param to Ending point of the range
   * @param amount Intensity value to add (can be negative)
   */
  add(from: number, to: number, amount: number) {
    const changes = new Map<number, number>();
    
    // Convert existing segments to point changes
    for (let i = 0; i < this.segments.length - 1; i++) {
      const [start, intensity] = this.segments[i];
      const [end] = this.segments[i + 1];
      changes.set(start, (changes.get(start) || 0) + intensity);
      changes.set(end, (changes.get(end) || 0) - intensity);
    }
    
    // Add new intensity changes
    changes.set(from, (changes.get(from) || 0) + amount);
    changes.set(to, (changes.get(to) || 0) - amount);
    
    this.applyChanges(changes);
  }

  /**
   * Sets the intensity for a specified range.
   * Any existing intensities in the range are overridden.
   * 
   * @param from Starting point of the range
   * @param to Ending point of the range
   * @param amount New intensity value for the range
   */
  set(from: number, to: number, amount: number) {
    const newSegments: number[][] = [];
    
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
    
    newSegments.push([to, afterIntensity]);
    
    // Add segments after the range
    for (const [point, intensity] of this.segments) {
      if (point > to) {
        newSegments.push([point, intensity]);
      }
    }
    
    this.segments = newSegments;
    
    // Clean up and normalize segments
    const changes = new Map<number, number>();
    for (let i = 0; i < this.segments.length - 1; i++) {
      const [start, intensity] = this.segments[i];
      const [end] = this.segments[i + 1];
      changes.set(start, (changes.get(start) || 0) + intensity);
      changes.set(end, (changes.get(end) || 0) - intensity);
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
  private applyChanges(changes: Map<number, number>) {
    // Sort points and calculate cumulative intensities
    const points = Array.from(changes.keys()).sort((a, b) => a - b);
    let currentIntensity = 0;
    
    const newSegments: number[][] = [];
    for (const point of points) {
      currentIntensity += changes.get(point) || 0;
      newSegments.push([point, currentIntensity]);
    }
    
    // Process segments to remove unnecessary zeros
    const finalSegments: number[][] = [];
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
   * Returns a JSON string representation of the segments.
   * Format: [[point, intensity], ...]
   */
  toString() {
    return JSON.stringify(this.segments);
  }
}