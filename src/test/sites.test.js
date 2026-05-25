import { describe, expect, it } from 'vitest';
import { buildScenarioSites } from '../constants/sites';

const childressId = 'childress-block-6-10';
const horizon56Id = 'horizon-5-6';
const kiowaId = 'kiowa';
const mackenzieId = 'mackenzie-canal';
const nostrumGroupId = 'nostrum-group';
const oklahomaId = 'oklahoma';
const sw1Id = 'sweetwater-1-1400mw';
const sw2Id = 'sweetwater-2-600mw';

const expectedB3002026OnlyGpus = (b3002026) => ({
  b200: 0,
  b300: 0,
  b3002026,
  gb300: 0,
  mi350x: 0,
  hyperscaleBulkGB300: 0,
  veraRubin: 0,
});

const getChildressSite = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === childressId);
const getHorizon56Site = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === horizon56Id);
const getKiowaSite = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === kiowaId);
const getMackenzieSite = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === mackenzieId);
const getNostrumGroupSite = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === nostrumGroupId);
const getOklahomaSite = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === oklahomaId);
const getSw1Site = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === sw1Id);
const getSw2Site = (scenario) =>
  buildScenarioSites(scenario).find(site => site.id === sw2Id);

describe('Childress Block 7-10 scenario defaults', () => {
  it('keeps 2025 disabled with 6,666 B300 2026-pricing GPUs and no other GPUs', () => {
    const childress = getChildressSite('2025');

    expect(childress.enabled).toBe(false);
    expect(childress.data.gpus).toEqual(expectedB3002026OnlyGpus(6666));
    expect(childress.data.defaultGpus).toEqual(expectedB3002026OnlyGpus(6666));
  });

  it('enables 2026 with 6,666 B300 2026-pricing GPUs and no other GPUs', () => {
    const childress = getChildressSite('2026');

    expect(childress.enabled).toBe(true);
    expect(childress.data.gpus).toEqual(expectedB3002026OnlyGpus(6666));
    expect(childress.data.defaultGpus).toEqual(expectedB3002026OnlyGpus(6666));
  });

  it.each(['2027', '2028', '2029', '2030'])(
    'enables %s with 100,000 B300 2026-pricing GPUs and no other GPUs',
    (scenario) => {
      const childress = getChildressSite(scenario);

      expect(childress.enabled).toBe(true);
      expect(childress.data.gpus).toEqual(expectedB3002026OnlyGpus(100000));
      expect(childress.data.defaultGpus).toEqual(expectedB3002026OnlyGpus(100000));
    }
  );
});

describe('Mackenzie + Canal Flats scenario defaults', () => {
  it('uses B300 2025 pricing for the 2025 mixed GPU bundle', () => {
    const mackenzie = getMackenzieSite('2025');

    expect(mackenzie.data.gpus.b300).toBe(19000);
    expect(mackenzie.data.gpus.b3002026).toBe(0);
    expect(mackenzie.data.defaultGpus.b300).toBe(19000);
    expect(mackenzie.data.defaultGpus.b3002026).toBe(0);
  });

  it.each(['2026', '2027', '2028', '2029', '2030'])(
    'uses B300 2026 pricing for %s B300-only scenarios',
    (scenario) => {
      const mackenzie = getMackenzieSite(scenario);

      expect(mackenzie.data.gpus).toEqual(expectedB3002026OnlyGpus(45833));
      expect(mackenzie.data.defaultGpus).toEqual(expectedB3002026OnlyGpus(45833));
    }
  );
});

describe('Oklahoma scenario defaults', () => {
  it.each(['2025', '2026', '2027', '2028'])('is disabled in the %s scenario', (scenario) => {
    expect(getOklahomaSite(scenario).enabled).toBe(false);
  });

  it.each(['2029', '2030'])(
    'uses 1000MW and 107,333 Vera Rubin 2026-pricing GPUs in the %s scenario',
    (scenario) => {
      const oklahoma = getOklahomaSite(scenario);

      expect(oklahoma.enabled).toBe(true);
      expect(oklahoma.data.sizeValue).toBe(1000);
      expect(oklahoma.data.sizeUnit).toBe('MW');
      expect(oklahoma.data.itLoad).toBeCloseTo(666.67, 2);
      expect(oklahoma.data.defaultDCITLoad).toBeCloseTo(666.67, 2);
      expect(oklahoma.data.directGpuCount).toBe(0);
      expect(oklahoma.data.defaultDirectGpuCount).toBe(0);
      expect(oklahoma.data.veraRubinGpuCount).toBe(107333);
      expect(oklahoma.data.defaultVeraRubinGpuCount).toBe(107333);
    }
  );
});

