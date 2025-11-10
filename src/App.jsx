import React, { useState } from 'react';
import './App.css';
import GPUPrices from './components/GPUPrices';
import ColocationSite from './components/ColocationSite';
import HyperscalerSite from './components/HyperscalerSite';
import IRENCloudSite from './components/IRENCloudSite';

function App() {
  // GPU Prices
  const [gpuPrices, setGpuPrices] = useState({
    hyperscaleBulkGB300: 76315.78,
    gb300: 80000,
    b200: 45952.38,
    b300: 61117.21,
    mi350x: 42788.92,
  });

  // Share calculation inputs
  const [useDirectSharesInput, setUseDirectSharesInput] = useState(false);
  const [directShares, setDirectShares] = useState(365.3); // in millions
  const [currentShares, setCurrentShares] = useState(281); // in millions
  const [dilutionPercentage, setDilutionPercentage] = useState(30);
  const [peRatio, setPeRatio] = useState(25);
  const [shareParamsOpen, setShareParamsOpen] = useState(true);
  const [gpuPricesOpen, setGpuPricesOpen] = useState(false);

  // Sites data
  const [sites, setSites] = useState([
    {
      id: 'prince-george',
      name: 'Prince George',
      type: 'IREN Cloud',
      enabled: true,
      accordionOpen: true,
      data: {
        toplineRevenue: 500,
        ebitdaMargin: 85,
        dcType: 'retrofit',
        retrofitCapex: 0,
        gpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        interestCost: 0,
        residualValue: 0,
        siteSize: 100,
        pue: 1.5,
        dcLifetime: 20,
      }
    },
    {
      id: 'mackenzie-canal',
      name: 'Mackenzie + Canal Flats',
      type: 'IREN Cloud',
      enabled: true,
      accordionOpen: true,
      data: {
        toplineRevenue: 1000,
        ebitdaMargin: 85,
        dcType: 'retrofit',
        retrofitCapex: 0,
        gpus: { b300: 19000, b200: 19200, mi350x: 2200, gb300: 2400, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        interestCost: 0,
        residualValue: 0,
        siteSize: 100,
        pue: 1.5,
        dcLifetime: 20,
      }
    },
    {
      id: 'horizon-1-4',
      name: 'Horizon 1-4',
      type: 'Hyperscaler Tenant',
      enabled: true,
      accordionOpen: true,
      data: {
        sizeValue: 200,
        sizeUnit: 'MW',
        pue: 1.5,
        revenueMode: 'direct',
        directGpuCount: 76,
        toplineRevenue: 9700,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'total',
        totalHardwareCost: 5800,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 9.7 / 13.224 * 100,
        contractGapEnabled: false,
      }
    },
    {
      id: 'horizon-5-10',
      name: 'Horizon 5-10',
      type: 'Hyperscaler Tenant',
      enabled: true,
      accordionOpen: true,
      data: {
        sizeValue: 450,
        sizeUnit: 'MW',
        pue: 1.5,
        revenueMode: 'nebius',
        nebiusGpuCount: 114,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'total',
        totalHardwareCost: 5800 * 114 / 76,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 86,
        contractGapEnabled: true,
      }
    },
    {
      id: 'sweetwater-1',
      name: 'Sweetwater 1',
      type: 'Colocation',
      enabled: true,
      accordionOpen: true,
      data: {
        totalLoadValue: 1400,
        totalLoadUnit: 'MW',
        pue: 1.5,
        revenuePerMW: 1.83,
        dcCostPerMW: 15,
        dcLifetime: 20,
      }
    },
    {
      id: 'sweetwater-2',
      name: 'Sweetwater 2',
      type: 'Colocation',
      enabled: false,
      accordionOpen: true,
      data: {
        totalLoadValue: 600,
        totalLoadUnit: 'MW',
        pue: 1.5,
        revenuePerMW: 1.83,
        dcCostPerMW: 15,
        dcLifetime: 20,
      }
    },
  ]);

  const updateSite = (id, newData) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, data: { ...site.data, ...newData } } : site
    ));
  };

  const toggleSite = (id) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, enabled: !site.enabled } : site
    ));
  };

  const toggleSiteAccordion = (id) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, accordionOpen: !site.accordionOpen } : site
    ));
  };

  const expandAll = () => {
    setShareParamsOpen(true);
    setGpuPricesOpen(true);
    setSites(sites.map(site => ({ ...site, accordionOpen: true })));
  };

  const collapseAll = () => {
    setShareParamsOpen(false);
    setGpuPricesOpen(false);
    setSites(sites.map(site => ({ ...site, accordionOpen: false })));
  };

  const deleteSite = (id) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const addSite = (type) => {
    const newId = `site-${Date.now()}`;
    const defaultData = {
      'Colocation': {
        totalLoadValue: 100,
        totalLoadUnit: 'MW',
        pue: 1.5,
        revenuePerMW: 1.83,
        dcCostPerMW: 15,
        dcLifetime: 20,
      },
      'Hyperscaler Tenant': {
        sizeValue: 100,
        sizeUnit: 'MW',
        pue: 1.5,
        revenueMode: 'direct',
        directGpuCount: 0,
        toplineRevenue: 1000,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'total',
        totalHardwareCost: 1000,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 0,
        contractGapEnabled: false,
      },
      'IREN Cloud': {
        toplineRevenue: 500,
        ebitdaMargin: 85,
        dcType: 'retrofit',
        retrofitCapex: 0,
        gpus: { b300: 0, b200: 0, mi350x: 0, gb300: 0, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        interestCost: 0,
        residualValue: 0,
        siteSize: 100,
        pue: 1.5,
        dcLifetime: 20,
      }
    };

    setSites([...sites, {
      id: newId,
      name: `New ${type} Site`,
      type,
      enabled: true,
      accordionOpen: true,
      data: defaultData[type]
    }]);
  };

  // Calculate net profit for each site
  const calculateSiteNetProfit = (site) => {
    if (!site.enabled) return { netProfit: 0, steps: [] };

    if (site.type === 'Colocation') {
      return calculateColocationProfit(site.data);
    } else if (site.type === 'Hyperscaler Tenant') {
      return calculateHyperscalerProfit(site.data);
    } else if (site.type === 'IREN Cloud') {
      return calculateIRENCloudProfit(site.data, gpuPrices);
    }
    return { netProfit: 0, steps: [] };
  };

  const calculateColocationProfit = (data) => {
    const steps = [];
    const totalLoadMW = data.totalLoadUnit === 'GW' ? data.totalLoadValue * 1000 : data.totalLoadValue;
    steps.push(`Total Load: ${totalLoadMW.toFixed(2)} MW`);

    const itLoad = totalLoadMW / data.pue;
    steps.push(`IT Load: ${totalLoadMW.toFixed(2)} MW / ${data.pue} = ${itLoad.toFixed(2)} MW`);

    const revenue = itLoad * data.revenuePerMW;
    steps.push(`Revenue: ${itLoad.toFixed(2)} MW × $${data.revenuePerMW}M/MW-yr = $${revenue.toFixed(2)}M/yr`);

    const dcCost = totalLoadMW * data.dcCostPerMW;
    steps.push(`DC Cost: ${totalLoadMW.toFixed(2)} MW × $${data.dcCostPerMW}M/MW = $${dcCost.toFixed(2)}M`);

    const dcDepreciation = dcCost / data.dcLifetime;
    steps.push(`DC Depreciation: $${dcCost.toFixed(2)}M / ${data.dcLifetime} yrs = $${dcDepreciation.toFixed(2)}M/yr`);

    const netProfit = revenue - dcDepreciation;
    steps.push(`Net Profit: $${revenue.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

    return { netProfit, steps };
  };

  const calculateHyperscalerProfit = (data) => {
    const steps = [];

    // Calculate revenue
    let revenue = 0;
    if (data.revenueMode === 'direct') {
      revenue = data.toplineRevenue;
      steps.push(`Revenue: $${revenue.toFixed(2)}M`);
    } else if (data.revenueMode === 'nebius') {
      const irenMsftBase = 9700; // $9.7B
      revenue = (data.nebiusGpuCount / 76) * irenMsftBase;
      steps.push(`Revenue: (${data.nebiusGpuCount}k / 76k) × $${irenMsftBase}M = $${revenue.toFixed(2)}M`);
    }

    const ebitda = revenue * (data.ebitdaMargin / 100);
    steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${data.ebitdaMargin}% = $${ebitda.toFixed(2)}M`);

    const ebitdaPerYear = ebitda / data.contractYears;
    steps.push(`EBITDA/yr: $${ebitda.toFixed(2)}M / ${data.contractYears} yrs = $${ebitdaPerYear.toFixed(2)}M/yr`);

    // GPU depreciation
    let totalHardwareCost = 0;
    if (data.hardwareMode === 'total') {
      totalHardwareCost = data.totalHardwareCost;
    } else if (data.hardwareMode === 'gpus') {
      const gpus = data.gpus || {};
      totalHardwareCost =
        (gpus.b300 || 0) * gpuPrices.b300 / 1000 +
        (gpus.b200 || 0) * gpuPrices.b200 / 1000 +
        (gpus.mi350x || 0) * gpuPrices.mi350x / 1000 +
        (gpus.gb300 || 0) * gpuPrices.gb300 / 1000 +
        (gpus.hyperscaleBulkGB300 || 0) * gpuPrices.hyperscaleBulkGB300 / 1000;
      steps.push(`Total Hardware Cost: $${totalHardwareCost.toFixed(2)}M`);
    }

    const gpuDepreciation = totalHardwareCost / data.contractYears;
    steps.push(`GPU Depreciation: $${totalHardwareCost.toFixed(2)}M / ${data.contractYears} yrs = $${gpuDepreciation.toFixed(2)}M/yr`);

    // DC depreciation
    const sizeMW = data.sizeUnit === 'GW' ? data.sizeValue * 1000 : data.sizeValue;
    const itLoad = sizeMW / (data.pue || 1);
    const dcCost = sizeMW * data.dcCostPerMW;
    const dcDepreciation = dcCost / data.dcLifetime;
    steps.push(`DC Depreciation: (${sizeMW.toFixed(2)} MW × $${data.dcCostPerMW}M/MW) / ${data.dcLifetime} yrs = $${dcDepreciation.toFixed(2)}M/yr`);

    // Interest calculation - Amortized Monthly Payments
    const prepayment = revenue * (data.prepaymentPercent / 100);
    steps.push(`Prepayment: $${revenue.toFixed(2)}M × ${data.prepaymentPercent}% = $${prepayment.toFixed(2)}M`);

    const initialDebt = totalHardwareCost - prepayment;
    steps.push(`Initial Debt: $${totalHardwareCost.toFixed(2)}M - $${prepayment.toFixed(2)}M = $${initialDebt.toFixed(2)}M`);

    // Calculate monthly payment using amortization formula
    const annualRate = data.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = data.debtYears * 12;
    const monthlyPayment = initialDebt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const annualPayment = monthlyPayment * 12;
    steps.push(`Monthly Payment (Amortized): $${monthlyPayment.toFixed(2)}M/month`);
    steps.push(`Annual Payment: $${annualPayment.toFixed(2)}M/yr`);

    // Calculate interest for each year (aggregated from monthly)
    let remainingBalance = initialDebt;
    let totalInterest = 0;
    for (let year = 1; year <= data.debtYears; year++) {
      let yearInterest = 0;
      let yearPrincipal = 0;
      const startBalance = remainingBalance;

      // Calculate 12 months of payments
      for (let month = 1; month <= 12; month++) {
        const monthInterest = remainingBalance * monthlyRate;
        const monthPrincipal = monthlyPayment - monthInterest;
        yearInterest += monthInterest;
        yearPrincipal += monthPrincipal;
        remainingBalance -= monthPrincipal;
      }

      totalInterest += yearInterest;
      steps.push(`Year ${year} - Start Balance: $${startBalance.toFixed(2)}M, Interest: $${yearInterest.toFixed(2)}M, Principal: $${yearPrincipal.toFixed(2)}M`);
    }
    steps.push(`Total Interest: $${totalInterest.toFixed(2)}M`);

    const interestPerYear = totalInterest / data.debtYears;
    steps.push(`Average Interest/yr: $${totalInterest.toFixed(2)}M / ${data.debtYears} yrs = $${interestPerYear.toFixed(2)}M/yr`);

    const residualValue = totalHardwareCost * (data.residualValue / 100);
    steps.push(`GPU Residual Value: $${totalHardwareCost.toFixed(2)}M × ${data.residualValue}% = $${residualValue.toFixed(2)}M`);

    const residualValuePerYear = residualValue / data.contractYears;
    steps.push(`GPU Residual Value/yr: $${residualValue.toFixed(2)}M / ${data.contractYears} yrs = $${residualValuePerYear.toFixed(2)}M/yr`);

    const baseNetProfit = ebitdaPerYear - gpuDepreciation - dcDepreciation - interestPerYear + residualValuePerYear;
    steps.push(`Base Net Profit: $${ebitdaPerYear.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${interestPerYear.toFixed(2)}M + $${residualValuePerYear.toFixed(2)}M = $${baseNetProfit.toFixed(2)}M/yr`);

    let netProfit = baseNetProfit;

    // Contract Gap to Nebius (only if enabled)
    if (data.contractGapEnabled) {
      steps.push(''); // Empty line for spacing
      steps.push('--- Contract Gap to Nebius ---');

      // Get GPU count (from either direct or nebius mode)
      const gpuCount = data.revenueMode === 'direct' ? (data.directGpuCount || 0) : (data.nebiusGpuCount || 0);

      // GPU Count Prorated Nebius Topline
      const nebiusBase = 17400; // $17.4B
      const gpuCountProratedNebius = (gpuCount / 100) * nebiusBase;
      steps.push(`GPU Count Prorated Nebius Topline: (${gpuCount}k / 100k) × $${nebiusBase}M = $${gpuCountProratedNebius.toFixed(2)}M`);

      // Base Contract Percentage as Percentage of Nebius
      const baseContractPercentage = gpuCountProratedNebius > 0 ? (revenue / gpuCountProratedNebius) * 100 : 0;
      steps.push(`Base Contract Percentage as Percentage of Nebius: ($${revenue.toFixed(2)}M / $${gpuCountProratedNebius.toFixed(2)}M) × 100 = ${baseContractPercentage.toFixed(2)}%`);

      // Improved Contracts Percentage (user input)
      const improvedPercentage = data.improvedContractsPercentage || 0;

      // New Negotiated Topline
      const newRevenue = (gpuCount / 100) * nebiusBase * (improvedPercentage / 100);
      steps.push(`New Negotiated Topline: (${gpuCount}k / 100k) × $${nebiusBase}M × ${improvedPercentage}% = $${newRevenue.toFixed(2)}M`);

      // Additional Profit
      const additionalProfit = newRevenue - revenue;
      steps.push(`Additional Profit: $${newRevenue.toFixed(2)}M - $${revenue.toFixed(2)}M = $${additionalProfit.toFixed(2)}M`);

      // Net Profit (Base Net Profit + Additional Profit)
      netProfit = baseNetProfit + additionalProfit;
      steps.push(`Net Profit: $${baseNetProfit.toFixed(2)}M/yr + $${additionalProfit.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);
    }

    return { netProfit, steps };
  };

  const calculateIRENCloudProfit = (data, prices) => {
    const steps = [];

    const revenue = data.toplineRevenue;
    steps.push(`Revenue: $${revenue.toFixed(2)}M`);

    const ebitda = revenue * (data.ebitdaMargin / 100);
    steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${data.ebitdaMargin}% = $${ebitda.toFixed(2)}M`);

    // GPU depreciation
    const gpus = data.gpus || {};
    const totalGpuCost =
      (gpus.b300 || 0) * prices.b300 / 1000000 +
      (gpus.b200 || 0) * prices.b200 / 1000000 +
      (gpus.mi350x || 0) * prices.mi350x / 1000000 +
      (gpus.gb300 || 0) * prices.gb300 / 1000000 +
      (gpus.hyperscaleBulkGB300 || 0) * prices.hyperscaleBulkGB300 / 1000000;
    steps.push(`Total GPU Cost: $${totalGpuCost.toFixed(2)}M`);

    const gpuDepreciation = totalGpuCost / data.gpuUsefulLife;
    steps.push(`GPU Depreciation: $${totalGpuCost.toFixed(2)}M / ${data.gpuUsefulLife} yrs = $${gpuDepreciation.toFixed(2)}M/yr`);

    // DC depreciation
    let dcDepreciation = 0;
    if (data.dcType === 'retrofit') {
      dcDepreciation = data.retrofitCapex / (data.dcLifetime || 20);
      steps.push(`DC Depreciation (Retrofit): $${data.retrofitCapex}M / ${data.dcLifetime || 20} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
    } else {
      const itLoad = data.siteSize / data.pue;
      const dcCostPerMW = data.dcCostPerMW || 0;
      const dcCost = itLoad * dcCostPerMW;
      dcDepreciation = dcCost / data.dcLifetime;
      steps.push(`IT Load: ${data.siteSize} MW / ${data.pue} = ${itLoad.toFixed(2)} MW`);
      steps.push(`DC Cost: ${itLoad.toFixed(2)} MW × $${dcCostPerMW}M/MW = $${dcCost.toFixed(2)}M`);
      steps.push(`DC Depreciation: $${dcCost.toFixed(2)}M / ${data.dcLifetime} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
    }

    const residualValue = totalGpuCost * (data.residualValue / 100);
    steps.push(`GPU Residual Value: $${totalGpuCost.toFixed(2)}M × ${data.residualValue}% = $${residualValue.toFixed(2)}M`);

    const residualValuePerYear = residualValue / data.gpuUsefulLife;
    steps.push(`GPU Residual Value/yr: $${residualValue.toFixed(2)}M / ${data.gpuUsefulLife} yrs = $${residualValuePerYear.toFixed(2)}M/yr`);

    const netProfit = ebitda - gpuDepreciation - dcDepreciation - data.interestCost + residualValuePerYear;
    steps.push(`Net Profit: $${ebitda.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${data.interestCost}M + $${residualValuePerYear.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

    return { netProfit, steps };
  };

  // Calculate total annual revenue
  const totalAnnualRevenue = sites.reduce((sum, site) => {
    if (!site.enabled) return sum;

    if (site.type === 'Colocation') {
      const totalLoadMW = site.data.totalLoadUnit === 'GW' ? site.data.totalLoadValue * 1000 : site.data.totalLoadValue;
      const itLoad = totalLoadMW / site.data.pue;
      const revenue = itLoad * site.data.revenuePerMW;
      return sum + revenue;
    } else if (site.type === 'Hyperscaler Tenant') {
      let revenue = 0;
      if (site.data.revenueMode === 'direct') {
        revenue = site.data.toplineRevenue;
      } else if (site.data.revenueMode === 'nebius') {
        const irenMsftBase = 9700;
        revenue = (site.data.nebiusGpuCount / 76) * irenMsftBase;
      }
      return sum + revenue;
    } else if (site.type === 'IREN Cloud') {
      return sum + site.data.toplineRevenue;
    }
    return sum;
  }, 0);

  // Calculate total net profits
  const totalNetProfit = sites.reduce((sum, site) => {
    const result = calculateSiteNetProfit(site);
    return sum + result.netProfit;
  }, 0);

  // Calculate market cap
  const marketCap = totalNetProfit * peRatio;

  // Calculate shares
  const fullyDilutedShares = useDirectSharesInput
    ? directShares
    : currentShares * (1 + dilutionPercentage / 100);

  // Calculate share price
  const sharePrice = marketCap / fullyDilutedShares;

  // Helper function to format values (M or B)
  const formatValue = (value, prefix = '$', suffix = '') => {
    if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(2)}B${suffix}`;
    }
    return `${prefix}${value.toFixed(0)}M${suffix}`;
  };

  const formatShares = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}B`;
    }
    return `${value.toFixed(1)}M`;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>IREN Community | Financials</h1>
      </header>

      <div className="container">
        {/* Final Results Section */}
        <div className="results-card">
          <h2>Valuation Summary</h2>
          <div className="result-grid">
            <div className="result-item">
              <label>Share Price</label>
              <div className="result-value highlight">${sharePrice.toFixed(2)}</div>
            </div>
            <div className="result-item">
              <label>Market Cap</label>
              <div className="result-value">{formatValue(marketCap)}</div>
            </div>
            <div className="result-item">
              <label>Fully Diluted Shares</label>
              <div className="result-value">{formatShares(fullyDilutedShares)}</div>
            </div>
            <div className="result-item">
              <label>Annual Revenue</label>
              <div className="result-value">{formatValue(totalAnnualRevenue, '$', '/yr')}</div>
            </div>
            <div className="result-item">
              <label>Annual Net Profit</label>
              <div className="result-value">{formatValue(totalNetProfit, '$', '/yr')}</div>
            </div>
          </div>

          <div className="calc-steps">
            <div>Market Cap = Net Profits × P/E Ratio = {formatValue(totalNetProfit)} × {peRatio} = {formatValue(marketCap)}</div>
            <div>Share Price = Market Cap / Fully Diluted Shares = {formatValue(marketCap)} / {formatShares(fullyDilutedShares)} = ${sharePrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Expand/Collapse All Buttons */}
        <div className="accordion-controls">
          <button onClick={expandAll} className="control-btn">Expand All</button>
          <button onClick={collapseAll} className="control-btn">Collapse All</button>
        </div>

        {/* Share Calculation Inputs */}
        <div className="accordion">
          <div className="accordion-header" onClick={() => setShareParamsOpen(!shareParamsOpen)}>
            <h3>Share Price Calculation Parameters</h3>
            <span className="accordion-icon">{shareParamsOpen ? '−' : '+'}</span>
          </div>

          {shareParamsOpen && (
            <div className="accordion-content">
          <div className="input-row">
            <label>P/E Ratio</label>
            <input
              type="number"
              value={peRatio}
              onChange={(e) => setPeRatio(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onBlur={(e) => setPeRatio(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            />
          </div>

              <div className="input-row">
                <label>Shares Calculation Method</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={!useDirectSharesInput}
                      onChange={() => setUseDirectSharesInput(false)}
                    />
                    Calculate from Current Shares + Dilution
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={useDirectSharesInput}
                      onChange={() => setUseDirectSharesInput(true)}
                    />
                    Direct Input
                  </label>
                </div>
              </div>

              {!useDirectSharesInput ? (
                <>
                  <div className="input-row">
                    <label>Current Shares (millions)</label>
                    <input
                      type="number"
                      value={currentShares}
                      onChange={(e) => setCurrentShares(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onBlur={(e) => setCurrentShares(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="input-row">
                    <label>Dilution Percentage (%)</label>
                    <input
                      type="number"
                      value={dilutionPercentage}
                      onChange={(e) => setDilutionPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onBlur={(e) => setDilutionPercentage(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="calc-steps">
                    Fully Diluted Shares = {currentShares}M × (1 + {dilutionPercentage}%) = {fullyDilutedShares.toFixed(1)}M
                  </div>
                </>
              ) : (
                <div className="input-row">
                  <label>Fully Diluted Shares (millions)</label>
                  <input
                    type="number"
                    value={directShares}
                    onChange={(e) => setDirectShares(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onBlur={(e) => setDirectShares(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* GPU Prices */}
        <GPUPrices prices={gpuPrices} setPrices={setGpuPrices} isOpen={gpuPricesOpen} setIsOpen={setGpuPricesOpen} />

        {/* Sites */}
        <div className="sites-section">
          <div className="sites-header">
            <h3>Sites</h3>
            <div className="add-site-buttons">
              <button onClick={() => addSite('Colocation')}>+ Colocation</button>
              <button onClick={() => addSite('Hyperscaler Tenant')}>+ Hyperscaler</button>
              <button onClick={() => addSite('IREN Cloud')}>+ IREN Cloud</button>
            </div>
          </div>

          {sites.map(site => {
            const result = calculateSiteNetProfit(site);

            return (
              <div key={site.id} className={`site-wrapper ${!site.enabled ? 'disabled' : ''}`}>
                {site.type === 'Colocation' && (
                  <ColocationSite
                    site={site}
                    result={result}
                    updateSite={updateSite}
                    toggleSite={toggleSite}
                    toggleAccordion={toggleSiteAccordion}
                    deleteSite={deleteSite}
                  />
                )}
                {site.type === 'Hyperscaler Tenant' && (
                  <HyperscalerSite
                    site={site}
                    result={result}
                    gpuPrices={gpuPrices}
                    updateSite={updateSite}
                    toggleSite={toggleSite}
                    toggleAccordion={toggleSiteAccordion}
                    deleteSite={deleteSite}
                  />
                )}
                {site.type === 'IREN Cloud' && (
                  <IRENCloudSite
                    site={site}
                    result={result}
                    gpuPrices={gpuPrices}
                    updateSite={updateSite}
                    toggleSite={toggleSite}
                    toggleAccordion={toggleSiteAccordion}
                    deleteSite={deleteSite}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

