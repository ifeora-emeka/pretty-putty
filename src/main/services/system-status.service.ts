import os from "os";
import { Client } from "ssh2";
import { SystemMetrics, SystemStatus, OSInfo, HardwareInfo, RemoteSystemMetrics } from "../types.system";
import { SSHMetricsService } from "./ssh-metrics.service";

export class SystemStatusService {
  private statusCache: Map<string, SystemStatus> = new Map();
  private remoteMetricsCache: Map<string, RemoteSystemMetrics> = new Map();
  private osInfoCache: OSInfo | null = null;
  private hardwareInfoCache: HardwareInfo | null = null;
  private cacheTimeout: number = 5000;
  private sshMetricsService = SSHMetricsService.getInstance();

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

  getOSInfo(): OSInfo {
    if (this.osInfoCache) {
      return this.osInfoCache;
    }

    const cpus = os.cpus();
    const osInfo: OSInfo = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
    };

    this.osInfoCache = osInfo;
    return osInfo;
  }

  getHardwareInfo(): HardwareInfo {
    if (this.hardwareInfoCache) {
      return this.hardwareInfoCache;
    }

    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const networkInterfaces = os.networkInterfaces();

    const networkInterfaceList = Object.entries(networkInterfaces)
      .flatMap(([name, interfaces]) =>
        (interfaces || [])
          .filter((iface) => iface.family === "IPv4" && !iface.internal)
          .map((iface) => ({
            name,
            address: iface.address,
            family: iface.family,
          }))
      )
      .slice(0, 3);

    const hardwareInfo: HardwareInfo = {
      cpuModel: cpus[0]?.model || "Unknown",
      cpuCores: cpus.length,
      cpuSpeed: cpus[0]?.speed || 0,
      totalMemory: Math.round(totalMemory / (1024 * 1024 * 1024)),
      networkInterfaces: networkInterfaceList,
    };

    this.hardwareInfoCache = hardwareInfo;
    return hardwareInfo;
  }

  getStatus(connectionId: string): SystemStatus {
    const metrics = this.getSystemMetrics();
    const isHealthy = metrics.cpu < 90 && metrics.memory < 90 && metrics.disk < 95;

    const status: SystemStatus = {
      connectionId,
      isHealthy,
      lastUpdated: Date.now(),
      metrics,
      osInfo: this.getOSInfo(),
      hardwareInfo: this.getHardwareInfo(),
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

  async getRemoteMetrics(client: Client): Promise<RemoteSystemMetrics> {
    return this.sshMetricsService.getRemoteMetrics(client);
  }

  cacheRemoteMetrics(connectionId: string, metrics: RemoteSystemMetrics): void {
    this.remoteMetricsCache.set(connectionId, metrics);
  }

  getCachedRemoteMetrics(connectionId: string): RemoteSystemMetrics | undefined {
    return this.remoteMetricsCache.get(connectionId);
  }

  clearRemoteMetrics(connectionId: string): void {
    this.remoteMetricsCache.delete(connectionId);
  }

  clearAllRemoteMetrics(): void {
    this.remoteMetricsCache.clear();
  }
}
