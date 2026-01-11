/**
 * Default constants and configuration for the IREN Community Financials app
 */

// Base revenue constants from public data
export const NEBIUS_BASE_REVENUE = 17400; // $17.4B Nebius-MSFT contract baseline
export const IREN_MSFT_CONTRACT_RATIO = 0.7335; // IREN-MSFT was ~73.35% of NBIS-MSFT

// GPU pricing calculation base values
// These values are derived from public market data and contract disclosures
export const GPU_PRICING_BASE = {
  // Base calculation factors for hourly rates
  // Formula: (annual_revenue / yearly_gpu_hours) * rate_multiplier
  ANNUAL_REVENUE_BASE: 500000000, // $500M base annual revenue
  YEARLY_GPU_HOURS: 661169760, // Base yearly GPU hours (76k GPUs * 8760 hours)

  // Hyperscaler contract assumptions
  HYPERSCALER_ANNUAL_REVENUE: 1940000000, // $1.94B annual revenue
  HYPERSCALER_GPU_COUNT: 76000, // Reference GPU count for hyperscaler deals
  HOURS_PER_DAY: 24,
  DAYS_PER_YEAR: 365,
};

// Rate multipliers for different GPU types (relative to base)
export const GPU_RATE_MULTIPLIERS = {
  b200: 3.08,
  b300: 3.85,
  gb300: 5.11,
  mi350x: 2.91,
  veraRubinNVL144: 1.75, // Multiplier on top of hyperscaler base rate
};

// Calculate base hourly rates from constants
const BASE_HOURLY_RATE = GPU_PRICING_BASE.ANNUAL_REVENUE_BASE / GPU_PRICING_BASE.YEARLY_GPU_HOURS;
const HYPERSCALER_BASE_RATE = GPU_PRICING_BASE.HYPERSCALER_ANNUAL_REVENUE /
  GPU_PRICING_BASE.DAYS_PER_YEAR /
  GPU_PRICING_BASE.HYPERSCALER_GPU_COUNT /
  GPU_PRICING_BASE.HOURS_PER_DAY;

// Default GPU hourly rates
export const DEFAULT_GPU_HOURLY_RATES = {
  b200: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.b200,
  b300: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.b300,
  gb300: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.gb300,
  mi350x: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.mi350x,
  hyperscaleBulkGB300: HYPERSCALER_BASE_RATE,
  veraRubinNVL144: HYPERSCALER_BASE_RATE * GPU_RATE_MULTIPLIERS.veraRubinNVL144,
};

// Default GPU prices
export const DEFAULT_GPU_PRICES = {
  hyperscaleBulkGB300: 76315.78,
  veraRubinNVL144: 76315.78 * 1.5,
  gb300: 80000,
  b200: 45952.38,
  b300: 61117.21,
  mi350x: 42788.92,
};

// Default scenario configuration
export const DEFAULT_SCENARIO = '2026-h18-sw1';

export const DEFAULT_SCENARIO_PARAMS = {
  'canada': { peRatio: 50, dilutionPercentage: 0, currentShares: 352.7 },
  'canada-h14': { peRatio: 50, dilutionPercentage: 0, currentShares: 352.7 },
  '2027-h110-colo': { peRatio: 30, dilutionPercentage: 15, currentShares: 409.126 },
  '2027-h110-hyperscaler': { peRatio: 30, dilutionPercentage: 60, currentShares: 409.126 },
  '2026-h18-sw1': { peRatio: 40, dilutionPercentage: 15, currentShares: 409.126 }
};

// Time constants
export const HOURS_PER_YEAR = 24 * 365; // 8760 hours
export const MONTHS_PER_YEAR = 12;
