import React, { useEffect } from 'react';
import SiteOutputs from './shared/SiteOutputs';
import SiteAccordionHeader from './shared/SiteAccordionHeader';
import LoadInputSection from './shared/LoadInputSection';
import CalcSteps from './shared/CalcSteps';
import GPUCountsSection from './shared/GPUCountsSection';

function IRENCloudSite({ site, result, gpuPrices, gpuHourlyRates, updateSite, updateSiteName, toggleSite, toggleAccordion, deleteSite }) {
  const update = (field, value) => {
    updateSite(site.id, { [field]: value });
  };

  // Calculate current DC IT Load in MW
  const getCurrentDCITLoad = () => {
    if (site.data.loadInputMode === 'total') {
      const totalLoadMW = site.data.sizeUnit === 'GW'
        ? site.data.sizeValue * 1000
        : site.data.sizeValue;
      return totalLoadMW / (site.data.pue || 1);
    } else {
      return site.data.itLoadUnit === 'GW'
        ? (site.data.itLoad || 0) * 1000
        : (site.data.itLoad || 0);
    }
  };

  // Calculate scaled GPU counts based on DC IT Load ratio
  const calculateScaledGPUs = () => {
    const currentLoad = getCurrentDCITLoad();
    const defaultLoad = site.data.defaultDCITLoad || currentLoad;
    const ratio = defaultLoad > 0 ? currentLoad / defaultLoad : 1;

    const defaultGpus = site.data.defaultGpus || site.data.gpus;
    const scaledGpus = {};

    // Dynamically scale all GPU types
    Object.keys(gpuPrices).forEach(gpuType => {
      scaledGpus[gpuType] = Math.round((defaultGpus[gpuType] || 0) * ratio);
    });

    return scaledGpus;
  };

  // Auto-scale GPUs when autoscale is enabled and load changes
  useEffect(() => {
    if (site.data.autoscaleGPUs) {
      const scaledGpus = calculateScaledGPUs();""

      // Only update if GPUs have actually changed
      const currentGpus = site.data.gpus;
      const gpusChanged = Object.keys(scaledGpus).some(
        key => scaledGpus[key] !== (currentGpus[key] || 0)
      );

      if (gpusChanged) {
        if (site.data.autoCalculateRevenue) {
          const calculatedRevenue = calculateRevenueFromGPUs(scaledGpus);
          updateSite(site.id, { gpus: scaledGpus, toplineRevenue: calculatedRevenue });
        } else {
          update('gpus', scaledGpus);
        }
      }
    }
  }, [site.data.autoscaleGPUs, site.data.loadInputMode, site.data.sizeValue, site.data.sizeUnit,
      site.data.pue, site.data.itLoad, site.data.itLoadUnit]);

  const handleNumberChange = (field, value) => {
    update(field, value === '' ? '' : parseFloat(value));
  };

  const handleNumberBlur = (field, value, defaultValue = 0) => {
    update(field, value === '' ? defaultValue : parseFloat(value) || defaultValue);
  };

  const handleGpuChange = (gpuType, value) => {
    const newGpus = { ...site.data.gpus, [gpuType]: value === '' ? '' : parseFloat(value) };

    // Auto-calculate revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const calculatedRevenue = calculateRevenueFromGPUs(newGpus);
      updateSite(site.id, { gpus: newGpus, toplineRevenue: calculatedRevenue });
    } else {
      update('gpus', newGpus);
    }
  };

  const handleGpuBlur = (gpuType, value) => {
    const newGpus = { ...site.data.gpus, [gpuType]: value === '' ? 0 : parseFloat(value) || 0 };

    // Auto-calculate revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const calculatedRevenue = calculateRevenueFromGPUs(newGpus);
      updateSite(site.id, { gpus: newGpus, toplineRevenue: calculatedRevenue });
    } else {
      update('gpus', newGpus);
    }
  };

  const calculateRevenueFromGPUs = (gpus) => {
    const hoursPerYear = 24 * 365;
    let revenueInDollars = 0;

    // Dynamically calculate revenue for all GPU types
    Object.keys(gpuPrices).forEach(gpuType => {
      const gpuCount = gpus[gpuType] || 0;
      const hourlyRate = gpuHourlyRates[gpuType] || 0;
      revenueInDollars += gpuCount * hourlyRate * hoursPerYear;
    });

    const roundedDollars = Math.round(revenueInDollars); // Round to nearest dollar
    return roundedDollars / 1000000; // Convert to millions
  };

  const handleAutoCalculateToggle = () => {
    const newAutoCalculate = !site.data.autoCalculateRevenue;

    // If enabling auto-calculate, immediately calculate revenue
    if (newAutoCalculate) {
      const calculatedRevenue = calculateRevenueFromGPUs(site.data.gpus);
      updateSite(site.id, { autoCalculateRevenue: newAutoCalculate, toplineRevenue: calculatedRevenue });
    } else {
      update('autoCalculateRevenue', newAutoCalculate);
    }
  };

  const handleAutoscaleGPUsToggle = () => {
    const newAutoscale = !site.data.autoscaleGPUs;

    // If enabling autoscale, immediately calculate scaled GPUs
    if (newAutoscale) {
      const scaledGpus = calculateScaledGPUs();

      // Also initialize default values if not set
      const defaultLoad = site.data.defaultDCITLoad || getCurrentDCITLoad();
      const defaultGpus = site.data.defaultGpus || site.data.gpus;

      if (site.data.autoCalculateRevenue) {
        const calculatedRevenue = calculateRevenueFromGPUs(scaledGpus);
        updateSite(site.id, {
          autoscaleGPUs: newAutoscale,
          gpus: scaledGpus,
          defaultDCITLoad: defaultLoad,
          defaultGpus: defaultGpus,
          toplineRevenue: calculatedRevenue
        });
      } else {
        updateSite(site.id, {
          autoscaleGPUs: newAutoscale,
          gpus: scaledGpus,
          defaultDCITLoad: defaultLoad,
          defaultGpus: defaultGpus
        });
      }
    } else {
      update('autoscaleGPUs', newAutoscale);
    }
  };

  const getDCCostPerMW = () => {
    if (site.data.dcType === 'retrofit') return 0;
    if (site.data.newDcType === 't3-liquid') return 15;
    if (site.data.newDcType === 't2-liquid') return 8;
    if (site.data.newDcType === 't2-air') return 2;
    return site.data.dcCostPerMW || 0;
  };

  return (
    <div className="accordion">
      <SiteAccordionHeader
        site={site}
        result={result}
        updateSiteName={updateSiteName}
        toggleSite={toggleSite}
        toggleAccordion={toggleAccordion}
        deleteSite={deleteSite}
      />

      {site.accordionOpen && (
        <div className="accordion-content">
          {!site.enabled ? (
            <div className="disabled-message">
              Site Disabled. Please Enable to Input Parameters.
            </div>
          ) : (
            <>
            <div className="site-content-layout">
              <SiteOutputs result={result} />
              <div className="site-inputs">
              <LoadInputSection
                loadInputMode={site.data.loadInputMode}
                sizeValue={site.data.sizeValue}
                sizeUnit={site.data.sizeUnit}
                pue={site.data.pue}
                itLoad={site.data.itLoad}
                itLoadUnit={site.data.itLoadUnit}
                onModeChange={(mode) => update('loadInputMode', mode)}
                onSizeValueChange={(value) => handleNumberChange('sizeValue', value)}
                onSizeValueBlur={(value) => handleNumberBlur('sizeValue', value)}
                onSizeUnitChange={(value) => update('sizeUnit', value)}
                onPueChange={(value) => handleNumberChange('pue', value)}
                onPueBlur={(value) => handleNumberBlur('pue', value, 1)}
                onItLoadChange={(value) => handleNumberChange('itLoad', value)}
                onItLoadBlur={(value) => handleNumberBlur('itLoad', value)}
                onItLoadUnitChange={(value) => update('itLoadUnit', value)}
              />

          <div className="input-row">
            <label>Autoscale GPU Counts based on DC IT Load?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={site.data.autoscaleGPUs === true}
                  onChange={() => handleAutoscaleGPUsToggle()}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  checked={site.data.autoscaleGPUs !== true}
                  onChange={() => {
                    if (site.data.autoscaleGPUs) {
                      update('autoscaleGPUs', false);
                    }
                  }}
                />
                No
              </label>
            </div>
          </div>

          <GPUCountsSection
            gpuPrices={gpuPrices}
            gpuValues={site.data.gpus}
            siteData={site.data}
            autoscaleGPUs={site.data.autoscaleGPUs}
            onGpuChange={handleGpuChange}
            onGpuBlur={handleGpuBlur}
            extraInputs={
              <div className="input-row">
                <label>Paid Off (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={site.data.gpuPaidOffPercent ?? 0}
                  onChange={(e) => handleNumberChange('gpuPaidOffPercent', e.target.value)}
                  onBlur={(e) => handleNumberBlur('gpuPaidOffPercent', e.target.value, 0)}
                />
              </div>
            }
          />

              <div className="input-row">
                <label>Auto Calculate Base Revenue from GPU Counts?</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={site.data.autoCalculateRevenue === true}
                      onChange={() => handleAutoCalculateToggle()}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={site.data.autoCalculateRevenue !== true}
                      onChange={() => {
                        if (site.data.autoCalculateRevenue) {
                          update('autoCalculateRevenue', false);
                        }
                      }}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="input-row">
                <label>Base Revenue ($M)</label>
                <input
                  type="number"
                  value={site.data.toplineRevenue}
                  onChange={(e) => handleNumberChange('toplineRevenue', e.target.value)}
                  onBlur={(e) => handleNumberBlur('toplineRevenue', e.target.value)}
                  disabled={site.data.autoCalculateRevenue}
                  style={site.data.autoCalculateRevenue ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                />
              </div>

              <div className="input-row">
                <label>Project EBITDA Margin (%)</label>
                <input
                  type="number"
                  value={site.data.ebitdaMargin}
                  onChange={(e) => handleNumberChange('ebitdaMargin', e.target.value)}
                  onBlur={(e) => handleNumberBlur('ebitdaMargin', e.target.value)}
                />
              </div>

          <div className="input-row">
            <label>GPU Deployment Period (years)</label>
            <input
              type="number"
              value={site.data.gpuUsefulLife}
              onChange={(e) => handleNumberChange('gpuUsefulLife', e.target.value)}
              onBlur={(e) => handleNumberBlur('gpuUsefulLife', e.target.value, 1)}
            />
          </div>

          <div className="input-row">
            <label>GPU Residual Value Percentage (%)</label>
            <input
              type="number"
              value={site.data.residualValue ?? 0}
              onChange={(e) => handleNumberChange('residualValue', e.target.value)}
              onBlur={(e) => handleNumberBlur('residualValue', e.target.value, 0)}
            />
          </div>

          <div className="input-row">
            <label>Data Center Type</label>
            <select
              value={site.data.dcType}
              onChange={(e) => {
                const dcType = e.target.value;
                if (dcType === 'new') {
                  // Initialize newDcType and dcCostPerMW when switching to new DC
                  const newDcType = site.data.newDcType || 't3-liquid';
                  let dcCostPerMW = 15; // default for t3-liquid
                  // Only use existing dcCostPerMW if it's a valid non-zero value
                  if (site.data.dcCostPerMW && site.data.dcCostPerMW > 0) {
                    dcCostPerMW = site.data.dcCostPerMW;
                  } else {
                    // Set based on newDcType
                    if (newDcType === 't2-liquid') dcCostPerMW = 8;
                    else if (newDcType === 't2-air') dcCostPerMW = 2;
                    else if (newDcType === 't3-liquid') dcCostPerMW = 15;
                  }
                  updateSite(site.id, {
                    dcType: 'new',
                    newDcType: newDcType,
                    dcCostPerMW: dcCostPerMW
                  });
                } else {
                  update('dcType', dcType);
                }
              }}
            >
              <option value="retrofit">Retrofit DC</option>
              <option value="new">New DC</option>
            </select>
          </div>

          {site.data.dcType === 'retrofit' ? (
            <>
              <div className="input-row">
                <label>Retrofit Capex per MW ($M)</label>
                <input
                  type="number"
                  value={site.data.retrofitCapexPerMW ?? 0}
                  onChange={(e) => handleNumberChange('retrofitCapexPerMW', e.target.value)}
                  onBlur={(e) => handleNumberBlur('retrofitCapexPerMW', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>DC Useful Lifetime (years)</label>
                <input
                  type="number"
                  value={site.data.dcLifetime ?? 20}
                  onChange={(e) => handleNumberChange('dcLifetime', e.target.value)}
                  onBlur={(e) => handleNumberBlur('dcLifetime', e.target.value, 1)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-row">
                <label>New DC Type</label>
                <select
                  value={site.data.newDcType || 't3-liquid'}
                  onChange={(e) => {
                    const type = e.target.value;
                    let updates = { newDcType: type };
                    if (type === 't3-liquid') {
                      updates.dcCostPerMW = 15;
                    } else if (type === 't2-liquid') {
                      updates.dcCostPerMW = 8;
                    } else if (type === 't2-air') {
                      updates.dcCostPerMW = 2;
                    }
                    // For 'custom', don't update dcCostPerMW - keep existing value
                    updateSite(site.id, updates);
                  }}
                >
                  <option value="t3-liquid">T3 Liquid Cooled</option>
                  <option value="t2-liquid">T2 Liquid Cooled</option>
                  <option value="t2-air">T2 Air Cooled</option>
                  <option value="custom">Custom DC</option>
                </select>
              </div>

              <div className="input-row">
                <label>Cost per MW IT Load ($M/MW)</label>
                <input
                  type="number"
                  value={site.data.dcCostPerMW ?? getDCCostPerMW()}
                  onChange={(e) => handleNumberChange('dcCostPerMW', e.target.value)}
                  onBlur={(e) => handleNumberBlur('dcCostPerMW', e.target.value)}
                />
              </div>

              <div className="input-row">
                <label>DC Useful Lifetime (years)</label>
                <input
                  type="number"
                  value={site.data.dcLifetime ?? 20}
                  onChange={(e) => handleNumberChange('dcLifetime', e.target.value)}
                  onBlur={(e) => handleNumberBlur('dcLifetime', e.target.value, 1)}
                />
              </div>
            </>
          )}

          <div className="input-row">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={site.data.interestRate ?? 7}
              onChange={(e) => handleNumberChange('interestRate', e.target.value)}
              onBlur={(e) => handleNumberBlur('interestRate', e.target.value, 0)}
            />
          </div>

          <div className="input-row">
            <label>Loan Term (years)</label>
            <input
              type="number"
              value={site.data.debtYears ?? 5}
              onChange={(e) => handleNumberChange('debtYears', e.target.value)}
              onBlur={(e) => handleNumberBlur('debtYears', e.target.value, 1)}
            />
          </div>

              </div>
            </div>
            <CalcSteps steps={result.steps} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IRENCloudSite;

