import React from 'react';

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
  );
}

export default SiteAccordionHeader;
