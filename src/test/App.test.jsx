import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../App';

describe('IREN Stock Analyzer - Default Inputs (2027 scenario)', () => {
  let container;

  beforeEach(() => {
    const result = render(<App />);
    container = result.container;
  });

  it('should display the selected scenario in the valuation summary heading', () => {
    expect(screen.getByRole('heading', { name: '2027 Valuation Summary' })).toBeInTheDocument();
  });

  it('should display the interactive scenario chart controls', () => {
    expect(screen.getByRole('heading', { name: 'Chart' })).toBeInTheDocument();
    expect(screen.getByLabelText('X Axis')).toHaveValue('year');
    expect(screen.getByLabelText('Y Axis')).toHaveValue('sharePrice');
  });

  it('should display the correct share price of 236.44', () => {
    // Find the share price display in the result-item
    const sharePrice = screen.getByText('Share Price');
    const sharePriceContainer = sharePrice.closest('.result-item');

    // Check if the share price is 236.44
    expect(sharePriceContainer).toHaveTextContent('$236.44');
  });

  it('should display correct Total Annual Revenue of 10.70B/yr', () => {
    // Find the result-grid and get Annual Revenue from it
    const resultGrid = container.querySelector('.result-grid');
    const annualRevenue = within(resultGrid).getByText('Annual Revenue');
    const revenueContainer = annualRevenue.closest('.result-item');

    // Check if the total revenue is 10.70B/yr
    expect(revenueContainer).toHaveTextContent('$10.70B/yr');
  });

  it('should display correct Total Earnings before Tax, SG&A of 3.09B/yr', () => {
    // Find the result-grid and get Earnings before Tax, SG&A from it
    const resultGrid = container.querySelector('.result-grid');
    const earnings = within(resultGrid).getByText('Earnings before Tax, SG&A');
    const earningsContainer = earnings.closest('.result-item');

    // Check if the total earnings is 3.09B/yr
    expect(earningsContainer).toHaveTextContent('$3.09B/yr');
  });

  it('should display correct active MW of 1,210MW', () => {
    const resultGrid = container.querySelector('.result-grid');
    const activeMW = within(resultGrid).getByText('MWs Active');
    const activeMWContainer = activeMW.closest('.result-item');

    expect(activeMWContainer).toHaveTextContent('1,210MW');
  });

  it('should display correct Annual Revenue Split in calculation steps', () => {
    // Check the calc-steps section for revenue split
    const calcSteps = container.querySelector('.calc-steps');

    // Verify all revenue values are present for the 2027 scenario
    expect(calcSteps).toHaveTextContent('Prince George: $500M/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $1.62B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $1.94B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 5-6: $1.17B/yr');
    expect(calcSteps).toHaveTextContent('Childress Block 7-10: $3.53B/yr');
    expect(calcSteps).toHaveTextContent('SW1: $1.95B/yr');
    expect(calcSteps).not.toHaveTextContent('Oklahoma:');
    expect(calcSteps).toHaveTextContent('Total Annual Revenue = $10.70B/yr');
  });

  it('should display correct Earnings before Tax, SG&A Split in calculation steps', () => {
    // Check the calc-steps section for earnings split
    const calcSteps = container.querySelector('.calc-steps');

    // Verify all earnings values are present for the 2027 scenario
    expect(calcSteps).toHaveTextContent('Prince George: $210M/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $595M/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $194M/yr');
    expect(calcSteps).toHaveTextContent('Horizon 5-6: $133M/yr');
    expect(calcSteps).toHaveTextContent('Childress Block 7-10: $1.30B/yr');
    expect(calcSteps).toHaveTextContent('SW1: $659M/yr');
    expect(calcSteps).not.toHaveTextContent('Oklahoma:');
    expect(calcSteps).toHaveTextContent('Total Earnings before Tax, SG&A = $3.09B/yr');
  });

  it('should verify Prince George revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Prince George: $500M/yr');
    expect(calcSteps).toHaveTextContent('Prince George: $210M/yr');
  });

  it('should verify Mackenzie + Canal Flats revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $1.62B/yr');
    expect(calcSteps).toHaveTextContent('Mackenzie + Canal Flats: $595M/yr');
  });

  it('should verify Horizon 1-4 revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $1.94B/yr');
    expect(calcSteps).toHaveTextContent('Horizon 1-4: $194M/yr');
  });

  it('should verify Childress Block 7-10 revenue and earnings', () => {
    const calcSteps = container.querySelector('.calc-steps');
    expect(calcSteps).toHaveTextContent('Childress Block 7-10: $3.53B/yr');
    expect(calcSteps).toHaveTextContent('Childress Block 7-10: $1.30B/yr');
  });

  it('should have 6 sites enabled by default', () => {
    const enabledToggles = container.querySelectorAll('.toggle-switch.enabled');
    // Oklahoma is disabled in the default 2027 scenario
    expect(enabledToggles.length).toBeGreaterThanOrEqual(6);
  });

  it('should display Market Cap of 100.07B', () => {
    const marketCap = screen.getByText('Market Cap');
    const marketCapContainer = marketCap.closest('.result-item');
    expect(marketCapContainer).toHaveTextContent('$100.07B');
  });
});
