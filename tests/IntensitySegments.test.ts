import { IntensitySegments } from '../src/IntensitySegments';

describe('IntensitySegments', () => {
  let segments: IntensitySegments;

  beforeEach(() => {
    segments = new IntensitySegments();
  });

  describe('Constructor', () => {
    it('should initialize with an empty segments array', () => {
      expect(segments.toString()).toBe('[]');
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

    it('should maintain a single segment when adding same intensity', () => {
      segments.add(10, 30, 1);
      expect(segments.toString()).toBe('[[10,1],[30,0]]');
    });

    it('should create stepped segments for overlapping ranges', () => {
      segments.add(10, 30, 1);
      segments.add(20, 40, 1);
      expect(segments.toString()).toBe('[[10,1],[20,2],[30,1],[40,0]]');
    });

    it('should correctly reduce intensity in overlapping ranges', () => {
      segments.add(10, 30, 1);
      segments.add(20, 40, 1);
      segments.add(10, 40, -1);
      expect(segments.toString()).toBe('[[20,1],[30,0]]');
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

    it('should handle zero intensity by creating proper boundaries', () => {
      segments.add(10, 40, 2);
      segments.set(20, 30, 0);
      expect(segments.toString()).toBe('[[10,2],[20,0],[30,2],[40,0]]');
    });

    it('should support setting negative intensity values', () => {
      segments.add(10, 40, 2);
      segments.set(20, 30, -1);
      expect(segments.toString()).toBe('[[10,2],[20,-1],[30,2],[40,0]]');
    });
  });
});
