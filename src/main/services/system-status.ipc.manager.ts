import { ipcMain } from "electron";
import { SystemStatusService } from "./system-status.service";

export class SystemStatusIpcManager {
  private systemStatusService: SystemStatusService;

  constructor(systemStatusService: SystemStatusService = new SystemStatusService()) {
    this.systemStatusService = systemStatusService;
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
  }
}
