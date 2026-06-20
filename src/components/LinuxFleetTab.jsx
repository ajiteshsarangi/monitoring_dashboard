import React from 'react';
import { Badge, Button } from './UiKit';
import { executeLinuxCommand } from '../mockData';

export const LinuxFleetTab = ({
  linuxServers,
  activeTerminalId,
  setActiveTerminalId,
  terminalHistory,
  setTerminalHistory
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-grid">
        {linuxServers.map(server => {
          const isTerminalOpen = activeTerminalId === server.id;
          const ramPct = Math.round((server.ramUsed / server.ramTotal) * 100);
          const diskPct = Math.round((server.diskUsed / server.diskTotal) * 100);
          
          return (
            <div key={server.id} className="col-6">
              <div className="card linux-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Server Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Badge 
                      className={
                        server.os.includes('Ubuntu') ? 'os-badge-ubuntu' : 
                        server.os.includes('Rocky') ? 'os-badge-rocky' : 'os-badge-debian'
                      }
                    >
                      {server.os.includes('Ubuntu') ? 'UBUNTU' : 
                       server.os.includes('Rocky') ? 'ROCKY' : 'DEBIAN'}
                    </Badge>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{server.hostname}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>IP: {server.ip} • OS: {server.os}</span>
                    </div>
                  </div>
                  <Badge variant={server.status === 'online' ? 'success' : server.status === 'warning' ? 'warning' : 'danger'}>
                    {server.status}
                  </Badge>
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System Uptime</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>{server.uptime}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unix Load Average</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>{server.loadAvg.join(', ')}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Network Link</span>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: 4, color: 'var(--text-primary)' }}>{server.interfaces.name} ({server.interfaces.speed})</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CPU Hardware</span>
                    <div style={{ fontSize: '12px', fontWeight: 500, marginTop: 4, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={server.cpuModel}>
                      {server.cpuCores} Cores ({server.cpuCores === 16 ? 'AMD EPYC' : 'Intel Xeon'})
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
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{server.ramUsed.toFixed(1)} GB / {server.ramTotal.toFixed(1)} GB ({ramPct}%)</span>
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
                      <span>NVMe Disk Storage Capacity</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{server.diskUsed} GB / {server.diskTotal} GB ({diskPct}%)</span>
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Deployed Services Summary
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-tertiary)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(server.services || []).length}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>Total</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(34, 197, 94, 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                        {(server.services || []).filter(s => s.status === 'online').length}
                      </div>
                      <div style={{ fontSize: '9px', color: '#22c55e', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Up</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(251, 191, 36, 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(251, 191, 36, 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)' }}>
                        {(server.services || []).filter(s => s.status === 'warning').length}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--warning)', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Degraded</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', background: 'rgba(239, 68, 68, 0.06)', padding: '6px 4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                        {(server.services || []).filter(s => s.status === 'critical').length}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--danger)', opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Critical</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Console Shell Drawer toggle button */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {isTerminalOpen ? '🟢 SSH Console Session Active' : '⚪ Shell Diagnostic Connection Idle'}
                  </span>
                  <Button 
                    variant={isTerminalOpen ? 'danger' : 'primary'} 
                    size="sm"
                    onClick={() => setActiveTerminalId(isTerminalOpen ? null : server.id)}
                  >
                    {isTerminalOpen ? 'Terminate SSH' : 'Establish SSH Shell'}
                  </Button>
                </div>

                {/* Mock SSH Terminal Console */}
                {isTerminalOpen && (
                  <div className="terminal-shell" style={{ marginTop: '12px' }}>
                    <div className="terminal-header-pane">
                      <div className="terminal-dots">
                        <span className="terminal-dot red" />
                        <span className="terminal-dot yellow" />
                        <span className="terminal-dot green" />
                      </div>
                      <div>admin@{server.name}: ~ (secure shell)</div>
                      <div>10Gbps</div>
                    </div>
                    
                    <div className="terminal-output" ref={(el) => {
                      if (el) el.scrollTop = el.scrollHeight; // Auto scroll to bottom
                    }}>
                      {terminalHistory[server.id]?.map((line, idx) => (
                        <div key={idx} className={`terminal-line ${line.type}`}>
                          {line.text}
                        </div>
                      ))}
                    </div>

                    <div className="terminal-input-row">
                      <span className="terminal-prompt">admin@{server.name}:~$</span>
                      <select 
                        className="terminal-select-cmd"
                        value="" 
                        onChange={(e) => {
                          const command = e.target.value;
                          if (!command) return;
                          
                          if (command === 'clear') {
                            setTerminalHistory(prev => ({
                              ...prev,
                              [server.id]: []
                            }));
                          } else {
                            const logs = executeLinuxCommand(server, command);
                            setTerminalHistory(prev => ({
                              ...prev,
                              [server.id]: [...(prev[server.id] || []), ...logs]
                            }));
                          }
                        }}
                      >
                        <option value="" disabled>-- Execute Diagnostic SSH Shell Command --</option>
                        <option value="df -h">df -h (Check Filesystem Disk Capacity)</option>
                        <option value="free -m">free -m (Check Memory Ram Pools)</option>
                        <option value="uptime">uptime (Check Load Average and Uptime)</option>
                        <option value="uname -a">uname -a (Check OS Linux Kernel details)</option>
                        <option value="top -b -n 1">top -b -n 1 (Check Top Resource Daemon Processes)</option>
                        <option value="clear">clear (Reset Shell Output Screen)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
