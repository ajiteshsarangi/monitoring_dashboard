import React from 'react';
import {
  DashboardIcon,
  ServerIcon,
  BellIcon,
  ActivityIcon,
  CpuIcon
} from '../Icons';
import './Sidebar.css';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  serversCount,
  linuxServersCount = 4,
  hasDangerAlerts,
  healthStatus = 'healthy'
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
            <span className="nav-text">Components ({serversCount})</span>
          </div>
        </li>
        <li>
          <div 
            className={`nav-item ${activeTab === 'linux' ? 'active' : ''}`}
            onClick={() => setActiveTab('linux')}
          >
            <ServerIcon />
            <span className="nav-text">Linux Servers ({linuxServersCount})</span>
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
        <div 
          className="pulsar" 
          style={{ 
            backgroundColor: healthStatus === 'healthy' ? 'var(--success)' : 'var(--danger)',
            boxShadow: healthStatus === 'healthy' ? '0 0 6px var(--success)' : '0 0 6px var(--danger)'
          }}
        ></div>
        <span className="footer-text" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {healthStatus === 'healthy' ? 'Application Healthy' : 'Application Offline'}
        </span>
      </div>
    </aside>
  );
};
