import React from 'react';
import {
  DashboardIcon,
  ServerIcon,
  BellIcon,
  ActivityIcon,
  CpuIcon
} from './Icons';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  serversCount,
  hasDangerAlerts
}) => {
  return (
    <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">BG</div>
        <span className="brand-name">BlueGrid Monitor</span>
      </div>
      
      <ul className="sidebar-nav">
        <li>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <DashboardIcon />
            <span className="nav-text">Dashboard</span>
          </div>
        </li>
        <li>
          <div 
            className={`nav-item ${activeTab === 'nodes' ? 'active' : ''}`}
            onClick={() => setActiveTab('nodes')}
          >
            <CpuIcon />
            <span className="nav-text">Node Fleet ({serversCount})</span>
          </div>
        </li>
        <li>
          <div 
            className={`nav-item ${activeTab === 'linux' ? 'active' : ''}`}
            onClick={() => setActiveTab('linux')}
          >
            <ServerIcon />
            <span className="nav-text">Linux Fleet (4)</span>
          </div>
        </li>
        <li>
          <div 
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ActivityIcon />
            <span className="nav-text">Log Explorer</span>
          </div>
        </li>
        <li>
          <div 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <BellIcon dot={hasDangerAlerts} />
            <span className="nav-text">Alert Logs</span>
          </div>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="pulsar"></div>
        <span className="footer-text" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Application Healthy
        </span>
      </div>
    </aside>
  );
};
