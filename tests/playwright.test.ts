import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('IntensitySegments Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    const testPath = path.join(process.cwd(), 'tests', 'browser-test.html');
    await page.goto(`file://${testPath}`);

    // Wait for library to load
    await page.waitForFunction(() => {
      return typeof (window as any).IntensitySegments !== 'undefined';
    }, { timeout: 5000 });
  });

  test('should run all browser tests successfully', async ({ page }) => {
    // Wait for tests to complete
    const testResults = await page.waitForFunction(() => {
      const results = (window as any).mochaResults;
      return results && results.completed ? results : null;
    }, { timeout: 30000 });

    // Get test results
    const results = await testResults.evaluate(r => r);

    // Validate test results
    expect(results.failures, 'No tests should fail').toBe(0);
    expect(results.total, 'All tests should run').toBeGreaterThan(0);
    expect(results.passes, 'All tests should pass').toBe(results.total);
  });

  test('should handle error cases gracefully', async ({ page }) => {
    // Test invalid time range
    const error = await page.evaluate(() => {
      try {
        const segments = new (window as any).IntensitySegments.IntensitySegments();
        segments.add(10, 5, 1);
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(error).toBe('Invalid range: start time must be less than end time');

    // Test invalid intensity value
    const infinityError = await page.evaluate(() => {
      try {
        const segments = new (window as any).IntensitySegments.IntensitySegments();
        segments.add(0, 10, Infinity);
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(infinityError).toBe('Invalid range: intensity must be a finite number');

    // Test invalid type
    const typeError = await page.evaluate(() => {
      try {
        const segments = new (window as any).IntensitySegments.IntensitySegments();
        // @ts-ignore - Intentionally passing wrong type
        segments.add('0', 10, 1);
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(typeError).toBe('Invalid type: time points must be numbers');
  });
});
