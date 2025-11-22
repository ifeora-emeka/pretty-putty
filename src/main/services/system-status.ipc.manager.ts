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
    ipcMain.handle("system:get-status", (event, connectionId: string) => {
      try {
        const status = this.systemStatusService.getStatus(connectionId);
        return {
          success: true,
          status,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:get-metrics", (event) => {
      try {
        const metrics = this.systemStatusService.getSystemMetrics();
        return {
          success: true,
          metrics,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:health-check", (event, connectionId: string) => {
      try {
        let status = this.systemStatusService.getCachedStatus(connectionId);

        if (!status || !this.systemStatusService.isCacheValid(connectionId)) {
          status = this.systemStatusService.getStatus(connectionId);
        }

        return {
          success: true,
          isHealthy: status.isHealthy,
          metrics: status.metrics,
        };
      } catch (error) {
        return {
          success: false,
          isHealthy: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:clear-status", (event, connectionId: string) => {
      try {
        this.systemStatusService.clearStatus(connectionId);
        return {
          success: true,
          message: "Status cleared",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:clear-all-status", (event) => {
      try {
        this.systemStatusService.clearAllStatus();
        return {
          success: true,
          message: "All status cleared",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:get-os-info", (event) => {
      try {
        const osInfo = this.systemStatusService.getOSInfo();
        return {
          success: true,
          osInfo,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("system:get-hardware-info", (event) => {
      try {
        const hardwareInfo = this.systemStatusService.getHardwareInfo();
        return {
          success: true,
          hardwareInfo,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

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
