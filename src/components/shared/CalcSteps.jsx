import React, { useState } from 'react';

function CalcSteps({ steps }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="calc-steps">
      <div
        className="calc-steps-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600
        }}
      >
        <span>Calculation Details</span>
        <span style={{ fontSize: '1.2em' }}>{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="calc-steps-content" style={{ marginTop: '0.5rem' }}>
          {steps.map((step, i) => <div key={i}>{step}</div>)}
        </div>
      )}
    </div>
  );
}

export default CalcSteps;
