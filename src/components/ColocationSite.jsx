import React from 'react';
import SiteOutputs from './SiteOutputs';
import SiteAccordionHeader from './SiteAccordionHeader';
import LoadInputSection from './LoadInputSection';
import CalcSteps from './CalcSteps';

function ColocationSite({ site, result, updateSite, updateSiteName, toggleSite, toggleAccordion, deleteSite }) {
  const update = (field, value) => {
    updateSite(site.id, { [field]: value });
  };

  const handleNumberChange = (field, value) => {
    update(field, value === '' ? '' : parseFloat(value));
  };

  const handleNumberBlur = (field, value, defaultValue = 0) => {
    update(field, value === '' ? defaultValue : parseFloat(value) || defaultValue);
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
                totalLoadValue={site.data.totalLoadValue}
                totalLoadUnit={site.data.totalLoadUnit}
                pue={site.data.pue}
                itLoad={site.data.itLoad}
                itLoadUnit={site.data.itLoadUnit}
                onModeChange={(mode) => update('loadInputMode', mode)}
                onTotalLoadValueChange={(value) => handleNumberChange('totalLoadValue', value)}
                onTotalLoadValueBlur={(value) => handleNumberBlur('totalLoadValue', value)}
                onTotalLoadUnitChange={(value) => update('totalLoadUnit', value)}
                onPueChange={(value) => handleNumberChange('pue', value)}
                onPueBlur={(value) => handleNumberBlur('pue', value, 1)}
                onItLoadChange={(value) => handleNumberChange('itLoad', value)}
                onItLoadBlur={(value) => handleNumberBlur('itLoad', value)}
                onItLoadUnitChange={(value) => update('itLoadUnit', value)}
              />

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

export default ColocationSite;

