import { IntensitySegments } from '../src/IntensitySegments';

describe('IntensitySegments', () => {
  let segments: IntensitySegments;

  beforeEach(() => {
    segments = new IntensitySegments({ maxSize: 100, ttl: 1000 });
  });

  describe('Constructor', () => {
    it('should initialize with an empty segments array', () => {
      expect(segments.toString()).toBe('[]');
    });

    it('should use default cache config when not provided', () => {
      const defaultSegments = new IntensitySegments();
      expect(defaultSegments.toString()).toBe('[]');
    });
  });

  describe('Parameter validation', () => {
    describe('Time range validation', () => {
      it('should throw TypeError for non-number time points', () => {
        expect(() => segments.add('10' as any, 30, 1)).toThrow('Invalid type: time points must be numbers');
        expect(() => segments.add(10, '30' as any, 1)).toThrow('Invalid type: time points must be numbers');
      });

      it('should throw RangeError for non-finite time points', () => {
        expect(() => segments.add(Infinity, 30, 1)).toThrow('Invalid range: time points must be finite numbers');
        expect(() => segments.add(10, Infinity, 1)).toThrow('Invalid range: time points must be finite numbers');
      });

      it('should throw RangeError when start time is greater than or equal to end time', () => {
        expect(() => segments.add(30, 30, 1)).toThrow('Invalid range: start time must be less than end time');
        expect(() => segments.add(40, 30, 1)).toThrow('Invalid range: start time must be less than end time');
      });
    });

    describe('Intensity validation', () => {
      it('should throw TypeError for non-number intensity', () => {
        expect(() => segments.add(10, 30, '1' as any)).toThrow('Invalid type: intensity must be a number');
      });

      it('should throw RangeError for non-finite intensity', () => {
        expect(() => segments.add(10, 30, Infinity)).toThrow('Invalid range: intensity must be a finite number');
      });
    });
  });

  describe('add() method', () => {
    it('should create a basic segment with single intensity', () => {
      segments.add(10, 30, 1);
      expect(segments.toString()).toBe('[[10,1],[30,0]]');
    });

    it('should merge overlapping segments by adding their intensities', () => {
      segments.add(10, 30, 1);
      segments.add(20, 40, 1);
      expect(segments.toString()).toBe('[[10,1],[20,2],[30,1],[40,0]]');
    });

    it('should handle negative intensity values correctly', () => {
      segments.add(10, 30, 1);
      segments.add(20, 40, 1);
      segments.add(10, 40, -2);
      expect(segments.toString()).toBe('[[10,-1],[20,0],[30,-1],[40,0]]');
    });
  });

  describe('set() method', () => {
    beforeEach(() => {
      segments = new IntensitySegments();
    });

    it('should create a basic segment with specified intensity', () => {
      segments.set(10, 30, 2);
      expect(segments.toString()).toBe('[[10,2],[30,0]]');
    });

    it('should override existing intensities within the target range', () => {
      segments.add(10, 40, 1);
      segments.set(20, 30, 3);
      expect(segments.toString()).toBe('[[10,1],[20,3],[30,1],[40,0]]');
    });

    it('should handle consecutive set operations correctly', () => {
      segments.set(10, 30, 2);
      segments.set(20, 40, 3);
      expect(segments.toString()).toBe('[[10,2],[20,3],[40,0]]');
    });
  });

  describe('getIntensityAt() method', () => {
    beforeEach(() => {
      segments.add(10, 30, 2);
      segments.add(20, 40, 1);
    });

    it('should return correct intensity at exact points', () => {
      expect(segments.getIntensityAt(10)).toBe(2);
      expect(segments.getIntensityAt(20)).toBe(3);
      expect(segments.getIntensityAt(30)).toBe(1);
      expect(segments.getIntensityAt(40)).toBe(0);
    });

    it('should return correct intensity between points', () => {
      expect(segments.getIntensityAt(15)).toBe(2);
      expect(segments.getIntensityAt(25)).toBe(3);
      expect(segments.getIntensityAt(35)).toBe(1);
      expect(segments.getIntensityAt(45)).toBe(0);
    });

    it('should use cache for repeated queries', () => {
      const time = 25;
      const firstResult = segments.getIntensityAt(time);
      const secondResult = segments.getIntensityAt(time);
      expect(firstResult).toBe(secondResult);
    });

    it('should handle points before first segment', () => {
      expect(segments.getIntensityAt(5)).toBe(0);
    });
  });

  describe('getSegmentAt() method', () => {
    beforeEach(() => {
      segments.add(10, 30, 2);
      segments.add(20, 40, 1);
    });

    it('should return correct segment at exact points', () => {
      expect(segments.getSegmentAt(10)).toEqual({ start: 10, end: 20, intensity: 2 });
      expect(segments.getSegmentAt(20)).toEqual({ start: 20, end: 30, intensity: 3 });
      expect(segments.getSegmentAt(30)).toEqual({ start: 30, end: 40, intensity: 1 });
    });

    it('should return correct segment between points', () => {
      expect(segments.getSegmentAt(15)).toEqual({ start: 10, end: 20, intensity: 2 });
      expect(segments.getSegmentAt(25)).toEqual({ start: 20, end: 30, intensity: 3 });
      expect(segments.getSegmentAt(35)).toEqual({ start: 30, end: 40, intensity: 1 });
    });

    it('should return null for points before first segment', () => {
      expect(segments.getSegmentAt(5)).toBeNull();
    });

    it('should return null for points after last segment', () => {
      expect(segments.getSegmentAt(45)).toBeNull();
    });
  });

  describe('Cache management', () => {
    it('should remove expired cache entries', async () => {
      const ttl = 100; // 100ms TTL
      segments = new IntensitySegments({ maxSize: 100, ttl });
      
      segments.add(10, 30, 2);
      const time = 15;
      segments.getIntensityAt(time); // Cache the value
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, ttl + 50));
      
      // This should trigger cache cleanup and recalculate
      const intensity = segments.getIntensityAt(time);
      expect(intensity).toBe(2);
    });

    it('should respect cache size limit', () => {
      segments = new IntensitySegments({ maxSize: 2, ttl: 1000 });
      
      segments.add(10, 40, 1);
      
      // Cache three values
      segments.getIntensityAt(15);
      segments.getIntensityAt(25);
      segments.getIntensityAt(35);
      
      // The cache size should not exceed 2
      expect((segments as any).intensityCache.size).toBeLessThanOrEqual(2);
    });
  });

  describe('Empty and optimized segments', () => {
    it('should handle empty segments list', () => {
      segments = new IntensitySegments();
      expect(segments.getSegmentAt(10)).toBeNull();
    });

    it('should optimize segments by removing unnecessary zero segments', () => {
      segments = new IntensitySegments();
      
      // Create a scenario that would result in unnecessary zero segments
      segments.add(10, 30, 1);
      segments.add(20, 30, -1);
      
      // The final segments should not contain unnecessary zero segments
      expect(segments.toString()).toBe('[[10,1],[20,0]]');
    });
  });

  describe('Segment optimization', () => {
    it('should skip leading zero segments', () => {
      segments = new IntensitySegments();
      
      // Add a zero segment followed by a non-zero segment
      segments.set(0, 10, 0);  // This should be skipped
      segments.set(10, 20, 1);
      segments.set(20, 30, 0);
      
      // The zero segment at the start should be omitted
      expect(segments.toString()).toBe('[[10,1],[20,0]]');
    });

    it('should handle multiple leading zero segments', () => {
      segments = new IntensitySegments();
      
      // Add multiple zero segments followed by a non-zero segment
      segments.set(0, 10, 0);   // These should all be skipped
      segments.set(10, 20, 0);  // These should all be skipped
      segments.set(20, 30, 1);
      segments.set(30, 40, 0);
      
      // All zero segments at the start should be omitted
      expect(segments.toString()).toBe('[[20,1],[30,0]]');
    });

    it('should keep zero segments between non-zero segments', () => {
      segments = new IntensitySegments();
      
      segments.set(10, 20, 1);
      segments.set(20, 30, 0);  // This zero should be kept
      segments.set(30, 40, 1);
      segments.set(40, 50, 0);
      
      expect(segments.toString()).toBe('[[10,1],[20,0],[30,1],[40,0]]');
    });
  });
});
