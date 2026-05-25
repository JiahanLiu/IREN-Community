import React, { useState } from 'react';

function GPUCountsSection({
  gpuPrices,
  gpuValues,
  fieldMap,
  displayNames,
  siteData,
  autoscaleGPUs,
  onGpuChange,
  onGpuBlur,
  onHyperscaleGpuChange,
  onHyperscaleGpuBlur,
  extraInputs
}) {
  const [gpuCountsOpen, setGpuCountsOpen] = useState(false);

  // Default display names if not provided
  const defaultDisplayNames = {
    'gb300': 'GB300 - 2025 Pricing',
    'b200': 'B200 - 2025 Pricing',
    'b300': 'B300 - 2025 Pricing',
    'b3002026': 'B300 - 2026 Pricing',
    'mi350x': 'MI350X - 2025 Pricing',
    'veraRubin': 'Vera Rubin - 2026 Pricing',
    'hyperscaleBulkGB300': 'Bulk GB300 - 2025 Pricing'
  };

  const getDisplayName = (gpuType) => {
    if (displayNames && displayNames[gpuType]) {
      return displayNames[gpuType];
    }
    if (defaultDisplayNames[gpuType]) {
      return defaultDisplayNames[gpuType];
    }
    return gpuType.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <div className="gpu-inputs">
      <h4
        onClick={() => setGpuCountsOpen(!gpuCountsOpen)}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>GPU Counts</span>
        <span style={{ fontSize: '1.2em' }}>{gpuCountsOpen ? '−' : '+'}</span>
      </h4>
      {gpuCountsOpen && (
        <>
          {Object.keys(gpuPrices).map(gpuType => {
            const isHyperscaleType = fieldMap && fieldMap[gpuType] !== undefined;
            const value = isHyperscaleType
              ? (siteData[fieldMap[gpuType]] ?? 0)
              : (gpuValues?.[gpuType] ?? 0);

            return (
              <div key={gpuType} className="input-row">
                <label style={!displayNames ? { textTransform: 'uppercase' } : undefined}>
                  {getDisplayName(gpuType)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => isHyperscaleType && onHyperscaleGpuChange
                    ? onHyperscaleGpuChange(fieldMap[gpuType], e.target.value)
                    : onGpuChange(gpuType, e.target.value)
                  }
                  onBlur={(e) => isHyperscaleType && onHyperscaleGpuBlur
                    ? onHyperscaleGpuBlur(fieldMap[gpuType], e.target.value)
                    : onGpuBlur(gpuType, e.target.value)
                  }
                  disabled={autoscaleGPUs}
                  style={autoscaleGPUs ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                />
              </div>
            );
          })}
          {extraInputs}
        </>
      )}
    </div>
  );
}

export default GPUCountsSection;
