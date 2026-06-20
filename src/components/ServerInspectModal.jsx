import React from 'react';
import { Modal, Button } from './UiKit';

export const ServerInspectModal = ({
  isServerModalOpen,
  setIsServerModalOpen,
  selectedServer,
  handleRebootServer
}) => {
  return (
    <Modal
      isOpen={isServerModalOpen}
      onClose={() => setIsServerModalOpen(false)}
      title={selectedServer ? `Telemetry Diagnostics: ${selectedServer.name}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={() => setIsServerModalOpen(false)}>
            Close Diagnostics
          </Button>
          {selectedServer && (
            <Button 
              variant="danger" 
              onClick={() => handleRebootServer(selectedServer.id)}
            >
              Reboot Node
            </Button>
          )}
        </>
      }
    >
      {selectedServer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status State</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <div className="pulsar" style={{ 
                  backgroundColor: selectedServer.status === 'online' ? '#22c55e' : selectedServer.status === 'warning' ? 'var(--warning)' : 'var(--danger)',
                  boxShadow: selectedServer.status === 'online' ? '0 0 6px #22c55e' : selectedServer.status === 'warning' ? '0 0 6px var(--warning)' : '0 0 6px var(--danger)'
                }}></div>
                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedServer.status}
                </span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cluster ID</span>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{selectedServer.id}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CPU Utilization</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)', marginTop: 4 }}>
                {selectedServer.cpu}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Memory Footprint</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: 4 }}>
                {selectedServer.ram}%
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Active Daemon Processes</span>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', fontFamily: 'monospace', fontSize: '11px', maxHeight: '120px', overflowY: 'auto' }}>
              <div style={{ color: 'var(--success)' }}>[OK] systemd-journald.service - Journal Service</div>
              <div style={{ color: 'var(--success)' }}>[OK] nginx.service - High-Performance Web Server</div>
              {selectedServer.status === 'critical' ? (
                <div style={{ color: 'var(--danger)' }}>[FAIL] postgresql.service - Connection Pool Saturated</div>
              ) : (
                <div style={{ color: 'var(--success)' }}>[OK] postgresql.service - Database Daemon</div>
              )}
              <div style={{ color: 'var(--success)' }}>[OK] prometheus-node-exporter.service - Metrics Agent</div>
              <div style={{ color: 'var(--text-secondary)' }}>[INFO] Syncing replicas... 100% block parity.</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
