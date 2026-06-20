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

// Import Mock Data
import {
  generateHistoricalMetrics,
  initialServersList,
  initialAlerts,
  tickMetrics,
  tickServers,
  initialLinuxServers,
  tickLinuxServers,
  initialLogs,
  generateNewLogLine
} from './mockData';

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium'); // 'small' | 'medium' | 'large'

  // Real-time updates state
  const [isLive, setIsLive] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState(3000); // 3 seconds

  // Data States
  const [historicalData, setHistoricalData] = useState(() => generateHistoricalMetrics(16));
  const [servers, setServers] = useState(initialServersList);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchTerm, setSearchTerm] = useState('');

  // Linux Servers States
  const [linuxServers, setLinuxServers] = useState(initialLinuxServers);
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

  // Widget Visibility Settings (Managed via Customizer Workspace)
  const [widgets, setWidgets] = useState({
    statsRow: true,
    cpuTrend: true,
    memoryTrend: true,
    networkLoad: true,
    serverTable: true,
    alertFeed: true,
    radialHealth: true
  });
  
  const [layoutColumns, setLayoutColumns] = useState('4'); // Stat cards per row (3 or 4)
  const [lastCheckTime, setLastCheckTime] = useState(() => new Date().toLocaleTimeString());

  // Effect to toggle CSS themes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect to toggle font size settings
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  // Simulated live polling interval
  useEffect(() => {
    let intervalId = null;
    if (isLive) {
      intervalId = setInterval(() => {
        // Tick metrics
        setHistoricalData(prev => tickMetrics(prev));
        // Tick servers
        setServers(prev => tickServers(prev));
        // Tick Linux servers
        setLinuxServers(prev => tickLinuxServers(prev));
        // Update check timestamp
        setLastCheckTime(new Date().toLocaleTimeString());
        // Tick logs
        setLogs(prev => {
          const newLine = generateNewLogLine(linuxServersRef.current);
          return [...prev.slice(-99), newLine];
        });

        // Randomly add new alert occasionally (25% chance)
        if (Math.random() < 0.25) {
          const alertTypes = ['warning', 'danger', 'info'];
          const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const nodes = ['web-prod-01', 'api-router-01', 'db-replica', 'redis-cache'];
          const node = nodes[Math.floor(Math.random() * nodes.length)];
          
          let message = '';
          let code = '';
          if (randomType === 'danger') {
            message = `High connection pool saturation detected on ${node}`;
            code = 'CONN_POOL_SATURATED';
          } else if (randomType === 'warning') {
            message = `Slight CPU throttling detected on ${node}`;
            code = 'CPU_THROTTLE';
          } else {
            message = `Log rotation complete on ${node}`;
            code = 'LOG_ROTATION_OK';
          }

          setAlerts(prev => [
            {
              id: `alt-${Date.now()}`,
              message,
              type: randomType,
              time: 'Just now',
              code
            },
            ...prev.slice(0, 7) // Keep maximum of 8 alerts in list
          ]);
        }
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

    // Last CPU reading
    const currentCpu = historicalData.cpuData[historicalData.cpuData.length - 1].value;
    const currentMem = historicalData.memoryData[historicalData.memoryData.length - 1].value;
    const currentNet = historicalData.networkData[historicalData.networkData.length - 1].value;

    // Calculate system health percentage
    const healthScore = Math.max(100 - (criticalServers * 15) - (warningServers * 5), 0);

    // Global components aggregates
    let totalServicesCount = 0;
    let servicesUpCount = 0;
    let servicesDegradedCount = 0;
    let servicesCriticalCount = 0;

    linuxServers.forEach(srv => {
      if (srv.services) {
        srv.services.forEach(svc => {
          totalServicesCount++;
          if (svc.status === 'online') servicesUpCount++;
          else if (svc.status === 'warning') servicesDegradedCount++;
          else if (svc.status === 'critical') servicesCriticalCount++;
        });
      }
    });

    return {
      totalServers,
      criticalServers,
      warningServers,
      onlineServers,
      currentCpu,
      currentMem,
      currentNet,
      healthScore,
      totalServicesCount,
      servicesUpCount,
      servicesDegradedCount,
      servicesCriticalCount
    };
  }, [servers, historicalData, linuxServers]);

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
    setSelectedServer(server);
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
        hasDangerAlerts={alerts.some(a => a.type === 'danger')}
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
              activeTerminalId={activeTerminalId}
              setActiveTerminalId={setActiveTerminalId}
              terminalHistory={terminalHistory}
              setTerminalHistory={setTerminalHistory}
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
