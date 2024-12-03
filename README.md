# Intensity Segments Manager

[![CI](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml/badge.svg)](https://github.com/h1bomb/intensity-segments/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/h1bomb/intensity-segments/graph/badge.svg?token=1DP6kKsrGG)](https://codecov.io/github/h1bomb/intensity-segments)
[![npm version](https://badge.fury.io/js/intensity-segments.svg)](https://badge.fury.io/js/intensity-segments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [简体中文](./README.zh-CN.md)

A TypeScript library for managing intensity segments over a timeline. This library provides a robust way to handle overlapping intensity changes and maintain a clean, efficient representation of intensity values over time.

## Features

- Add intensity changes to specific time ranges
- Set absolute intensity values for time ranges
- Handle overlapping segments automatically
- Maintain efficient segment representation
- Support for positive and negative intensity values

## Installation

```bash
npm install intensity-segments
```

## Usage

```typescript
import { IntensitySegments } from 'intensity-segments';

// Create a new instance
const segments = new IntensitySegments();

// Add intensity to a range
segments.add(10, 20, 2);  // Adds intensity of 2 from time 10 to 20

// Set intensity for a range
segments.set(15, 25, 3);  // Sets intensity to 3 from time 15 to 25

// Get string representation
console.log(segments.toString());  // Shows current segments
```

## Implementation Details

### Data Structure

The `IntensitySegments` class uses an array of `[point, intensity]` pairs to represent intensity changes over time. Each pair represents:
- `point`: The starting point of a segment
- `intensity`: The intensity value for that segment

For example, `[[0, 1], [10, 2], [20, 0]]` represents:
- Intensity of 1 from point 0 to 10
- Intensity of 2 from point 10 to 20
- Intensity of 0 after point 20

### Key Methods

#### add(from: number, to: number, amount: number)

Adds an intensity change to a specified range:
1. Converts existing segments to point changes
2. Adds new intensity changes
3. Recalculates all segments

Example:
```typescript
// Initial state: [[0, 1], [10, 0]]
segments.add(5, 15, 2);
// Result: [[0, 1], [5, 3], [10, 2], [15, 0]]
```

#### set(from: number, to: number, amount: number)

Sets absolute intensity for a range:
1. Preserves segments before the range
2. Sets new intensity for the range
3. Preserves segments after the range
4. Normalizes the resulting segments

Example:
```typescript
// Initial state: [[0, 1], [10, 2], [20, 1]]
segments.set(5, 15, 3);
// Result: [[0, 1], [5, 3], [15, 1], [20, 0]]
```

### Optimization Features

1. **Zero Handling**
   - Removes unnecessary zero-intensity segments
   - Preserves zero segments when they represent meaningful transitions

2. **Segment Merging**
   - Automatically merges adjacent segments with the same intensity
   - Removes redundant points

3. **Edge Cases**
   - Handles overlapping segments correctly
   - Supports negative intensity values
   - Maintains proper segment boundaries

## Example Scenarios

### 1. Adding Overlapping Intensities

```typescript
const segments = new IntensitySegments();
segments.add(0, 10, 1);   // [[0, 1], [10, 0]]
segments.add(5, 15, 2);   // [[0, 1], [5, 3], [10, 2], [15, 0]]
```

### 2. Setting Intensities

```typescript
const segments = new IntensitySegments();
segments.add(0, 20, 1);   // [[0, 1], [20, 0]]
segments.set(10, 30, 2);  // [[0, 1], [10, 2], [30, 0]]
```

### 3. Cancelling Out Intensities

```typescript
const segments = new IntensitySegments();
segments.add(0, 10, 2);    // [[0, 2], [10, 0]]
segments.add(0, 10, -2);   // Empty result (all zeros removed)
```




## Development

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run build
npm run build
```

## Project Structure

```
.
├── src/           # Source files
├── tests/         # Test files
├── dist/          # Compiled files
├── package.json   # Project configuration
└── README.md      # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.