import React, { useState } from 'react';
import './ServoControl.css';

const ServoControl = () => {
  const [angle, setAngle] = useState(90);

  const handleAngleChange = async (e) => {
    const newAngle = parseInt(e.target.value);
    setAngle(newAngle);
  };

  const sendServoCommand = async () => {
    try {
      await fetch('http://localhost:5000/servo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ angle }),
      });
      console.log(`Servo angle set to: ${angle}`);
    } catch (err) {
      console.error('Failed to send servo command:', err);
    }
  };

  return (
    <div className="servo-control glass">
      <div className="control-label">CAMERA_PAN_SERVO</div>
      <div className="servo-ui">
        <input 
          type="range" 
          min="0" 
          max="180" 
          value={angle} 
          onChange={handleAngleChange}
          onMouseUp={sendServoCommand}
          className="servo-slider"
        />
        <div className="angle-status">
          <span className="angle-value">{angle}°</span>
        </div>
      </div>
    </div>
  );
};

export default ServoControl;
