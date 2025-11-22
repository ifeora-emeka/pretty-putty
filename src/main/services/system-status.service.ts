import os from "os";
import { SystemMetrics, SystemStatus } from "../types.system";

export class SystemStatusService {
  private statusCache: Map<string, SystemStatus> = new Map();
  private cacheTimeout: number = 5000;

  getSystemMetrics(): SystemMetrics {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = (usedMemory / totalMemory) * 100;

    const cpus = os.cpus();
    const avgLoad = os.loadavg()[0];
    const cpuUsagePercent = Math.min((avgLoad / cpus.length) * 100, 100);

    return {
      cpu: Math.round(cpuUsagePercent),
      memory: Math.round(memoryPercent),
      disk: this.getDiskUsage(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };
  }

  private getDiskUsage(): number {
    try {
      const homeDir = os.homedir();
      const stat = require("fs").statfsSync?.(homeDir);

      if (stat) {
        const available = stat.bavail * stat.bsize;
        const total = stat.blocks * stat.bsize;
        const used = (total - available) / total;
        return Math.round(used * 100);
      }

      return 0;
    } catch {
      return 0;
    }
  }

  getStatus(connectionId: string): SystemStatus {
    const metrics = this.getSystemMetrics();
    const isHealthy = metrics.cpu < 90 && metrics.memory < 90 && metrics.disk < 95;

    const status: SystemStatus = {
      connectionId,
      isHealthy,
      lastUpdated: Date.now(),
      metrics,
    };

    this.statusCache.set(connectionId, status);
    return status;
  }

  getCachedStatus(connectionId: string): SystemStatus | undefined {
    return this.statusCache.get(connectionId);
  }

  isCacheValid(connectionId: string): boolean {
    const cached = this.statusCache.get(connectionId);
    if (!cached) return false;

    const age = Date.now() - cached.lastUpdated;
    return age < this.cacheTimeout;
  }

  clearStatus(connectionId: string): void {
    this.statusCache.delete(connectionId);
  }

  clearAllStatus(): void {
    this.statusCache.clear();
  }
}
