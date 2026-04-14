import React, { useState } from 'react';
import { 
  Wifi,
  Battery, 
  Search, 
  Maximize2,
  Activity
} from 'lucide-react';
import './LiveFeed.css';

const LiveFeed = () => {
  const [aiEnabled, setAiEnabled] = useState(false);

  const handleToggleAI = async () => {
    try {
      const newState = !aiEnabled;
      const response = await fetch('http://localhost:5000/toggle_detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState }),
      });
      if (response.ok) {
        setAiEnabled(newState);
      }
    } catch (error) {
      console.error('Failed to toggle AI:', error);
    }
  };

  return (
    <div className={`live-feed-container glass ${aiEnabled ? 'ai-active' : ''}`}>
      <div className="feed-header">
        <div className="feed-title">
          <span className={`dot ${aiEnabled ? 'text-green' : 'text-orange'}`}></span>
          LIVE_FEED {aiEnabled && <span className="ai-status-tag">AI_ON</span>}
        </div>
        <div className="feed-actions">
          <button 
            className={`ai-toggle-btn ${aiEnabled ? 'active' : ''}`} 
            onClick={handleToggleAI}
            title="Toggle AI Rust Detection"
          >
            <Activity size={16} />
            <span>AI_DETECT</span>
          </button>
          <Search size={16} className="text-muted" />
          <Maximize2 size={16} className="text-muted" />
        </div>
      </div>

      <div className="video-viewport">
        {/* Mock for camera stream */}
        <div className="mock-video">
          <img 
            src="http://localhost:5000/video_feed" 
            alt="Live Bot Feed" 
            className="video-content"
          />
          
          {/* HUD Overlay */}
          <div className="hud-overlay">
            <div className="reticle"></div>
            <div className="corner cor-tl"></div>
            <div className="corner cor-tr"></div>
            <div className="corner cor-bl"></div>
            <div className="corner cor-br"></div>
          </div>
        </div>

        {/* Indicators Overlay */}
        <div className="overlay-indicators top-right">
          <div className="indicator-group glass">
            <div className="indicator-label">SIGNAL_STRENGTH</div>
            <div className="signal-bars">
              <div className="bar active"></div>
              <div className="bar active"></div>
              <div className="bar active"></div>
              <div className="bar"></div>
            </div>
          </div>
          <div className="indicator-group glass">
            <div className="indicator-label">BATTERY_LVL</div>
            <div className="battery-display">
              <span className="battery-val">84%</span>
              <Battery size={14} className="text-orange" />
            </div>
          </div>
        </div>

        <div className="overlay-indicators bottom-left">
          <div className="hud-data">
            <div className="data-item">X: 124.52</div>
            <div className="data-item">Y: 012.18</div>
            <div className="data-item">Z: 884.00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
