import React from 'react';
import { formatPaybackYears } from '../../utils/formatters';

function SiteAccordionHeader({
  site,
  result,
  updateSiteName,
  toggleSite,
  toggleAccordion,
  deleteSite
}) {
  const isOpen = site.accordionOpen;

  return (
    <div className="accordion-header" onClick={() => toggleAccordion(site.id)}>
      <div className="accordion-title-row">
        <input
          type="text"
          value={site.name}
          onChange={(e) => {
            e.stopPropagation();
            updateSiteName(site.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="site-name-input"
        />
        <div className="site-actions" onClick={(e) => e.stopPropagation()}>
          <div
            className={`toggle-switch ${site.enabled ? 'enabled' : ''}`}
            onClick={() => toggleSite(site.id)}
          >
            <span className="toggle-label">{site.type}</span>
            <div className="toggle-slider"></div>
          </div>
          <button className="delete-btn" onClick={() => deleteSite(site.id)}>Delete</button>
        </div>
      </div>
      <div className="net-profit-display">
        <div className="label">Positive Cashflow After</div>
        <div className="value">{formatPaybackYears(result.paybackYears)}</div>
      </div>
      <div className="net-profit-display">
        <div className="label">Earnings before Tax, SG&A</div>
        <div className="value">${result.netProfit.toFixed(2)}M/yr</div>
      </div>
      <div className="net-profit-display">
        <div className="label">Annual Revenue</div>
        <div className="value">${(result.revenue / 1000).toFixed(2)}B/yr</div>
      </div>
      <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
    </div>
  );
}

export default SiteAccordionHeader;
