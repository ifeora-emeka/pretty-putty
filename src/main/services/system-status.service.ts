import { Client } from "ssh2";
import { RemoteSystemMetrics } from "../types.system";
import { SSHMetricsService } from "./ssh-metrics.service";

export class SystemStatusService {
  private remoteMetricsCache: Map<string, RemoteSystemMetrics> = new Map();
  private sshMetricsService = SSHMetricsService.getInstance();

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
