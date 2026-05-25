/**
 * Financial calculation utilities for the IREN Community Financials app
 */

import { HOURS_PER_YEAR, MONTHS_PER_YEAR } from '../constants/defaults';

/**
 * Calculate net profit for a Colocation site
 * @param {Object} data - Site data
 * @returns {Object} Result with netProfit, revenue, steps, and paybackYears
 */
export const calculateColocationProfit = (data) => {
  const steps = [];

  let itLoad;
  if (data.loadInputMode === 'direct') {
    const itLoadValue = data.itLoad || 0;
    itLoad = data.itLoadUnit === 'GW' ? itLoadValue * 1000 : itLoadValue;
    steps.push(`IT Load: ${itLoad.toFixed(2)} MW`);
  } else {
    const totalLoadValue = data.totalLoadValue || 0;
    const totalLoadMW = data.totalLoadUnit === 'GW' ? totalLoadValue * 1000 : totalLoadValue;
    steps.push(`Total Load: ${totalLoadMW.toFixed(2)} MW`);
    itLoad = totalLoadMW / (data.pue || 1);
    steps.push(`IT Load: ${totalLoadMW.toFixed(2)} MW / ${(data.pue || 1)} = ${itLoad.toFixed(2)} MW`);
  }

  const revenue = itLoad * (data.revenuePerMW || 0);
  steps.push(`Revenue: ${itLoad.toFixed(2)} MW × $${(data.revenuePerMW || 0)}M/MW-yr = $${revenue.toFixed(2)}M/yr`);

  const dcCost = itLoad * (data.dcCostPerMW || 0);
  steps.push(`DC Cost: ${itLoad.toFixed(2)} MW × $${(data.dcCostPerMW || 0)}M/MW = $${dcCost.toFixed(2)}M`);

  const dcDepreciation = dcCost / (data.dcLifetime || 1);
  steps.push(`DC Depreciation: $${dcCost.toFixed(2)}M / ${(data.dcLifetime || 1)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);

  const netProfit = revenue - dcDepreciation;
  steps.push(`Earnings before Tax, SG&A: $${revenue.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

  // Calculate Positive Cashflow Years (out of 20 years)
  // Formula: (Revenue * 20 - DC Cost) / (Revenue * 20) * 20
  // For Colocation: GPU Cost = 0, Interest = 0, Additional Profit = 0
  steps.push('\u00A0');
  steps.push('--- Positive Cashflow ---');
  const revenue20yr = revenue * 20;
  steps.push(`20-Year Revenue: $${revenue.toFixed(2)}M/yr × 20 = $${revenue20yr.toFixed(2)}M`);

  const totalCashflow20yr = revenue20yr - dcCost;
  steps.push(`20-Year Net Cashflow: $${revenue20yr.toFixed(2)}M - $${dcCost.toFixed(2)}M = $${totalCashflow20yr.toFixed(2)}M`);

  const cashflowFraction = revenue20yr > 0 ? totalCashflow20yr / revenue20yr : 0;
  const paybackYears = cashflowFraction * 20;
  steps.push(`Positive Cashflow: ($${totalCashflow20yr.toFixed(2)}M / $${revenue20yr.toFixed(2)}M) × 20 = ${paybackYears.toFixed(1)} out of 20 years`);

  // Payback Period: DC Cost / Annual Revenue
  const paybackPeriod = revenue > 0 ? dcCost / revenue : Infinity;
  steps.push(`Payback Period: $${dcCost.toFixed(2)}M / $${revenue.toFixed(2)}M/yr = ${paybackPeriod.toFixed(1)} years`);

  return { netProfit, revenue, steps, paybackYears, totalCashflow20yr, itLoad, paybackPeriod };
};

/**
 * Calculate monthly amortized payment
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate (decimal)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment amount
 */
const calculateMonthlyPayment = (principal, annualRate, years) => {
  const monthlyRate = annualRate / MONTHS_PER_YEAR;
  const totalMonths = years * MONTHS_PER_YEAR;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
};

/**
 * Calculate total interest over loan term with yearly breakdown
 * @param {number} principal - Loan principal
 * @param {number} annualRate - Annual interest rate (decimal)
 * @param {number} years - Loan term in years
 * @param {Array} steps - Steps array to push calculation details
 * @returns {number} Total interest paid
 */
const calculateTotalInterest = (principal, annualRate, years, steps) => {
  const monthlyRate = annualRate / MONTHS_PER_YEAR;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);

  let remainingBalance = principal;
  let totalInterest = 0;

  for (let year = 1; year <= years; year++) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    const startBalance = remainingBalance;

    // Calculate 12 months of payments
    for (let month = 1; month <= MONTHS_PER_YEAR; month++) {
      const monthInterest = remainingBalance * monthlyRate;
      const monthPrincipal = monthlyPayment - monthInterest;
      yearInterest += monthInterest;
      yearPrincipal += monthPrincipal;
      remainingBalance -= monthPrincipal;
    }

    totalInterest += yearInterest;
    if (steps) {
      steps.push(`Year ${year} - Start Balance: $${startBalance.toFixed(2)}M, Interest: $${yearInterest.toFixed(2)}M, Principal: $${yearPrincipal.toFixed(2)}M`);
    }
  }

  return totalInterest;
};

