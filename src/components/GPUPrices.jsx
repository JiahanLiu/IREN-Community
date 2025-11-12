import React from 'react';

function GPUPrices({ prices, setPrices, hourlyRates, setHourlyRates, isOpen, setIsOpen }) {
  const updatePrice = (key, value) => {
    setPrices({ ...prices, [key]: value === '' ? '' : parseFloat(value) });
  };

  const handleBlur = (key, value) => {
    setPrices({ ...prices, [key]: value === '' ? 0 : parseFloat(value) || 0 });
  };

  const updateHourlyRate = (key, value) => {
    setHourlyRates({ ...hourlyRates, [key]: value === '' ? '' : parseFloat(value) });
  };

  const handleHourlyRateBlur = (key, value) => {
    setHourlyRates({ ...hourlyRates, [key]: value === '' ? 0 : parseFloat(value) || 0 });
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>GPU Prices</h3>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div className="accordion-content">
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {/* Header Row */}
            <div></div>
            <div style={{ fontWeight: 'bold', color: '#495057' }}>Unit Price ($)</div>
            <div style={{ fontWeight: 'bold', color: '#495057' }}>Hourly Rate ($/hr)</div>
          </div>

          <div className="input-row" style={{ gridTemplateColumns: '200px 1fr 1fr' }}>
            <label>B200</label>
            <input
              type="number"
              value={prices.b200}
              onChange={(e) => updatePrice('b200', e.target.value)}
              onBlur={(e) => handleBlur('b200', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={hourlyRates.b200}
              onChange={(e) => updateHourlyRate('b200', e.target.value)}
              onBlur={(e) => handleHourlyRateBlur('b200', e.target.value)}
            />
          </div>

          <div className="input-row" style={{ gridTemplateColumns: '200px 1fr 1fr' }}>
            <label>B300</label>
            <input
              type="number"
              value={prices.b300}
              onChange={(e) => updatePrice('b300', e.target.value)}
              onBlur={(e) => handleBlur('b300', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={hourlyRates.b300}
              onChange={(e) => updateHourlyRate('b300', e.target.value)}
              onBlur={(e) => handleHourlyRateBlur('b300', e.target.value)}
            />
          </div>

          <div className="input-row" style={{ gridTemplateColumns: '200px 1fr 1fr' }}>
            <label>GB300</label>
            <input
              type="number"
              value={prices.gb300}
              onChange={(e) => updatePrice('gb300', e.target.value)}
              onBlur={(e) => handleBlur('gb300', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={hourlyRates.gb300}
              onChange={(e) => updateHourlyRate('gb300', e.target.value)}
              onBlur={(e) => handleHourlyRateBlur('gb300', e.target.value)}
            />
          </div>

          <div className="input-row" style={{ gridTemplateColumns: '200px 1fr 1fr' }}>
            <label>MI350X</label>
            <input
              type="number"
              value={prices.mi350x}
              onChange={(e) => updatePrice('mi350x', e.target.value)}
              onBlur={(e) => handleBlur('mi350x', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={hourlyRates.mi350x}
              onChange={(e) => updateHourlyRate('mi350x', e.target.value)}
              onBlur={(e) => handleHourlyRateBlur('mi350x', e.target.value)}
            />
          </div>

          <div className="input-row" style={{ gridTemplateColumns: '200px 1fr 1fr' }}>
            <label>Hyperscale Bulk GB300</label>
            <input
              type="number"
              value={prices.hyperscaleBulkGB300}
              onChange={(e) => updatePrice('hyperscaleBulkGB300', e.target.value)}
              onBlur={(e) => handleBlur('hyperscaleBulkGB300', e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              value={hourlyRates.hyperscaleBulkGB300}
              onChange={(e) => updateHourlyRate('hyperscaleBulkGB300', e.target.value)}
              onBlur={(e) => handleHourlyRateBlur('hyperscaleBulkGB300', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GPUPrices;

