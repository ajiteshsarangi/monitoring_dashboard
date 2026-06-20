import React from 'react';
import Link from 'next/link';
import {
  DashboardIcon,
  ServerIcon,
  BellIcon,
  ActivityIcon,
  CpuIcon
} from './Icons';

export const Sidebar = ({
  activeTab,
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
          <Link 
            href="/dashboard"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <DashboardIcon />
            <span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/nodes"
            className={`nav-item ${activeTab === 'nodes' ? 'active' : ''}`}
          >
            <CpuIcon />
            <span className="nav-text">Node Fleet ({serversCount})</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/linux"
            className={`nav-item ${activeTab === 'linux' ? 'active' : ''}`}
          >
            <ServerIcon />
            <span className="nav-text">Linux Fleet (4)</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/logs"
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <ActivityIcon />
            <span className="nav-text">Log Explorer</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/alerts"
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          >
            <BellIcon dot={hasDangerAlerts} />
            <span className="nav-text">Alert Logs</span>
          </Link>
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
