import React, { useState } from 'react';
import './App.css';
import GPUPrices from './components/GPUPrices';
import ColocationSite from './components/ColocationSite';
import HyperscalerSite from './components/HyperscalerSite';
import IRENCloudSite from './components/IRENCloudSite';
import packageJson from '../package.json';

// Default scenario configuration
const DEFAULT_SCENARIO = '2026-h18-sw1';
const DEFAULT_SCENARIO_PARAMS = {
  'canada': { peRatio: 50, dilutionPercentage: 0, currentShares: 352.7 },
  'canada-h14': { peRatio: 50, dilutionPercentage: 0, currentShares: 352.7 },
  '2027-h110-colo': { peRatio: 30, dilutionPercentage: 15, currentShares: 409.126 },
  '2027-h110-hyperscaler': { peRatio: 30, dilutionPercentage: 60, currentShares: 409.126 },
  '2026-h18-sw1': { peRatio: 40, dilutionPercentage: 15, currentShares: 409.126 }
};

function App() {
  // GPU Prices
  const [gpuPrices, setGpuPrices] = useState({
    hyperscaleBulkGB300: 76315.78,
    veraRubinNVL144: 76315.78 * 1.5,
    gb300: 80000,
    b200: 45952.38,
    b300: 61117.21,
    mi350x: 42788.92,
  });

  // GPU Hourly Rates
  const [gpuHourlyRates, setGpuHourlyRates] = useState({
    b200: 500000000 / 661169760 * 3.08,
    b300: 500000000 / 661169760 * 3.85,
    gb300: 500000000 / 661169760 * 5.11,
    mi350x: 500000000 / 661169760 * 2.91,
    hyperscaleBulkGB300: 1940000000 / 365 / 76000 / 24,
    veraRubinNVL144: 1940000000 / 365 / 76000 / 24 * 1.75,
  });

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
        retrofitCapexPerMW: 0,
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
        retrofitCapexPerMW: 0,
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

  const downloadCSV = () => {
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

  // Calculate net profit for each site
  const calculateSiteNetProfit = (site) => {
    if (!site.enabled) return { netProfit: 0, revenue: 0, steps: [] };

    if (site.type === 'Colocation') {
      return calculateColocationProfit(site.data);
    } else if (site.type === 'Hyperscaler IaaS') {
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
      const veraRubinCost = veraRubinCount * gpuPrices.veraRubinNVL144 / 1000000;
      totalHardwareCost = hyperscaleCost + veraRubinCost;
      if (hyperscaleCount > 0) {
        steps.push(`Hyperscale Bulk GB300: ${hyperscaleCount.toLocaleString()} GPUs × $${gpuPrices.hyperscaleBulkGB300.toLocaleString()} = $${hyperscaleCost.toFixed(2)}M`);
      }
      if (veraRubinCount > 0) {
        steps.push(`Hyperscale Bulk Vera Rubin NVL144: ${veraRubinCount.toLocaleString()} GPUs × $${gpuPrices.veraRubinNVL144.toLocaleString()} = $${veraRubinCost.toFixed(2)}M`);
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

    // Improved Contract (only if enabled)
    if (data.contractGapEnabled) {
      steps.push(''); // Empty line for spacing
      steps.push('--- Improved Contract ---');

      // Get GPU count
      const gpuCount = data.directGpuCount || 0;

      let newRevenue;

      // Check improvement mode (default is 'direct')
      if (data.improvementMode === 'percentage') {
        // Percentage of NBIS-MSFT mode
        // Nebius Topline Scaled by GPU Count with hourly rate adjustment
        const nebiusBase = 17400; // $17.4B
        const defaultHourlyRate = 1940000000 / 365 / 76000 / 24;
        const currentHourlyRate = gpuHourlyRates.hyperscaleBulkGB300;
        const hourlyRateRatio = currentHourlyRate / defaultHourlyRate;
        const gpuCountProratedNebius = (gpuCount / 100000) * nebiusBase * hourlyRateRatio;
        steps.push(`Nebius Topline Scaled by GPU Count: (${gpuCount} / 100k) × $${nebiusBase}M × ${hourlyRateRatio.toFixed(4)} = $${gpuCountProratedNebius.toFixed(2)}M`);

        // Improved Contracts Percentage (user input)
        const improvedPercentage = data.improvedContractsPercentage || 0;

        // New Negotiated Topline
        newRevenue = gpuCountProratedNebius * (improvedPercentage / 100);
        steps.push(`New Negotiated Topline: $${gpuCountProratedNebius.toFixed(2)}M × ${improvedPercentage}% = $${newRevenue.toFixed(2)}M`);
      } else {
        // Improvement Percentage mode (default)
        const improvementPercentage = data.directImprovement || 0;

        // New Negotiated Topline based on Base Contract Revenue
        newRevenue = revenue * (1 + improvementPercentage / 100);
        steps.push(`New Negotiated Topline: $${revenue.toFixed(2)}M × (1 + ${improvementPercentage}%) = $${newRevenue.toFixed(2)}M`);
      }

      // Additional Profit (5yrs)
      const additionalProfit5yrs = newRevenue - revenue;
      steps.push(`Additional Profit (5yrs): New Negotiated Topline - Base Contract Revenue = $${newRevenue.toFixed(2)}M - $${revenue.toFixed(2)}M = $${additionalProfit5yrs.toFixed(2)}M`);

      // Additional Profit (annual)
      const additionalProfit = additionalProfit5yrs / 5;
      steps.push(`Additional Profit: Additional Profit (5yrs) / 5 = $${additionalProfit5yrs.toFixed(2)}M / 5 = $${additionalProfit.toFixed(2)}M/yr`);

      // Net Profit (Base Net Profit + Additional Profit)
      netProfit = baseNetProfit + additionalProfit;
      steps.push(`Earnings before Tax, SG&A: Base Earnings before Tax, SG&A + Additional Profit = $${baseNetProfit.toFixed(2)}M/yr + $${additionalProfit.toFixed(2)}M/yr = $${netProfit.toFixed(2)}M/yr`);

      // Update total revenue to include additional profit
      totalRevenue = revenue + additionalProfit5yrs;
      steps.push(`Revenue: Base Contract Revenue + Additional Profit (5yrs) = $${revenue.toFixed(2)}M + $${additionalProfit5yrs.toFixed(2)}M = $${totalRevenue.toFixed(2)}M`);
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
    const calculatedGpuCost =
      (gpus.b300 || 0) * prices.b300 / 1000000 +
      (gpus.b200 || 0) * prices.b200 / 1000000 +
      (gpus.mi350x || 0) * prices.mi350x / 1000000 +
      (gpus.gb300 || 0) * prices.gb300 / 1000000 +
      (gpus.hyperscaleBulkGB300 || 0) * prices.hyperscaleBulkGB300 / 1000000;

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
    const initialDebt = totalGpuCost;
    steps.push(`Initial Debt: $${initialDebt.toFixed(2)}M`);

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
    const result = calculateSiteNetProfit(site);
    return sum + result.revenue;
  }, 0);

  // Calculate total net profits
  const totalNetProfit = activeSites.reduce((sum, site) => {
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
            {activeSites.filter(site => site.enabled).map(site => {
              const result = calculateSiteNetProfit(site);
              return (
                <div key={site.id}>
                  {site.name}: {formatValue(result.revenue)}/yr
                </div>
              );
            })}
            <div style={{ marginTop: '0.5rem' }}>Total Annual Revenue = {formatValue(totalAnnualRevenue)}/yr</div>

            <div style={{ fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>Earnings before Tax, SG&A Split:</div>
            {activeSites.filter(site => site.enabled).map(site => {
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

        {/* Scenarios */}
        <div className="accordion">
          <div className="accordion-header" onClick={() => setScenariosOpen(!scenariosOpen)}>
            <h3>Scenarios</h3>
            <span className="accordion-icon">{scenariosOpen ? '−' : '+'}</span>
          </div>

          {scenariosOpen && (
            <div className="accordion-content">
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                className={`scenario-btn ${selectedScenario === scenario.id ? 'selected' : ''}`}
                style={{ position: 'relative' }}
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
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '1',
                    padding: 0
                  }}
                  title="Delete scenario"
                >
                  ×
                </button>
              </button>
            ))}

            {/* Add Scenario Button */}
            <button
              onClick={() => setShowScenarioModal(true)}
              className="scenario-btn"
              style={{ borderStyle: 'dashed' }}
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
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ marginTop: 0, color: '#1a1a1a' }}>Create Custom Scenario</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Enter scenario name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowScenarioModal(false);
                    setNewScenarioName('');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomScenario}
                  disabled={!newScenarioName.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: newScenarioName.trim() ? '#71DA80' : '#e9ecef',
                    color: newScenarioName.trim() ? '#1a1a1a' : '#6c757d',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: newScenarioName.trim() ? 'pointer' : 'not-allowed'
                  }}
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
            const result = calculateSiteNetProfit(site);

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
        <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem', color: '#666' }}>
          Version {packageJson.version}
        </div>
      </div>
    </div>
  );
}

export default App;

