import React from 'react';

function GPUPrices({ prices, setPrices, isOpen, setIsOpen }) {
  const updatePrice = (key, value) => {
    setPrices({ ...prices, [key]: value === '' ? '' : parseFloat(value) });
  };

  const handleBlur = (key, value) => {
    setPrices({ ...prices, [key]: value === '' ? 0 : parseFloat(value) || 0 });
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>GPU Prices</h3>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div className="accordion-content">
          <div className="input-row">
            <label>Hyperscale Bulk GB300 ($)</label>
            <input
              type="number"
              value={prices.hyperscaleBulkGB300}
              onChange={(e) => updatePrice('hyperscaleBulkGB300', e.target.value)}
              onBlur={(e) => handleBlur('hyperscaleBulkGB300', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>GB300 ($)</label>
            <input
              type="number"
              value={prices.gb300}
              onChange={(e) => updatePrice('gb300', e.target.value)}
              onBlur={(e) => handleBlur('gb300', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>B200 ($)</label>
            <input
              type="number"
              value={prices.b200}
              onChange={(e) => updatePrice('b200', e.target.value)}
              onBlur={(e) => handleBlur('b200', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>B300 ($)</label>
            <input
              type="number"
              value={prices.b300}
              onChange={(e) => updatePrice('b300', e.target.value)}
              onBlur={(e) => handleBlur('b300', e.target.value)}
            />
          </div>

          <div className="input-row">
            <label>MI350X ($)</label>
            <input
              type="number"
              value={prices.mi350x}
              onChange={(e) => updatePrice('mi350x', e.target.value)}
              onBlur={(e) => handleBlur('mi350x', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GPUPrices;

