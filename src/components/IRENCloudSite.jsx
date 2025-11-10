import React from 'react';

function IRENCloudSite({ site, result, gpuPrices, updateSite, toggleSite, toggleAccordion, deleteSite }) {
  const update = (field, value) => {
    updateSite(site.id, { [field]: value });
  };

  const handleNumberChange = (field, value) => {
    update(field, value === '' ? '' : parseFloat(value));
  };

  const handleNumberBlur = (field, value, defaultValue = 0) => {
    update(field, value === '' ? defaultValue : parseFloat(value) || defaultValue);
  };

  const handleGpuChange = (gpuType, value) => {
    update('gpus', { ...site.data.gpus, [gpuType]: value === '' ? '' : parseFloat(value) });
  };

  const handleGpuBlur = (gpuType, value) => {
    update('gpus', { ...site.data.gpus, [gpuType]: value === '' ? 0 : parseFloat(value) || 0 });
  };

  const isOpen = site.accordionOpen;

  const getDCCostPerMW = () => {
    if (site.data.dcType === 'retrofit') return 0;
    if (site.data.newDcType === 't3-liquid') return 15;
    if (site.data.newDcType === 't2-liquid') return 8;
    if (site.data.newDcType === 't2-air') return 2;
    return site.data.dcCostPerMW || 0;
  };

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
          Net Profit: ${result.netProfit.toFixed(2)}M/yr
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
                <label>Base Revenue ($M)</label>
                <input
                  type="number"
                  value={site.data.toplineRevenue}
                  onChange={(e) => handleNumberChange('toplineRevenue', e.target.value)}
                  onBlur={(e) => handleNumberBlur('toplineRevenue', e.target.value)}
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

          <div className="gpu-inputs">
            <h4>GPU Counts</h4>
            <div className="input-row">
              <label>B300</label>
              <input
                type="number"
                value={site.data.gpus.b300}
                onChange={(e) => handleGpuChange('b300', e.target.value)}
                onBlur={(e) => handleGpuBlur('b300', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>B200</label>
              <input
                type="number"
                value={site.data.gpus.b200}
                onChange={(e) => handleGpuChange('b200', e.target.value)}
                onBlur={(e) => handleGpuBlur('b200', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>MI350X</label>
              <input
                type="number"
                value={site.data.gpus.mi350x}
                onChange={(e) => handleGpuChange('mi350x', e.target.value)}
                onBlur={(e) => handleGpuBlur('mi350x', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>GB300</label>
              <input
                type="number"
                value={site.data.gpus.gb300}
                onChange={(e) => handleGpuChange('gb300', e.target.value)}
                onBlur={(e) => handleGpuBlur('gb300', e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>Hyperscale Bulk GB300</label>
              <input
                type="number"
                value={site.data.gpus.hyperscaleBulkGB300}
                onChange={(e) => handleGpuChange('hyperscaleBulkGB300', e.target.value)}
                onBlur={(e) => handleGpuBlur('hyperscaleBulkGB300', e.target.value)}
              />
            </div>
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
              onChange={(e) => update('dcType', e.target.value)}
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
                    let cost = 15;
                    if (type === 't2-liquid') cost = 8;
                    if (type === 't2-air') cost = 2;
                    updateSite(site.id, { newDcType: type, dcCostPerMW: cost });
                  }}
                >
                  <option value="t3-liquid">T3 Liquid Cooled</option>
                  <option value="t2-liquid">T2 Liquid Cooled</option>
                  <option value="t2-air">T2 Air Cooled</option>
                </select>
              </div>

              <div className="input-row">
                <label>Cost per MW IT Load ($M/MW)</label>
                <input
                  type="number"
                  value={site.data.dcCostPerMW || getDCCostPerMW()}
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
            <label>Percentage of GPU/Hardware Financed as Debt (%)</label>
            <input
              type="number"
              value={site.data.debtPercent ?? 80}
              onChange={(e) => handleNumberChange('debtPercent', e.target.value)}
              onBlur={(e) => handleNumberBlur('debtPercent', e.target.value, 0)}
            />
          </div>

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

export default IRENCloudSite;

