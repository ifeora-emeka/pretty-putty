import { contextBridge, ipcRenderer } from "electron";

interface StorageAPI {
  storePassword: (connectionId: string, password: string, expiresIn24h: boolean) => Promise<{ success: boolean; error?: string }>;
  getPassword: (connectionId: string) => Promise<{ success: boolean; password?: string; error?: string }>;
  clearPassword: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  hasPassword: (connectionId: string) => Promise<{ success: boolean; has?: boolean; error?: string }>;
  addConnection: (connection: any) => Promise<{ success: boolean; error?: string }>;
  getConnection: (connectionId: string) => Promise<{ success: boolean; connection?: any; error?: string }>;
  getAllConnections: () => Promise<{ success: boolean; connections?: any[]; error?: string }>;
  removeConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  updateLastConnected: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  setPreference: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
  getPreference: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
  clearAllPasswords: () => Promise<{ success: boolean; error?: string }>;
  clearAllData: () => Promise<{ success: boolean; error?: string }>;
}

const storageAPI: StorageAPI = {
  storePassword: (connectionId, password, expiresIn24h) =>
    ipcRenderer.invoke("storage:store-password", connectionId, password, expiresIn24h),
  getPassword: (connectionId) =>
    ipcRenderer.invoke("storage:get-password", connectionId),
  clearPassword: (connectionId) =>
    ipcRenderer.invoke("storage:clear-password", connectionId),
  hasPassword: (connectionId) =>
    ipcRenderer.invoke("storage:has-password", connectionId),
  addConnection: (connection) =>
    ipcRenderer.invoke("storage:add-connection", connection),
  getConnection: (connectionId) =>
    ipcRenderer.invoke("storage:get-connection", connectionId),
  getAllConnections: () =>
    ipcRenderer.invoke("storage:get-all-connections"),
  removeConnection: (connectionId) =>
    ipcRenderer.invoke("storage:remove-connection", connectionId),
  updateLastConnected: (connectionId) =>
    ipcRenderer.invoke("storage:update-last-connected", connectionId),
  setPreference: (key, value) =>
    ipcRenderer.invoke("storage:set-preference", key, value),
  getPreference: (key) =>
    ipcRenderer.invoke("storage:get-preference", key),
  clearAllPasswords: () =>
    ipcRenderer.invoke("storage:clear-all-passwords"),
  clearAllData: () =>
    ipcRenderer.invoke("storage:clear-all-data"),
};

contextBridge.exposeInMainWorld("storage", storageAPI);
