// Generate initial mock data for dashboard monitoring

export const generateHistoricalMetrics = (pointsCount = 12) => {
  const labels = [];
  const now = new Date();
  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5 mins interval
    labels.push(
      time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  // CPU Load Data
  const cpuData = labels.map((label, idx) => {
    // base load of 35% with some random variations
    const baseVal = 35 + Math.sin(idx * 0.8) * 12 + Math.random() * 8;
    return { label, value: Math.round(Math.min(Math.max(baseVal, 5), 100)) };
  });

  // Memory Usage Data
  const memoryData = labels.map((label, idx) => {
    // base usage of 68% with steady incremental trends
    const baseVal = 62 + (idx * 0.6) + Math.random() * 4;
    return { label, value: Math.round(Math.min(Math.max(baseVal, 10), 100)) };
  });

  // Network Traffic Data (in Mbps)
  const networkData = labels.map((label, idx) => {
    const baseVal = 240 + Math.cos(idx * 0.5) * 80 + Math.random() * 40;
    return { label, value: Math.round(baseVal) };
  });

  return { cpuData, memoryData, networkData };
};

export const initialServersList = [
  { id: 'srv-us-east-1', name: 'web-prod-01', ports: '80, 443', cpu: 42, ram: 58, status: 'online', type: 'Web Server' },
  { id: 'srv-us-east-2', name: 'web-prod-02', ports: '80, 443', cpu: 78, ram: 82, status: 'warning', type: 'Web Server' },
  { id: 'srv-eu-west-1', name: 'api-gateway-01', ports: '8080', cpu: 31, ram: 45, status: 'online', type: 'API Router' },
  { id: 'srv-db-01', name: 'db-primary-main', ports: '5432', cpu: 89, ram: 91, status: 'critical', type: 'Database' },
  { id: 'srv-db-02', name: 'db-replica-sync', ports: '5432', cpu: 12, ram: 28, status: 'online', type: 'Database' },
  { id: 'srv-cch-01', name: 'redis-cache-cluster', ports: '6379', cpu: 22, ram: 74, status: 'online', type: 'Cache Grid' }
];

export const initialAlerts = [
  { id: 'alt-1', message: 'Database memory pressure exceeding 90% threshold', type: 'danger', time: '1 min ago', code: 'DB_RAM_CRITICAL' },
  { id: 'alt-2', message: 'API response latency spike on route /v1/checkout', type: 'warning', time: '5 mins ago', code: 'API_LATENCY_HIGH' },
  { id: 'alt-3', message: 'SSL certificate successfully renewed for *.domain.com', type: 'success', time: '12 mins ago', code: 'SSL_RENEWED' },
  { id: 'alt-4', message: 'Continuous integration build pipeline #4218 completed', type: 'info', time: '30 mins ago', code: 'CI_BUILD_OK' }
];

// Mutates metrics for live polling simulation
export const tickMetrics = (currentHistorical) => {
  const { cpuData, memoryData, networkData } = currentHistorical;
  const now = new Date();
  const newLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // CPU
  const lastCpu = cpuData[cpuData.length - 1].value;
  const nextCpu = Math.round(Math.min(Math.max(lastCpu + (Math.random() * 16 - 8), 10), 98));
  const newCpuData = [...cpuData.slice(1), { label: newLabel, value: nextCpu }];

  // Memory
  const lastMem = memoryData[memoryData.length - 1].value;
  const nextMem = Math.round(Math.min(Math.max(lastMem + (Math.random() * 6 - 3), 10), 98));
  const newMemoryData = [...memoryData.slice(1), { label: newLabel, value: nextMem }];

  // Network
  const lastNet = networkData[networkData.length - 1].value;
  const nextNet = Math.round(Math.min(Math.max(lastNet + (Math.random() * 80 - 40), 100), 800));
  const newNetworkData = [...networkData.slice(1), { label: newLabel, value: nextNet }];

  return {
    cpuData: newCpuData,
    memoryData: newMemoryData,
    networkData: newNetworkData
  };
};

export const tickServers = (servers) => {
  return servers.map(srv => {
    // CPU fluctuates up or down
    const cpuDelta = Math.floor(Math.random() * 14 - 7);
    const newCpu = Math.min(Math.max(srv.cpu + cpuDelta, 5), 98);
    
    // RAM fluctuates slightly
    const ramDelta = Math.floor(Math.random() * 6 - 3);
    const newRam = Math.min(Math.max(srv.ram + ramDelta, 10), 98);

    // Determine state
    let newStatus = 'online';
    if (newCpu > 85 || newRam > 85) {
      newStatus = 'critical';
    } else if (newCpu > 70 || newRam > 70) {
      newStatus = 'warning';
    }

    return {
      ...srv,
      cpu: newCpu,
      ram: newRam,
      status: newStatus
    };
  });
};

export const initialLinuxServers = [
  {
    id: 'lnx-01',
    name: 'srv-prod-app-01',
    hostname: 'srv-prod-app-01.internal',
    ip: '10.0.1.15',
    os: 'Ubuntu 24.04 LTS',
    kernel: 'Linux 6.8.0-40-generic',
    cpuCores: 8,
    cpuModel: 'Intel(R) Xeon(R) Gold 6330 CPU @ 2.00GHz',
    cpuLoad: 38,
    ramTotal: 32.0, // GB
    ramUsed: 14.5,
    diskTotal: 500, // GB
    diskUsed: 184,
    diskType: 'NVMe SSD',
    uptime: '14 days, 6 hours, 12 mins',
    loadAvg: [0.24, 0.45, 0.38],
    interfaces: { name: 'eth0', speed: '10 Gbps', ip: '10.0.1.15' },
    status: 'online',
    services: [
      { name: 'nginx-ingress', status: 'online' },
      { name: 'nodejs-api-gateway', status: 'online' },
      { name: 'auth-service', status: 'online' },
      { name: 'user-profile-api', status: 'online' },
      { name: 'file-uploader', status: 'online' },
      { name: 'notification-daemon', status: 'online' },
      { name: 'node-exporter', status: 'online' }
    ]
  },
  {
    id: 'lnx-02',
    name: 'srv-prod-app-02',
    hostname: 'srv-prod-app-02.internal',
    ip: '10.0.1.16',
    os: 'Ubuntu 24.04 LTS',
    kernel: 'Linux 6.8.0-40-generic',
    cpuCores: 8,
    cpuModel: 'Intel(R) Xeon(R) Gold 6330 CPU @ 2.00GHz',
    cpuLoad: 72,
    ramTotal: 32.0, // GB
    ramUsed: 26.8, // high RAM usage
    diskTotal: 500, // GB
    diskUsed: 412, // high disk usage
    diskType: 'NVMe SSD',
    uptime: '8 days, 11 hours, 45 mins',
    loadAvg: [1.85, 1.42, 1.10], // loaded
    interfaces: { name: 'eth0', speed: '10 Gbps', ip: '10.0.1.16' },
    status: 'warning',
    services: [
      { name: 'nginx-loadbalancer', status: 'online' },
      { name: 'nodejs-checkout-api', status: 'warning' },
      { name: 'payment-processor', status: 'online' },
      { name: 'cart-manager', status: 'online' },
      { name: 'recommendation-engine', status: 'warning' },
      { name: 'node-exporter', status: 'online' }
    ]
  },
  {
    id: 'lnx-03',
    name: 'srv-prod-db-01',
    hostname: 'srv-prod-db-01.internal',
    ip: '10.0.2.20',
    os: 'Rocky Linux 9.4 (Blue Onyx)',
    kernel: 'Linux 5.14.0-427.el9.x86_64',
    cpuCores: 16,
    cpuModel: 'AMD EPYC 7763 64-Core Processor',
    cpuLoad: 48,
    ramTotal: 64.0, // GB
    ramUsed: 58.2, // high DB RAM
    diskTotal: 1000, // GB
    diskUsed: 890, // DB files
    diskType: 'NVMe Raid-10',
    uptime: '92 days, 3 hours, 5 mins',
    loadAvg: [0.95, 1.12, 1.05],
    interfaces: { name: 'eth0', speed: '25 Gbps', ip: '10.0.2.20' },
    status: 'online',
    services: [
      { name: 'postgresql-primary', status: 'online' },
      { name: 'redis-session-cache', status: 'online' },
      { name: 'pg-bouncer', status: 'online' },
      { name: 'node-exporter', status: 'online' }
    ]
  },
  {
    id: 'lnx-04',
    name: 'srv-stage-cache-01',
    hostname: 'srv-stage-cache-01.internal',
    ip: '10.0.1.42',
    os: 'Debian GNU/Linux 12 (bookworm)',
    kernel: 'Linux 6.1.0-21-generic',
    cpuCores: 4,
    cpuModel: 'Intel(R) Xeon(R) Silver 4314 CPU @ 2.40GHz',
    cpuLoad: 14,
    ramTotal: 16.0, // GB
    ramUsed: 4.8,
    diskTotal: 250, // GB
    diskUsed: 58,
    diskType: 'SATA SSD',
    uptime: '1 day, 2 hours, 18 mins',
    loadAvg: [0.08, 0.15, 0.12],
    interfaces: { name: 'eth0', speed: '1 Gbps', ip: '10.0.1.42' },
    status: 'online',
    services: [
      { name: 'redis-cache-shard-01', status: 'online' },
      { name: 'redis-cache-shard-02', status: 'online' },
      { name: 'redis-cache-shard-03', status: 'online' },
      { name: 'redis-cache-shard-04', status: 'online' },
      { name: 'redis-cache-shard-05', status: 'online' },
      { name: 'redis-cache-shard-06', status: 'online' },
      { name: 'redis-cache-shard-07', status: 'online' },
      { name: 'redis-cache-shard-08', status: 'online' },
      { name: 'memcached-node-01', status: 'online' },
      { name: 'memcached-node-02', status: 'online' },
      { name: 'cache-proxy-nutcracker', status: 'online' },
      { name: 'sentinel-sync-daemon', status: 'online' },
      { name: 'node-exporter', status: 'online' },
      { name: 'prometheus-agent', status: 'online' }
    ]
  }
];

export const executeLinuxCommand = (server, command) => {
  const cmd = command.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString();
  
  if (cmd === 'clear') {
    return [];
  }
  
  let output = '';
  switch (cmd) {
    case 'df -h':
      output = `Filesystem      Size  Used Avail Use% Mounted on
udev             16G     0   16G   0% /dev
tmpfs           3.2G  1.8M  3.2G   1% /run
/dev/sda1       ${server.diskTotal}G  ${server.diskUsed}G  ${server.diskTotal - server.diskUsed}G  ${Math.round((server.diskUsed/server.diskTotal)*100)}% /
tmpfs            16G  184K   16G   1% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda15      124M  5.8M  118M   5% /boot/efi
/dev/sdb1        96G   12G   84G  13% /mnt/data`;
      break;

    case 'free -m':
      const totalMB = Math.round(server.ramTotal * 1024);
      const usedMB = Math.round(server.ramUsed * 1024);
      const freeMB = totalMB - usedMB;
      const buffCache = Math.round(totalMB * 0.15); // mock cache
      const availableMB = freeMB + Math.round(buffCache * 0.8);
      output = `              total        used        free      shared  buff/cache   available
Mem:           ${totalMB}        ${usedMB}        ${freeMB}          12        ${buffCache}       ${availableMB}
Swap:           4096         512        3584`;
      break;

    case 'uptime':
      output = ` ${timestamp} up ${server.uptime},  1 user,  load average: ${server.loadAvg.join(', ')}`;
      break;

    case 'uname -a':
      output = `Linux ${server.hostname} ${server.kernel} #1 SMP PREEMPT_DYNAMIC UTC 2026 x86_64 x86_64 x86_64 GNU/Linux`;
      break;

    case 'top -b -n 1':
      output = `top - ${timestamp} up ${server.uptime.split(',')[0]},  1 user,  load average: ${server.loadAvg.join(', ')}
Tasks: 124 total,   1 running, 123 sleeping,   0 stopped,   0 zombie
%Cpu(s):  ${Math.round(server.cpuLoad)}%us,  2.1%sy,  0.0%ni, ${100 - Math.round(server.cpuLoad) - 3}%id,  0.5%wa,  0.0%hi,  0.4%si,  0.0%st
MiB Mem :  ${Math.round(server.ramTotal * 1024)} total,  ${Math.round((server.ramTotal - server.ramUsed) * 1024)} free,  ${Math.round(server.ramUsed * 1024)} used,   1524 buff/cache

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   1482 postgres  20   0 1258624  82412  78410 R  42.5   1.2   0:14.28 postgres
   1120 root      20   0  352424  12480   8240 S   4.2   0.2   0:08.52 systemd-journal
   1502 nginx     20   0   84210   6120   4100 S   1.8   0.1   0:02.14 nginx
   1618 root      20   0   42180   3240   2180 S   0.5   0.1   0:00.45 node-exporter`;
      break;

    default:
      output = `bash: ${command}: command not found
Available helper commands: 'df -h', 'free -m', 'uptime', 'uname -a', 'top -b -n 1', 'clear'`;
  }

  return [
    { type: 'input', text: `$ ${command}` },
    ...output.split('\n').map(line => ({ type: 'output', text: line }))
  ];
};

export const tickLinuxServers = (servers) => {
  return servers.map(srv => {
    // CPU load fluctuates slightly
    const cpuDelta = Math.floor(Math.random() * 12 - 6);
    const cpuLoad = Math.min(Math.max(srv.cpuLoad + cpuDelta, 5), 98);
    
    // RAM load fluctuations (ramUsed, up to ramTotal)
    const ramDelta = (Math.random() * 1.2 - 0.6);
    const newRamUsed = Math.min(Math.max(Number((srv.ramUsed + ramDelta).toFixed(1)), 2.0), srv.ramTotal - 0.5);

    // Compute load average
    const currentLoad = srv.loadAvg[0];
    const nextLoad = Math.max(Number((currentLoad + (Math.random() * 0.16 - 0.08)).toFixed(2)), 0.02);
    const newLoadAvg = [
      nextLoad,
      Number((srv.loadAvg[1] * 0.9 + nextLoad * 0.1).toFixed(2)),
      Number((srv.loadAvg[2] * 0.95 + nextLoad * 0.05).toFixed(2))
    ];

    // Determine status
    let newStatus = 'online';
    const ramPercentage = (newRamUsed / srv.ramTotal) * 100;
    if (cpuLoad > 85 || ramPercentage > 85) {
      newStatus = 'critical';
    } else if (cpuLoad > 70 || ramPercentage > 70) {
      newStatus = 'warning';
    }

    // Dynamic services status updates based on overall server health
    const updatedServices = (srv.services || []).map((svc, idx) => {
      if (newStatus === 'critical') {
        // Critical server -> first 2 critical, next 2 warning, rest online
        return {
          ...svc,
          status: idx < 2 ? 'critical' : (idx < 4 ? 'warning' : 'online')
        };
      } else if (newStatus === 'warning') {
        // Warning server -> first 2 warning, rest online
        return {
          ...svc,
          status: idx < 2 ? 'warning' : 'online'
        };
      } else {
        // Online server -> both online
        return {
          ...svc,
          status: 'online'
        };
      }
    });

    return {
      ...srv,
      cpuLoad,
      ramUsed: newRamUsed,
      loadAvg: newLoadAvg,
      status: newStatus,
      services: updatedServices
    };
  });
};

export const initialLogs = [
  { id: 'log-1', timestamp: '21:38:10.024', server: 'srv-prod-app-01', service: 'nginx', level: 'INFO', message: '192.168.1.15 - - "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"' },
  { id: 'log-2', timestamp: '21:38:12.152', server: 'srv-prod-app-01', service: 'nodejs-app', level: 'INFO', message: '[NodeApp] Server started listening on port 3000' },
  { id: 'log-3', timestamp: '21:38:15.890', server: 'srv-prod-db-01', service: 'postgresql', level: 'INFO', message: 'LOG: database system is ready to accept connections' },
  { id: 'log-4', timestamp: '21:38:18.012', server: 'srv-prod-db-01', service: 'redis', level: 'INFO', message: 'DB 0: 12 keys evicted in active expire cycle' },
  { id: 'log-5', timestamp: '21:39:01.305', server: 'srv-stage-cache-01', service: 'node-exporter', level: 'INFO', message: 'level=info msg="Listening on :9100"' },
  { id: 'log-6', timestamp: '21:39:05.412', server: 'srv-prod-app-02', service: 'nginx', level: 'INFO', message: '192.168.1.28 - - "GET /api/v1/status HTTP/1.1" 200 128' },
  { id: 'log-7', timestamp: '21:39:10.742', server: 'srv-prod-app-02', service: 'nodejs-app', level: 'WARN', message: '[NodeApp] High garbage collection latency: 142ms' },
  { id: 'log-8', timestamp: '21:39:15.910', server: 'srv-prod-db-01', service: 'postgresql', level: 'WARN', message: 'WARNING: autovacuum: connection pool occupancy at 75%' },
  { id: 'log-9', timestamp: '21:39:20.114', server: 'srv-prod-app-01', service: 'nginx', level: 'INFO', message: '192.168.1.52 - - "POST /api/v1/auth/login HTTP/1.1" 200 48' },
  { id: 'log-10', timestamp: '21:39:24.321', server: 'srv-prod-app-01', service: 'nodejs-app', level: 'INFO', message: '[NodeApp] Session token validated successfully for user: admin' },
  { id: 'log-11', timestamp: '21:39:30.890', server: 'srv-stage-cache-01', service: 'redis', level: 'INFO', message: 'Replica srv-stage-cache-01:6379 synced with primary srv-prod-db-01:6379' },
  { id: 'log-12', timestamp: '21:40:02.104', server: 'srv-prod-app-02', service: 'nodejs-app', level: 'ERROR', message: '[NodeApp] Error: ECONNREFUSED 10.0.2.20:5432 - DB Connection Pool Timeout' },
  { id: 'log-13', timestamp: '21:40:03.450', server: 'srv-prod-db-01', service: 'postgresql', level: 'ERROR', message: 'ERROR: connection limit exceeded for non-superuser "app_user"' },
  { id: 'log-14', timestamp: '21:40:05.120', server: 'srv-prod-app-02', service: 'nginx', level: 'WARN', message: '192.168.1.48 - - "GET /api/v1/checkout HTTP/1.1" 503 24' },
  { id: 'log-15', timestamp: '21:40:10.024', server: 'srv-prod-db-01', service: 'redis', level: 'WARN', message: 'WARNING: Memory usage exceeds 90% of maxmemory limit' }
];

export const generateNewLogLine = (linuxServers) => {
  const server = linuxServers[Math.floor(Math.random() * linuxServers.length)];
  
  // Get services deployed on that server
  let services = [];
  if (server.id === 'lnx-01') services = ['nginx', 'nodejs-app'];
  else if (server.id === 'lnx-02') services = ['nginx', 'nodejs-app'];
  else if (server.id === 'lnx-03') services = ['postgresql', 'redis'];
  else services = ['redis', 'node-exporter'];

  const service = services[Math.floor(Math.random() * services.length)];
  
  // Determine severity based on server status
  let level = 'INFO';
  const rand = Math.random();
  if (server.status === 'critical') {
    level = rand < 0.5 ? 'CRIT' : rand < 0.85 ? 'ERROR' : 'WARN';
  } else if (server.status === 'warning') {
    level = rand < 0.6 ? 'WARN' : rand < 0.85 ? 'INFO' : 'ERROR';
  } else {
    level = rand < 0.9 ? 'INFO' : rand < 0.98 ? 'WARN' : 'ERROR';
  }

  // Realistic log messages
  const logsMap = {
    'nginx': {
      'INFO': [
        '192.168.1.58 - - "GET /static/bundle.js HTTP/1.1" 200 4821',
        '192.168.1.102 - - "GET /api/v1/metrics HTTP/1.1" 200 94',
        '192.168.1.44 - - "GET /api/v1/health HTTP/1.1" 200 36',
        '192.168.1.15 - - "POST /api/v1/event HTTP/1.1" 201 12'
      ],
      'WARN': [
        '192.168.1.110 - - "GET /api/v1/heavy-query HTTP/1.1" 200 8124 (Response time: 824ms)',
        '192.168.1.12 - - "GET /invalid-route HTTP/1.1" 404 142'
      ],
      'ERROR': [
        '192.168.1.15 - - "GET /api/v1/checkout HTTP/1.1" 502 24 (Bad Gateway)',
        '192.168.1.28 - - "POST /api/v1/payment HTTP/1.1" 504 36 (Gateway Timeout)'
      ],
      'CRIT': [
        'nginx: [emerg] open() "/var/log/nginx/access.log" failed (28: No space left on device)',
        'nginx: worker process 1482 exited on signal 11 (Segmentation fault)'
      ]
    },
    'nodejs-app': {
      'INFO': [
        '[NodeApp] Middleware authentication verified user token successfully.',
        '[NodeApp] Dispatching webhook callback notification to external endpoint.',
        '[NodeApp] Cache hit on user metadata profile query.',
        '[NodeApp] Scheduled backup routine completed in 142ms.'
      ],
      'WARN': [
        '[NodeApp] Memory heap usage warnings threshold (75% allocation occupied).',
        '[NodeApp] Response latency threshold exceeded on route /v1/search (342ms).'
      ],
      'ERROR': [
        '[NodeApp] Error: Failed to write file payload storage cache stream timed out.',
        '[NodeApp] ReferenceError: customerProfileId is not defined at checkout.js:142.'
      ],
      'CRIT': [
        '[NodeApp] UnhandledRejection: Database connection pool exhausted. Node daemon crash impending!',
        '[NodeApp] Fatal: Process running out of memory. GC allocation limits exceeded.'
      ]
    },
    'postgresql': {
      'INFO': [
        'LOG: statement: SELECT * FROM nodes_inventory WHERE status = \'online\';',
        'LOG: duration: 4.128 ms  statement: UPDATE sessions SET last_seen = NOW();',
        'LOG: checkpoint starting: time',
        'LOG: checkpoint complete: wrote 42 buffers (0.1%)'
      ],
      'WARN': [
        'WARNING: lock table saturation threat level exceeding nominal constraints (62%).',
        'WARNING: database cluster recovery parity replication lagging by 182 blocks.'
      ],
      'ERROR': [
        'ERROR: deadlocks detected on table "transactions" during bulk insert operations.',
        'ERROR: column "cluster_load" of relation "servers" does not exist at character 38.'
      ],
      'CRIT': [
        'FATAL: database system is shutting down (SIGTERM received).',
        'PANIC: could not locate a valid checkpoint record in write-ahead log.'
      ]
    },
    'redis': {
      'INFO': [
        'DB 0: 4 keys removed in active expire cycle.',
        'Asynchronous AOF background rewriting started by PID 1642.',
        'Background AOF rewrite terminated successfully.',
        'DB 0: Client connection closed.'
      ],
      'WARN': [
        'WARNING: redis instance maxmemory threshold reached (80%). Evicting keys.',
        'WARNING: client output buffer memory limits exceeded on connection 10.0.1.15:4212.'
      ],
      'ERROR': [
        'ERROR: Failed to save database dump on disk. Write permissions denied on /var/lib/redis.',
        'ERROR: Redis connection cluster handshake timeout on node 10.0.1.42:6379.'
      ],
      'CRIT': [
        'FATAL: Out of memory executing commands. Redis cluster node terminated.',
        'FATAL: Redis configuration file invalid. Unknown parameter directive max_memory.'
      ]
    },
    'node-exporter': {
      'INFO': [
        'level=info msg="Listening on :9100"',
        'level=info msg="Metrics scraped successfully by scraper client 10.0.2.5."',
        'level=info msg="Collector diskstats succeeded."',
        'level=info msg="Collector cpu succeeded."'
      ],
      'WARN': [
        'level=warn msg="Failed to read filesystem metrics /sys/class/net (file not found)."'
      ],
      'ERROR': [
        'level=error msg="Error scraping socket stats node: Connection refused."'
      ],
      'CRIT': [
        'level=error msg="Fatal: Prometheus exporter socket binding failure. Address already in use."'
      ]
    }
  };

  const msgs = logsMap[service][level] || logsMap[service]['INFO'];
  const message = msgs[Math.floor(Math.random() * msgs.length)];
  const now = new Date();
  const timestamp = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp,
    server: server.name,
    service,
    level,
    message
  };
};
