import React from 'react';
import { Card, Button, Badge } from './UiKit';

export const AlertLogsTab = ({
  alerts,
  setAlerts
}) => {
  return (
    <Card 
      title="System Operations Event Feed" 
      subtitle="Showing last events parsed by operations telemetry agents"
      actions={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setAlerts([])}>
            Clear Logs
          </Button>
          <Button variant="primary" onClick={() => {
            setAlerts(prev => [
              {
                id: `alt-${Date.now()}`,
                message: 'Forced telemetry check triggered by administrator profile ajite',
                type: 'info',
                time: 'Just now',
                code: 'FORCE_CHECK'
              },
              ...prev
            ]);
          }}>
            Trigger Test Event
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <h3>All telemetry clear.</h3>
            <p style={{ marginTop: '8px' }}>No warnings, critical codes, or info records registered.</p>
          </div>
        ) : (
          alerts.map((alt) => (
            <div 
              key={alt.id} 
              className={`alert-item ${alt.type}`}
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}
            >
              <div style={{ marginRight: '16px', fontSize: '20px' }}>
                {alt.type === 'danger' && '❌'}
                {alt.type === 'warning' && '⚠️'}
                {alt.type === 'success' && '✅'}
                {alt.type === 'info' && 'ℹ️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="font-bold" style={{ fontSize: '13px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {alt.code}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>• {alt.time}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{alt.message}</p>
              </div>
              <Badge variant={alt.type}>
                {alt.type === 'danger' ? 'critical' : alt.type}
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
