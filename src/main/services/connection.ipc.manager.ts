import { ipcMain } from "electron";
import { ConnectionManager } from "./connection.manager";
import {
  CreateConnectionRequest,
  DisconnectRequest,
  OpenChannelRequest,
  SendCommandRequest,
  ListDirRequest,
} from "../types.connection";

export class ConnectionIpcManager {
  private connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager = ConnectionManager.getInstance()) {
    this.connectionManager = connectionManager;
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    ipcMain.handle(
      "connection:create-session",
      async (event, data: CreateConnectionRequest) => {
        console.log("[ConnectionIpcManager] IPC create-session received:", {
          connectionId: data.connectionId,
          host: data.host,
          port: data.port,
          username: data.username,
          hasPassword: !!data.password,
        });

        try {
          console.log("[ConnectionIpcManager] Creating session object...");
          const session = this.connectionManager.createSession(
            data.connectionId,
            data.host,
            data.port,
            data.username
          );
          console.log("[ConnectionIpcManager] Session object created");

          if (data.password) {
            console.log("[ConnectionIpcManager] Attempting SSH connection...");
            await session.connectSSH(data.password);
            console.log("[ConnectionIpcManager] SSH connection successful");
          }

          console.log("[ConnectionIpcManager] Setting active connection");
          this.connectionManager.setActiveConnection(data.connectionId);

          console.log("[ConnectionIpcManager] Returning success response");
          return {
            success: true,
            connectionId: data.connectionId,
            message: "Session created and connected",
          };
        } catch (error) {
          console.error("[ConnectionIpcManager] create-session error:", {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    ipcMain.handle("connection:get-active", (event) => {
      try {
        const activeId = this.connectionManager.getActiveConnectionId();
        const activeSession = this.connectionManager.getActiveConnection();

        if (!activeSession) {
          return {
            success: false,
            error: "No active connection",
          };
        }

        const state = activeSession.getSessionState();
        return {
          success: true,
          connection: state,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("connection:get-state", (event, connectionId: string) => {
      try {
        const session = this.connectionManager.getSession(connectionId);
        if (!session) {
          return {
            success: false,
            error: `Connection ${connectionId} not found`,
          };
        }

        const state = session.getSessionState();
        return {
          success: true,
          state,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("connection:list-all", (event) => {
      try {
        const connections = this.connectionManager.listConnections();
        return {
          success: true,
          connections,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle(
      "connection:open-channel",
      (event, data: OpenChannelRequest) => {
        try {
          const session = this.connectionManager.getSession(data.connectionId);
          if (!session) {
            return {
              success: false,
              error: `Connection ${data.connectionId} not found`,
            };
          }

          const channelId = session.openChannel(data.channelType, null);
          return {
            success: true,
            channelId,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    ipcMain.handle(
      "connection:close-channel",
      (event, connectionId: string, channelId: string) => {
        try {
          const session = this.connectionManager.getSession(connectionId);
          if (!session) {
            return {
              success: false,
              error: `Connection ${connectionId} not found`,
            };
          }

          session.closeChannel(channelId);
          return {
            success: true,
            message: "Channel closed",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    ipcMain.handle(
      "connection:disconnect",
      async (event, data: DisconnectRequest) => {
        try {
          const session = this.connectionManager.getSession(data.connectionId);
          if (session) {
            session.closeAllChannels();
            await session.disconnectSSH();
          }

          this.connectionManager.removeSession(data.connectionId);

          return {
            success: true,
            message: "Disconnected",
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    ipcMain.handle("connection:is-connected", (event, connectionId: string) => {
      try {
        const session = this.connectionManager.getSession(connectionId);
        if (!session) {
          return {
            success: true,
            isConnected: false,
          };
        }

        return {
          success: true,
          isConnected: session.isConnected(),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    ipcMain.handle("connection:clear-all", (event) => {
      try {
        this.connectionManager.clearAllSessions();
        return {
          success: true,
          message: "All connections cleared",
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
