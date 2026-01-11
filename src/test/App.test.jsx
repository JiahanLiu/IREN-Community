import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../App';

describe('IREN Stock Analyzer - Default Inputs (2026-h18-sw1 scenario)', () => {
  let container;

  beforeEach(() => {
    const result = render(<App />);
    container = result.container;
  });

  it('should display the correct share price of 157.60', () => {
    // Find the share price display in the result-item
    const sharePrice = screen.getByText('Share Price');
    const sharePriceContainer = sharePrice.closest('.result-item');

    // Check if the share price is 157.60
    expect(sharePriceContainer).toHaveTextContent('$157.60');
  });

  it('should display correct Total Annual Revenue of 8.95B/yr', () => {
    // Find the result-grid and get Annual Revenue from it
    const resultGrid = container.querySelector('.result-grid');
    const annualRevenue = within(resultGrid).getByText('Annual Revenue');
    const revenueContainer = annualRevenue.closest('.result-item');

    // Check if the total revenue is 8.95B/yr
    expect(revenueContainer).toHaveTextContent('$8.95B/yr');
  });

  it('should display correct Total Earnings before Tax, SG&A of 2.05B/yr', () => {
    // Find the result-grid and get Earnings before Tax, SG&A from it
    const resultGrid = container.querySelector('.result-grid');
    const earnings = within(resultGrid).getByText('Earnings before Tax, SG&A');
    const earningsContainer = earnings.closest('.result-item');

    // Check if the total earnings is 2.05B/yr
    expect(earningsContainer).toHaveTextContent('$2.05B/yr');
  });

  it('should display correct Annual Revenue Split in calculation steps', () => {
    // Check the calc-steps section for revenue split
    const calcSteps = container.querySelector('.calc-steps');

    // Verify all revenue values are present for the 2026-h18-sw1 scenario
    expect(calcSteps).toHaveTextContent('Prince George: $500M/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $1.00B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $1.94B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 5-8: $2.75B/yr');
    expect(calcSteps).toHaveTextContent('SW1: 300MW Hyperscaler: $2.75B/yr');
    expect(calcSteps).toHaveTextContent('Total Annual Revenue = $8.95B/yr');
  });

  it('should display correct Earnings before Tax, SG&A Split in calculation steps', () => {
    // Check the calc-steps section for earnings split
    const calcSteps = container.querySelector('.calc-steps');

    // Verify all earnings values are present for the 2026-h18-sw1 scenario
    expect(calcSteps).toHaveTextContent('Prince George: $217M/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $296M/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $194M/yr');
    expect(calcSteps).toHaveTextContent('Horizon 5-8: $672M/yr');
    expect(calcSteps).toHaveTextContent('SW1: 300MW Hyperscaler: $672M/yr');
    expect(calcSteps).toHaveTextContent('Total Earnings before Tax, SG&A = $2.05B/yr');
  });

  it('should verify Prince George revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Prince George: $500M/yr');
    expect(calcSteps).toHaveTextContent('Prince George: $217M/yr');
  });

  it('should verify Mackenzie + Canal Flats revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $1.00B/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $296M/yr');
  });

  it('should verify Horizon 1-4 revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $1.94B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $194M/yr');
  });

  it('should verify Horizon 5-8 revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Horizon 5-8: $2.75B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 5-8: $672M/yr');
  });

  it('should verify SW1: 300MW Hyperscaler revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('SW1: 300MW Hyperscaler: $2.75B/yr');
    expect(calcSteps).toHaveTextContent('SW1: 300MW Hyperscaler: $672M/yr');
  });

  it('should have all 5 sites enabled by default', () => {
    const enabledToggles = container.querySelectorAll('.toggle-switch.enabled');
    // Each site should have an enabled toggle
    expect(enabledToggles.length).toBeGreaterThanOrEqual(5);
  });

  it('should display Market Cap of 74.15B', () => {
    const marketCap = screen.getByText('Market Cap');
    const marketCapContainer = marketCap.closest('.result-item');
    expect(marketCapContainer).toHaveTextContent('$74.15B');
  });
});
