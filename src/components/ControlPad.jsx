import React, { useEffect, useRef } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import './ControlPad.css';

const ControlPad = () => {
  const activeKeyRef = useRef(null);

  const sendCommand = async (action) => {
    try {
      await fetch('http://localhost:5000/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      console.log(`Command sent: ${action}`);
    } catch (err) {
      console.error('Failed to send command:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent repeat events
      if (activeKeyRef.current === e.key) return;

      let action = null;
      switch (e.key) {
        case 'ArrowUp':
          action = 'FORWARD';
          break;
        case 'ArrowDown':
          action = 'BACKWARD';
          break;
        case 'ArrowLeft':
          action = 'LEFT';
          break;
        case 'ArrowRight':
          action = 'RIGHT';
          break;
        default:
          return;
      }

      if (action) {
        activeKeyRef.current = e.key;
        sendCommand(action);
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        activeKeyRef.current = null;
        sendCommand('STOP');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const directions = [
    { id: 'up', icon: ChevronUp, gridArea: 'up', action: 'FORWARD' },
    { id: 'left', icon: ChevronLeft, gridArea: 'left', action: 'LEFT' },
    { id: 'down', icon: ChevronDown, gridArea: 'down', action: 'BACKWARD' },
    { id: 'right', icon: ChevronRight, gridArea: 'right', action: 'RIGHT' },
  ];

  return (
    <div className="control-pad glass">
      <div className="control-label">MOVEMENT_CONTROL</div>
      <div className="dpad-grid">
        {directions.map((dir) => (
          <button 
            key={dir.id} 
            className={`dpad-btn ${dir.id}`}
            style={{ gridArea: dir.gridArea }}
            onMouseDown={() => sendCommand(dir.action)}
            onMouseUp={() => sendCommand('STOP')}
            onMouseLeave={() => sendCommand('STOP')}
          >
            <dir.icon size={24} />
          </button>
        ))}
        <div className="dpad-center"></div>
      </div>
    </div>
  );
};

export default ControlPad;
