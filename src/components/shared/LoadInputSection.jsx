import React from 'react';

function LoadInputSection({
  loadInputMode,
  sizeValue,
  sizeUnit,
  pue,
  itLoad,
  itLoadUnit,
  onModeChange,
  onSizeValueChange,
  onSizeValueBlur,
  onSizeUnitChange,
  onPueChange,
  onPueBlur,
  onItLoadChange,
  onItLoadBlur,
  onItLoadUnitChange,
  // For ColocationSite which uses different field names
  totalLoadValue,
  totalLoadUnit,
  onTotalLoadValueChange,
  onTotalLoadValueBlur,
  onTotalLoadUnitChange
}) {
  const isColocationMode = totalLoadValue !== undefined;

  return (
    <>
      <div className="input-row">
        <label>Load Input Mode</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              checked={loadInputMode === 'total'}
              onChange={() => onModeChange('total')}
            />
            Total Load + PUE
          </label>
          <label>
            <input
              type="radio"
              checked={loadInputMode === 'direct'}
              onChange={() => onModeChange('direct')}
            />
            DC IT Load
          </label>
        </div>
      </div>

      {loadInputMode === 'total' ? (
        <>
          <div className="input-row">
            <label>Site Size/Total Load</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={isColocationMode ? totalLoadValue : sizeValue}
                onChange={(e) => isColocationMode
                  ? onTotalLoadValueChange(e.target.value)
                  : onSizeValueChange(e.target.value)
                }
                onBlur={(e) => isColocationMode
                  ? onTotalLoadValueBlur(e.target.value)
                  : onSizeValueBlur(e.target.value)
                }
              />
              <select
                value={isColocationMode ? totalLoadUnit : sizeUnit}
                onChange={(e) => isColocationMode
                  ? onTotalLoadUnitChange(e.target.value)
                  : onSizeUnitChange(e.target.value)
                }
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
              value={pue}
              onChange={(e) => onPueChange(e.target.value)}
              onBlur={(e) => onPueBlur(e.target.value)}
            />
          </div>
        </>
      ) : (
        <div className="input-row">
          <label>IT Load</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={itLoad ?? 0}
              onChange={(e) => onItLoadChange(e.target.value)}
              onBlur={(e) => onItLoadBlur(e.target.value)}
            />
            <select
              value={itLoadUnit || 'MW'}
              onChange={(e) => onItLoadUnitChange(e.target.value)}
            >
              <option value="MW">MW</option>
              <option value="GW">GW</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}

export default LoadInputSection;
