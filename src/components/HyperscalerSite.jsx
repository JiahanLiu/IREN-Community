import React from 'react';

function HyperscalerSite({ site, result, gpuPrices, updateSite, toggleSite, toggleAccordion, deleteSite }) {
  const update = (field, value) => {
    updateSite(site.id, { [field]: value });
  };

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
            <label>Base Revenue Input Mode</label>
            <select
              value={site.data.revenueMode}
              onChange={(e) => update('revenueMode', e.target.value)}
            >
              <option value="direct">Direct Revenue Input</option>
              <option value="nebius">GPU Count Then Prorated to First IREN-MSFT Contract</option>
            </select>
          </div>

          {site.data.revenueMode === 'direct' && (
            <>
              <div className="input-row">
                <label>Number of GPUs (thousands)</label>
                <input
                  type="number"
                  value={site.data.directGpuCount ?? 0}
                  onChange={(e) => handleNumberChange('directGpuCount', e.target.value)}
                  onBlur={(e) => handleNumberBlur('directGpuCount', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Base Revenue ($M)</label>
                <input
                  type="number"
                  value={site.data.toplineRevenue}
                  onChange={(e) => handleNumberChange('toplineRevenue', e.target.value)}
                  onBlur={(e) => handleNumberBlur('toplineRevenue', e.target.value)}
                />
              </div>
            </>
          )}

          {site.data.revenueMode === 'nebius' && (
            <div className="input-row">
              <label>Number of GPUs (thousands)</label>
              <input
                type="number"
                value={site.data.nebiusGpuCount ?? 0}
                onChange={(e) => handleNumberChange('nebiusGpuCount', e.target.value)}
                onBlur={(e) => handleNumberBlur('nebiusGpuCount', e.target.value)}
              />
            </div>
          )}

          <div className="input-row">
            <label>Contract Years</label>
            <input
              type="number"
              value={site.data.contractYears}
              onChange={(e) => handleNumberChange('contractYears', e.target.value)}
              onBlur={(e) => handleNumberBlur('contractYears', e.target.value, 1)}
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

          {site.data.hardwareMode === 'gpus' && (
            <div className="gpu-inputs">
              <h4>GPU Counts</h4>
              <div className="input-row">
                <label>B300</label>
                <input
                  type="number"
                  value={site.data.gpus?.b300 ?? 0}
                  onChange={(e) => handleGpuChange('b300', e.target.value)}
                  onBlur={(e) => handleGpuBlur('b300', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>B200</label>
                <input
                  type="number"
                  value={site.data.gpus?.b200 ?? 0}
                  onChange={(e) => handleGpuChange('b200', e.target.value)}
                  onBlur={(e) => handleGpuBlur('b200', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>MI350X</label>
                <input
                  type="number"
                  value={site.data.gpus?.mi350x ?? 0}
                  onChange={(e) => handleGpuChange('mi350x', e.target.value)}
                  onBlur={(e) => handleGpuBlur('mi350x', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>GB300</label>
                <input
                  type="number"
                  value={site.data.gpus?.gb300 ?? 0}
                  onChange={(e) => handleGpuChange('gb300', e.target.value)}
                  onBlur={(e) => handleGpuBlur('gb300', e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Hyperscale Bulk GB300</label>
                <input
                  type="number"
                  value={site.data.gpus?.hyperscaleBulkGB300 ?? 0}
                  onChange={(e) => handleGpuChange('hyperscaleBulkGB300', e.target.value)}
                  onBlur={(e) => handleGpuBlur('hyperscaleBulkGB300', e.target.value)}
                />
              </div>
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

          <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#495057' }}>Contract Gap Closer to Nebius</h4>

          <div className="input-row">
            <label>Enable Contract Gap Calculation</label>
            <div
              className={`toggle-switch ${site.data.contractGapEnabled ? 'enabled' : ''}`}
              onClick={(e) => { e.stopPropagation(); update('contractGapEnabled', !site.data.contractGapEnabled); }}
            >
              <span className="toggle-label">{site.data.contractGapEnabled ? 'Enabled' : 'Disabled'}</span>
              <div className="toggle-slider"></div>
            </div>
          </div>

          {site.data.contractGapEnabled && (
            <div className="input-row">
            <label>Improved Contracts Percentage as a Percentage of Nebius (%)</label>
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

