import React from 'react';
import { CloseIcon, SettingsIcon } from './Icons';
import { Button, Toggle } from './UiKit';

export const CustomizerDrawer = ({
  isCustomizerOpen,
  setIsCustomizerOpen,
  widgets,
  setWidgets,
  updateFrequency,
  setUpdateFrequency,
  fontSize,
  setFontSize,
  resetLayout
}) => {
  return (
    <div className={`customizer-panel ${isCustomizerOpen ? 'open' : ''}`}>
      <div className="customizer-header">
        <div style={{ fontWeight: 700, fontSize: 16 }}>Dashboard Workspace</div>
        <button className="menu-toggle-btn" onClick={() => setIsCustomizerOpen(false)}>
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="customizer-body">
        
        {/* APPLICATION RESTART POLICY INFO */}
        <div className="customizer-section" style={{ backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px' }}>
          <h5 className="customizer-section-title" style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <SettingsIcon size={14} /> Restart Policy Config
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Health Check Interval:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>3 seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Failure Threshold:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>3 failures</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Restart Retry Count:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>3 attempts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Restart Cooldown:</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>15 seconds</span>
            </div>
          </div>
        </div>

        <div className="customizer-section">
          <h5 className="customizer-section-title">Show / Hide UI Elements</h5>
          <Toggle 
            label="Stat Resource Row" 
            checked={widgets.statsRow} 
            onChange={(val) => setWidgets(prev => ({ ...prev, statsRow: val }))} 
          />
          <Toggle 
            label="System Health Score Dial" 
            checked={widgets.radialHealth} 
            onChange={(val) => setWidgets(prev => ({ ...prev, radialHealth: val }))} 
          />
          <Toggle 
            label="CPU Performance Line" 
            checked={widgets.cpuTrend} 
            onChange={(val) => setWidgets(prev => ({ ...prev, cpuTrend: val }))} 
          />
          <Toggle 
            label="RAM Commit Profile Line" 
            checked={widgets.memoryTrend} 
            onChange={(val) => setWidgets(prev => ({ ...prev, memoryTrend: val }))} 
          />
          <Toggle 
            label="Host Load Average Comparison" 
            checked={widgets.networkLoad} 
            onChange={(val) => setWidgets(prev => ({ ...prev, networkLoad: val }))} 
          />
          <Toggle 
            label="Reachable Server Grid Table" 
            checked={widgets.serverTable} 
            onChange={(val) => setWidgets(prev => ({ ...prev, serverTable: val }))} 
          />
          <Toggle 
            label="Alert Telemetry Logs feed" 
            checked={widgets.alertFeed} 
            onChange={(val) => setWidgets(prev => ({ ...prev, alertFeed: val }))} 
          />
        </div>



        <div className="customizer-section">
          <h5 className="customizer-section-title">Accessibility Options</h5>
          <div className="customizer-option">
            <span>Application font size</span>
            <select 
              className="form-control" 
              value={fontSize} 
              onChange={(e) => setFontSize(e.target.value)}
              style={{ width: 120 }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={resetLayout}>
            Reset Grid
          </Button>
          <Button variant="primary" style={{ flex: 1 }} onClick={() => setIsCustomizerOpen(false)}>
            Apply Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
