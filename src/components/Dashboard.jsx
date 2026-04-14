
import React from 'react';
import Sidebar from './Sidebar';
import LiveFeed from './LiveFeed';
import SensorGauge from './SensorGauge';
import ControlPad from './ControlPad';
import ServoControl from './ServoControl';
import './Dashboard.css';

const Dashboard = () => {
  const [telemetry, setTelemetry] = React.useState({
    temp: 0,
    pressure: 0,
    humidity: 0,
    dist_cm: 0,
    speed_cms: 0,
    source: "N/A"
  });

  React.useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://localhost:5000/telemetry');
        if (response.ok) {
          const data = await response.json();
          setTelemetry(data);
        }
      } catch (err) {
        console.error('Failed to fetch telemetry:', err);
      }
    };

    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

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
                  value={telemetry.humidity.toFixed(1)}
                  unit="%"
                  percentage={telemetry.humidity}
                />
                <ServoControl />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="main-sensor-container">
              <SensorGauge
                label="System_Pressure"
                value={telemetry.pressure.toFixed(1)}
                unit="hPa"
                percentage={(telemetry.pressure / 1100) * 100}
                color="var(--primary)"
              />
            </div>

            <div className="sm-data-grid">
              <div className="data-box glass">
                <div className="db-label">Bot_Distance</div>
                <div className="db-value">{telemetry.dist_cm.toFixed(1)} <span className="db-unit">cm</span></div>
              </div>
              <div className="data-box glass">
                <div className="db-label">Bot_Speed</div>
                <div className="db-value text-orange">{telemetry.speed_cms.toFixed(1)} <span className="db-unit">cm/s</span></div>
              </div>
            </div>

            <div className="temp-section glass">
              <div className="db-label">Internal_Temp ({telemetry.source})</div>
              <div className="temp-display">
                <div className="temp-value">{telemetry.temp.toFixed(1)}<span className="temp-unit">°C</span></div>
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
