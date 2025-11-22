import { Connection } from "@/__mock__/auth.mock";
import "@/src/main/types.preload";

export class AuthElectronService {
  static async saveConnectionToStorage(
    connection: Connection,
    password: string,
    rememberFor24h: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (!window.storage) {
      return { success: false, error: "Storage API not available" };
    }

    try {
      const storageConnection = {
        id: connection.id,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        username: connection.username,
      };

      const result = await window.storage.addConnection(storageConnection);

      if (!result.success) {
        return result;
      }

      if (rememberFor24h && password) {
        const passwordResult = await window.storage.storePassword(
          connection.id,
          password,
          true
        );

        if (!passwordResult.success) {
          return passwordResult;
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save connection",
      };
    }
  }

  static async loadStoredPassword(connectionId: string): Promise<string | null> {
    if (!window.storage) {
      return null;
    }

    try {
      const result = await window.storage.getPassword(connectionId);

      if (result.success && result.password) {
        return result.password;
      }

      return null;
    } catch {
      return null;
    }
  }

  static async loadAllConnections(): Promise<Connection[]> {
    if (!window.storage) {
      return [];
    }

    try {
      const result = await window.storage.getAllConnections();

      if (result.success && result.connections) {
        return result.connections as Connection[];
      }

      return [];
    } catch {
      return [];
    }
  }

  static async deleteConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
    if (!window.storage) {
      return { success: false, error: "Storage API not available" };
    }

    try {
      await window.storage.removeConnection(connectionId);
      await window.storage.clearPassword(connectionId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete connection",
      };
    }
  }

  static async createSession(
    connectionId: string,
    host: string,
    port: number,
    username: string,
    password: string
  ): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    if (!window.connection) {
      return { success: false, error: "Connection API not available" };
    }

    try {
      const result = await window.connection.createSession(
        connectionId,
        host,
        port,
        username,
        password
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create session",
      };
    }
  }

  static async checkConnectionHealth(
    connectionId: string
  ): Promise<{ success: boolean; isConnected?: boolean; error?: string }> {
    if (!window.connection) {
      return { success: false, error: "Connection API not available" };
    }

    try {
      const result = await window.connection.isConnected(connectionId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check connection",
      };
    }
  }

  static async disconnectSession(
    connectionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!window.connection) {
      return { success: false, error: "Connection API not available" };
    }

    try {
      const result = await window.connection.disconnect(connectionId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to disconnect",
      };
    }
  }

  static async getActiveConnection(): Promise<{ success: boolean; connection?: any; error?: string }> {
    if (!window.connection) {
      return { success: false, error: "Connection API not available" };
    }

    try {
      const result = await window.connection.getActive();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get active connection",
      };
    }
  }

  static async updateLastConnected(connectionId: string): Promise<{ success: boolean; error?: string }> {
    if (!window.storage) {
      return { success: false, error: "Storage API not available" };
    }

    try {
      const result = await window.storage.updateLastConnected(connectionId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update last connected",
      };
    }
  }
}
