import React from 'react';
import {
  ActivityIcon,
  ServerIcon,
  UsersIcon,
  CpuIcon,
  InfoIcon,
  BellIcon
} from './Icons';
import { Card, Badge, Button, StatCard } from './UiKit';
import { LineChart, BarChart, RadialProgress } from './SvgCharts';
import { getStatusConfig } from '../utils/statusHelper';

export const DashboardTab = ({
  widgets,
  layoutColumns,
  aggregateMetrics,
  historicalData,
  linuxServers,
  filteredServers,
  alerts,
  searchTerm,
  setSearchTerm,
  handleOpenServer,
  setAlerts,
  lastCheckTime
}) => {
  return (
    <>
      {/* STAT CARDS ROW */}
      {widgets.statsRow && (
        <div className="dashboard-grid">
          <StatCard 
            label="CPU Load Average"
            value={`${aggregateMetrics.currentCpu}%`}
            icon={<ActivityIcon size={20} />}
            trend={aggregateMetrics.currentCpu > 70 ? "High Usage" : "Stable Load"}
            trendValue={aggregateMetrics.currentCpu > 70 ? "+4.2%" : "-1.5%"}
            trendDirection={aggregateMetrics.currentCpu > 70 ? "up" : "down"}
            className="col-3 glow-card"
          />
          <StatCard 
            label="Active RAM Pool"
            value={`${aggregateMetrics.currentMem}%`}
            icon={<ServerIcon size={20} />}
            trend="Steady allocation"
            trendValue="+0.4%"
            trendDirection="neutral"
            className="col-3 glow-card"
          />
          <StatCard 
            label="Storage Volume (Disk)"
            value={`${aggregateMetrics.currentDisk}%`}
            icon={<ServerIcon size={20} />}
            trend="Volume usage rate"
            trendValue="Nominal"
            trendDirection="neutral"
            className="col-3 glow-card"
          />
          <StatCard 
            label="Network Throughput"
            value={aggregateMetrics.currentNet}
            icon={<UsersIcon size={20} />}
            trend="Ingress Traffic"
            trendValue="Active"
            trendDirection="up"
            className="col-3 glow-card"
          />
        </div>
      )}

      {/* DUAL WIDGET GRIDS (CHARTS AND GAUGES) */}
      <div className="dashboard-grid">
        {/* CPU Trend Line Chart */}
        {widgets.cpuTrend && (
          <Card 
            title="System Processor Load (CPU)" 
            subtitle="Real-time telemetry metric aggregate"
            className={widgets.radialHealth ? "col-8 glow-card" : "col-12 glow-card"}
            actions={
              <Badge variant={aggregateMetrics.currentCpu > 70 ? 'danger' : 'success'}>
                {aggregateMetrics.currentCpu > 70 ? 'LOAD STRESSED' : 'NOMINAL'}
              </Badge>
            }
          >
            <LineChart 
              data={historicalData.cpuData} 
              strokeColor="var(--accent-blue)" 
              fillGradientId="cpuGrad"
            />
          </Card>
        )}

        {/* Health Radial Guage Dial */}
        {widgets.radialHealth && (
          <Card 
            title="Aggregate Host Health" 
            subtitle="Weighted VM and host operating metrics"
            className={widgets.cpuTrend ? "col-4 glow-card" : "col-12 glow-card"}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
              <RadialProgress 
                percentage={aggregateMetrics.healthScore} 
                strokeColor={aggregateMetrics.healthScore > 85 ? 'var(--success)' : aggregateMetrics.healthScore > 60 ? 'var(--warning)' : 'var(--danger)'} 
              />
              <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {aggregateMetrics.healthScore === 100 
                  ? 'All host servers healthy and reachable' 
                  : `${linuxServers.filter(s => s.status === 'critical').length} host server(s) require attention`}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Memory Allocation Trend Line Chart */}
        {widgets.memoryTrend && (
          <Card 
            title="Active Memory Commit (RAM)" 
            subtitle="Memory allocation footprint"
            className="col-6 glow-card"
          >
            <LineChart 
              data={historicalData.memoryData} 
              strokeColor="var(--accent-cyan)" 
              fillGradientId="memGrad"
            />
          </Card>
        )}

        {/* Host Load Average Comparison Bar Chart */}
        {widgets.networkLoad && (
          <Card 
            title="Host Load Average Comparison" 
            subtitle="Recent queue load metrics across host server nodes"
            className="col-6 glow-card"
            actions={
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }}></span> 1m
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }}></span> 5m
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span> 15m
                </span>
              </div>
            }
          >
            <BarChart 
              data={linuxServers.flatMap(srv => {
                const shortName = srv.name
                  .replace('APP SERVER', 'App')
                  .replace('SERVER', 'Srv');
                
                const oneMin = srv.loadAvg?.[0] ?? srv.load_average?.one_minute ?? 0;
                const fiveMin = srv.loadAvg?.[1] ?? srv.load_average?.five_minutes ?? 0;
                const fifteenMin = srv.loadAvg?.[2] ?? srv.load_average?.fifteen_minutes ?? 0;

                return [
                  { 
                    label: `${srv.name} (1-Min Load)`, 
                    value: oneMin, 
                    xAxisLabel: '', 
                    color: 'var(--accent-blue)' 
                  },
                  { 
                    label: `${srv.name} (5-Min Load)`, 
                    value: fiveMin, 
                    xAxisLabel: shortName, 
                    color: 'var(--accent-cyan)' 
                  },
                  { 
                    label: `${srv.name} (15-Min Load)`, 
                    value: fifteenMin, 
                    xAxisLabel: '', 
                    color: '#8b5cf6' 
                  }
                ];
              })} 
              barColor="var(--accent-blue)"
            />
          </Card>
        )}
      </div>

      {/* GLOBAL SERVICE COMPONENTS SUMMARY */}
      <div className="dashboard-grid">
        <Card 
          title="Global Service Components Summary" 
          subtitle="Unified real-time status of all microservice components deployed across the fleet"
          className="col-12 glow-card"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metrics Row */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Total Components Card */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', color: 'var(--accent-blue)' }}>
                  <CpuIcon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{aggregateMetrics.totalServicesCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Components</div>
                </div>
              </div>
              
              {/* Components Up Card */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', color: 'var(--accent-blue)' }}>
                  <ActivityIcon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{aggregateMetrics.servicesUpCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Components Up</div>
                </div>
              </div>

              {/* Components Degraded Card */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', color: 'var(--accent-blue)' }}>
                  <InfoIcon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{aggregateMetrics.servicesDegradedCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Components Degraded</div>
                </div>
              </div>

              {/* Components Critical Card */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', color: 'var(--accent-blue)' }}>
                  <BellIcon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{aggregateMetrics.servicesCriticalCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Components Critical</div>
                </div>
              </div>
            </div>

            {/* Service Grid Map */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              {linuxServers.map(server => {
                const srvStatusCfg = getStatusConfig(server.status);
                return (
                  <div key={server.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span className="service-host-title">{server.name}</span>
                      <Badge variant={srvStatusCfg.variant}>
                        {srvStatusCfg.label}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                      {(server.services || []).map((svc, sidx) => {
                        const svcStatusCfg = getStatusConfig(svc.rawStatus || svc.status);
                        return (
                          <div key={sidx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{svc.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: svcStatusCfg.color }}>
                              <span style={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: svcStatusCfg.color, 
                                boxShadow: `0 0 4px ${svcStatusCfg.color}` 
                              }}></span>
                              {svcStatusCfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* BOTTOM WIDGET GRID (TABLE AND ALERTS) */}
      <div className="dashboard-grid">
        {/* Fleet Node List Table */}
        {widgets.serverTable && (
          <Card 
            title="Reachable Node Fleet Components" 
            subtitle="Active microservice deployments"
            className={widgets.alertFeed ? "col-8 glow-card dashboard-bottom-card" : "col-12 glow-card dashboard-bottom-card"}
            actions={
              <input 
                type="text" 
                placeholder="Search components..."
                className="form-control"
                style={{ padding: '6px 12px', fontSize: '13.5px', width: 180 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            }
          >
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Host</th>
                    <th>Port</th>
                    <th>CPU</th>
                    <th>RAM</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                        No components matching query found.
                      </td>
                    </tr>
                  ) : (
                    filteredServers.map((srv) => {
                      const compStatusCfg = getStatusConfig(srv.rawStatus || srv.status);
                      return (
                        <tr key={srv.id}>
                          <td className="font-semibold">{srv.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{srv.type}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{srv.ports}</td>
                          <td>{srv.cpu}%</td>
                          <td>{srv.ram}%</td>
                          <td className="text-center">
                            <Badge variant={compStatusCfg.variant}>
                              {compStatusCfg.label}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Button variant="secondary" size="sm" onClick={() => handleOpenServer(srv)}>
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Alerts Alert logs feed */}
        {widgets.alertFeed && (
          <Card 
            title="Active Alerts Log" 
            subtitle="System warnings and telemetry exceptions"
            className={widgets.serverTable ? "col-4 glow-card dashboard-bottom-card" : "col-12 glow-card dashboard-bottom-card"}
            actions={
              <Button variant="secondary" size="sm" onClick={() => setAlerts([])}>
                Clear
              </Button>
            }
          >
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column' }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <div style={{ marginBottom: 8 }}>✅</div>
                  All systems normal. No active alerts.
                </div>
              ) : (
                alerts.map((alt) => (
                  <div key={alt.id} className={`alert-item ${alt.type}`}>
                    <div className="alert-message">
                      <div className="font-semibold" style={{ fontSize: '11.5px', textTransform: 'uppercase', marginBottom: 2, opacity: 0.8 }}>
                        {alt.code || 'ALERT'}
                      </div>
                      {alt.message}
                    </div>
                    <span className="alert-time">{alt.time}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
