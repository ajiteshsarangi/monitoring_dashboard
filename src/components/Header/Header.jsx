import React from 'react';
import {
  MenuIcon,
  PauseIcon,
  PlayIcon,
  LightModeIcon,
  DarkModeIcon,
  SettingsIcon
} from '../Icons';
import { Button } from '../UiKit';
import './Header.css';

export const Header = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeTab,
  lastCheckTime,
  isLive,
  setIsLive,
  theme,
  setTheme,
  isCustomizerOpen,
  setIsCustomizerOpen,
  healthStatus = 'healthy'
}) => {
  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          <MenuIcon />
        </button>
        <div className="dashboard-title">
          {activeTab === 'dashboard' && 'NOC Dashboard Overview'}
          {activeTab === 'nodes' && 'Component Fleet Manager'}
          {activeTab === 'linux' && 'Linux Fleet Diagnostics'}
          {activeTab === 'logs' && 'Application Log Explorer'}
          {activeTab === 'alerts' && 'System Alert Feed Logs'}
        </div>
      </div>

      <div className="header-right">
        {/* Live Indicator Switch */}
        <div className="flex-row-center gap-16" style={{ marginRight: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 4 }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Telemetry Sync</span>
            <span style={{ fontSize: '14.5px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              Last Check: {lastCheckTime}
            </span>
          </div>
          <div className="flex-row-center">
            <div 
              className="pulsar" 
              style={{ 
                backgroundColor: healthStatus === 'offline' ? 'var(--danger)' : (isLive ? 'var(--success)' : 'var(--text-muted)'),
                boxShadow: healthStatus === 'offline' ? '0 0 6px var(--danger)' : (isLive ? '0 0 6px var(--success)' : 'none')
              }}
            ></div>
            <span style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.05em', color: healthStatus === 'offline' ? 'var(--danger)' : (isLive ? 'var(--success)' : 'var(--text-muted)') }}>
              {healthStatus === 'offline' ? 'PAUSED / OFFLINE' : (isLive ? 'LIVE STREAMING' : 'PAUSED')}
            </span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsLive(!isLive)}
            className="flex-row-center"
            style={{ padding: '6px 10px' }}
            disabled={healthStatus === 'offline'}
          >
            {isLive ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
            {isLive ? 'Pause Stream' : 'Resume'}
          </Button>
        </div>

        {/* Light/Dark Toggle */}
        <button 
          className="menu-toggle-btn" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <LightModeIcon size={18} /> : <DarkModeIcon size={18} />}
        </button>

        {/* Customizer Slider Gear button */}
        <button 
          className={`menu-toggle-btn ${isCustomizerOpen ? 'active' : ''}`}
          onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
          title="Open Template Customizer Workspace"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