describe('SW1 scenario defaults', () => {
  it('uses 300MW and 32,200 Vera Rubin 2026-pricing GPUs in the 2027 scenario', () => {
    const sw1 = getSw1Site('2027');

    expect(sw1.enabled).toBe(true);
    expect(sw1.data.sizeValue).toBe(300);
    expect(sw1.data.sizeUnit).toBe('MW');
    expect(sw1.data.itLoad).toBe(200);
    expect(sw1.data.defaultDCITLoad).toBe(200);
    expect(sw1.data.veraRubinGpuCount).toBe(32200);
    expect(sw1.data.defaultVeraRubinGpuCount).toBe(32200);
  });

  it.each(['2028', '2029', '2030'])(
    'uses 1400MW and 150,266 Vera Rubin 2026-pricing GPUs in the %s scenario',
    (scenario) => {
      const sw1 = getSw1Site(scenario);

      expect(sw1.enabled).toBe(true);
      expect(sw1.data.sizeValue).toBe(1400);
      expect(sw1.data.sizeUnit).toBe('MW');
      expect(sw1.data.itLoad).toBeCloseTo(933.33, 2);
      expect(sw1.data.defaultDCITLoad).toBeCloseTo(933.33, 2);
      expect(sw1.data.veraRubinGpuCount).toBe(150266);
      expect(sw1.data.defaultVeraRubinGpuCount).toBe(150266);
    }
  );
});

describe('SW2 scenario defaults', () => {
  it.each(['2025', '2026', '2027', '2028'])('is disabled in the %s scenario', (scenario) => {
    expect(getSw2Site(scenario).enabled).toBe(false);
  });

  it.each(['2029', '2030'])(
    'uses 600MW and 64,400 Vera Rubin 2026-pricing GPUs in the %s scenario',
    (scenario) => {
      const sw2 = getSw2Site(scenario);

      expect(sw2.enabled).toBe(true);
      expect(sw2.name).toBe('SW2');
      expect(sw2.data.sizeValue).toBe(600);
      expect(sw2.data.sizeUnit).toBe('MW');
      expect(sw2.data.itLoad).toBe(400);
      expect(sw2.data.defaultDCITLoad).toBe(400);
      expect(sw2.data.veraRubinGpuCount).toBe(64400);
      expect(sw2.data.defaultVeraRubinGpuCount).toBe(64400);
    }
  );
});

describe('Horizon 5-6 scenario defaults', () => {
  it.each(['2028', '2029', '2030'])('is enabled in the %s scenario', (scenario) => {
    expect(getHorizon56Site(scenario).enabled).toBe(true);
  });
});

describe('Nostrum Group scenario defaults', () => {
  it.each(['2025', '2026', '2027', '2028', '2029'])('is disabled in the %s scenario', (scenario) => {
    expect(getNostrumGroupSite(scenario).enabled).toBe(false);
  });

  it('uses 490MW and 52,593 Vera Rubin 2026-pricing GPUs in the 2030 scenario', () => {
    const nostrumGroup = getNostrumGroupSite('2030');

    expect(nostrumGroup.enabled).toBe(true);
    expect(nostrumGroup.name).toBe('Nostrum Group');
    expect(nostrumGroup.data.sizeValue).toBe(490);
    expect(nostrumGroup.data.sizeUnit).toBe('MW');
    expect(nostrumGroup.data.itLoad).toBeCloseTo(326.67, 2);
    expect(nostrumGroup.data.defaultDCITLoad).toBeCloseTo(326.67, 2);
    expect(nostrumGroup.data.directGpuCount).toBe(0);
    expect(nostrumGroup.data.defaultDirectGpuCount).toBe(0);
    expect(nostrumGroup.data.veraRubinGpuCount).toBe(52593);
    expect(nostrumGroup.data.defaultVeraRubinGpuCount).toBe(52593);
  });
});

describe('Kiowa scenario defaults', () => {
  it.each(['2025', '2026', '2027', '2028', '2029'])('is disabled in the %s scenario', (scenario) => {
    expect(getKiowaSite(scenario).enabled).toBe(false);
  });

  it('uses 1200MW and 128,800 Vera Rubin 2026-pricing GPUs in the 2030 scenario', () => {
    const kiowa = getKiowaSite('2030');

    expect(kiowa.enabled).toBe(true);
    expect(kiowa.name).toBe('Kiowa');
    expect(kiowa.data.sizeValue).toBe(1200);
    expect(kiowa.data.sizeUnit).toBe('MW');
    expect(kiowa.data.itLoad).toBe(800);
    expect(kiowa.data.defaultDCITLoad).toBe(800);
    expect(kiowa.data.directGpuCount).toBe(0);
    expect(kiowa.data.defaultDirectGpuCount).toBe(0);
    expect(kiowa.data.veraRubinGpuCount).toBe(128800);
    expect(kiowa.data.defaultVeraRubinGpuCount).toBe(128800);
  });
});
