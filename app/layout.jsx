'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
  
  // Theme & FontSize state with localStorage support
  const [theme, setTheme] = useState('dark');
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
    const savedTheme = localStorage.getItem('monitoring-theme') || 'dark';
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
      <html lang="en">
        <head>
          <title>Monitoring Dashboard</title>
        </head>
        <body style={{ background: '#090d16', color: '#f8fafc' }} />
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
  };

  const activeTab = pathname ? (pathname.split('/').pop() || 'dashboard') : 'dashboard';

  return (
    <html lang="en" data-theme={theme} data-font-size={fontSize}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Monitoring Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
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
              {React.cloneElement(children, childProps)}
            </div>
          </main>

          <CustomizerDrawer 
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            widgets={widgets}
            setWidgets={setWidgets}
            layoutColumns={layoutColumns}
            setLayoutColumns={setLayoutColumns}
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isLive={isLive}
            setIsLive={setIsLive}
            updateFrequency={updateFrequency}
            setUpdateFrequency={setUpdateFrequency}
          />

          <ServerInspectModal 
            isOpen={isServerModalOpen}
            onClose={() => setIsServerModalOpen(false)}
            server={selectedServer}
          />
        </div>
      </body>
    </html>
  );
}
