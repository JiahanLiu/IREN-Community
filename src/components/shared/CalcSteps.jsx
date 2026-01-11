import React from 'react';

function CalcSteps({ steps }) {
  return (
    <div className="calc-steps">
      {steps.map((step, i) => <div key={i}>{step}</div>)}
    </div>
  );
}

export default CalcSteps;
