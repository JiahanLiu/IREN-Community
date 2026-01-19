import React from 'react';
import { formatPaybackYears } from '../../utils/formatters';

function SiteOutputs({ result }) {

  return (
    <div className="site-outputs">
      <div className="output-item">
        <span className="output-label">Annual Revenue</span>
        <span className="output-value revenue">${(result.revenue / 1000).toFixed(2)}B/yr</span>
      </div>
      <div className="output-item">
        <span className="output-label">Earnings before Tax, SG&A</span>
        <span className="output-value earnings">${result.netProfit.toFixed(2)}M/yr</span>
      </div>
      <div className="output-item">
        <span className="output-label">Positive Cashflow</span>
        <span className="output-value earnings">{formatPaybackYears(result.paybackYears)}</span>
      </div>
    </div>
  );
}

export default SiteOutputs;
