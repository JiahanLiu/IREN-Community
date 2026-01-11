import React, { useEffect } from 'react';
import SiteOutputs from './SiteOutputs';
import SiteAccordionHeader from './SiteAccordionHeader';
import LoadInputSection from './LoadInputSection';
import CalcSteps from './CalcSteps';
import GPUCountsSection from './GPUCountsSection';

function HyperscalerSite({ site, result, gpuPrices, gpuHourlyRates, updateSite, updateSiteName, toggleSite, toggleAccordion, deleteSite }) {
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

  // Calculate scaled GPU count based on DC IT Load ratio
  const calculateScaledGpuCount = () => {
    const currentLoad = getCurrentDCITLoad();
    const defaultLoad = site.data.defaultDCITLoad || currentLoad;
    const ratio = defaultLoad > 0 ? currentLoad / defaultLoad : 1;

    const defaultGpuCount = site.data.defaultDirectGpuCount ?? site.data.directGpuCount ?? 0;
    return Math.round(defaultGpuCount * ratio);
  };

  const calculateScaledVeraRubinGpuCount = () => {
    const currentLoad = getCurrentDCITLoad();
    const defaultLoad = site.data.defaultDCITLoad || currentLoad;
    const ratio = defaultLoad > 0 ? currentLoad / defaultLoad : 1;

    const defaultVeraRubinCount = site.data.defaultVeraRubinGpuCount ?? site.data.veraRubinGpuCount ?? 0;
    return Math.round(defaultVeraRubinCount * ratio);
  };

  // Calculate scaled GPU counts for hardware mode 'gpus'
  const calculateScaledGPUs = () => {
    const currentLoad = getCurrentDCITLoad();
    const defaultLoad = site.data.defaultDCITLoad || currentLoad;
    const ratio = defaultLoad > 0 ? currentLoad / defaultLoad : 1;

    const defaultGpus = site.data.defaultGpus || site.data.gpus || {};
    const scaledGpus = {};

    // Dynamically scale all GPU types
    Object.keys(gpuPrices).forEach(gpuType => {
      scaledGpus[gpuType] = Math.round((defaultGpus[gpuType] || 0) * ratio);
    });

    return scaledGpus;
  };

  // Auto-scale GPU count when autoscale is enabled and load changes
  useEffect(() => {
    if (site.data.autoscaleGPUs) {
      const scaledGpuCount = calculateScaledGpuCount();
      const scaledVeraRubinCount = calculateScaledVeraRubinGpuCount();

      // Check if any GPU counts have changed
      const hyperscaleChanged = scaledGpuCount !== site.data.directGpuCount;
      const veraRubinChanged = scaledVeraRubinCount !== site.data.veraRubinGpuCount;

      // Update GPU counts if they have changed
      if (hyperscaleChanged || veraRubinChanged) {
        const updates = {};
        if (hyperscaleChanged) updates.directGpuCount = scaledGpuCount;
        if (veraRubinChanged) updates.veraRubinGpuCount = scaledVeraRubinCount;

        if (site.data.autoCalculateRevenue) {
          const revenueInMillions = calculateContractRevenue(scaledGpuCount, scaledVeraRubinCount, site.data.contractYears || 1);
          updates.toplineRevenue = revenueInMillions;
        }
        updateSite(site.id, updates);
      }

      // Also update GPUs if in 'gpus' hardware mode
      if (site.data.hardwareMode === 'gpus') {
        const scaledGpus = calculateScaledGPUs();
        const currentGpus = site.data.gpus || {};
        const gpusChanged = Object.keys(scaledGpus).some(
          key => scaledGpus[key] !== (currentGpus[key] || 0)
        );

        if (gpusChanged) {
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
    let finalValue = value === '' ? defaultValue : parseFloat(value) || defaultValue;

    // Enforce range for improvedContractsPercentage
    if (field === 'improvedContractsPercentage' && finalValue !== 0) {
      finalValue = Math.max(73.35, Math.min(100, finalValue));
    }

    update(field, finalValue);
  };

  const calculateContractRevenue = (hyperscaleCount, veraRubinCount, contractYears) => {
    const hoursPerYear = 24 * 365;
    const hyperscaleRevenue = (hyperscaleCount || 0) * gpuHourlyRates.hyperscaleBulkGB300 * contractYears * hoursPerYear;
    const veraRubinRevenue = (veraRubinCount || 0) * (gpuHourlyRates.veraRubinNVL144 || 0) * contractYears * hoursPerYear;
    const totalRevenue = hyperscaleRevenue + veraRubinRevenue;
    const roundedDollars = Math.round(totalRevenue);
    return roundedDollars / 1000000;
  };

  const handleGpuCountChange = (field, value) => {
    const parsedValue = value === '' ? '' : parseFloat(value);

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue && parsedValue !== '') {
      const hyperscaleCount = field === 'directGpuCount' ? parsedValue : (site.data.directGpuCount || 0);
      const veraRubinCount = field === 'veraRubinGpuCount' ? parsedValue : (site.data.veraRubinGpuCount || 0);
      const revenueInMillions = calculateContractRevenue(hyperscaleCount, veraRubinCount, site.data.contractYears || 1);
      updateSite(site.id, { [field]: parsedValue, toplineRevenue: revenueInMillions });
    } else {
      update(field, parsedValue);
    }
  };

  const handleGpuCountBlur = (field, value, defaultValue = 0) => {
    const finalValue = value === '' ? defaultValue : parseFloat(value) || defaultValue;

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const hyperscaleCount = field === 'directGpuCount' ? finalValue : (site.data.directGpuCount || 0);
      const veraRubinCount = field === 'veraRubinGpuCount' ? finalValue : (site.data.veraRubinGpuCount || 0);
      const revenueInMillions = calculateContractRevenue(hyperscaleCount, veraRubinCount, site.data.contractYears || 1);
      updateSite(site.id, { [field]: finalValue, toplineRevenue: revenueInMillions });
    } else {
      update(field, finalValue);
    }
  };

  const handleContractYearsChange = (value) => {
    const parsedValue = value === '' ? '' : parseFloat(value);

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue && parsedValue !== '') {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, site.data.veraRubinGpuCount || 0, parsedValue);
      updateSite(site.id, { contractYears: parsedValue, toplineRevenue: revenueInMillions });
    } else {
      update('contractYears', parsedValue);
    }
  };

  const handleContractYearsBlur = (value, defaultValue = 1) => {
    const finalValue = value === '' ? defaultValue : parseFloat(value) || defaultValue;

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, site.data.veraRubinGpuCount || 0, finalValue);
      updateSite(site.id, { contractYears: finalValue, toplineRevenue: revenueInMillions });
    } else {
      update('contractYears', finalValue);
    }
  };

  const handleAutoCalculateToggle = () => {
    const newAutoCalculate = !site.data.autoCalculateRevenue;

    // If enabling auto-calculate, immediately calculate revenue
    if (newAutoCalculate) {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, site.data.veraRubinGpuCount || 0, site.data.contractYears || 1);
      updateSite(site.id, { autoCalculateRevenue: newAutoCalculate, toplineRevenue: revenueInMillions });
    } else {
      update('autoCalculateRevenue', newAutoCalculate);
    }
  };

  const handleAutoscaleGPUsToggle = () => {
    const newAutoscale = !site.data.autoscaleGPUs;

    // If enabling autoscale, immediately calculate scaled values
    if (newAutoscale) {
      const scaledGpuCount = calculateScaledGpuCount();
      const scaledVeraRubinCount = calculateScaledVeraRubinGpuCount();

      // Also initialize default values if not set
      const defaultLoad = site.data.defaultDCITLoad || getCurrentDCITLoad();
      const defaultGpuCount = site.data.defaultDirectGpuCount ?? site.data.directGpuCount ?? 0;
      const defaultVeraRubinCount = site.data.defaultVeraRubinGpuCount ?? site.data.veraRubinGpuCount ?? 0;

      const updates = {
        autoscaleGPUs: newAutoscale,
        directGpuCount: scaledGpuCount,
        veraRubinGpuCount: scaledVeraRubinCount,
        defaultDCITLoad: defaultLoad,
        defaultDirectGpuCount: defaultGpuCount,
        defaultVeraRubinGpuCount: defaultVeraRubinCount
      };

      // If using GPU hardware mode, also scale and save default GPUs
      if (site.data.hardwareMode === 'gpus') {
        const scaledGpus = calculateScaledGPUs();
        const defaultGpus = site.data.defaultGpus || site.data.gpus || {};
        updates.gpus = scaledGpus;
        updates.defaultGpus = defaultGpus;
      }

      // If auto-calculate revenue is enabled, update revenue too
      if (site.data.autoCalculateRevenue) {
        const revenueInMillions = calculateContractRevenue(scaledGpuCount, scaledVeraRubinCount, site.data.contractYears || 1);
        updates.toplineRevenue = revenueInMillions;
      }

      updateSite(site.id, updates);
    } else {
      update('autoscaleGPUs', newAutoscale);
    }
  };

  const handleGpuChange = (gpuType, value) => {
    update('gpus', { ...site.data.gpus, [gpuType]: value === '' ? '' : parseFloat(value) });
  };

  const handleGpuBlur = (gpuType, value) => {
    update('gpus', { ...site.data.gpus, [gpuType]: value === '' ? 0 : parseFloat(value) || 0 });
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
            fieldMap={{
              'hyperscaleBulkGB300': 'directGpuCount',
              'veraRubinNVL144': 'veraRubinGpuCount'
            }}
            displayNames={{
              'hyperscaleBulkGB300': 'Hyperscale Bulk GB300',
              'veraRubinNVL144': 'Hyperscale Bulk Vera Rubin NVL144',
              'gb300': 'GB300',
              'b200': 'B200',
              'b300': 'B300',
              'mi350x': 'MI350X'
            }}
            siteData={site.data}
            autoscaleGPUs={site.data.autoscaleGPUs}
            onGpuChange={handleGpuChange}
            onGpuBlur={handleGpuBlur}
            onHyperscaleGpuChange={handleGpuCountChange}
            onHyperscaleGpuBlur={handleGpuCountBlur}
          />

          <div className="input-row">
            <label>Contract Years</label>
            <input
              type="number"
              value={site.data.contractYears}
              onChange={(e) => handleContractYearsChange(e.target.value)}
              onBlur={(e) => handleContractYearsBlur(e.target.value, 1)}
            />
          </div>

          <div className="input-row">
            <label>Auto Calculate Base Contract Revenue from GPU Counts</label>
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
            <label>Base Contract Revenue ($M)</label>
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
            <label>Hardware Cost Input Mode</label>
            <select
              value={site.data.hardwareMode}
              onChange={(e) => update('hardwareMode', e.target.value)}
            >
              <option value="total">Total All-in Hardware Cost</option>
              <option value="gpus">Calculate from GPU Count</option>
            </select>
          </div>

          {site.data.hardwareMode === 'total' && (
            <div className="input-row">
              <label>Total Hardware Cost ($M)</label>
              <input
                type="number"
                value={site.data.totalHardwareCost}
                onChange={(e) => handleNumberChange('totalHardwareCost', e.target.value)}
                onBlur={(e) => handleNumberBlur('totalHardwareCost', e.target.value)}
              />
            </div>
          )}

          <div className="input-row">
            <label>DC Cost per MW ($M)</label>
            <input
              type="number"
              value={site.data.dcCostPerMW}
              onChange={(e) => handleNumberChange('dcCostPerMW', e.target.value)}
              onBlur={(e) => handleNumberBlur('dcCostPerMW', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>DC Lifetime (years)</label>
            <input
              type="number"
              value={site.data.dcLifetime}
              onChange={(e) => handleNumberChange('dcLifetime', e.target.value)}
              onBlur={(e) => handleNumberBlur('dcLifetime', e.target.value, 1)}
            />
          </div>

          <div className="input-row">
            <label>Prepayment % of Revenue</label>
            <input
              type="number"
              value={site.data.prepaymentPercent}
              onChange={(e) => handleNumberChange('prepaymentPercent', e.target.value)}
              onBlur={(e) => handleNumberBlur('prepaymentPercent', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={site.data.interestRate}
              onChange={(e) => handleNumberChange('interestRate', e.target.value)}
              onBlur={(e) => handleNumberBlur('interestRate', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>Loan Term (years)</label>
            <input
              type="number"
              value={site.data.debtYears}
              onChange={(e) => handleNumberChange('debtYears', e.target.value)}
              onBlur={(e) => handleNumberBlur('debtYears', e.target.value, 1)}
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
            <label>Improved Contract</label>
            <div
              className={`toggle-switch ${site.data.contractGapEnabled ? 'enabled' : ''}`}
              onClick={(e) => { e.stopPropagation(); update('contractGapEnabled', !site.data.contractGapEnabled); }}
            >
              <span className="toggle-label">{site.data.contractGapEnabled ? 'Enabled' : 'Disabled'}</span>
              <div className="toggle-slider"></div>
            </div>
          </div>

          {site.data.contractGapEnabled && (
            <>
              <div className="input-row">
                <label>Improvement Calculation Mode</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={site.data.improvementMode === 'percentage'}
                      onChange={() => update('improvementMode', 'percentage')}
                    />
                    Percentage of NBIS-MSFT
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={site.data.improvementMode === 'direct' || !site.data.improvementMode}
                      onChange={() => update('improvementMode', 'direct')}
                    />
                    Improvement Percentage
                  </label>
                </div>
              </div>

              {site.data.improvementMode === 'percentage' && (
                <div className="input-row">
                  <label>Improved Contract as a Percentage of NBIS-MSFT (%)</label>
                  <div style={{ width: '100%' }}>
                    <input
                      type="number"
                      min="73.35"
                      max="100"
                      step="0.01"
                      style={{ width: '100%' }}
                      value={site.data.improvedContractsPercentage ?? 0}
                      onChange={(e) => handleNumberChange('improvedContractsPercentage', e.target.value)}
                      onBlur={(e) => handleNumberBlur('improvedContractsPercentage', e.target.value, 0)}
                    />
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      The first IREN-MSFT Contract's Revenue was ~73.35% of NBIS-MSFT Contract's Revenue. We expect subsequent contracts to be better than ~73.35% because IREN's credibility and/or uptime track record will enable them to negotiate a better topline. The total cost of GPUs, hardware, DC and all operation cost is reflected in the items subtracted from Base Revenue and any additional revenue is profit. This percentage should be between 73.35% and 100%.
                    </div>
                  </div>
                </div>
              )}

              {(site.data.improvementMode === 'direct' || !site.data.improvementMode) && (
                <div className="input-row">
                  <label>Improvement Percentage (%)</label>
                  <div style={{ width: '100%' }}>
                    <input
                      type="number"
                      step="0.01"
                      style={{ width: '100%' }}
                      value={site.data.directImprovement ?? 0}
                      onChange={(e) => handleNumberChange('directImprovement', e.target.value)}
                      onBlur={(e) => handleNumberBlur('directImprovement', e.target.value, 0)}
                    />
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem', lineHeight: '1.4' }}>
                      Enter the improvement percentage relative to base contract revenue.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

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

export default HyperscalerSite;

