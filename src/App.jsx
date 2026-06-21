import React, { useState, useEffect, useRef } from 'react';

// Import UI sub-components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { NodeFleetTab } from './components/NodeFleetTab';
import { AlertLogsTab } from './components/AlertLogsTab';
import { LinuxFleetTab } from './components/LinuxFleetTab';
import { LogExplorerTab } from './components/LogExplorerTab';
import { CustomizerDrawer } from './components/CustomizerDrawer';
import { ServerInspectModal } from './components/ServerInspectModal';
import { getStatusConfig } from './utils/statusHelper';

// Import Mock Data
import {
  generateHistoricalMetrics,
  initialServersList,
  initialAlerts,
  initialLinuxServers,
  initialLogs,
  generateNewLogLine
} from './mockData';

const mapComponentStatus = (statusStr) => {
  return getStatusConfig(statusStr).category;
};

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('bluegrid_theme') || 'light');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('bluegrid_fontSize') || 'small'); // Default to small

  // Real-time updates state
  const [isLive, setIsLive] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState(3000); // 3 seconds

  // Data States
  const [historicalData, setHistoricalData] = useState(() => generateHistoricalMetrics(16));
  const [servers, setServers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy'); // 'healthy' | 'offline'
  const [latestMetrics, setLatestMetrics] = useState(null);

  // Linux Servers States
  const [linuxServers, setLinuxServers] = useState([]);
  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [terminalHistory, setTerminalHistory] = useState({
    'lnx-01': [{ type: 'output', text: 'srv-prod-app-01 login: admin\nPassword: *********\nLast login: Wed Jun 17 19:42:10 2026 from 10.0.0.12\n\nWelcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-40-generic)\n* Documentation:  https://help.ubuntu.com\n* Management:     https://landscape.canonical.com\n* Support:        https://ubuntu.com/pro\n\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-02': [{ type: 'output', text: 'srv-prod-app-02 login: admin\nPassword: *********\nLast login: Wed Jun 17 20:12:05 2026 from 10.0.0.12\n\nWelcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-40-generic)\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-03': [{ type: 'output', text: 'srv-prod-db-01 login: dbadmin\nPassword: *********\nLast login: Mon Jun 15 08:33:14 2026 from 10.0.0.4\n\nWelcome to Rocky Linux 9.4 (Blue Onyx)\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-04': [{ type: 'output', text: 'srv-stage-cache-01 login: cacheadm\nPassword: *********\nLast login: Wed Jun 17 21:00:15 2026 from 10.0.0.12\n\nWelcome to Debian GNU/Linux 12 (bookworm)\nActive command shell started. Type commands from drop-down below.' }]
  });

  // Log Explorer States
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLogServer, setSelectedLogServer] = useState('all');
  const [selectedLogService, setSelectedLogService] = useState('all');
  const [selectedLogLevel, setSelectedLogLevel] = useState('all');
  const [logSearchKeyword, setLogSearchKeyword] = useState('');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  const linuxServersRef = useRef(linuxServers);
  linuxServersRef.current = linuxServers;

  // Selected Server for Detail Modal
  const [selectedServer, setSelectedServer] = useState(null);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // Widget Visibility Settings (Managed via Customizer Workspace) - Load from Local Storage
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('bluegrid_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
    return {
      statsRow: true,
      cpuTrend: true,
      memoryTrend: true,
      networkLoad: true,
      serverTable: true,
      alertFeed: true,
      radialHealth: true
    };
  });
  
  const [layoutColumns, setLayoutColumns] = useState('4'); // Stat cards per row (3 or 4)
  const [lastCheckTime, setLastCheckTime] = useState(() => new Date().toLocaleTimeString());

  // Effect to toggle CSS themes & persist in Local Storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bluegrid_theme', theme);
  }, [theme]);

  // Effect to toggle font size settings & persist in Local Storage
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('bluegrid_fontSize', fontSize);
  }, [fontSize]);

  // Effect to persist active widgets selection in Local Storage
  useEffect(() => {
    localStorage.setItem('bluegrid_widgets', JSON.stringify(widgets));
  }, [widgets]);

  const fetchTelemetry = async () => {
    try {
      const [healthRes, metricsRes, componentsRes, serversRes, alertsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/health').then(r => {
          if (!r.ok) throw new Error('Health check status not OK');
          return r.json();
        }),
        fetch('http://127.0.0.1:8000/metrics').then(r => r.json()),
        fetch('http://127.0.0.1:8000/components').then(r => r.json()),
        fetch('http://127.0.0.1:8000/servers').then(r => r.json()),
        fetch('http://127.0.0.1:8000/alerts').then(r => r.json()),
      ]);

      if (healthRes.status === 'ok') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('offline');
      }

      setLastCheckTime(new Date().toLocaleTimeString());
      setLatestMetrics(metricsRes);

      // Map components to the 'servers' state
      const mappedServers = componentsRes.map(comp => {
        return {
          ...comp,
          id: comp.component_id,
          name: comp.component_name || comp.component_id,
          ports: comp.port ? String(comp.port) : 'N/A',
          cpu: comp.cpu_usage_percent || 0,
          ram: comp.memory_usage_percent || 0,
          status: mapComponentStatus(comp.status),
          rawStatus: comp.status,
          type: comp.server_name || 'Component',
          server_name: comp.server_name,
          host: comp.host
        };
      });
      setServers(mappedServers);

      // Map Linux Fleet components
      const mappedLinux = serversRes.map(srv => {
        const serverComponents = componentsRes.filter(c => c.server_name === srv.name || c.host === srv.host);
        const servicesList = serverComponents.map(c => ({
          name: c.component_name || c.component_id,
          status: mapComponentStatus(c.status),
          rawStatus: c.status
        }));

        // Memory values (in GB). Fall back to null if memory_details is missing
        const ramTotal = srv.memory_details ? srv.memory_details.total_mb / 1024 : null;
        const ramUsed = srv.memory_details ? srv.memory_details.used_mb / 1024 : null;

        // Parse filesystems total & used in GB dynamically. Fallback to null if empty.
        let diskTotal = null;
        let diskUsed = null;
        if (srv.filesystems && srv.filesystems.length > 0) {
          const parseCap = (str) => {
            const val = parseFloat(str);
            if (str.toLowerCase().includes('t')) return val * 1024; // Convert TB to GB
            return val;
          };
          diskTotal = srv.filesystems.reduce((acc, f) => acc + parseCap(f.total), 0);
          diskUsed = srv.filesystems.reduce((acc, f) => acc + parseCap(f.used), 0);
        }

        return {
          id: srv.host || srv.name,
          name: srv.name,
          hostname: srv.hostname || srv.name,
          ip: srv.host,
          os: srv.os || 'Linux Server',
          kernel: srv.kernel || 'N/A',
          architecture: srv.architecture || 'N/A',
          cpuCores: srv.cpu_hardware?.total_threads || null,
          cpuModel: srv.cpu_hardware?.model || 'Generic Processor',
          cpuLoad: srv.cpu || 0,
          ramTotal,
          ramUsed,
          diskTotal,
          diskUsed,
          diskType: 'SSD',
          uptime: srv.uptime || 'Unknown',
          loadAvg: [
            srv.load_average?.one_minute ?? 0, 
            srv.load_average?.five_minutes ?? 0, 
            srv.load_average?.fifteen_minutes ?? 0
          ],
          interfaces: {
            name: srv.network_interfaces?.[0]?.interface || 'N/A',
            speed: srv.network_interfaces?.[0]?.speed || 'N/A',
            ip: srv.host || 'N/A',
            ipv4: srv.network_interfaces?.[0]?.ipv4 || srv.host || 'N/A'
          },
          status: srv.reachable === false ? 'critical' : 'online',
          rawStatus: srv.reachable === false ? 'UNREACHABLE' : 'REACHABLE',
          services: servicesList,
          load_average: srv.load_average,
          memory_details: srv.memory_details,
          filesystems: srv.filesystems,
          network_interfaces: srv.network_interfaces,
          cpu_hardware: srv.cpu_hardware,
          host: srv.host
        };
      });
      setLinuxServers(mappedLinux);

      // Update historical metrics using values directly from metrics API response
      const newLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newCpu = metricsRes && metricsRes.cpu !== undefined ? Math.round(metricsRes.cpu) : 0;
      const newMem = metricsRes && metricsRes.memory !== undefined ? Math.round(metricsRes.memory) : 0;
      const netValue = parseFloat(metricsRes.network) || 0;

      setHistoricalData(prev => {
        return {
          cpuData: [...prev.cpuData.slice(1), { label: newLabel, value: newCpu }],
          memoryData: [...prev.memoryData.slice(1), { label: newLabel, value: newMem }],
          networkData: [...prev.networkData.slice(1), { label: newLabel, value: netValue }]
        };
      });

      // Map Alerts
      const mappedAlerts = alertsRes.map(alt => ({
        id: `alt-${alt.id}`,
        message: alt.message,
        type: alt.severity === 'CRITICAL' ? 'danger' : (alt.severity === 'WARNING' ? 'warning' : 'info'),
        time: alt.created_at ? new Date(alt.created_at).toLocaleTimeString() : 'Just now',
        code: alt.component_id ? alt.component_id.toUpperCase() : 'ALERT'
      }));
      setAlerts(mappedAlerts);

    } catch (err) {
      console.error("API connection failed", err);
      setHealthStatus('offline');
    }
  };

  // Live polling interval
  useEffect(() => {
    fetchTelemetry();
    let intervalId = null;
    if (isLive) {
      intervalId = setInterval(() => {
        fetchTelemetry();
        // Generate a simulated log line to keep log explorer functional
        setLogs(prev => {
          const newLine = generateNewLogLine(linuxServersRef.current);
          return [...prev.slice(-99), newLine];
        });
      }, updateFrequency);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive, updateFrequency]);

  // Compute stats
  const aggregateMetrics = React.useMemo(() => {
    const totalServers = servers.length;
    const criticalServers = servers.filter(s => s.status === 'critical').length;
    const warningServers = servers.filter(s => s.status === 'warning').length;
    const onlineServers = servers.filter(s => s.status === 'online').length;

    // Calculate current aggregate values from metrics API response data
    const currentCpu = latestMetrics && latestMetrics.cpu !== undefined ? Math.round(latestMetrics.cpu) : 0;
    const currentMem = latestMetrics && latestMetrics.memory !== undefined ? Math.round(latestMetrics.memory) : 0;
    const currentDisk = latestMetrics ? latestMetrics.disk : 0;
    const currentNet = latestMetrics ? latestMetrics.network : (historicalData.networkData[historicalData.networkData.length - 1]?.value || 0);

    const totalHosts = linuxServers.length;
    const criticalHosts = linuxServers.filter(s => s.status === 'critical').length;
    const warningHosts = linuxServers.filter(s => s.status === 'warning').length;

    const healthScore = totalHosts > 0 
      ? Math.max(100 - (criticalHosts * 25) - (warningHosts * 10), 0) 
      : 100;

    // Calculate component status counts dynamically from components array
    const totalServicesCount = servers.length;
    const servicesUpCount = servers.filter(s => s.status === 'online').length;
    const servicesDegradedCount = servers.filter(s => s.status === 'warning').length;
    const servicesCriticalCount = servers.filter(s => s.status === 'critical').length;

    return {
      totalServers,
      criticalServers,
      warningServers,
      onlineServers,
      currentCpu,
      currentMem,
      currentDisk,
      currentNet,
      healthScore,
      totalServicesCount,
      servicesUpCount,
      servicesDegradedCount,
      servicesCriticalCount
    };
  }, [servers, historicalData, linuxServers, latestMetrics]);

  const resetLayout = () => {
    setWidgets({
      statsRow: true,
      cpuTrend: true,
      memoryTrend: true,
      networkLoad: true,
      serverTable: true,
      alertFeed: true,
      radialHealth: true
    });
    setLayoutColumns('4');
  };

  const handleOpenServer = (server) => {
    if (server.component_id) {
      const hostServer = linuxServers.find(s => s.name === server.server_name || s.ip === server.host);
      setSelectedServer({
        ...hostServer,
        ...server,
        hostStatus: hostServer?.status,
        hostRawStatus: hostServer?.rawStatus,
        name: server.name,
        id: server.id
      });
    } else {
      setSelectedServer({
        ...server,
        hostStatus: server.status,
        hostRawStatus: server.rawStatus,
        name: server.name,
        id: server.id
      });
    }
    setIsServerModalOpen(true);
  };

  const handleRebootServer = (id) => {
    setServers(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, cpu: 5, ram: 12, status: 'online' };
      }
      return s;
    }));
    setIsServerModalOpen(false);
    
    // Add info alert
    const target = servers.find(s => s.id === id);
    setAlerts(prev => [
      {
        id: `alt-${Date.now()}`,
        message: `Command issued: Soft-reboot initiated for node ${target?.name}`,
        type: 'info',
        time: 'Just now',
        code: 'NODE_REBOOTING'
      },
      ...prev
    ]);
  };

  // Filter server fleet list
  const filteredServers = servers.filter(server => {
    const query = searchTerm.toLowerCase();
    return (
      server.name.toLowerCase().includes(query) ||
      server.ports.toLowerCase().includes(query) ||
      server.type.toLowerCase().includes(query) ||
      server.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="app-container">
      {/* SIDEBAR PANEL */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        serversCount={servers.length}
        linuxServersCount={linuxServers.length}
        hasDangerAlerts={alerts.some(a => a.type === 'danger')}
        healthStatus={healthStatus}
      />

      {/* MAIN WRAPPER CONTAINER */}
      <div className={`main-wrapper ${isSidebarCollapsed ? 'expanded' : ''}`}>
        
        {/* HEADER TOP-BAR */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeTab={activeTab}
          lastCheckTime={lastCheckTime}
          isLive={isLive}
          setIsLive={setIsLive}
          theme={theme}
          setTheme={setTheme}
          isCustomizerOpen={isCustomizerOpen}
          setIsCustomizerOpen={setIsCustomizerOpen}
          healthStatus={healthStatus}
        />

        {/* MAIN BODY AREA */}
        <main className="content-body">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              widgets={widgets}
              layoutColumns={layoutColumns}
              aggregateMetrics={aggregateMetrics}
              historicalData={historicalData}
              linuxServers={linuxServers}
              filteredServers={filteredServers}
              alerts={alerts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleOpenServer={handleOpenServer}
              setAlerts={setAlerts}
              lastCheckTime={lastCheckTime}
            />
          )}

          {/* TAB 2: FULL NODE FLEET PANEL */}
          {activeTab === 'nodes' && (
            <NodeFleetTab
              servers={servers}
              setServers={setServers}
              setAlerts={setAlerts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleOpenServer={handleOpenServer}
              handleRebootServer={handleRebootServer}
            />
          )}

          {/* TAB 3: ALERTS LOG VIEWER */}
          {activeTab === 'alerts' && (
            <AlertLogsTab
              alerts={alerts}
              setAlerts={setAlerts}
            />
          )}

          {/* TAB 4: LINUX FLEET DIAGNOSTICS */}
          {activeTab === 'linux' && (
            <LinuxFleetTab
              linuxServers={linuxServers}
              handleOpenServer={handleOpenServer}
            />
          )}

          {/* TAB 5: APPLICATION LOG EXPLORER */}
          {activeTab === 'logs' && (
            <LogExplorerTab
              logs={logs}
              setLogs={setLogs}
              selectedLogServer={selectedLogServer}
              setSelectedLogServer={setSelectedLogServer}
              selectedLogService={selectedLogService}
              setSelectedLogService={setSelectedLogService}
              selectedLogLevel={selectedLogLevel}
              setSelectedLogLevel={setSelectedLogLevel}
              logSearchKeyword={logSearchKeyword}
              setLogSearchKeyword={setLogSearchKeyword}
              isAutoScrollEnabled={isAutoScrollEnabled}
              setIsAutoScrollEnabled={setIsAutoScrollEnabled}
            />
          )}

        </main>
      </div>

      {/* COMPONENT INTERACTION DRAWERS / OVERLAYS */}

      {/* 1. CUSTOMIZER DRAWER PANEL (Rearrange elements & layout) */}
      <CustomizerDrawer
        isCustomizerOpen={isCustomizerOpen}
        setIsCustomizerOpen={setIsCustomizerOpen}
        widgets={widgets}
        setWidgets={setWidgets}
        updateFrequency={updateFrequency}
        setUpdateFrequency={setUpdateFrequency}
        fontSize={fontSize}
        setFontSize={setFontSize}
        resetLayout={resetLayout}
      />

      {/* 2. INSPECTION MODAL (Server details & actions) */}
      <ServerInspectModal
        isServerModalOpen={isServerModalOpen}
        setIsServerModalOpen={setIsServerModalOpen}
        selectedServer={selectedServer}
        handleRebootServer={handleRebootServer}
      />
    </div>
  );
}

export default App;
