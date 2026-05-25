import { DEFAULT_GPU_HOURLY_RATES, HOURS_PER_YEAR } from './defaults';

const clone = (value) => JSON.parse(JSON.stringify(value));

const mackenzieGpus = { b300: 19000, b3002026: 0, b200: 19200, mi350x: 2200, gb300: 2400, hyperscaleBulkGB300: 0 };
const createB3002026OnlyGpus = (b3002026) => ({
  b300: 0,
  b3002026,
  b200: 0,
  mi350x: 0,
  gb300: 0,
  hyperscaleBulkGB300: 0,
  veraRubin: 0,
});
const mackenzieB300OnlyGpus = createB3002026OnlyGpus(45833);
const childressBaseGpus = createB3002026OnlyGpus(6666);
const childressGrowthGpus = createB3002026OnlyGpus(100000);
const CHILDRESS_BASE_DCIT_LOAD = 110 / 1.375;
const CHILDRESS_2026_DCIT_LOAD = 20 / 1.375;
const CHILDRESS_2027_PLUS_DCIT_LOAD = 300 / 1.375;
const SW1_2028_PLUS_DCIT_LOAD = 1400 / 1.5;
const MACKENZIE_B300_ONLY_SCENARIO_DATA = {
  gpus: mackenzieB300OnlyGpus,
  defaultGpus: mackenzieB300OnlyGpus,
};
const SW1_2028_PLUS_SCENARIO_DATA = {
  sizeValue: 1400,
  sizeUnit: 'MW',
  defaultDCITLoad: SW1_2028_PLUS_DCIT_LOAD,
  veraRubinGpuCount: 150266,
  defaultVeraRubinGpuCount: 150266,
};
const OKLAHOMA_2029_PLUS_DCIT_LOAD = 1000 / 1.5;
const OKLAHOMA_2029_PLUS_SCENARIO_DATA = {
  sizeValue: 1000,
  sizeUnit: 'MW',
  directGpuCount: 0,
  defaultDirectGpuCount: 0,
  defaultDCITLoad: OKLAHOMA_2029_PLUS_DCIT_LOAD,
  veraRubinGpuCount: 107333,
  defaultVeraRubinGpuCount: 107333,
};

const calculateIrenCloudRevenue = (gpus, gpuHourlyRates) => {
  const revenueInDollars = Object.keys(gpuHourlyRates).reduce((sum, gpuType) => (
    sum + ((gpus[gpuType] || 0) * (gpuHourlyRates[gpuType] || 0) * HOURS_PER_YEAR)
  ), 0);

  return Math.round(revenueInDollars) / 1000000;
};

const calculateHyperscalerRevenue = (data, gpuHourlyRates) => {
  const contractYears = data.contractYears || 1;
  const hyperscaleRevenue = (data.directGpuCount || 0) *
    (gpuHourlyRates.hyperscaleBulkGB300 || 0) *
    contractYears *
    HOURS_PER_YEAR;
  const veraRubinRevenue = (data.veraRubinGpuCount || 0) *
    (gpuHourlyRates.veraRubin || 0) *
    contractYears *
    HOURS_PER_YEAR;

  return Math.round(hyperscaleRevenue + veraRubinRevenue) / 1000000;
};

const getCurrentDCITLoad = (data) => {
  if (data.loadInputMode === 'total') {
    const totalLoadMW = data.sizeUnit === 'GW'
      ? (data.sizeValue || 0) * 1000
      : (data.sizeValue || 0);
    return totalLoadMW / (data.pue || 1);
  }

  return data.itLoadUnit === 'GW'
    ? (data.itLoad || 0) * 1000
    : (data.itLoad || 0);
};

const applyTotalSiteSize = (data, sizeValue, sizeUnit = 'MW') => {
  const totalLoadMW = sizeUnit === 'GW' ? sizeValue * 1000 : sizeValue;

  return {
    ...data,
    loadInputMode: 'total',
    sizeValue,
    sizeUnit,
    itLoad: totalLoadMW / (data.pue || 1),
    itLoadUnit: 'MW',
  };
};

