'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { TelemetryProvider } from './TelemetryContext';
import '../src/index.css';
import { Sidebar } from '../src/components/Sidebar';
import { Header } from '../src/components/Header';
import { CustomizerDrawer } from '../src/components/CustomizerDrawer';
import { ServerInspectModal } from '../src/components/ServerInspectModal';
import {
  initialServersList,
  initialAlerts,
  tickServers,
  initialLinuxServers,
  tickLinuxServers,
  initialLogs,
  generateNewLogLine,
  generateHistoricalMetrics,
  tickMetrics
} from '../src/mockData';

export default function RootLayout({ children }) {
  // Navigation State (now synced via URL, but we track layout updates)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  
  // Theme & FontSize state with localStorage support (Default should be 'light')
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [mounted, setMounted] = useState(false);

  // Real-time telemetry state (shared/propogated context)
  const [isLive, setIsLive] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState(3000);
  const [historicalData, setHistoricalData] = useState(null);
  const [servers, setServers] = useState(initialServersList);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [linuxServers, setLinuxServers] = useState(initialLinuxServers);
  const [logs, setLogs] = useState(initialLogs);
  
  // Linux Servers States
  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [terminalHistory, setTerminalHistory] = useState({
    'lnx-01': [{ type: 'output', text: 'srv-prod-app-01 login: admin\nPassword: *********\nLast login: Wed Jun 17 19:42:10 2026 from 10.0.0.12\n\nWelcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-40-generic)\n* Documentation:  https://help.ubuntu.com\n* Management:     https://landscape.canonical.com\n* Support:        https://ubuntu.com/pro\n\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-02': [{ type: 'output', text: 'srv-prod-app-02 login: admin\nPassword: *********\nLast login: Wed Jun 17 20:12:05 2026 from 10.0.0.12\n\nWelcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-40-generic)\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-03': [{ type: 'output', text: 'srv-prod-db-01 login: dbadmin\nPassword: *********\nLast login: Mon Jun 15 08:33:14 2026 from 10.0.0.4\n\nWelcome to Rocky Linux 9.4 (Blue Onyx)\nActive command shell started. Type commands from drop-down below.' }],
    'lnx-04': [{ type: 'output', text: 'srv-stage-cache-01 login: cacheadm\nPassword: *********\nLast login: Wed Jun 17 21:00:15 2026 from 10.0.0.12\n\nWelcome to Debian GNU/Linux 12 (bookworm)\nActive command shell started. Type commands from drop-down below.' }]
  });

  // Log Explorer States
  const [selectedLogServer, setSelectedLogServer] = useState('all');
  const [selectedLogService, setSelectedLogService] = useState('all');
  const [selectedLogLevel, setSelectedLogLevel] = useState('all');
  const [logSearchKeyword, setLogSearchKeyword] = useState('');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Detail modal state
  const [selectedServer, setSelectedServer] = useState(null);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // Widget visibility
  const [widgets, setWidgets] = useState({
    statsRow: true,
    cpuTrend: true,
    memoryTrend: true,
    networkLoad: true,
    serverTable: true,
    alertFeed: true,
    radialHealth: true
  });
  const [layoutColumns, setLayoutColumns] = useState('4');
  const [lastCheckTime, setLastCheckTime] = useState('');

  const linuxServersRef = useRef(linuxServers);
  const pathname = usePathname();

  useEffect(() => {
    linuxServersRef.current = linuxServers;
  }, [linuxServers]);

  // Hydrate theme and font-size from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('monitoring-theme') || 'light';
    const savedFontSize = localStorage.getItem('monitoring-font-size') || 'medium';
    setTheme(savedTheme);
    setFontSize(savedFontSize);
    setHistoricalData(generateHistoricalMetrics(16));
    setLastCheckTime(new Date().toLocaleTimeString());
    setMounted(true);
  }, []);

  // Update document properties when theme or font size changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('monitoring-theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('monitoring-font-size', fontSize);
  }, [fontSize, mounted]);

  // Telemetry Interval (corresponds to Vite simulated ticks)
  useEffect(() => {
    if (!mounted || !isLive) return;
    const intervalId = setInterval(() => {
      setHistoricalData(prev => prev ? tickMetrics(prev) : generateHistoricalMetrics(16));
      setServers(prev => tickServers(prev));
      setLinuxServers(prev => tickLinuxServers(prev));
      setLastCheckTime(new Date().toLocaleTimeString());
      setLogs(prev => {
        const newLine = generateNewLogLine(linuxServersRef.current);
        return [...prev.slice(-99), newLine];
      });

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
          ...prev.slice(0, 7)
        ]);
      }
    }, updateFrequency);

    return () => clearInterval(intervalId);
  }, [isLive, updateFrequency, mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Monitoring Dashboard</title>
        </head>
        <body style={{ background: '#090d16', color: '#f8fafc' }} suppressHydrationWarning />
      </html>
    );
  }

  // Calculate metrics
  const activeServersCount = servers.length;
  const criticalAlertsCount = alerts.filter(a => a.type === 'danger').length;
  const hasDangerAlerts = criticalAlertsCount > 0;

  // Aggregate metrics
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalServers = servers.length;
  const criticalServers = servers.filter(s => s.status === 'danger').length;
  const averageCpu = Math.round(servers.reduce((acc, s) => acc + s.cpu, 0) / (totalServers || 1));
  const averageMem = Math.round(servers.reduce((acc, s) => acc + s.ram, 0) / (totalServers || 1));
  
  const aggregateMetrics = {
    currentCpu: averageCpu,
    currentMem: averageMem,
    currentNet: 412, // mock constant baseline
    onlineServers,
    totalServers,
    criticalServers,
    healthScore: Math.max(0, 100 - (criticalServers * 20) - (alerts.filter(a => a.type === 'warning').length * 2)),
    totalServicesCount: linuxServers.reduce((acc, s) => acc + (s.services || []).length, 0),
    servicesUpCount: linuxServers.reduce((acc, s) => acc + (s.services || []).filter(sv => sv.status === 'online').length, 0),
    servicesDegradedCount: linuxServers.reduce((acc, s) => acc + (s.services || []).filter(sv => sv.status === 'warning').length, 0),
    servicesCriticalCount: linuxServers.reduce((acc, s) => acc + (s.services || []).filter(sv => sv.status === 'danger').length, 0)
  };

  // Build filtered servers lists for tables
  const filteredServers = servers.filter(srv => 
    srv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    srv.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenServer = (srv) => {
    setSelectedServer(srv);
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

  // We clone children to pass the active telemetry data states to them
  const childProps = {
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
    lastCheckTime,
    servers,
    setServers,
    logs,
    setLogs,
    activeTerminalId,
    setActiveTerminalId,
    terminalHistory,
    setTerminalHistory,
    selectedLogServer,
    setSelectedLogServer,
    selectedLogService,
    setSelectedLogService,
    selectedLogLevel,
    setSelectedLogLevel,
    logSearchKeyword,
    setLogSearchKeyword,
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    handleRebootServer,
    resetLayout,
  };

  const activeTab = pathname ? (pathname.split('/').pop() || 'dashboard') : 'dashboard';

  return (
    <html lang="en" data-theme={theme} data-font-size={fontSize} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Monitoring Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <div className="app-container">
          <Sidebar 
            activeTab={activeTab} 
            isSidebarCollapsed={isSidebarCollapsed}
            serversCount={activeServersCount}
            hasDangerAlerts={hasDangerAlerts}
          />
          <main className={`main-wrapper ${isSidebarCollapsed ? 'expanded' : ''}`}>
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
            <div className="content-body">
              <TelemetryProvider value={childProps}>
                {children}
              </TelemetryProvider>
            </div>
          </main>

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

          <ServerInspectModal 
            isServerModalOpen={isServerModalOpen}
            setIsServerModalOpen={setIsServerModalOpen}
            selectedServer={selectedServer}
            handleRebootServer={handleRebootServer}
          />
        </div>
      </body>
    </html>
  );
}
