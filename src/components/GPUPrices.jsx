import React, { useState } from 'react';

function GPUPrices({ prices, setPrices, hourlyRates, setHourlyRates, isOpen, setIsOpen }) {
  const [newGpuName, setNewGpuName] = useState('');
  const [newGpuPrice, setNewGpuPrice] = useState('');
  const [newGpuHourlyRate, setNewGpuHourlyRate] = useState('');

  // Define default GPU types that cannot be deleted
  const defaultGpuTypes = ['b200', 'b300', 'gb300', 'mi350x', 'hyperscaleBulkGB300'];

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

  const addNewGpuType = () => {
    if (!newGpuName.trim()) {
      alert('Please enter a GPU name');
      return;
    }

    // Convert name to key format (e.g., "H100" -> "h100", "RTX 4090" -> "rtx4090")
    const key = newGpuName.toLowerCase().replace(/\s+/g, '');

    if (prices.hasOwnProperty(key)) {
      alert('This GPU type already exists');
      return;
    }

    setPrices({ ...prices, [key]: parseFloat(newGpuPrice) || 0 });
    setHourlyRates({ ...hourlyRates, [key]: parseFloat(newGpuHourlyRate) || 0 });

    setNewGpuName('');
    setNewGpuPrice('');
    setNewGpuHourlyRate('');
  };

  const removeGpuType = (key) => {
    if (defaultGpuTypes.includes(key)) {
      alert('Cannot delete default GPU types');
      return;
    }

    if (window.confirm(`Remove ${key} from GPU types?`)) {
      const newPrices = { ...prices };
      const newRates = { ...hourlyRates };
      delete newPrices[key];
      delete newRates[key];
      setPrices(newPrices);
      setHourlyRates(newRates);
    }
  };

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>GPU Prices</h3>
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div className="accordion-content">
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 1fr 60px', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {/* Header Row */}
            <div style={{ fontWeight: 'bold', color: '#495057' }}>GPU Type</div>
            <div style={{ fontWeight: 'bold', color: '#495057' }}>Unit Price ($)</div>
            <div style={{ fontWeight: 'bold', color: '#495057' }}>Hourly Rate ($/hr)</div>
            <div></div>
          </div>

          {/* Render all GPU types dynamically */}
          {Object.keys(prices).map((key) => {
            const isDefault = defaultGpuTypes.includes(key);
            return (
              <div key={key} className="input-row" style={{ gridTemplateColumns: '250px 1fr 1fr 60px', display: 'grid', gap: '1rem', alignItems: 'center' }}>
                <label style={{ textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input
                  type="number"
                  value={prices[key]}
                  onChange={(e) => updatePrice(key, e.target.value)}
                  onBlur={(e) => handleBlur(key, e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRates[key] || 0}
                  onChange={(e) => updateHourlyRate(key, e.target.value)}
                  onBlur={(e) => handleHourlyRateBlur(key, e.target.value)}
                />
                {!isDefault && (
                  <button
                    onClick={() => removeGpuType(key)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ×
                  </button>
                )}
                {isDefault && <div></div>}
              </div>
            );
          })}

          {/* Add New GPU Type Section */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Add New GPU Type</h4>
            <div className="input-row" style={{ gridTemplateColumns: '250px 1fr 1fr 60px', display: 'grid', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="GPU Name"
                value={newGpuName}
                onChange={(e) => setNewGpuName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={newGpuPrice}
                onChange={(e) => setNewGpuPrice(e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Hourly Rate"
                value={newGpuHourlyRate}
                onChange={(e) => setNewGpuHourlyRate(e.target.value)}
              />
              <button
                onClick={addNewGpuType}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GPUPrices;

