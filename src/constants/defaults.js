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
  veraRubin: 1.75, // Multiplier on top of hyperscaler base rate
};

// Calculate base hourly rates from constants
const BASE_HOURLY_RATE = GPU_PRICING_BASE.ANNUAL_REVENUE_BASE / GPU_PRICING_BASE.YEARLY_GPU_HOURS;
const HYPERSCALER_BASE_RATE = GPU_PRICING_BASE.HYPERSCALER_ANNUAL_REVENUE /
  GPU_PRICING_BASE.DAYS_PER_YEAR /
  GPU_PRICING_BASE.HYPERSCALER_GPU_COUNT /
  GPU_PRICING_BASE.HOURS_PER_DAY;

// Default GPU hourly rates
export const DEFAULT_GPU_HOURLY_RATES = {
  veraRubin: 6.89953621879,
  hyperscaleBulkGB300: HYPERSCALER_BASE_RATE,
  gb300: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.gb300,
  b3002026: 4.02472946096,
  b300: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.b300,
  b200: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.b200,
  mi350x: BASE_HOURLY_RATE * GPU_RATE_MULTIPLIERS.mi350x,
};

// Default GPU prices
export const DEFAULT_GPU_PRICES = {
  veraRubin: 120000,
  hyperscaleBulkGB300: 76315.78,
  gb300: 80000,
  b3002026: 70000,
  b300: 61117.21,
  b200: 45952.38,
  mi350x: 42788.92,
};

// Default scenario configuration
export const DEFAULT_SCENARIO = '2027';
export const BASE_2025_SHARES = 352.7;

export const getCurrentSharesFromDilution = (dilutionPercentage) =>
  BASE_2025_SHARES * (1 + (dilutionPercentage || 0) / 100);

export const DEFAULT_SCENARIO_PARAMS = {
  '2025': { peRatio: 50, dilutionPercentage: 0 },
  '2026': { peRatio: 40, dilutionPercentage: 10 },
  '2027': { peRatio: 35, dilutionPercentage: 20 },
  '2028': { peRatio: 30, dilutionPercentage: 30 },
  '2029': { peRatio: 25, dilutionPercentage: 40 },
  '2030': { peRatio: 20, dilutionPercentage: 40 }
};

// Time constants
export const HOURS_PER_YEAR = 24 * 365; // 8760 hours
export const MONTHS_PER_YEAR = 12;
