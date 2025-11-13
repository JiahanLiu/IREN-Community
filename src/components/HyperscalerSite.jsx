import React, { useEffect, useState } from 'react';

function HyperscalerSite({ site, result, gpuPrices, gpuHourlyRates, updateSite, toggleSite, toggleAccordion, deleteSite }) {
  const [gpuCountsOpen, setGpuCountsOpen] = useState(false);

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

      // Update directGpuCount if it has changed
      if (scaledGpuCount !== site.data.directGpuCount) {
        if (site.data.autoCalculateRevenue) {
          const revenueInMillions = calculateContractRevenue(scaledGpuCount, site.data.contractYears || 1);
          updateSite(site.id, { directGpuCount: scaledGpuCount, toplineRevenue: revenueInMillions });
        } else {
          update('directGpuCount', scaledGpuCount);
        }
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

  const calculateContractRevenue = (gpuCount, contractYears) => {
    const hoursPerYear = 24 * 365;
    const revenueInDollars = gpuCount * gpuHourlyRates.hyperscaleBulkGB300 * contractYears * hoursPerYear;
    const roundedDollars = Math.round(revenueInDollars);
    return roundedDollars / 1000000;
  };

  const handleGpuCountChange = (field, value) => {
    const parsedValue = value === '' ? '' : parseFloat(value);

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue && parsedValue !== '') {
      const revenueInMillions = calculateContractRevenue(parsedValue, site.data.contractYears || 1);
      updateSite(site.id, { [field]: parsedValue, toplineRevenue: revenueInMillions });
    } else {
      update(field, parsedValue);
    }
  };

  const handleGpuCountBlur = (field, value, defaultValue = 0) => {
    const finalValue = value === '' ? defaultValue : parseFloat(value) || defaultValue;

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const revenueInMillions = calculateContractRevenue(finalValue, site.data.contractYears || 1);
      updateSite(site.id, { [field]: finalValue, toplineRevenue: revenueInMillions });
    } else {
      update(field, finalValue);
    }
  };

  const handleContractYearsChange = (value) => {
    const parsedValue = value === '' ? '' : parseFloat(value);

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue && parsedValue !== '') {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, parsedValue);
      updateSite(site.id, { contractYears: parsedValue, toplineRevenue: revenueInMillions });
    } else {
      update('contractYears', parsedValue);
    }
  };

  const handleContractYearsBlur = (value, defaultValue = 1) => {
    const finalValue = value === '' ? defaultValue : parseFloat(value) || defaultValue;

    // Auto-calculate base contract revenue if enabled
    if (site.data.autoCalculateRevenue) {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, finalValue);
      updateSite(site.id, { contractYears: finalValue, toplineRevenue: revenueInMillions });
    } else {
      update('contractYears', finalValue);
    }
  };

  const handleAutoCalculateToggle = () => {
    const newAutoCalculate = !site.data.autoCalculateRevenue;

    // If enabling auto-calculate, immediately calculate revenue
    if (newAutoCalculate) {
      const revenueInMillions = calculateContractRevenue(site.data.directGpuCount || 0, site.data.contractYears || 1);
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

      // Also initialize default values if not set
      const defaultLoad = site.data.defaultDCITLoad || getCurrentDCITLoad();
      const defaultGpuCount = site.data.defaultDirectGpuCount ?? site.data.directGpuCount ?? 0;

      const updates = {
        autoscaleGPUs: newAutoscale,
        directGpuCount: scaledGpuCount,
        defaultDCITLoad: defaultLoad,
        defaultDirectGpuCount: defaultGpuCount
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
        const revenueInMillions = calculateContractRevenue(scaledGpuCount, site.data.contractYears || 1);
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

  const isOpen = site.accordionOpen;

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => toggleAccordion(site.id)}>
        <div className="accordion-title-row">
          <input
            type="text"
            value={site.name}
            onClick={(e) => e.stopPropagation()}
            className="site-name-input"
            readOnly
          />
          <span className="site-type-badge">{site.type}</span>
          <div className="site-actions" onClick={(e) => e.stopPropagation()}>
            <div
              className={`toggle-switch ${site.enabled ? 'enabled' : ''}`}
              onClick={() => toggleSite(site.id)}
            >
              <div className="toggle-slider"></div>
            </div>
            <button className="delete-btn" onClick={() => deleteSite(site.id)}>Delete</button>
          </div>
        </div>
        <div className="net-profit-display">
          <div className="label">Annual Revenue</div>
          <div className="value">${(result.revenue / 1000).toFixed(2)}B/yr</div>
        </div>
        <div className="net-profit-display">
          <div className="label">Earnings before Tax, SG&A</div>
          <div className="value">${result.netProfit.toFixed(2)}M/yr</div>
        </div>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div className="accordion-content">
          {!site.enabled ? (
            <div className="disabled-message">
              Site Disabled. Please Enable to Input Parameters.
            </div>
          ) : (
            <>
              <div className="input-row">
                <label>Load Input Mode</label>
                <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={site.data.loadInputMode === 'total'}
                  onChange={() => update('loadInputMode', 'total')}
                />
                Total Load + PUE
              </label>
              <label>
                <input
                  type="radio"
                  checked={site.data.loadInputMode === 'direct'}
                  onChange={() => update('loadInputMode', 'direct')}
                />
                DC IT Load
              </label>
            </div>
          </div>

          {site.data.loadInputMode === 'total' ? (
            <>
              <div className="input-row">
                <label>Site Size/Total Load</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={site.data.sizeValue}
                    onChange={(e) => handleNumberChange('sizeValue', e.target.value)}
                    onBlur={(e) => handleNumberBlur('sizeValue', e.target.value)}
                  />
                  <select
                    value={site.data.sizeUnit}
                    onChange={(e) => update('sizeUnit', e.target.value)}
                  >
                    <option value="MW">MW</option>
                    <option value="GW">GW</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                <label>PUE</label>
                <input
                  type="number"
                  step="0.1"
                  value={site.data.pue}
                  onChange={(e) => handleNumberChange('pue', e.target.value)}
                  onBlur={(e) => handleNumberBlur('pue', e.target.value, 1)}
                />
              </div>
            </>
          ) : (
            <div className="input-row">
              <label>IT Load</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={site.data.itLoad ?? 0}
                  onChange={(e) => handleNumberChange('itLoad', e.target.value)}
                  onBlur={(e) => handleNumberBlur('itLoad', e.target.value)}
                />
                <select
                  value={site.data.itLoadUnit || 'MW'}
                  onChange={(e) => update('itLoadUnit', e.target.value)}
                >
                  <option value="MW">MW</option>
                  <option value="GW">GW</option>
                </select>
              </div>
            </div>
          )}

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

          <div className="gpu-inputs">
            <h4
              onClick={() => setGpuCountsOpen(!gpuCountsOpen)}
              style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>GPU Counts</span>
              <span style={{ fontSize: '1.2em' }}>{gpuCountsOpen ? '−' : '+'}</span>
            </h4>
            {gpuCountsOpen && (
              <>
                {Object.keys(gpuPrices).map(gpuType => {
                  // Use directGpuCount for hyperscaleBulkGB300, gpus object for others
                  const isHyperscaleBulk = gpuType === 'hyperscaleBulkGB300';
                  const value = isHyperscaleBulk
                    ? (site.data.directGpuCount ?? '')
                    : (site.data.gpus?.[gpuType] ?? '');
                  const onChange = isHyperscaleBulk
                    ? (e) => handleGpuCountChange('directGpuCount', e.target.value)
                    : (e) => handleGpuChange(gpuType, e.target.value);
                  const onBlur = isHyperscaleBulk
                    ? (e) => handleGpuCountBlur('directGpuCount', e.target.value)
                    : (e) => handleGpuBlur(gpuType, e.target.value);

                  return (
                    <div key={gpuType} className="input-row">
                      <label style={{ textTransform: 'uppercase' }}>{gpuType.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <input
                        type="number"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={site.data.autoscaleGPUs}
                        style={site.data.autoscaleGPUs ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                      />
                    </div>
                  );
                })}
              </>
            )}
          </div>

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

          <div className="calc-steps">
            {result.steps.map((step, i) => <div key={i}>{step}</div>)}
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default HyperscalerSite;

