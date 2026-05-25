import { describe, expect, it } from 'vitest';
import { DEFAULT_GPU_HOURLY_RATES, DEFAULT_GPU_PRICES } from '../constants/defaults';

describe('default GPU pricing', () => {
  it('keeps B300 2025 pricing and adds B300 2026 pricing', () => {
    expect(DEFAULT_GPU_PRICES.b300).toBe(61117.21);
    expect(DEFAULT_GPU_HOURLY_RATES.b300).toBeCloseTo(2.9128727151638896);

    expect(DEFAULT_GPU_PRICES.b3002026).toBe(70000);
    expect(DEFAULT_GPU_HOURLY_RATES.b3002026).toBe(4.02472946096);
  });

  it('sets Vera Rubin 2026 pricing', () => {
    expect(DEFAULT_GPU_PRICES.veraRubin).toBe(120000);
    expect(DEFAULT_GPU_HOURLY_RATES.veraRubin).toBe(6.89953621879);
  });

  it('orders GPU pricing controls by default display order', () => {
    expect(Object.keys(DEFAULT_GPU_PRICES)).toEqual([
      'veraRubin',
      'hyperscaleBulkGB300',
      'gb300',
      'b3002026',
      'b300',
      'b200',
      'mi350x',
    ]);
    expect(Object.keys(DEFAULT_GPU_HOURLY_RATES)).toEqual(Object.keys(DEFAULT_GPU_PRICES));
  });
});
