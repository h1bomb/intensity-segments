import { IntensitySegments } from './IntensitySegments';

let segments = new IntensitySegments();
console.log(segments.toString()); // Should be "[]"
segments.add(10, 30, 1);
console.log(segments.toString()); // Should be: "[[10,1],[30,0]]"
segments.add(20, 40, 1);
console.log(segments.toString()); // Should be: "[[10,1],[20,2],[30,1],[40,0]]"
segments.add(10, 40, -2);
console.log(segments.toString()); // Should be: "[[10,-1],[20,0],[30,-1],[40,0]]"

// Another example sequence:
segments = new IntensitySegments();
console.log(segments.toString()); // Should be "[]"
segments.add(10, 30, 1);
console.log(segments.toString()); // Should be "[[10,1],[30,0]]"
segments.add(20, 40, 1);
console.log(segments.toString()); // Should be "[[10,1],[20,2],[30,1],[40,0]]"
segments.add(10, 40, -1);
console.log(segments.toString()); // Should be "[[20,1],[30,0]]"
segments.add(10, 40, -1);
console.log(segments.toString()); // Should be "[[10,-1],[20,0],[30,-1],[40,0]]"

