import React from 'react';
import { Card, Badge, Button } from './UiKit';
import { getStatusConfig } from '../utils/statusHelper';

export const NodeFleetTab = ({
  servers,
  setServers,
  setAlerts,
  searchTerm,
  setSearchTerm,
  handleOpenServer,
  handleRebootServer
}) => {
  return (
    <Card 
      title="Component Fleet Resource Grid" 
      subtitle={`Total: ${servers.length} active microservice components`}
      actions={
        <div className="flex-row-center">
          <input 
            type="text" 
            placeholder="Filter components..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={() => {
            const newId = `comp-${Date.now()}`;
            const newName = `worker-service-${Math.floor(Math.random() * 900 + 100)}`;
            const portsList = ['80', '8080', '5432', '6379', '9000', '22'];
            const types = ['APP SERVER 1', 'APP SERVER 2', 'ETL SERVER', 'WEB SERVER'];
            setServers(prev => [
              ...prev,
              {
                id: newId,
                name: newName,
                ports: portsList[Math.floor(Math.random() * portsList.length)],
                cpu: 10,
                ram: 15,
                status: 'online',
                type: types[Math.floor(Math.random() * types.length)],
                server_name: types[Math.floor(Math.random() * types.length)],
                host: '127.0.0.1'
              }
            ]);
            // add alert
            setAlerts(prev => [
              { id: `alt-${Date.now()}`, message: `Provisioned new fleet component: ${newName}`, type: 'success', time: 'Just now', code: 'COMPONENT_PROVISIONED' },
              ...prev
            ]);
          }}>
            + Add Component Node
          </Button>
        </div>
      }
    >
      <div className="dashboard-grid" style={{ marginTop: '8px' }}>
        {servers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(srv => (
          <div key={srv.id} className="col-4">
            <div className="card glow-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{srv.name}</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>PID: {srv.process_id || 'N/A'}</span>
                </div>
                <Badge variant={getStatusConfig(srv.rawStatus || srv.status).variant}>
                  {getStatusConfig(srv.rawStatus || srv.status).label}
                </Badge>
              </div>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Host Server:</span>
                  <span className="font-semibold">{srv.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Port:</span>
                  <span className="font-semibold" style={{ fontFamily: 'monospace' }}>{srv.ports}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>CPU Core</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{srv.cpu}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${srv.cpu}%`, 
                        height: '100%', 
                        backgroundColor: getStatusConfig(srv.rawStatus || srv.status).category === 'critical' ? 'var(--danger)' : getStatusConfig(srv.rawStatus || srv.status).category === 'warning' ? 'var(--warning)' : 'var(--accent-blue)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>RAM Slot</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{srv.ram}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${srv.ram}%`, 
                        height: '100%', 
                        backgroundColor: srv.ram > 85 ? 'var(--danger)' : srv.ram > 70 ? 'var(--warning)' : 'var(--accent-cyan)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  style={{ flex: 1 }}
                  onClick={() => handleOpenServer(srv)}
                >
                  Inspect
                </Button>
                <Button 
                  variant="danger-outline" 
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleRebootServer(srv.id)}
                >
                  Reboot
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
