import { ipcMain } from "electron";
import { SecureCredentialStore } from "./secure-credential.service";
import { AppDataStore } from "./app-data.service";

export class StorageManager {
  private credentialStore: SecureCredentialStore;
  private appDataStore: AppDataStore;

  constructor(isDev: boolean = false) {
    this.credentialStore = new SecureCredentialStore();
    this.appDataStore = new AppDataStore(isDev);
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    ipcMain.handle("storage:store-password", (event, connectionId: string, password: string, expiresIn24h: boolean) => {
      try {
        this.credentialStore.storePassword(connectionId, password, expiresIn24h);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:get-password", (event, connectionId: string) => {
      try {
        const password = this.credentialStore.getPassword(connectionId);
        return { success: true, password };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:clear-password", (event, connectionId: string) => {
      try {
        this.credentialStore.clearPassword(connectionId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:clear-all-passwords", () => {
      try {
        this.credentialStore.clearAllPasswords();
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:has-password", (event, connectionId: string) => {
      try {
        const has = this.credentialStore.hasPassword(connectionId);
        return { success: true, has };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:add-connection", (event, connection) => {
      try {
        this.appDataStore.addConnection(connection);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:get-connection", (event, connectionId: string) => {
      try {
        const connection = this.appDataStore.getConnection(connectionId);
        return { success: true, connection };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:get-all-connections", () => {
      try {
        const connections = this.appDataStore.getAllConnections();
        return { success: true, connections };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:remove-connection", (event, connectionId: string) => {
      try {
        this.appDataStore.removeConnection(connectionId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:update-last-connected", (event, connectionId: string) => {
      try {
        this.appDataStore.updateLastConnected(connectionId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:set-preference", (event, key: string, value) => {
      try {
        this.appDataStore.setPreference(key as any, value);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:get-preference", (event, key: string) => {
      try {
        const value = this.appDataStore.getPreference(key as any);
        return { success: true, value };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:get-all-preferences", () => {
      try {
        const preferences = this.appDataStore.getAllPreferences();
        return { success: true, preferences };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:clear-expired-passwords", () => {
      try {
        this.credentialStore.clearExpiredPasswords();
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });

    ipcMain.handle("storage:clear-all-data", () => {
      try {
        this.appDataStore.clearAllData();
        this.credentialStore.clearAllPasswords();
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
  }

  getCredentialStore(): SecureCredentialStore {
    return this.credentialStore;
  }

  getAppDataStore(): AppDataStore {
    return this.appDataStore;
  }
}
