import React from 'react';
import './SensorGauge.css';

const SensorGauge = ({ label, value, unit, percentage, color = 'var(--primary)' }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="sensor-gauge glass">
      <div className="gauge-label">{label}</div>
      <div className="gauge-viewport">
        <svg viewBox="0 0 160 160" className="gauge-svg">
          {/* Background Track */}
          <circle 
            cx="80" cy="80" r={radius} 
            className="gauge-track" 
          />
          {/* Progress Bar */}
          <circle 
            cx="80" cy="80" r={radius} 
            className="gauge-progress"
            style={{ 
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: offset
            }}
          />
        </svg>
        <div className="gauge-value-container">
          <div className="gauge-value">{value}</div>
          <div className="gauge-unit">{unit}</div>
        </div>
      </div>
    </div>
  );
};

export default SensorGauge;
