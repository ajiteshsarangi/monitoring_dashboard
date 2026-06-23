import React from 'react';
import { Card, Button, Badge } from '../UiKit';
import './LogExplorerTab.css';

export const LogExplorerTab = ({
  logs,
  setLogs,
  servers = [],
  selectedLogServer,
  setSelectedLogServer,
  selectedLogService,
  setSelectedLogService,
  selectedLogLevel,
  setSelectedLogLevel,
  availableSeverities = ['INFO', 'WARN', 'DEBUG', 'ERROR'],
  logLines,
  setLogLines,
  isAutoScrollEnabled,
  setIsAutoScrollEnabled,
  onFetchLogs
}) => {
  // Get unique servers dynamically from components list
  const uniqueServers = Array.from(new Set(servers.map(s => s.server_name || s.host || 'Unknown'))).filter(Boolean);

  // Get matching services/components for the selected server
  const matchingServices = servers.filter(s => (s.server_name || s.host || 'Unknown') === selectedLogServer);
  return (
    <Card 
      title="Application Log Telemetry Stream" 
      subtitle="Consolidated real-time daemon logs from fleet servers"
      actions={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            Clear Log Terminal
          </Button>
          <Button variant="primary" size="sm" onClick={() => {
            const nowStr = new Date().toLocaleTimeString();
            const exceptionLogs = [
              {
                id: `java-err-${Date.now()}-1`,
                timestamp: nowStr,
                server: 'srv-prod-app-01',
                service: 'nodejs-app',
                level: 'CRIT',
                message: 'FATAL Exception in thread "http-nio-8080-exec-4" java.lang.NullPointerException: Cannot invoke "com.example.service.DatabaseConnector.query()" because "this.connector" is null',
                isStackTrace: false
              },
              {
                id: `java-err-${Date.now()}-2`,
                timestamp: '',
                server: 'srv-prod-app-01',
                service: 'nodejs-app',
                level: '',
                message: '    at com.example.controller.CheckoutController.doCheckout(CheckoutController.java:142)',
                isStackTrace: true
              },
              {
                id: `java-err-${Date.now()}-3`,
                timestamp: '',
                server: 'srv-prod-app-01',
                service: 'nodejs-app',
                level: '',
                message: '    at com.example.filter.AuthFilter.doFilter(AuthFilter.java:85)',
                isStackTrace: true
              },
              {
                id: `java-err-${Date.now()}-4`,
                timestamp: '',
                server: 'srv-prod-app-01',
                service: 'nodejs-app',
                level: '',
                message: '    Caused by: java.lang.NullPointerException',
                isStackTrace: true
              },
              {
                id: `java-err-${Date.now()}-5`,
                timestamp: '',
                server: 'srv-prod-app-01',
                service: 'nodejs-app',
                level: '',
                message: '        at com.example.service.DatabaseConnector.init(DatabaseConnector.java:54)',
                isStackTrace: true
              }
            ];
            setLogs(prev => [...prev, ...exceptionLogs]);
          }}>
            Inject Java Exception
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Filter Server Node</label>
            <select 
              className="form-control" 
              style={{ width: '100%', fontSize: '13.5px' }}
              value={selectedLogServer}
              onChange={(e) => setSelectedLogServer(e.target.value)}
            >
              {uniqueServers.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Filter Deployed Service</label>
            <select 
              className="form-control" 
              style={{ width: '100%', fontSize: '13.5px' }}
              value={selectedLogService}
              onChange={(e) => setSelectedLogService(e.target.value)}
            >
              {matchingServices.map(svc => (
                <option key={svc.id} value={svc.id}>{svc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Filter Severity Level</label>
            <select 
              className="form-control" 
              style={{ width: '100%', fontSize: '13.5px' }}
              value={selectedLogLevel}
              onChange={(e) => setSelectedLogLevel(e.target.value)}
            >
              {availableSeverities.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Lines to Retrieve</label>
            <input 
              type="number" 
              min="1"
              max="500"
              placeholder="100"
              className="form-control"
              style={{ width: '100%', fontSize: '13.5px' }}
              value={logLines}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLogLines(isNaN(val) ? '' : Math.min(Math.max(val, 1), 500));
              }}
            />
          </div>
        </div>

        {/* Console Log Screen */}
        <div className="log-console">
          {/* Console Header */}
          <div className="terminal-header-pane" style={{ borderBottomColor: 'rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span style={{ marginLeft: '6px', fontWeight: 600 }}>Log Terminal Console</span>
            </div>
            <div className="flex-row-center">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none', fontSize: '11.5px' }}>
                <input 
                  type="checkbox" 
                  checked={isAutoScrollEnabled} 
                  onChange={(e) => setIsAutoScrollEnabled(e.target.checked)} 
                />
                Auto-scroll lock
              </label>
            </div>
          </div>

          {/* Scrollable logs */}
          <div className="log-rows" ref={(el) => {
            if (el && isAutoScrollEnabled) {
              el.scrollTop = el.scrollHeight;
            }
          }}>
            {logs
              .map((log, index) => {
                if (typeof log === 'string') {
                  const isStack = log.trim().startsWith('at ') || log.trim().startsWith('Caused by:') || log.trim().startsWith('\t');
                  return (
                    <div key={index} className="log-row" style={{ padding: '2px 8px' }}>
                      <span 
                        className="log-message" 
                        style={{ 
                          fontFamily: 'monospace', 
                          color: isStack ? 'var(--text-muted)' : '#cdd6f4',
                          paddingLeft: isStack ? '24px' : '0' 
                        }}
                      >
                        {log}
                      </span>
                    </div>
                  );
                }

                if (log.isStackTrace) {
                  return (
                    <div key={log.id || index} className="log-row" style={{ padding: '2px 8px' }}>
                      <span 
                        className="log-message" 
                        style={{ 
                          fontFamily: 'monospace', 
                          color: 'var(--text-muted)',
                          paddingLeft: '24px' 
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  );
                }

                if (!log.level && !log.timestamp) {
                  return (
                    <div key={log.id || index} className="log-row" style={{ padding: '2px 8px' }}>
                      <span className="log-message" style={{ fontFamily: 'monospace' }}>
                        {log.message}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={log.id || index} className="log-row">
                    <span className="log-ts">[{log.timestamp}]</span>
                    <span className="log-node">{log.server}</span>
                    <span className="log-service">{log.service}</span>
                    <span className={`log-level ${log.level.toLowerCase()}`}>{log.level}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                );
              })}
            {logs.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                <div>No logs match the current search filters.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