const scaleSiteForCurrentLoad = (site, gpuHourlyRates) => {
  if (!site.data.autoscaleGPUs) return site;

  const currentLoad = getCurrentDCITLoad(site.data);
  const defaultLoad = site.data.defaultDCITLoad || currentLoad;
  const ratio = defaultLoad > 0 ? currentLoad / defaultLoad : 1;

  if (site.type === 'IREN Cloud') {
    const defaultGpus = site.data.defaultGpus || site.data.gpus || {};
    const gpus = Object.keys(gpuHourlyRates).reduce((scaled, gpuType) => ({
      ...scaled,
      [gpuType]: Math.round((defaultGpus[gpuType] || 0) * ratio),
    }), {});

    return {
      ...site,
      data: {
        ...site.data,
        gpus,
        toplineRevenue: site.data.autoCalculateRevenue
          ? calculateIrenCloudRevenue(gpus, gpuHourlyRates)
          : site.data.toplineRevenue,
      },
    };
  }

  if (site.type === 'Hyperscaler IaaS') {
    const directGpuCount = Math.round((site.data.defaultDirectGpuCount ?? site.data.directGpuCount ?? 0) * ratio);
    const veraRubinGpuCount = Math.round((site.data.defaultVeraRubinGpuCount ?? site.data.veraRubinGpuCount ?? 0) * ratio);
    const data = {
      ...site.data,
      directGpuCount,
      veraRubinGpuCount,
    };

    return {
      ...site,
      data: {
        ...data,
        toplineRevenue: data.autoCalculateRevenue
          ? calculateHyperscalerRevenue(data, gpuHourlyRates)
          : data.toplineRevenue,
      },
    };
  }

  return site;
};

