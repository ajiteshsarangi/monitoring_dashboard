import React from 'react';
import { Badge, Button } from '../UiKit';
import { executeLinuxCommand } from '../../mockData';
import { getStatusConfig } from '../../utils/statusHelper';
import './LinuxFleetTab.css';

const formatBytes = (bytes) => {
  if (!bytes) return '0.00 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};

export const LinuxFleetTab = ({
  linuxServers,
  handleOpenServer
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-grid">
        {linuxServers.map(server => {
          const ramPct = (server.ramUsed && server.ramTotal) ? Math.round((server.ramUsed / server.ramTotal) * 100) : 0;
          const diskPct = (server.diskUsed && server.diskTotal) ? Math.round((server.diskUsed / server.diskTotal) * 100) : 0;
          
          return (
            <div key={server.id} className="col-6">
              <div className="card linux-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Server Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
 
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{server.name}</h3>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>IP: {server.ip} • Hostname: {server.hostname}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusConfig(server.status).variant}>
                    {server.rawStatus || getStatusConfig(server.status).label}
                  </Badge>
                </div>
                 {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System Uptime</span>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginTop: 4, color: 'var(--text-primary)' }}>{server.uptime}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unix Load Average</span>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginTop: 4, color: 'var(--text-primary)' }}>{server.loadAvg.join(', ')}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Network Interface</span>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginTop: 4, color: 'var(--text-primary)' }}>
                      {server.interfaces.name} (Rx: {formatBytes(server.network_interfaces?.[0]?.rx_bytes)} | Tx: {formatBytes(server.network_interfaces?.[0]?.tx_bytes)})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CPU Hardware</span>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginTop: 4, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {server.cpuCores ? `${server.cpuCores} vCPUs` : 'N/A'} {server.architecture && `(${server.architecture})`}
                    </div>
                  </div>
                </div>

                {/* Resource Metric Progress Bars */}
                <div>
                  {/* CPU Load Progress */}
                  <div className="metric-bar-group">
                    <div className="metric-bar-label">
                      <span>CPU Core Utilization</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{server.cpuLoad}%</span>
                    </div>
                    <div className="metric-bar-wrapper">
                      <div 
                        className="metric-bar-fill"
                        style={{ 
                          width: `${server.cpuLoad}%`, 
                          backgroundColor: server.cpuLoad > 85 ? 'var(--danger)' : server.cpuLoad > 70 ? 'var(--warning)' : 'var(--accent-blue)' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Memory Space Usage */}
                  <div className="metric-bar-group">
                    <div className="metric-bar-label">
                      <span>RAM Memory Allocation</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {server.ramUsed && server.ramTotal 
                          ? `${server.ramUsed.toFixed(1)} GB / ${server.ramTotal.toFixed(1)} GB (${ramPct}%)`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="metric-bar-wrapper">
                      <div 
                        className="metric-bar-fill"
                        style={{ 
                          width: `${ramPct}%`, 
                          backgroundColor: ramPct > 85 ? 'var(--danger)' : ramPct > 70 ? 'var(--warning)' : 'var(--accent-cyan)' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Disk Space Usage */}
                  <div className="metric-bar-group" style={{ marginBottom: 0 }}>
                    <div className="metric-bar-label">
                      <span>Storage Space Allocation</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {server.diskUsed && server.diskTotal 
                          ? `${server.diskUsed.toFixed(0)} GB / ${server.diskTotal.toFixed(0)} GB (${diskPct}%)`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="metric-bar-wrapper">
                      <div 
                        className="metric-bar-fill"
                        style={{ 
                          width: `${diskPct}%`, 
                          backgroundColor: diskPct > 85 ? 'var(--danger)' : diskPct > 70 ? 'var(--warning)' : 'var(--info)' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Deployed Services Health Summary */}
                <div style={{ marginTop: '4px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Deployed Services Summary
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-tertiary)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(server.services || []).length}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Total</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(var(--success-rgb), 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(var(--success-rgb), 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>
                        {(server.services || []).filter(s => s.status === 'online').length}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--success)', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Up</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(251, 191, 36, 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(251, 191, 36, 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>
                        {(server.services || []).filter(s => s.status === 'warning').length}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--warning)', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Degraded</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(239, 68, 68, 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                        {(server.services || []).filter(s => s.status === 'critical').length}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--danger)', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Critical</div>
                    </div>
                  </div>
                </div>

                {/* Diagnostics Action Button */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleOpenServer(server)}
                  >
                    Diagnostics
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
