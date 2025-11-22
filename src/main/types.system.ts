export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  loadAverage: number[];
}

export interface SystemStatus {
  connectionId: string;
  isHealthy: boolean;
  lastUpdated: number;
  metrics: SystemMetrics;
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
