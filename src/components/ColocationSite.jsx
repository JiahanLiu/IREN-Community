import React from 'react';

function ColocationSite({ site, result, updateSite, toggleSite, toggleAccordion, deleteSite }) {
  const update = (field, value) => {
    updateSite(site.id, { [field]: value });
  };

  const handleNumberChange = (field, value) => {
    update(field, value === '' ? '' : parseFloat(value));
  };

  const handleNumberBlur = (field, value, defaultValue = 0) => {
    update(field, value === '' ? defaultValue : parseFloat(value) || defaultValue);
  };

  const isOpen = site.accordionOpen;

  const updateName = (newName) => {
    // Update the entire site object to change the name
    const sites = JSON.parse(localStorage.getItem('sites') || '[]');
    const updatedSites = sites.map(s => s.id === site.id ? { ...s, name: newName } : s);
    localStorage.setItem('sites', JSON.stringify(updatedSites));
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => toggleAccordion(site.id)}>
        <div className="accordion-title-row">
          <input
            type="text"
            value={site.name}
            onChange={(e) => {
              e.stopPropagation();
              // We need to update through parent
            }}
            onClick={(e) => e.stopPropagation()}
            className="site-name-input"
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
                    value={site.data.totalLoadValue}
                    onChange={(e) => handleNumberChange('totalLoadValue', e.target.value)}
                    onBlur={(e) => handleNumberBlur('totalLoadValue', e.target.value)}
                  />
                  <select
                    value={site.data.totalLoadUnit}
                    onChange={(e) => update('totalLoadUnit', e.target.value)}
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
            <label>Revenue per MW-yr (IT Load) ($M)</label>
              <input
                type="number"
                step="0.01"
                value={site.data.revenuePerMW}
                onChange={(e) => handleNumberChange('revenuePerMW', e.target.value)}
                onBlur={(e) => handleNumberBlur('revenuePerMW', e.target.value)}
              />
          </div>

          <div className="input-row">
            <label>DC Building Cost per MW ($M)</label>
              <input
                type="number"
                value={site.data.dcCostPerMW}
                onChange={(e) => handleNumberChange('dcCostPerMW', e.target.value)}
                onBlur={(e) => handleNumberBlur('dcCostPerMW', e.target.value)}
              />
          </div>

          <div className="input-row">
            <label>DC Useful Lifetime (years)</label>
              <input
                type="number"
                value={site.data.dcLifetime}
                onChange={(e) => handleNumberChange('dcLifetime', e.target.value)}
                onBlur={(e) => handleNumberBlur('dcLifetime', e.target.value, 1)}
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

export default ColocationSite;