/**
 * Calculate net profit for a Hyperscaler IaaS site
 * @param {Object} data - Site data
 * @param {Object} gpuPrices - GPU price data
 * @param {Object} gpuHourlyRates - GPU hourly rate data
 * @returns {Object} Result with netProfit, revenue, steps, and paybackYears
 */
export const calculateHyperscalerProfit = (data, gpuPrices, gpuHourlyRates) => {
  const steps = [];

  // Calculate revenue
  const revenue = data.toplineRevenue || 0;
  steps.push(`Base Contract Revenue: $${revenue.toFixed(2)}M`);

  const ebitda = revenue * ((data.ebitdaMargin || 0) / 100);
  steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${(data.ebitdaMargin || 0)}% = $${ebitda.toFixed(2)}M`);

  const ebitdaPerYear = ebitda / (data.contractYears || 1);
  steps.push(`EBITDA/yr: $${ebitda.toFixed(2)}M / ${(data.contractYears || 1)} yrs = $${ebitdaPerYear.toFixed(2)}M/yr`);

  // GPU depreciation
  let totalHardwareCost = 0;
  if (data.hardwareMode === 'total') {
    totalHardwareCost = data.totalHardwareCost || 0;
  } else if (data.hardwareMode === 'gpus') {
    // Calculate hardware cost from all GPU types
    const hyperscaleCount = data.directGpuCount || 0;
    const veraRubinCount = data.veraRubinGpuCount || 0;
    const hyperscaleCost = hyperscaleCount * gpuPrices.hyperscaleBulkGB300 / 1000000;
    const veraRubinCost = veraRubinCount * gpuPrices.veraRubin / 1000000;
    totalHardwareCost = hyperscaleCost + veraRubinCost;
    if (hyperscaleCount > 0) {
      steps.push(`Bulk GB300 - 2025 Pricing: ${hyperscaleCount.toLocaleString()} GPUs × $${gpuPrices.hyperscaleBulkGB300.toLocaleString()} = $${hyperscaleCost.toFixed(2)}M`);
    }
    if (veraRubinCount > 0) {
      steps.push(`Vera Rubin - 2026 Pricing: ${veraRubinCount.toLocaleString()} GPUs × $${gpuPrices.veraRubin.toLocaleString()} = $${veraRubinCost.toFixed(2)}M`);
    }
    steps.push(`Total Hardware Cost: $${totalHardwareCost.toFixed(2)}M`);
  }

  const gpuDepreciation = totalHardwareCost / (data.contractYears || 1);
  steps.push(`GPU Depreciation: $${totalHardwareCost.toFixed(2)}M / ${(data.contractYears || 1)} yrs = $${gpuDepreciation.toFixed(2)}M/yr`);

  // DC depreciation
  let itLoad;
  if (data.loadInputMode === 'direct') {
    const itLoadValue = data.itLoad || 0;
    itLoad = data.itLoadUnit === 'GW' ? itLoadValue * 1000 : itLoadValue;
    steps.push(`IT Load: ${itLoad.toFixed(2)} MW`);
  } else {
    const sizeValue = data.sizeValue || 0;
    const sizeMW = data.sizeUnit === 'GW' ? sizeValue * 1000 : sizeValue;
    itLoad = sizeMW / (data.pue || 1);
    steps.push(`IT Load: ${sizeMW.toFixed(2)} MW / ${(data.pue || 1)} = ${itLoad.toFixed(2)} MW`);
  }

  const dcCost = itLoad * (data.dcCostPerMW || 0);
  const dcDepreciation = dcCost / (data.dcLifetime || 1);
  steps.push(`DC Depreciation: (${itLoad.toFixed(2)} MW × $${(data.dcCostPerMW || 0)}M/MW) / ${(data.dcLifetime || 1)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);

  // Interest calculation - Amortized Monthly Payments
  const prepayment = revenue * ((data.prepaymentPercent || 0) / 100);
  steps.push(`Prepayment: $${revenue.toFixed(2)}M × ${(data.prepaymentPercent || 0)}% = $${prepayment.toFixed(2)}M`);

  const initialDebt = totalHardwareCost - prepayment;
  steps.push(`Initial Debt: $${totalHardwareCost.toFixed(2)}M - $${prepayment.toFixed(2)}M = $${initialDebt.toFixed(2)}M`);

  // Calculate monthly payment using amortization formula
  const annualRate = (data.interestRate || 0) / 100;
  const monthlyPayment = calculateMonthlyPayment(initialDebt, annualRate, data.debtYears || 1);
  const annualPayment = monthlyPayment * MONTHS_PER_YEAR;
  steps.push(`Monthly Payment (Amortized): $${monthlyPayment.toFixed(2)}M/month`);
  steps.push(`Annual Payment: $${annualPayment.toFixed(2)}M/yr`);

  // Calculate interest for each year
  const totalInterest = calculateTotalInterest(initialDebt, annualRate, data.debtYears || 1, steps);
  steps.push(`Total Interest: $${totalInterest.toFixed(2)}M`);

  const interestPerYear = totalInterest / data.debtYears;
  steps.push(`Average Interest/yr: $${totalInterest.toFixed(2)}M / ${data.debtYears} yrs = $${interestPerYear.toFixed(2)}M/yr`);

  const residualValue = totalHardwareCost * (data.residualValue / 100);
  steps.push(`GPU Residual Value: $${totalHardwareCost.toFixed(2)}M × ${data.residualValue}% = $${residualValue.toFixed(2)}M`);

  const residualValuePerYear = residualValue / data.contractYears;
  steps.push(`GPU Residual Value/yr: $${residualValue.toFixed(2)}M / ${data.contractYears} yrs = $${residualValuePerYear.toFixed(2)}M/yr`);

  const netProfit = ebitdaPerYear - gpuDepreciation - dcDepreciation - interestPerYear + residualValuePerYear;
  steps.push(`Earnings before Tax, SG&A: $${ebitdaPerYear.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${interestPerYear.toFixed(2)}M + $${residualValuePerYear.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

  // Calculate annual revenue (divide total contract revenue by contract years)
  const annualRevenue = revenue / (data.contractYears || 1);

  // Calculate Positive Cashflow Years (out of 20 years)
  // Formula: (EBITDA * 4 - GPU Cost * 4 - DC Cost - Total Interest * 4) / EBITDA * 4 * 20
  // Where: EBITDA is 5-year total, × 4 for 20-year projection
  // DC Cost has no multiplier (lasts 20 years)
  steps.push('\u00A0');
  steps.push('--- Positive Cashflow ---');

  const ebitda20yr = ebitda * 4;
  steps.push(`20-Year EBITDA: $${ebitda.toFixed(2)}M × 4 = $${ebitda20yr.toFixed(2)}M`);

  const gpuCost20yr = totalHardwareCost * 4;
  steps.push(`20-Year GPU Cost: $${totalHardwareCost.toFixed(2)}M × 4 = $${gpuCost20yr.toFixed(2)}M`);

  steps.push(`20-Year DC Cost: $${dcCost.toFixed(2)}M `);

  const interest20yr = totalInterest * 4;
  steps.push(`20-Year Interest: $${totalInterest.toFixed(2)}M × 4 = $${interest20yr.toFixed(2)}M`);

  // Calculate residual value for 20 years (4 GPU replacement cycles)
  const residualValue20yr = residualValue * 4;
  steps.push(`20-Year Residual Value: $${residualValue.toFixed(2)}M × 4 = $${residualValue20yr.toFixed(2)}M`);

  const totalCashflow20yr = ebitda20yr - gpuCost20yr - dcCost - interest20yr + residualValue20yr;
  const totalEbitda20yr = ebitda20yr;
  steps.push(`20-Year Net Cashflow: $${ebitda20yr.toFixed(2)}M - $${gpuCost20yr.toFixed(2)}M - $${dcCost.toFixed(2)}M - $${interest20yr.toFixed(2)}M + $${residualValue20yr.toFixed(2)}M = $${totalCashflow20yr.toFixed(2)}M`);

  const cashflowFraction = totalEbitda20yr > 0 ? totalCashflow20yr / totalEbitda20yr : 0;
  const paybackYears = cashflowFraction * 20;
  steps.push(`Positive Cashflow: ($${totalCashflow20yr.toFixed(2)}M / $${totalEbitda20yr.toFixed(2)}M) × 20 = ${paybackYears.toFixed(1)} out of 20 years`);

  // Payback Period: (GPU Cost + DC Cost + Total Interest) / EBITDA/yr
  const totalCosts = totalHardwareCost + dcCost + totalInterest;
  const annualCashflow = ebitdaPerYear;
  const paybackPeriod = annualCashflow > 0 ? totalCosts / annualCashflow : Infinity;
  steps.push(`Payback Period: ($${totalHardwareCost.toFixed(2)}M + $${dcCost.toFixed(2)}M + $${totalInterest.toFixed(2)}M) / $${ebitdaPerYear.toFixed(2)}M/yr = ${paybackPeriod.toFixed(1)} years`);

  return { netProfit, revenue: annualRevenue, steps, paybackYears, totalCashflow20yr, itLoad, paybackPeriod };
};

/**
 * Calculate net profit for an IREN Cloud site
 * @param {Object} data - Site data
 * @param {Object} gpuPrices - GPU price data
 * @returns {Object} Result with netProfit, revenue, steps, and paybackYears
 */
export const calculateIRENCloudProfit = (data, gpuPrices) => {
  const steps = [];

  const revenue = data.toplineRevenue || 0;
  steps.push(`Revenue: $${revenue.toFixed(2)}M`);

  const ebitda = revenue * ((data.ebitdaMargin || 0) / 100);
  steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${(data.ebitdaMargin || 0)}% = $${ebitda.toFixed(2)}M`);

  // GPU depreciation
  const gpus = data.gpus || {};
  const calculatedGpuCost = Object.keys(gpuPrices).reduce((sum, gpuType) => (
    sum + ((gpus[gpuType] || 0) * (gpuPrices[gpuType] || 0) / 1000000)
  ), 0);

  // Apply paid off percentage: reduce cost by the paid off amount
  const gpuPaidOffPercent = data.gpuPaidOffPercent ?? 0;
  const totalGpuCost = calculatedGpuCost * (1 - gpuPaidOffPercent / 100);

  if (gpuPaidOffPercent > 0) {
    steps.push(`Total GPU Cost: $${calculatedGpuCost.toFixed(2)}M × (1 - ${gpuPaidOffPercent}%) = $${totalGpuCost.toFixed(2)}M`);
  } else {
    steps.push(`Total GPU Cost: $${totalGpuCost.toFixed(2)}M`);
  }

  const gpuDepreciation = totalGpuCost / (data.gpuUsefulLife || 1);
  steps.push(`GPU Depreciation: $${totalGpuCost.toFixed(2)}M / ${(data.gpuUsefulLife || 1)} yrs = $${gpuDepreciation.toFixed(2)}M/yr`);

  // Calculate IT Load based on input mode
  let itLoad;
  if (data.loadInputMode === 'direct') {
    const itLoadValue = data.itLoad || 0;
    itLoad = data.itLoadUnit === 'GW' ? itLoadValue * 1000 : itLoadValue;
    steps.push(`IT Load: ${itLoad.toFixed(2)} MW`);
  } else {
    const sizeValue = data.sizeValue || 0;
    const sizeMW = data.sizeUnit === 'GW' ? sizeValue * 1000 : sizeValue;
    itLoad = sizeMW / (data.pue || 1);
    steps.push(`Total Load: ${sizeMW.toFixed(2)} MW`);
    steps.push(`IT Load: ${sizeMW.toFixed(2)} MW / ${(data.pue || 1)} = ${itLoad.toFixed(2)} MW`);
  }

  // DC depreciation
  let dcDepreciation = 0;
  let dcCost = 0;
  if (data.dcType === 'retrofit') {
    dcCost = itLoad * (data.retrofitCapexPerMW || 0);
    dcDepreciation = dcCost / (data.dcLifetime || 20);
    steps.push(`Retrofit Capex: ${itLoad.toFixed(2)} MW × $${(data.retrofitCapexPerMW || 0)}M/MW = $${dcCost.toFixed(2)}M`);
    steps.push(`DC Depreciation (Retrofit): $${dcCost.toFixed(2)}M / ${(data.dcLifetime || 20)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
  } else {
    const dcCostPerMW = data.dcCostPerMW || 0;
    dcCost = itLoad * dcCostPerMW;
    dcDepreciation = dcCost / (data.dcLifetime || 1);
    steps.push(`DC Cost: ${itLoad.toFixed(2)} MW × $${dcCostPerMW}M/MW = $${dcCost.toFixed(2)}M`);
    steps.push(`DC Depreciation: $${dcCost.toFixed(2)}M / ${(data.dcLifetime || 1)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
  }

  // Interest calculation - Amortized Monthly Payments
  const initialDebt = totalGpuCost;
  steps.push(`Initial Debt: $${initialDebt.toFixed(2)}M`);

  // Calculate monthly payment using amortization formula
  const annualRate = (data.interestRate || 0) / 100;
  const monthlyPayment = calculateMonthlyPayment(initialDebt, annualRate, data.debtYears || 1);
  const annualPayment = monthlyPayment * MONTHS_PER_YEAR;
  steps.push(`Monthly Payment (Amortized): $${monthlyPayment.toFixed(2)}M/month`);
  steps.push(`Annual Payment: $${annualPayment.toFixed(2)}M/yr`);

  // Calculate interest for each year with yearly breakdown in steps
  const totalInterest = calculateTotalInterest(initialDebt, annualRate, data.debtYears || 1, steps);

  const averageInterestPerYear = totalInterest / (data.debtYears || 1);
  steps.push(`Average Interest/yr: $${totalInterest.toFixed(2)}M / ${(data.debtYears || 1)} yrs = $${averageInterestPerYear.toFixed(2)}M/yr`);

  const residualValue = totalGpuCost * ((data.residualValue || 0) / 100);
  steps.push(`GPU Residual Value: $${totalGpuCost.toFixed(2)}M × ${(data.residualValue || 0)}% = $${residualValue.toFixed(2)}M`);

  const residualValuePerYear = residualValue / (data.gpuUsefulLife || 1);
  steps.push(`GPU Residual Value/yr: $${residualValue.toFixed(2)}M / ${(data.gpuUsefulLife || 1)} yrs = $${residualValuePerYear.toFixed(2)}M/yr`);

  const netProfit = ebitda - gpuDepreciation - dcDepreciation - averageInterestPerYear + residualValuePerYear;
  steps.push(`Earnings before Tax, SG&A: $${ebitda.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${averageInterestPerYear.toFixed(2)}M + $${residualValuePerYear.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

  // Calculate Positive Cashflow Years (out of 20 years)
  // Formula: (EBITDA * 20 - GPU Cost * 4 - DC Cost - Total Interest * 4) / (EBITDA * 20) * 20
  // Where: EBITDA is annual, × 20 for 20-year projection
  // GPU Cost and Interest × 4 for 4 replacement/debt cycles
  // DC Cost has no multiplier (lasts 20 years)
  steps.push('\u00A0');
  steps.push('--- Positive Cashflow ---');

  const ebitda20yr = ebitda * 20;
  steps.push(`20-Year EBITDA: $${ebitda.toFixed(2)}M/yr × 20 = $${ebitda20yr.toFixed(2)}M`);

  const gpuCost20yr = totalGpuCost * 4;
  steps.push(`20-Year GPU Cost: $${totalGpuCost.toFixed(2)}M × 4 = $${gpuCost20yr.toFixed(2)}M`);

  steps.push(`20-Year DC Cost: $${dcCost.toFixed(2)}M `);

  const interest20yr = totalInterest * 4;
  steps.push(`20-Year Interest: $${totalInterest.toFixed(2)}M × 4 = $${interest20yr.toFixed(2)}M`);

  // Calculate residual value for 20 years (4 GPU replacement cycles)
  const residualValue20yr = residualValue * 4;
  steps.push(`20-Year Residual Value: $${residualValue.toFixed(2)}M × 4 = $${residualValue20yr.toFixed(2)}M`);

  const totalCashflow20yr = ebitda20yr - gpuCost20yr - dcCost - interest20yr + residualValue20yr;
  const totalEbitda20yr = ebitda20yr;
  steps.push(`20-Year Net Cashflow: $${ebitda20yr.toFixed(2)}M - $${gpuCost20yr.toFixed(2)}M - $${dcCost.toFixed(2)}M - $${interest20yr.toFixed(2)}M + $${residualValue20yr.toFixed(2)}M = $${totalCashflow20yr.toFixed(2)}M`);

  const cashflowFraction = totalEbitda20yr > 0 ? totalCashflow20yr / totalEbitda20yr : 0;
  const paybackYears = cashflowFraction * 20;
  steps.push(`Positive Cashflow: ($${totalCashflow20yr.toFixed(2)}M / $${totalEbitda20yr.toFixed(2)}M) × 20 = ${paybackYears.toFixed(1)} out of 20 years`);

  // Payback Period: (GPU Cost + DC Cost + Total Interest) / EBITDA
  const totalCosts = totalGpuCost + dcCost + totalInterest;
  const annualCashflow = ebitda;
  const paybackPeriod = annualCashflow > 0 ? totalCosts / annualCashflow : Infinity;
  steps.push(`Payback Period: ($${totalGpuCost.toFixed(2)}M + $${dcCost.toFixed(2)}M + $${totalInterest.toFixed(2)}M) / $${ebitda.toFixed(2)}M/yr = ${paybackPeriod.toFixed(1)} years`);

  return { netProfit, revenue, steps, paybackYears, totalCashflow20yr, itLoad, paybackPeriod };
};

/**
 * Calculate net profit for a site based on its type
 * @param {Object} site - Site object with type and data
 * @param {Object} gpuPrices - GPU price data
 * @param {Object} gpuHourlyRates - GPU hourly rate data (needed for Hyperscaler)
 * @returns {Object} Result with netProfit, revenue, steps, and paybackYears
 */
export const calculateSiteNetProfit = (site, gpuPrices, gpuHourlyRates) => {
  if (!site.enabled) return { netProfit: 0, revenue: 0, steps: [], paybackYears: 0, totalCashflow20yr: 0, itLoad: 0, paybackPeriod: 0 };

  if (site.type === 'Colocation') {
    return calculateColocationProfit(site.data);
  } else if (site.type === 'Hyperscaler IaaS') {
    return calculateHyperscalerProfit(site.data, gpuPrices, gpuHourlyRates);
  } else if (site.type === 'IREN Cloud') {
    return calculateIRENCloudProfit(site.data, gpuPrices);
  }
  return { netProfit: 0, revenue: 0, steps: [], paybackYears: 0, totalCashflow20yr: 0, itLoad: 0, paybackPeriod: 0 };
};
