import React from 'react';
import { 
  Activity, 
  Gamepad2, 
  Settings, 
  TriangleAlert, 
  Wrench, 
  Cpu 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity, active: true },
    { id: 'drive', label: 'Drive', icon: Gamepad2 },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'alerts', label: 'Alerts', icon: TriangleAlert },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <div className="sidebar">
      <div className="brand-section">
        <div className="brand-icon">
          <Cpu className="text-orange" size={24} />
        </div>
        <div className="brand-info">
          <div className="unit-name">Unit_X1_Bot</div>
          <div className="version">FW_V3.4.B</div>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="connection-status">
          <div className="status-dot"></div>
          <span className="status-text">SECURE_CONNECTION</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
