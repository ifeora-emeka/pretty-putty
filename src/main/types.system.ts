export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  loadAverage: number[];
}

export interface RemoteSystemMetrics {
  cpu: number;
  memory: number;
  memoryUsed: number;
  memoryTotal: number;
  disk: number;
  diskUsed: number;
  diskTotal: number;
  loadAverage: number[];
  timestamp: number;
  osName?: string;
  uptime?: string;
  cpuModel?: string;
  cpuCores?: number;
  hostname?: string;
  kernel?: string;
}

export interface OSInfo {
  platform: string;
  type: string;
  release: string;
  arch: string;
  hostname: string;
  uptime: number;
  kernel?: string;
  distribution?: string;
  version?: string;
}

export interface HardwareInfo {
  cpuModel: string;
  cpuCores: number;
  cpuSpeed: number;
  totalMemory: number;
  totalDiskSpace?: number;
  networkInterfaces: Array<{
    name: string;
    address: string;
    family: string;
  }>;
}

export interface SystemStatus {
  connectionId: string;
  isHealthy: boolean;
  lastUpdated: number;
  metrics: SystemMetrics;
  osInfo?: OSInfo;
  hardwareInfo?: HardwareInfo;
  error?: string;
}

export interface SystemStatusResponse {
  success: boolean;
  status?: SystemStatus;
  error?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  isHealthy: boolean;
  metrics?: SystemMetrics;
  error?: string;
}

export interface OSInfoResponse {
  success: boolean;
  osInfo?: OSInfo;
  error?: string;
}

export interface HardwareInfoResponse {
  success: boolean;
  hardwareInfo?: HardwareInfo;
  error?: string;
}