export const BASE_SITES = [
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
      gpus: { b300: 9500, b3002026: 0, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
      defaultDCITLoad: 50 / 1.1,
      defaultGpus: { b300: 9500, b3002026: 0, b200: 9600, mi350x: 1100, gb300: 1200, hyperscaleBulkGB300: 0 },
      autoscaleGPUs: true,
      gpuPaidOffPercent: 25,
      gpuUsefulLife: 5,
      debtPercent: 80,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
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
      gpus: mackenzieGpus,
      defaultDCITLoad: 100,
      defaultGpus: mackenzieGpus,
      autoscaleGPUs: true,
      gpuPaidOffPercent: 0,
      gpuUsefulLife: 5,
      debtPercent: 80,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
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
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'horizon-5-6',
    name: 'Horizon 5-6',
    type: 'Hyperscaler IaaS',
    enabled: true,
    accordionOpen: true,
    data: {
      loadInputMode: 'total',
      sizeValue: 150,
      sizeUnit: 'MW',
      itLoad: 100,
      itLoadUnit: 'MW',
      pue: 1.5,
      directGpuCount: 46000,
      defaultDCITLoad: 100,
      defaultDirectGpuCount: 46000,
      autoscaleGPUs: true,
      toplineRevenue: 17613.16 / 3,
      contractYears: 5,
      ebitdaMargin: 85,
      hardwareMode: 'gpus',
      totalHardwareCost: 5800 * 46 / 76,
      dcCostPerMW: 15,
      dcLifetime: 20,
      prepaymentPercent: 20,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'childress-block-6-10',
    name: 'Childress Block 7-10',
    type: 'IREN Cloud',
    enabled: false,
    accordionOpen: true,
    data: {
      toplineRevenue: 1000,
      ebitdaMargin: 85,
      dcType: 'retrofit',
      loadInputMode: 'total',
      sizeValue: 110,
      sizeUnit: 'MW',
      itLoad: CHILDRESS_BASE_DCIT_LOAD,
      itLoadUnit: 'MW',
      pue: 1.375,
      retrofitCapexPerMW: 3.2,
      dcLifetime: 20,
      gpus: childressBaseGpus,
      defaultDCITLoad: CHILDRESS_BASE_DCIT_LOAD,
      defaultGpus: childressBaseGpus,
      autoscaleGPUs: true,
      gpuPaidOffPercent: 0,
      gpuUsefulLife: 5,
      debtPercent: 80,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'sweetwater-1-1400mw',
    name: 'SW1',
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
      directGpuCount: 0,
      veraRubinGpuCount: 32200,
      defaultDCITLoad: 200,
      defaultDirectGpuCount: 0,
      defaultVeraRubinGpuCount: 32200,
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
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'sweetwater-2-600mw',
    name: 'SW2',
    type: 'Hyperscaler IaaS',
    enabled: false,
    accordionOpen: true,
    data: {
      loadInputMode: 'total',
      sizeValue: 600,
      sizeUnit: 'MW',
      itLoad: 400,
      itLoadUnit: 'MW',
      pue: 1.5,
      directGpuCount: 0,
      veraRubinGpuCount: 64400,
      defaultDCITLoad: 400,
      defaultDirectGpuCount: 0,
      defaultVeraRubinGpuCount: 64400,
      autoscaleGPUs: true,
      toplineRevenue: 0,
      contractYears: 5,
      ebitdaMargin: 85,
      hardwareMode: 'gpus',
      totalHardwareCost: 0,
      dcCostPerMW: 15,
      dcLifetime: 20,
      prepaymentPercent: 20,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'oklahoma',
    name: 'Oklahoma',
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
      totalHardwareCost: 5800 * 92 / 76,
      dcCostPerMW: 15,
      dcLifetime: 20,
      prepaymentPercent: 20,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'nostrum-group',
    name: 'Nostrum Group',
    type: 'Hyperscaler IaaS',
    enabled: false,
    accordionOpen: true,
    data: {
      loadInputMode: 'total',
      sizeValue: 490,
      sizeUnit: 'MW',
      itLoad: 490 / 1.5,
      itLoadUnit: 'MW',
      pue: 1.5,
      directGpuCount: 0,
      veraRubinGpuCount: 52593,
      defaultDCITLoad: 490 / 1.5,
      defaultDirectGpuCount: 0,
      defaultVeraRubinGpuCount: 52593,
      autoscaleGPUs: true,
      toplineRevenue: 0,
      contractYears: 5,
      ebitdaMargin: 85,
      hardwareMode: 'gpus',
      totalHardwareCost: 0,
      dcCostPerMW: 15,
      dcLifetime: 20,
      prepaymentPercent: 20,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
  {
    id: 'kiowa',
    name: 'Kiowa',
    type: 'Hyperscaler IaaS',
    enabled: false,
    accordionOpen: true,
    data: {
      loadInputMode: 'total',
      sizeValue: 1200,
      sizeUnit: 'MW',
      itLoad: 800,
      itLoadUnit: 'MW',
      pue: 1.5,
      directGpuCount: 0,
      veraRubinGpuCount: 128800,
      defaultDCITLoad: 800,
      defaultDirectGpuCount: 0,
      defaultVeraRubinGpuCount: 128800,
      autoscaleGPUs: true,
      toplineRevenue: 0,
      contractYears: 5,
      ebitdaMargin: 85,
      hardwareMode: 'gpus',
      totalHardwareCost: 0,
      dcCostPerMW: 15,
      dcLifetime: 20,
      prepaymentPercent: 20,
      interestRate: 7,
      debtYears: 5,
      residualValue: 0,
      autoCalculateRevenue: true,
    },
  },
];

export const SCENARIO_SITE_OVERRIDES = {
  '2025': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true },
  },
  '2026': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true, data: MACKENZIE_B300_ONLY_SCENARIO_DATA },
    'horizon-1-4': { enabled: true },
    'childress-block-6-10': {
      enabled: true,
      data: {
        sizeValue: 20,
        sizeUnit: 'MW',
        defaultDCITLoad: CHILDRESS_2026_DCIT_LOAD,
        gpus: childressBaseGpus,
        defaultGpus: childressBaseGpus,
      },
    },
  },
  '2027': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true, data: MACKENZIE_B300_ONLY_SCENARIO_DATA },
    'horizon-1-4': { enabled: true },
    'horizon-5-6': { enabled: true },
    'childress-block-6-10': {
      enabled: true,
      data: {
        sizeValue: 300,
        sizeUnit: 'MW',
        defaultDCITLoad: CHILDRESS_2027_PLUS_DCIT_LOAD,
        gpus: childressGrowthGpus,
        defaultGpus: childressGrowthGpus,
      },
    },
    'sweetwater-1-1400mw': { enabled: true },
  },
  '2028': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true, data: MACKENZIE_B300_ONLY_SCENARIO_DATA },
    'horizon-1-4': { enabled: true },
    'horizon-5-6': { enabled: true },
    'childress-block-6-10': {
      enabled: true,
      data: {
        sizeValue: 300,
        sizeUnit: 'MW',
        defaultDCITLoad: CHILDRESS_2027_PLUS_DCIT_LOAD,
        gpus: childressGrowthGpus,
        defaultGpus: childressGrowthGpus,
      },
    },
    'sweetwater-1-1400mw': { enabled: true, data: SW1_2028_PLUS_SCENARIO_DATA },
  },
  '2029': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true, data: MACKENZIE_B300_ONLY_SCENARIO_DATA },
    'horizon-1-4': { enabled: true },
    'horizon-5-6': { enabled: true },
    'childress-block-6-10': {
      enabled: true,
      data: {
        sizeValue: 300,
        sizeUnit: 'MW',
        defaultDCITLoad: CHILDRESS_2027_PLUS_DCIT_LOAD,
        gpus: childressGrowthGpus,
        defaultGpus: childressGrowthGpus,
      },
    },
    'sweetwater-1-1400mw': { enabled: true, data: SW1_2028_PLUS_SCENARIO_DATA },
    'sweetwater-2-600mw': { enabled: true },
    'oklahoma': { enabled: true, data: OKLAHOMA_2029_PLUS_SCENARIO_DATA },
  },
  '2030': {
    'prince-george': { enabled: true },
    'mackenzie-canal': { enabled: true, data: MACKENZIE_B300_ONLY_SCENARIO_DATA },
    'horizon-1-4': { enabled: true },
    'horizon-5-6': { enabled: true },
    'childress-block-6-10': {
      enabled: true,
      data: {
        sizeValue: 300,
        sizeUnit: 'MW',
        defaultDCITLoad: CHILDRESS_2027_PLUS_DCIT_LOAD,
        gpus: childressGrowthGpus,
        defaultGpus: childressGrowthGpus,
      },
    },
    'sweetwater-1-1400mw': { enabled: true, data: SW1_2028_PLUS_SCENARIO_DATA },
    'sweetwater-2-600mw': { enabled: true },
    'oklahoma': { enabled: true, data: OKLAHOMA_2029_PLUS_SCENARIO_DATA },
    'nostrum-group': { enabled: true },
    'kiowa': { enabled: true },
  },
};

export const buildScenarioSites = (scenarioId, gpuHourlyRates = DEFAULT_GPU_HOURLY_RATES) => {
  const scenarioOverrides = SCENARIO_SITE_OVERRIDES[scenarioId] || {};

  return BASE_SITES.map(baseSite => {
    const override = scenarioOverrides[baseSite.id] || {};
    const mergedData = override.data
      ? { ...clone(baseSite.data), ...clone(override.data) }
      : clone(baseSite.data);
    const overriddenData = override.data && override.data.sizeValue !== undefined
      ? applyTotalSiteSize(mergedData, override.data.sizeValue, override.data.sizeUnit)
      : mergedData;
    const site = {
      ...clone(baseSite),
      enabled: override.enabled ?? false,
      accordionOpen: baseSite.accordionOpen ?? true,
      data: overriddenData,
    };

    return scaleSiteForCurrentLoad(site, gpuHourlyRates);
  });
};
