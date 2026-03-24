import React from 'react';
import Sidebar from './Sidebar';
import LiveFeed from './LiveFeed';
import SensorGauge from './SensorGauge';
import ControlPad from './ControlPad';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">
            <span className="text-orange">INSPECTION_UNIT_X1</span>
          </div>
          
          <div className="top-status">
            <div className="status-item glass">
              <span className="status-dot"></span>
              BOT_LINK: ACTIVE
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Left Large Column */}
          <div className="left-column">
            <LiveFeed />
            
            <div className="bottom-row">
              <ControlPad />
              
              <div className="sensors-row">
                <SensorGauge 
                  label="Ambient_Humidity" 
                  value="48.2" 
                  unit="%" 
                  percentage={48} 
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="main-sensor-container">
              <SensorGauge 
                label="System_Pressure" 
                value="785.2" 
                unit="PSI" 
                percentage={78.5} 
                color="var(--primary)"
              />
            </div>

            <div className="sm-data-grid">
              <div className="data-box glass">
                <div className="db-label">Input_Flow</div>
                <div className="db-value">12.4 <span className="db-unit">m/s</span></div>
              </div>
              <div className="data-box glass">
                <div className="db-label">Valve_Pos</div>
                <div className="db-value text-orange">OPEN</div>
              </div>
            </div>

            <div className="temp-section glass">
               <div className="db-label">Internal_Temp</div>
               <div className="temp-display">
                  <div className="temp-value">42.5<span className="temp-unit">°C</span></div>
                  <div className="temp-graph">
                    {/* Simplified bar graph */}
                    {[20, 35, 45, 60, 55, 75, 42].map((h, i) => (
                      <div 
                        key={i} 
                        className={`temp-bar ${i === 6 ? 'active' : ''}`} 
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
               </div>
            </div>

            <button className="standby-btn">
              SYSTEM_STANDBY_MODE_ACTIVE
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
