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
  const [peRatio, setPeRatio] = useState(30);
  const [corporateTaxRate, setCorporateTaxRate] = useState(21); // percentage
  const [taxAbatementRate, setTaxAbatementRate] = useState(85); // percentage
  const [sgaExpense, setSgaExpense] = useState(138); // in millions
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
        loadInputMode: 'total',
        sizeValue: 50,
        sizeUnit: 'MW',
        itLoad: 45.45,
        itLoadUnit: 'MW',
        pue: 1.1,
        retrofitCapexPerMW: 0,
        dcLifetime: 20,
        gpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        debtPercent: 0,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
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
        loadInputMode: 'total',
        sizeValue: 110,
        sizeUnit: 'MW',
        itLoad: 100,
        itLoadUnit: 'MW',
        pue: 1.1,
        retrofitCapexPerMW: 0,
        dcLifetime: 20,
        gpus: { b300: 19000, b200: 19200, mi350x: 2200, gb300: 2400, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        debtPercent: 0,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
      }
    },
    {
      id: 'horizon-1-4',
      name: 'Horizon 1-4',
      type: 'Hyperscaler Tenant',
      enabled: true,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        sizeValue: 300,
        sizeUnit: 'MW',
        itLoad: 200,
        itLoadUnit: 'MW',
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
        loadInputMode: 'total',
        sizeValue: 450,
        sizeUnit: 'MW',
        itLoad: 300,
        itLoadUnit: 'MW',
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
        loadInputMode: 'total',
        totalLoadValue: 1400,
        totalLoadUnit: 'MW',
        itLoad: 933.33,
        itLoadUnit: 'MW',
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
        loadInputMode: 'total',
        totalLoadValue: 600,
        totalLoadUnit: 'MW',
        itLoad: 400,
        itLoadUnit: 'MW',
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

  const downloadCSV = () => {
    const data = {
      gpuPrices,
      useDirectSharesInput,
      directShares,
      currentShares,
      dilutionPercentage,
      peRatio,
      corporateTaxRate,
      taxAbatementRate,
      sgaExpense,
      sites: sites.map(site => ({
        id: site.id,
        name: site.name,
        type: site.type,
        enabled: site.enabled,
        data: site.data
      }))
    };

    const csvContent = JSON.stringify(data, null, 2);
    const blob = new Blob([csvContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iren-financials-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const uploadCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Update GPU prices if present
        if (data.gpuPrices) {
          setGpuPrices({
            hyperscaleBulkGB300: data.gpuPrices.hyperscaleBulkGB300 ?? gpuPrices.hyperscaleBulkGB300,
            gb300: data.gpuPrices.gb300 ?? gpuPrices.gb300,
            b200: data.gpuPrices.b200 ?? gpuPrices.b200,
            b300: data.gpuPrices.b300 ?? gpuPrices.b300,
            mi350x: data.gpuPrices.mi350x ?? gpuPrices.mi350x,
          });
        }

        // Update share calculation parameters if present
        if (data.useDirectSharesInput !== undefined) setUseDirectSharesInput(data.useDirectSharesInput);
        if (data.directShares !== undefined) setDirectShares(data.directShares);
        if (data.currentShares !== undefined) setCurrentShares(data.currentShares);
        if (data.dilutionPercentage !== undefined) setDilutionPercentage(data.dilutionPercentage);
        if (data.peRatio !== undefined) setPeRatio(data.peRatio);
        if (data.corporateTaxRate !== undefined) setCorporateTaxRate(data.corporateTaxRate);
        if (data.taxAbatementRate !== undefined) setTaxAbatementRate(data.taxAbatementRate);
        if (data.sgaExpense !== undefined) setSgaExpense(data.sgaExpense);

        // Update sites if present
        if (data.sites && Array.isArray(data.sites)) {
          setSites(data.sites.map(site => ({
            ...site,
            accordionOpen: site.accordionOpen ?? true,
            data: { ...site.data }
          })));
        }

        alert('Configuration loaded successfully!');
      } catch (error) {
        alert('Error loading configuration file. Please check the file format.');
        console.error('Upload error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const deleteSite = (id) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const addSite = (type) => {
    const newId = `site-${Date.now()}`;
    const defaultData = {
      'Colocation': {
        loadInputMode: 'total',
        totalLoadValue: 100,
        totalLoadUnit: 'MW',
        itLoad: 66.67,
        itLoadUnit: 'MW',
        pue: 1.5,
        revenuePerMW: 1.83,
        dcCostPerMW: 15,
        dcLifetime: 20,
      },
      'Hyperscaler Tenant': {
        loadInputMode: 'total',
        sizeValue: 100,
        sizeUnit: 'MW',
        itLoad: 66.67,
        itLoadUnit: 'MW',
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
        loadInputMode: 'total',
        sizeValue: 50,
        sizeUnit: 'MW',
        itLoad: 45.45,
        itLoadUnit: 'MW',
        pue: 1.1,
        retrofitCapexPerMW: 0,
        dcLifetime: 20,
        gpus: { b300: 0, b200: 0, mi350x: 0, gb300: 0, hyperscaleBulkGB300: 0 },
        gpuUsefulLife: 5,
        debtPercent: 80,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
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
    if (!site.enabled) return { netProfit: 0, revenue: 0, steps: [] };

    if (site.type === 'Colocation') {
      return calculateColocationProfit(site.data);
    } else if (site.type === 'Hyperscaler Tenant') {
      return calculateHyperscalerProfit(site.data);
    } else if (site.type === 'IREN Cloud') {
      return calculateIRENCloudProfit(site.data, gpuPrices);
    }
    return { netProfit: 0, revenue: 0, steps: [] };
  };

  const calculateColocationProfit = (data) => {
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

    return { netProfit, revenue, steps };
  };

  const calculateHyperscalerProfit = (data) => {
    const steps = [];

    // Calculate revenue
    let revenue = 0;
    if (data.revenueMode === 'direct') {
      revenue = data.toplineRevenue || 0;
      steps.push(`Base Revenue: $${revenue.toFixed(2)}M`);
    } else if (data.revenueMode === 'nebius') {
      const irenMsftBase = 9700; // $9.7B
      revenue = ((data.nebiusGpuCount || 0) / 76) * irenMsftBase;
      steps.push(`Base Revenue: (${(data.nebiusGpuCount || 0)}k / 76k) × $${irenMsftBase}M = $${revenue.toFixed(2)}M`);
    }

    const ebitda = revenue * ((data.ebitdaMargin || 0) / 100);
    steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${(data.ebitdaMargin || 0)}% = $${ebitda.toFixed(2)}M`);

    const ebitdaPerYear = ebitda / (data.contractYears || 1);
    steps.push(`EBITDA/yr: $${ebitda.toFixed(2)}M / ${(data.contractYears || 1)} yrs = $${ebitdaPerYear.toFixed(2)}M/yr`);

    // GPU depreciation
    let totalHardwareCost = 0;
    if (data.hardwareMode === 'total') {
      totalHardwareCost = data.totalHardwareCost || 0;
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
    const monthlyRate = annualRate / 12;
    const totalMonths = (data.debtYears || 1) * 12;
    const monthlyPayment = initialDebt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const annualPayment = monthlyPayment * 12;
    steps.push(`Monthly Payment (Amortized): $${monthlyPayment.toFixed(2)}M/month`);
    steps.push(`Annual Payment: $${annualPayment.toFixed(2)}M/yr`);

    // Calculate interest for each year (aggregated from monthly)
    let remainingBalance = initialDebt;
    let totalInterest = 0;
    for (let year = 1; year <= (data.debtYears || 1); year++) {
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
    steps.push(`Base Earnings before Tax, SG&A: $${ebitdaPerYear.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${interestPerYear.toFixed(2)}M + $${residualValuePerYear.toFixed(2)}M = $${baseNetProfit.toFixed(2)}M/yr`);

    let netProfit = baseNetProfit;
    let totalRevenue = revenue; // Track total revenue (base + additional if applicable)

    // Contract Gap Closer to Nebius (only if enabled)
    if (data.contractGapEnabled) {
      steps.push(''); // Empty line for spacing
      steps.push('--- Contract Gap Closer to Nebius ---');

      // Get GPU count (from either direct or nebius mode)
      const gpuCount = data.revenueMode === 'direct' ? (data.directGpuCount || 0) : (data.nebiusGpuCount || 0);

      // GPU Count Prorated Nebius Topline
      const nebiusBase = 17400; // $17.4B
      const gpuCountProratedNebius = (gpuCount / 100) * nebiusBase;
      steps.push(`GPU Count Prorated Nebius Topline: (${gpuCount}k / 100k) × $${nebiusBase}M = $${gpuCountProratedNebius.toFixed(2)}M`);

      // Improved Contracts Percentage (user input)
      const improvedPercentage = data.improvedContractsPercentage || 0;

      // New Negotiated Topline
      const newRevenue = gpuCountProratedNebius * (improvedPercentage / 100);
      steps.push(`New Negotiated Topline: $${gpuCountProratedNebius.toFixed(2)}M × ${improvedPercentage}% = $${newRevenue.toFixed(2)}M`);

      // Additional Profit (5yrs)
      const additionalProfit5yrs = newRevenue - revenue;
      steps.push(`Additional Profit (5yrs): New Negotiated Topline - Base Revenue = $${newRevenue.toFixed(2)}M - $${revenue.toFixed(2)}M = $${additionalProfit5yrs.toFixed(2)}M`);

      // Additional Profit (annual)
      const additionalProfit = additionalProfit5yrs / 5;
      steps.push(`Additional Profit: Additional Profit (5yrs) / 5 = $${additionalProfit5yrs.toFixed(2)}M / 5 = $${additionalProfit.toFixed(2)}M/yr`);

      // Net Profit (Base Net Profit + Additional Profit)
      netProfit = baseNetProfit + additionalProfit;
      steps.push(`Earnings before Tax, SG&A: Base Earnings before Tax, SG&A + Additional Profit = $${baseNetProfit.toFixed(2)}M/yr + $${additionalProfit.toFixed(2)}M/yr = $${netProfit.toFixed(2)}M/yr`);

      // Update total revenue to include additional profit
      totalRevenue = revenue + additionalProfit5yrs;
      steps.push(`Revenue: Base Revenue + Additional Profit (5yrs) = $${revenue.toFixed(2)}M + $${additionalProfit5yrs.toFixed(2)}M = $${totalRevenue.toFixed(2)}M`);
    }

    // Calculate annual revenue (divide total contract revenue by contract years)
    const annualRevenue = totalRevenue / (data.contractYears || 1);

    return { netProfit, revenue: annualRevenue, steps };
  };

  const calculateIRENCloudProfit = (data, prices) => {
    const steps = [];

    const revenue = data.toplineRevenue || 0;
    steps.push(`Revenue: $${revenue.toFixed(2)}M`);

    const ebitda = revenue * ((data.ebitdaMargin || 0) / 100);
    steps.push(`EBITDA: $${revenue.toFixed(2)}M × ${(data.ebitdaMargin || 0)}% = $${ebitda.toFixed(2)}M`);

    // GPU depreciation
    const gpus = data.gpus || {};
    const totalGpuCost =
      (gpus.b300 || 0) * prices.b300 / 1000000 +
      (gpus.b200 || 0) * prices.b200 / 1000000 +
      (gpus.mi350x || 0) * prices.mi350x / 1000000 +
      (gpus.gb300 || 0) * prices.gb300 / 1000000 +
      (gpus.hyperscaleBulkGB300 || 0) * prices.hyperscaleBulkGB300 / 1000000;
    steps.push(`Total GPU Cost: $${totalGpuCost.toFixed(2)}M`);

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
    if (data.dcType === 'retrofit') {
      const retrofitCapex = itLoad * (data.retrofitCapexPerMW || 0);
      dcDepreciation = retrofitCapex / (data.dcLifetime || 20);
      steps.push(`Retrofit Capex: ${itLoad.toFixed(2)} MW × $${(data.retrofitCapexPerMW || 0)}M/MW = $${retrofitCapex.toFixed(2)}M`);
      steps.push(`DC Depreciation (Retrofit): $${retrofitCapex.toFixed(2)}M / ${(data.dcLifetime || 20)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
    } else {
      const dcCostPerMW = data.dcCostPerMW || 0;
      const dcCost = itLoad * dcCostPerMW;
      dcDepreciation = dcCost / (data.dcLifetime || 1);
      steps.push(`DC Cost: ${itLoad.toFixed(2)} MW × $${dcCostPerMW}M/MW = $${dcCost.toFixed(2)}M`);
      steps.push(`DC Depreciation: $${dcCost.toFixed(2)}M / ${(data.dcLifetime || 1)} yrs = $${dcDepreciation.toFixed(2)}M/yr`);
    }

    // Interest calculation - Amortized Monthly Payments
    const initialDebt = totalGpuCost * ((data.debtPercent || 0) / 100);
    steps.push(`Initial Debt: $${totalGpuCost.toFixed(2)}M × ${(data.debtPercent || 0)}% = $${initialDebt.toFixed(2)}M`);

    // Calculate monthly payment using amortization formula
    const annualRate = (data.interestRate || 0) / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = (data.debtYears || 1) * 12;
    const monthlyPayment = initialDebt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const annualPayment = monthlyPayment * 12;
    steps.push(`Monthly Payment (Amortized): $${monthlyPayment.toFixed(2)}M/month`);
    steps.push(`Annual Payment: $${annualPayment.toFixed(2)}M/yr`);

    // Calculate interest for each year (aggregated from monthly)
    let remainingBalance = initialDebt;
    let totalInterest = 0;
    for (let year = 1; year <= (data.debtYears || 1); year++) {
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
      steps.push(`Year ${year}: Interest = $${yearInterest.toFixed(2)}M, Principal = $${yearPrincipal.toFixed(2)}M, Ending Balance = $${remainingBalance.toFixed(2)}M`);
    }

    const averageInterestPerYear = totalInterest / (data.debtYears || 1);
    steps.push(`Average Interest/yr: $${totalInterest.toFixed(2)}M / ${(data.debtYears || 1)} yrs = $${averageInterestPerYear.toFixed(2)}M/yr`);

    const residualValue = totalGpuCost * ((data.residualValue || 0) / 100);
    steps.push(`GPU Residual Value: $${totalGpuCost.toFixed(2)}M × ${(data.residualValue || 0)}% = $${residualValue.toFixed(2)}M`);

    const residualValuePerYear = residualValue / (data.gpuUsefulLife || 1);
    steps.push(`GPU Residual Value/yr: $${residualValue.toFixed(2)}M / ${(data.gpuUsefulLife || 1)} yrs = $${residualValuePerYear.toFixed(2)}M/yr`);

    const netProfit = ebitda - gpuDepreciation - dcDepreciation - averageInterestPerYear + residualValuePerYear;
    steps.push(`Earnings before Tax, SG&A: $${ebitda.toFixed(2)}M - $${gpuDepreciation.toFixed(2)}M - $${dcDepreciation.toFixed(2)}M - $${averageInterestPerYear.toFixed(2)}M + $${residualValuePerYear.toFixed(2)}M = $${netProfit.toFixed(2)}M/yr`);

    return { netProfit, revenue, steps };
  };

  // Calculate total annual revenue
  const totalAnnualRevenue = sites.reduce((sum, site) => {
    const result = calculateSiteNetProfit(site);
    return sum + result.revenue;
  }, 0);

  // Calculate total net profits
  const totalNetProfit = sites.reduce((sum, site) => {
    const result = calculateSiteNetProfit(site);
    return sum + result.netProfit;
  }, 0);

  // Calculate pre-tax net profits
  const preTaxNetProfits = totalNetProfit - (sgaExpense || 0);

  // Calculate taxes
  const corporateTax = preTaxNetProfits * ((corporateTaxRate || 0) / 100);
  const taxAbatement = corporateTax * ((taxAbatementRate || 0) / 100);
  const taxes = corporateTax - taxAbatement;

  // Calculate net profit after taxes
  const netProfit = preTaxNetProfits - taxes;

  // Calculate market cap
  const marketCap = netProfit * (peRatio || 0);

  // Calculate shares
  const fullyDilutedShares = useDirectSharesInput
    ? (directShares || 0)
    : (currentShares || 0) * (1 + (dilutionPercentage || 0) / 100);

  // Calculate share price
  const sharePrice = fullyDilutedShares > 0 ? marketCap / fullyDilutedShares : 0;

  // Helper function to format values (M or B)
  const formatValue = (value, prefix = '$', suffix = '') => {
    const numValue = Number(value) || 0;
    if (!isFinite(numValue)) return `${prefix}0M${suffix}`;
    if (numValue >= 1000) {
      return `${prefix}${(numValue / 1000).toFixed(2)}B${suffix}`;
    }
    return `${prefix}${numValue.toFixed(0)}M${suffix}`;
  };

  const formatShares = (value) => {
    const numValue = Number(value) || 0;
    if (!isFinite(numValue)) return '0M';
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(2)}B`;
    }
    return `${numValue.toFixed(1)}M`;
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
              <div className="result-value highlight">${(Number(sharePrice) || 0).toFixed(2)}</div>
            </div>
            <div className="result-item">
              <label>Market Cap</label>
              <div className="result-value">{formatValue(marketCap)}</div>
            </div>
            <div className="result-item">
              <label>Annual Revenue</label>
              <div className="result-value">{formatValue(totalAnnualRevenue, '$', '/yr')}</div>
            </div>
            <div className="result-item">
              <label>Earnings before Tax, SG&A</label>
              <div className="result-value">{formatValue(totalNetProfit, '$', '/yr')}</div>
            </div>
          </div>

          <div className="calc-steps">
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Annual Revenue Split:</div>
            {sites.filter(site => site.enabled).map(site => {
              const result = calculateSiteNetProfit(site);
              return (
                <div key={site.id}>
                  {site.name}: {formatValue(result.revenue)}/yr
                </div>
              );
            })}
            <div style={{ marginTop: '0.5rem' }}>Total Annual Revenue = {formatValue(totalAnnualRevenue)}/yr</div>

            <div style={{ fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>Earnings before Tax, SG&A Split:</div>
            {sites.filter(site => site.enabled).map(site => {
              const result = calculateSiteNetProfit(site);
              return (
                <div key={site.id}>
                  {site.name}: {formatValue(result.netProfit)}/yr
                </div>
              );
            })}
            <div style={{ marginTop: '0.5rem' }}>Total Earnings before Tax, SG&A = {formatValue(totalNetProfit)}/yr</div>

            <div style={{ fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>Net Profit and Share Price Calculations:</div>
            <div>Pre-tax Net Profits = Earnings before Tax, SG&A - SG&A = {formatValue(totalNetProfit)} - {formatValue(sgaExpense)} = {formatValue(preTaxNetProfits)}</div>
            <div>Corporate Tax = Pre-tax Net Profits × Corporate Tax Rate = {formatValue(preTaxNetProfits)} × {corporateTaxRate}% = {formatValue(corporateTax)}</div>
            <div>Tax Abatement and Tax Loss Realization = Corporate Tax × Tax Abatement and Tax Loss Realization Rate = {formatValue(corporateTax)} × {taxAbatementRate}% = {formatValue(taxAbatement)}</div>
            <div>Taxes = Corporate Tax - Tax Abatement and Tax Loss Realization = {formatValue(corporateTax)} - {formatValue(taxAbatement)} = {formatValue(taxes)}</div>
            <div>Net Profit = Pre-tax Net Profits - Taxes = {formatValue(preTaxNetProfits)} - {formatValue(taxes)} = {formatValue(netProfit)}</div>
            <div>Market Cap = Net Profit × P/E Ratio = {formatValue(netProfit)} × {peRatio} = {formatValue(marketCap)}</div>
            <div>Share Price = Market Cap / Fully Diluted Shares = {formatValue(marketCap)} / {formatShares(fullyDilutedShares)} = ${(Number(sharePrice) || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Expand/Collapse All Buttons */}
        <div className="accordion-controls">
          <div className="control-btn-left">
            <button onClick={expandAll} className="control-btn">Expand All</button>
            <button onClick={collapseAll} className="control-btn">Collapse All</button>
          </div>
          <div className="control-btn-right">
            <button onClick={downloadCSV} className="control-btn">Download Inputs</button>
            <button onClick={() => document.getElementById('file-upload').click()} className="control-btn">Upload Inputs</button>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={uploadCSV}
              style={{ display: 'none' }}
            />
          </div>
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
            <label>Corporate Tax Rate (%)</label>
            <input
              type="number"
              value={corporateTaxRate}
              onChange={(e) => setCorporateTaxRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onBlur={(e) => setCorporateTaxRate(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="input-row">
            <label>Tax Abatement Rate and Tax Loss Realization (%)</label>
            <input
              type="number"
              value={taxAbatementRate}
              onChange={(e) => setTaxAbatementRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onBlur={(e) => setTaxAbatementRate(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="input-row">
            <label>SG&A Expense ($M)</label>
            <input
              type="number"
              value={sgaExpense}
              onChange={(e) => setSgaExpense(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onBlur={(e) => setSgaExpense(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            />
          </div>

              <div className="input-row">
                <label>Shares Calculation Method</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={!useDirectSharesInput}
                      onChange={() => {
                        setUseDirectSharesInput(false);
                        // Calculate dilution percentage from direct shares
                        if (currentShares > 0) {
                          const calculatedDilution = ((directShares / currentShares) - 1) * 100;
                          setDilutionPercentage(Math.max(0, calculatedDilution));
                        }
                      }}
                    />
                    Calculate from Current Shares + Dilution
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={useDirectSharesInput}
                      onChange={() => {
                        setUseDirectSharesInput(true);
                        // Calculate direct shares from current shares and dilution
                        const calculatedShares = currentShares * (1 + dilutionPercentage / 100);
                        setDirectShares(calculatedShares);
                      }}
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

