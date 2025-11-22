import { ipcMain } from "electron";
import { Client } from "ssh2";
import { SystemStatusService } from "./system-status.service";
import { ConnectionManager } from "./connection.manager";

export class SystemStatusIpcManager {
  private systemStatusService: SystemStatusService;
  private connectionManager: ConnectionManager;

  constructor(systemStatusService: SystemStatusService = new SystemStatusService()) {
    this.systemStatusService = systemStatusService;
    this.connectionManager = ConnectionManager.getInstance();
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    ipcMain.handle("system:get-remote-metrics", async (event, connectionId: string) => {
      try {
        const session = this.connectionManager.getSession(connectionId);
        if (!session) {
          return {
            success: false,
            error: `Connection ${connectionId} not found`,
          };
        }

        const sshClient = session.getSshClient() as Client;
        if (!sshClient) {
          return {
            success: false,
            error: "SSH client not initialized for this connection",
          };
        }

        const metrics = await this.systemStatusService.getRemoteMetrics(sshClient);
        this.systemStatusService.cacheRemoteMetrics(connectionId, metrics);

        return {
          success: true,
          metrics,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch remote metrics",
        };
      }
    });
  }
}
