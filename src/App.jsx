import React, { useState } from 'react';
import './App.css';
import GPUPrices from './components/GPUPrices';
import ColocationSite from './components/ColocationSite';
import HyperscalerSite from './components/HyperscalerSite';
import IRENCloudSite from './components/IRENCloudSite';
import packageJson from '../package.json';
import { formatValue, formatShares } from './utils/formatters';
import { calculateSiteNetProfit } from './utils/calculations';
import {
  DEFAULT_SCENARIO,
  DEFAULT_SCENARIO_PARAMS,
  DEFAULT_GPU_PRICES,
  DEFAULT_GPU_HOURLY_RATES
} from './constants/defaults';

function App() {
  // GPU Prices
  const [gpuPrices, setGpuPrices] = useState(DEFAULT_GPU_PRICES);

  // GPU Hourly Rates
  const [gpuHourlyRates, setGpuHourlyRates] = useState(DEFAULT_GPU_HOURLY_RATES);

  // Share calculation inputs
  const [useDirectSharesInput, setUseDirectSharesInput] = useState(false);
  const [directShares, setDirectShares] = useState(365.3); // in millions
  const [currentShares, setCurrentShares] = useState(DEFAULT_SCENARIO_PARAMS[DEFAULT_SCENARIO].currentShares); // in millions
  const [dilutionPercentage, setDilutionPercentage] = useState(DEFAULT_SCENARIO_PARAMS[DEFAULT_SCENARIO].dilutionPercentage);
  const [peRatio, setPeRatio] = useState(DEFAULT_SCENARIO_PARAMS[DEFAULT_SCENARIO].peRatio);
  const [corporateTaxRate, setCorporateTaxRate] = useState(21); // percentage
  const [taxAbatementRate, setTaxAbatementRate] = useState(85); // percentage
  const [sgaExpense, setSgaExpense] = useState(138); // in millions
  const [shareParamsOpen, setShareParamsOpen] = useState(true);
  const [gpuPricesOpen, setGpuPricesOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(DEFAULT_SCENARIO); // Track selected scenario
  const [customScenarios, setCustomScenarios] = useState([]); // Custom user-created scenarios
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  // Store parameters per scenario
  const [scenarioParameters, setScenarioParameters] = useState({...DEFAULT_SCENARIO_PARAMS});

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
        retrofitCapexPerMW: 3.2,
        dcLifetime: 20,
        gpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        defaultDCITLoad: 50 / 1.1,
        defaultGpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        autoscaleGPUs: true,
        gpuPaidOffPercent: 25,
        gpuUsefulLife: 5,
        debtPercent: 80,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        autoCalculateRevenue: true,
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
        retrofitCapexPerMW: 3.2,
        dcLifetime: 20,
        gpus: { b300: 19000, b200: 19200, mi350x: 2200, gb300: 2400, hyperscaleBulkGB300: 0 },
        defaultDCITLoad: 100,
        defaultGpus: { b300: 19000, b200: 19200, mi350x: 2200, gb300: 2400, hyperscaleBulkGB300: 0 },
        autoscaleGPUs: true,
        gpuPaidOffPercent: 0,
        gpuUsefulLife: 5,
        debtPercent: 80,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'horizon-1-4',
      name: 'Horizon 1-4',
      type: 'Hyperscaler IaaS',
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
        directGpuCount: 76000,
        defaultDCITLoad: 200,
        defaultDirectGpuCount: 76000,
        autoscaleGPUs: true,
        toplineRevenue: 9700,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'gpus',
        totalHardwareCost: 5800,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 9.7 / 13.224 * 100,
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: false,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'horizon-5-10',
      name: 'Horizon 5-10',
      type: 'Hyperscaler IaaS',
      enabled: false,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        sizeValue: 450,
        sizeUnit: 'MW',
        itLoad: 300,
        itLoadUnit: 'MW',
        pue: 1.5,
        directGpuCount: 114000,
        defaultDCITLoad: 300,
        defaultDirectGpuCount: 114000,
        autoscaleGPUs: true,
        toplineRevenue: 14544.47,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'gpus',
        totalHardwareCost: 5800 * 114 / 76,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 86,
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: true,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'horizon-5-8',
      name: 'Horizon 5-8',
      type: 'Hyperscaler IaaS',
      enabled: true,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        sizeValue: 300,
        sizeUnit: 'MW',
        itLoad: 200,
        itLoadUnit: 'MW',
        pue: 1.5,
        directGpuCount: 92000,
        defaultDCITLoad: 200,
        defaultDirectGpuCount: 92000,
        autoscaleGPUs: true,
        toplineRevenue: 11742.11,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'gpus',
        totalHardwareCost: 7021.05,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 86,
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: true,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'sweetwater-1',
      name: 'SW1: Colo',
      type: 'Colocation',
      enabled: false,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        totalLoadValue: 1400,
        totalLoadUnit: 'MW',
        itLoad: 933.33,
        itLoadUnit: 'MW',
        pue: 1.5,
        revenuePerMW: 2.18,
        dcCostPerMW: 15,
        dcLifetime: 20,
      }
    },
    {
      id: 'sweetwater-1-300mw',
      name: 'SW1: 300MW Hyperscaler',
      type: 'Hyperscaler IaaS',
      enabled: true,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        sizeValue: 300,
        sizeUnit: 'MW',
        itLoad: 200,
        itLoadUnit: 'MW',
        pue: 1.5,
        directGpuCount: 92000,
        defaultDCITLoad: 200,
        defaultDirectGpuCount: 92000,
        autoscaleGPUs: true,
        toplineRevenue: 11742.11,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'gpus',
        totalHardwareCost: 7021.05,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 86,
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: true,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'sweetwater-1-1400mw',
      name: 'SW1: 1400MW Hyperscaler',
      type: 'Hyperscaler IaaS',
      enabled: false,
      accordionOpen: true,
      data: {
        loadInputMode: 'total',
        sizeValue: 1400,
        sizeUnit: 'MW',
        itLoad: 933.33,
        itLoadUnit: 'MW',
        pue: 1.5,
        directGpuCount: 0,
        veraRubinGpuCount: 300427,
        defaultDCITLoad: 933.33,
        defaultDirectGpuCount: 0,
        defaultVeraRubinGpuCount: 300427,
        autoscaleGPUs: true,
        toplineRevenue: 54775,
        contractYears: 5,
        ebitdaMargin: 85,
        hardwareMode: 'gpus',
        totalHardwareCost: 5800 * 429.18 / 76,
        dcCostPerMW: 15,
        dcLifetime: 20,
        prepaymentPercent: 20,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        improvedContractsPercentage: 86,
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: true,
        autoCalculateRevenue: true,
      }
    },
    {
      id: 'sweetwater-2',
      name: 'Sweetwater 2 Colo',
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

  const updateSiteName = (id, newName) => {
    setSites(sites.map(site =>
      site.id === id ? { ...site, name: newName } : site
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
    setScenariosOpen(true);
    setSites(sites.map(site => ({ ...site, accordionOpen: true })));
  };

  const collapseAll = () => {
    setShareParamsOpen(false);
    setGpuPricesOpen(false);
    setScenariosOpen(false);
    setSites(sites.map(site => ({ ...site, accordionOpen: false })));
  };

  const downloadJSON = () => {
    const data = {
      gpuPrices,
      gpuHourlyRates,
      useDirectSharesInput,
      directShares,
      currentShares,
      dilutionPercentage,
      peRatio,
      corporateTaxRate,
      taxAbatementRate,
      sgaExpense,
      selectedScenario,
      customScenarios,
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

        // Update GPU hourly rates if present
        if (data.gpuHourlyRates) {
          setGpuHourlyRates({
            hyperscaleBulkGB300: data.gpuHourlyRates.hyperscaleBulkGB300 ?? gpuHourlyRates.hyperscaleBulkGB300,
            gb300: data.gpuHourlyRates.gb300 ?? gpuHourlyRates.gb300,
            b200: data.gpuHourlyRates.b200 ?? gpuHourlyRates.b200,
            b300: data.gpuHourlyRates.b300 ?? gpuHourlyRates.b300,
            mi350x: data.gpuHourlyRates.mi350x ?? gpuHourlyRates.mi350x,
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

        // Update scenarios if present
        if (data.selectedScenario !== undefined) setSelectedScenario(data.selectedScenario);
        if (data.customScenarios && Array.isArray(data.customScenarios)) {
          setCustomScenarios(data.customScenarios);
        }

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

  // Wrapper functions to update both global state and scenario-specific state
  const updatePeRatio = (value) => {
    setPeRatio(value);
    setScenarioParameters(prev => ({
      ...prev,
      [selectedScenario]: { ...prev[selectedScenario], peRatio: value }
    }));
  };

  const updateDilutionPercentage = (value) => {
    setDilutionPercentage(value);
    setScenarioParameters(prev => ({
      ...prev,
      [selectedScenario]: { ...prev[selectedScenario], dilutionPercentage: value }
    }));
  };

  const updateCurrentShares = (value) => {
    setCurrentShares(value);
    setScenarioParameters(prev => ({
      ...prev,
      [selectedScenario]: { ...prev[selectedScenario], currentShares: value }
    }));
  };

  const loadScenario = (scenarioName) => {
    setSelectedScenario(scenarioName); // Track the selected scenario

    // Load parameters for this scenario
    const params = scenarioParameters[scenarioName] || { peRatio: 30, dilutionPercentage: 30, currentShares: 352.7 };
    setPeRatio(params.peRatio);
    setDilutionPercentage(params.dilutionPercentage);
    setCurrentShares(params.currentShares);

    if (scenarioName === '2027-h110-colo') {
      // Canada + Horizon 1-10 + SW1 Colo - H2 2027 (all sites enabled)
      setSites(sites.map(site => ({
        ...site,
        enabled: site.id !== 'sweetwater-2' // Enable all except Sweetwater 2
      })));
    } else if (scenarioName === 'canada-h14') {
      // Canada + Horizon 1-4 - Prince George, Mackenzie + Canal Flats, and Horizon 1-4 enabled
      setSites(sites.map(site => ({
        ...site,
        enabled: site.id === 'prince-george' || site.id === 'mackenzie-canal' || site.id === 'horizon-1-4'
      })));
    } else if (scenarioName === 'canada') {
      // Canada Only - Only Prince George and Mackenzie + Canal Flats enabled
      setSites(sites.map(site => ({
        ...site,
        enabled: site.id === 'prince-george' || site.id === 'mackenzie-canal'
      })));
    } else if (scenarioName === '2027-h110-hyperscaler') {
      // Canada + Horizon 1-10 + SW1 1400MW Hyperscaler
      setSites(sites.map(site => ({
        ...site,
        enabled: site.id === 'prince-george' ||
                 site.id === 'mackenzie-canal' ||
                 site.id === 'horizon-1-4' ||
                 site.id === 'horizon-5-10' ||
                 site.id === 'sweetwater-1-1400mw'
      })));
    } else if (scenarioName === '2026-h18-sw1') {
      // Canada + Horizon 1-8 + SW1 300MW Hyperscaler
      setSites(sites.map(site => ({
        ...site,
        enabled: site.id === 'prince-george' ||
                 site.id === 'mackenzie-canal' ||
                 site.id === 'horizon-1-4' ||
                 site.id === 'horizon-5-8' ||
                 site.id === 'sweetwater-1-300mw'
      })));
    }
  };

  const saveCustomScenario = () => {
    if (!newScenarioName.trim()) return;

    const scenarioId = `custom-${Date.now()}`;
    const newScenario = {
      id: scenarioId,
      name: newScenarioName.trim(),
      peRatio: peRatio,
      dilution: dilutionPercentage,
      currentShares: currentShares,
      enabledSites: sites.filter(site => site.enabled).map(site => site.id)
    };

    // Save parameters for this custom scenario
    setScenarioParameters(prev => ({
      ...prev,
      [scenarioId]: { peRatio: peRatio, dilutionPercentage: dilutionPercentage, currentShares: currentShares }
    }));

    setCustomScenarios([...customScenarios, newScenario]);
    setShowScenarioModal(false);
    setNewScenarioName('');
  };

  const deleteCustomScenario = (scenarioId) => {
    setCustomScenarios(customScenarios.filter(s => s.id !== scenarioId));

    // Remove parameters for this scenario
    setScenarioParameters(prev => {
      const { [scenarioId]: removed, ...rest } = prev;
      return rest;
    });

    // If the deleted scenario was selected, switch to default
    if (selectedScenario === scenarioId) {
      loadScenario('2027-h110-colo');
    }
  };

  const loadCustomScenario = (scenario) => {
    setSelectedScenario(scenario.id);

    // Load parameters for this scenario
    const params = scenarioParameters[scenario.id] || { peRatio: scenario.peRatio, dilutionPercentage: scenario.dilution, currentShares: 352.7 };
    setPeRatio(params.peRatio);
    setDilutionPercentage(params.dilutionPercentage);
    setCurrentShares(params.currentShares);

    setSites(sites.map(site => ({
      ...site,
      enabled: scenario.enabledSites.includes(site.id)
    })));
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
      'Hyperscaler IaaS': {
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
        directImprovement: 17.288288951,
        improvementMode: 'direct',
        contractGapEnabled: false,
        autoCalculateRevenue: false,
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
        gpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        defaultDCITLoad: 50 / 1.1,
        defaultGpus: { b300: 9500, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
        autoscaleGPUs: true,
        gpuPaidOffPercent: 0,
        gpuUsefulLife: 5,
        debtPercent: 80,
        interestRate: 7,
        debtYears: 5,
        residualValue: 0,
        autoCalculateRevenue: true,
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

  // Helper to calculate site profit using imported utility
  const getSiteProfit = (site) => calculateSiteNetProfit(site, gpuPrices, gpuHourlyRates);

  // Filter sites based on selected scenario
  // Show specific sites only in certain scenarios
  const activeSites = sites.filter(site => {
    if (site.id === 'sweetwater-1-300mw') {
      return selectedScenario === '2026-h18-sw1';
    }
    if (site.id === 'sweetwater-1-1400mw') {
      return selectedScenario === '2027-h110-hyperscaler';
    }
    if (site.id === 'sweetwater-1') {
      return selectedScenario !== '2027-h110-hyperscaler' && selectedScenario !== '2026-h18-sw1';
    }
    if (site.id === 'horizon-5-8') {
      return selectedScenario === '2026-h18-sw1';
    }
    if (site.id === 'horizon-5-10') {
      return selectedScenario !== '2026-h18-sw1';
    }
    return true;
  });

  // Calculate total annual revenue
  const totalAnnualRevenue = activeSites.reduce((sum, site) => {
    const result = getSiteProfit(site);
    return sum + result.revenue;
  }, 0);

  // Calculate total net profits
  const totalNetProfit = activeSites.reduce((sum, site) => {
    const result = getSiteProfit(site);
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
            <div className="calc-steps-section-header">Annual Revenue Split:</div>
            {activeSites.filter(site => site.enabled).map(site => {
              const result = getSiteProfit(site);
              return (
                <div key={site.id}>
                  {site.name}: {formatValue(result.revenue)}/yr
                </div>
              );
            })}
            <div className="calc-steps-total">Total Annual Revenue = {formatValue(totalAnnualRevenue)}/yr</div>

            <div className="calc-steps-section-header calc-steps-section-header-margin">Earnings before Tax, SG&A Split:</div>
            {activeSites.filter(site => site.enabled).map(site => {
              const result = getSiteProfit(site);
              return (
                <div key={site.id}>
                  {site.name}: {formatValue(result.netProfit)}/yr
                </div>
              );
            })}
            <div className="calc-steps-total">Total Earnings before Tax, SG&A = {formatValue(totalNetProfit)}/yr</div>

            <div className="calc-steps-section-header calc-steps-section-header-margin">Net Profit and Share Price Calculations:</div>
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
            <button onClick={downloadJSON} className="control-btn">Download Inputs</button>
            <button onClick={() => document.getElementById('file-upload').click()} className="control-btn">Upload Inputs</button>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={uploadCSV}
              className="hidden-file-input"
            />
          </div>
        </div>

        {/* Scenarios */}
        <div className="accordion">
          <div className="accordion-header" onClick={() => setScenariosOpen(!scenariosOpen)}>
            <h3>Scenarios</h3>
            <span className="accordion-icon">{scenariosOpen ? '−' : '+'}</span>
          </div>

          {scenariosOpen && (
            <div className="accordion-content">
              <div className="scenario-buttons-container">
            <button
              onClick={() => loadScenario('canada')}
              className={`scenario-btn ${selectedScenario === 'canada' ? 'selected' : ''}`}
            >
              <div>
                <div>Canada</div>
                <div>&nbsp;</div>
              </div>
            </button>
            <button
              onClick={() => loadScenario('canada-h14')}
              className={`scenario-btn ${selectedScenario === 'canada-h14' ? 'selected' : ''}`}
            >
              <div>
                <div>Canada +</div>
                <div>Horizon 1-4</div>
              </div>
            </button>
            <button
              onClick={() => loadScenario('2026-h18-sw1')}
              className={`scenario-btn ${selectedScenario === '2026-h18-sw1' ? 'selected' : ''}`}
            >
              <div>
                <div>Frans 2026: Canada + Horizon 1-8</div>
                <div>+ SW1 200MW IT Hyperscaler</div>
              </div>
            </button>
            <button
              onClick={() => loadScenario('2027-h110-colo')}
              className={`scenario-btn ${selectedScenario === '2027-h110-colo' ? 'selected' : ''}`}
            >
              <div>
                <div>2027: Canada + Horizon 1-10</div>
                <div>+ SW1 Colo</div>
              </div>
            </button>
            <button
              onClick={() => loadScenario('2027-h110-hyperscaler')}
              className={`scenario-btn ${selectedScenario === '2027-h110-hyperscaler' ? 'selected' : ''}`}
            >
              <div>
                <div>Dulce 2027: Canada + Horizon 1-10</div>
                <div>+ SW1 933 MW IT Hyperscaler</div>
              </div>
            </button>

            {/* Custom Scenarios */}
            {customScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => loadCustomScenario(scenario)}
                className={`scenario-btn scenario-btn-custom ${selectedScenario === scenario.id ? 'selected' : ''}`}
              >
                <div>
                  <div>{scenario.name}</div>
                  <div>&nbsp;</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomScenario(scenario.id);
                  }}
                  className="scenario-delete-btn"
                  title="Delete scenario"
                >
                  ×
                </button>
              </button>
            ))}

            {/* Add Scenario Button */}
            <button
              onClick={() => setShowScenarioModal(true)}
              className="scenario-btn scenario-btn-dashed"
            >
              <div>
                <div>+ Add Custom</div>
                <div>Scenario</div>
              </div>
            </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Scenario Modal */}
        {showScenarioModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Create Custom Scenario</h3>

              <div className="modal-input-group">
                <label className="modal-label">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Enter scenario name"
                  className="modal-input"
                />
              </div>

              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setShowScenarioModal(false);
                    setNewScenarioName('');
                  }}
                  className="modal-btn modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomScenario}
                  disabled={!newScenarioName.trim()}
                  className="modal-btn modal-btn-save"
                >
                  Save Scenario
                </button>
              </div>
            </div>
          </div>
        )}

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
              onChange={(e) => updatePeRatio(e.target.value === '' ? '' : parseFloat(e.target.value))}
              onBlur={(e) => updatePeRatio(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
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
                          updateDilutionPercentage(Math.max(0, calculatedDilution));
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
                      onChange={(e) => updateCurrentShares(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onBlur={(e) => updateCurrentShares(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="input-row">
                    <label>Dilution Percentage (%)</label>
                    <input
                      type="number"
                      value={dilutionPercentage}
                      onChange={(e) => updateDilutionPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onBlur={(e) => updateDilutionPercentage(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="calc-steps">
                    <div>Fully Diluted Shares = {currentShares}M × (1 + {dilutionPercentage}%) = {fullyDilutedShares.toFixed(1)}M</div>
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
        <GPUPrices
          prices={gpuPrices}
          setPrices={setGpuPrices}
          hourlyRates={gpuHourlyRates}
          setHourlyRates={setGpuHourlyRates}
          isOpen={gpuPricesOpen}
          setIsOpen={setGpuPricesOpen}
        />

        {/* Sites */}
        <div className="sites-section">
          <div className="sites-header">
            <h3>Sites</h3>
            <div className="add-site-buttons">
              <button onClick={() => addSite('Colocation')}>+ Colocation</button>
              <button onClick={() => addSite('Hyperscaler IaaS')}>+ Hyperscaler IaaS</button>
              <button onClick={() => addSite('IREN Cloud')}>+ IREN Cloud</button>
            </div>
          </div>

          {activeSites.map(site => {
            const result = getSiteProfit(site);

            return (
              <div key={site.id} className={`site-wrapper ${!site.enabled ? 'disabled' : ''}`}>
                {site.type === 'Colocation' && (
                  <ColocationSite
                    site={site}
                    result={result}
                    updateSite={updateSite}
                    updateSiteName={updateSiteName}
                    toggleSite={toggleSite}
                    toggleAccordion={toggleSiteAccordion}
                    deleteSite={deleteSite}
                  />
                )}
                {site.type === 'Hyperscaler IaaS' && (
                  <HyperscalerSite
                    site={site}
                    result={result}
                    gpuPrices={gpuPrices}
                    gpuHourlyRates={gpuHourlyRates}
                    updateSite={updateSite}
                    updateSiteName={updateSiteName}
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
                    gpuHourlyRates={gpuHourlyRates}
                    updateSite={updateSite}
                    updateSiteName={updateSiteName}
                    toggleSite={toggleSite}
                    toggleAccordion={toggleSiteAccordion}
                    deleteSite={deleteSite}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Version Footer */}
        <div className="version-footer">
          Version {packageJson.version}
          <div className="disclaimer">Not Financial Advice</div>
        </div>
      </div>
    </div>
  );
}

export default App;

