import React from 'react';
import { Modal, Button, Badge } from '../UiKit';
import { getStatusConfig } from '../../utils/statusHelper';
import './ServerInspectModal.css';

export const ServerInspectModal = ({
  isServerModalOpen,
  setIsServerModalOpen,
  selectedServer,
  handleRebootServer
}) => {
  // Helper to determine status label and configuration using the reachable boolean
  const getStatusInfo = (server) => {
    if (!server) return { label: 'UNKNOWN', config: getStatusConfig(null) };
    if (server.component_id) {
      const raw = server.rawStatus || server.status;
      return {
        label: (raw || 'UNKNOWN').toUpperCase(),
        config: getStatusConfig(raw)
      };
    } else {
      let isReachable = true;
      if (server.reachable !== undefined) {
        isReachable = server.reachable;
      } else if (server.status === 'critical' || server.status === 'offline' || server.status === 'unreachable') {
        isReachable = false;
      }
      const label = isReachable ? 'REACHABLE' : 'UNREACHABLE';
      return {
        label,
        config: getStatusConfig(label)
      };
    }
  };

  const statusInfo = getStatusInfo(selectedServer);
  const isComponent = selectedServer && (selectedServer.component_id || (selectedServer.id && String(selectedServer.id).startsWith('comp')));

  return (
    <Modal
      isOpen={isServerModalOpen}
      onClose={() => setIsServerModalOpen(false)}
      title={selectedServer ? (isComponent ? `Inspect Component: ${selectedServer.name}` : `Diagnostics: ${selectedServer.hostname || selectedServer.name}`) : ''}
      style={{ maxWidth: '680px', width: '95%' }}
      footer={
        <>
          <Button variant="secondary" onClick={() => setIsServerModalOpen(false)}>
            Close Diagnostics
          </Button>
          {selectedServer && isComponent && (
            <Button 
              variant="danger" 
              onClick={() => handleRebootServer(selectedServer.id)}
            >
              Reboot Component
            </Button>
          )}
        </>
      }
    >
      {selectedServer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '550px', overflowY: 'auto', paddingLeft: '8px', paddingRight: '8px', paddingBottom: '8px' }}>
          
          {/* COMPONENT VIEW */}
          {isComponent && (
            <>
              {/* Header Info: Status & Last Checked */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Status State</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div className="pulsar" style={{ 
                      backgroundColor: statusInfo.config.color,
                      boxShadow: statusInfo.config.glow
                    }}></div>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '15px', color: statusInfo.config.color }}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Last Checked</span>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginTop: 4, color: 'var(--text-secondary)' }}>
                    {selectedServer.last_checked ? new Date(selectedServer.last_checked).toLocaleString() : new Date().toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Component Profile section (moved above) */}
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Component Profile</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Process ID (PID):</span>{' '}
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedServer.process_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Auto Restart:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedServer.restart_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Directory Size:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedServer.component_directory_size || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Memory Allocation:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedServer.memory_usage_mb ? `${selectedServer.memory_usage_mb} MB` : 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Host IP Address:</span>{' '}
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{selectedServer.host || selectedServer.ip || '127.0.0.1'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Process OK:</span>{' '}
                    <span style={{ color: selectedServer.process_ok ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {selectedServer.process_ok !== undefined ? String(selectedServer.process_ok).toUpperCase() : 'TRUE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CPU & RAM Grid (moved below) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>CPU Utilization</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-blue)', marginTop: 6 }}>
                    {selectedServer.cpu}%
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Memory Footprint</span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 6 }}>
                    {selectedServer.ram}%
                  </div>
                </div>
              </div>
            </>
          )}

          {/* HOST / SERVER VIEW */}
          {!isComponent && (
            <>
              {/* Header Info: Status & Check Time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Status State</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div className="pulsar" style={{ 
                      backgroundColor: statusInfo.config.color,
                      boxShadow: statusInfo.config.glow
                    }}></div>
                    <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '15px', color: statusInfo.config.color }}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                {selectedServer.last_checked && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Last Polled</span>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginTop: 4, color: 'var(--text-secondary)' }}>
                      {new Date(selectedServer.last_checked).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION B: HOST OPERATING SYSTEM & HARDWARE INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Operating System Detail Box */}
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>OS & Kernel Info</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>OS:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedServer.os || 'N/A'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Kernel:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedServer.kernel || 'N/A'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Uptime:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedServer.uptime || 'N/A'}</span></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>IP Address:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedServer.host || selectedServer.ip || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Hardware Detail Box */}
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>CPU Hardware</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>CPU Model:</span> <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedServer.cpu_hardware?.model || selectedServer.cpuModel || 'N/A'}</span></div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Topology:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {selectedServer.cpu_hardware?.total_threads || selectedServer.cpuCores || 0} Threads 
                        {selectedServer.cpu_hardware?.sockets ? ` (${selectedServer.cpu_hardware.sockets} Sockets • ${selectedServer.cpu_hardware.cores_per_socket} Cores/Srv)` : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Load Avg:</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {selectedServer.load_average ? `${selectedServer.load_average.one_minute}, ${selectedServer.load_average.five_minutes}, ${selectedServer.load_average.fifteen_minutes}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Current Utilization:</span>{' '}
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{selectedServer.cpuLoad || selectedServer.cpu || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: MEMORY BREAKDOWN POOLS */}
              {selectedServer.memory_details && (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Memory Pools Allocation</span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '14px' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.02em' }}>RAM Memory</div>
                      <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {((selectedServer.memory_details.used_mb || 0) / 1024).toFixed(2)} GB / {((selectedServer.memory_details.total_mb || 0) / 1024).toFixed(1)} GB
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {selectedServer.memory_details.used_percent}% Allocated
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.02em' }}>Available RAM</div>
                      <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--success)' }}>
                        {((selectedServer.memory_details.available_mb || 0) / 1024).toFixed(2)} GB
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Free Memory
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.02em' }}>Swap Space</div>
                      <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedServer.memory_details.swap_used_mb} MB / {selectedServer.memory_details.swap_total_mb} MB
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {selectedServer.memory_details.swap_used_percent}% Allocated
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION D: PARTITION FILESYSTEMS MAP */}
              {selectedServer.filesystems && selectedServer.filesystems.length > 0 && (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Mounted Filesystems Map</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedServer.filesystems.map((fs, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{fs.mount}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginLeft: '8px' }}>({fs.filesystem})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{fs.used} / {fs.total} Used</span>
                          <Badge variant={fs.used_percent_value > 90 ? 'danger' : 'info'}>{fs.used_percent}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION E: DETAILED NETWORK INTERFACES DIAGNOSTICS */}
              {selectedServer.network_interfaces && selectedServer.network_interfaces.length > 0 && (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>Network Interface Configuration</span>
                  {selectedServer.network_interfaces.map((net, idx) => {
                    const formatGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Interface:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{net.interface}</span></div>
                          <Badge variant={net.state === 'HEALTHY' ? 'success' : 'danger'}>{net.state}</Badge>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                          <div><span style={{ color: 'var(--text-secondary)' }}>IPv4 Range:</span> <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{net.ipv4}</span></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>MAC Address:</span> <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{net.mac_address}</span></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Received (Rx):</span> <span style={{ color: 'var(--text-primary)' }}>{formatGB(net.rx_bytes)} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({net.rx_dropped} dropped, {net.rx_errors} err)</span></span></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Transmitted (Tx):</span> <span style={{ color: 'var(--text-primary)' }}>{formatGB(net.tx_bytes)} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({net.tx_dropped} dropped, {net.tx_errors} err)</span></span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION F: SERVICES UPTIME BRIEF */}
              {selectedServer.services_summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(52, 211, 153, 0.08)', padding: '10px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{selectedServer.services_summary.healthy_services}</div>
                    <div style={{ fontSize: '11px', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>Healthy Services</div>
                  </div>
                  <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: '10px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--warning)' }}>{selectedServer.services_summary.degraded_services}</div>
                    <div style={{ fontSize: '11px', color: 'var(--warning)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>Degraded</div>
                  </div>
                  <div style={{ background: 'rgba(255, 107, 107, 0.08)', padding: '10px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>{selectedServer.services_summary.down_services}</div>
                    <div style={{ fontSize: '11px', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>Offline</div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}
    </Modal>
  );
};
