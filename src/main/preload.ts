import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, handler: (event: unknown, args: unknown) => void) =>
      ipcRenderer.on(channel, handler),
    off: (
      channel: string,
      handler: (event: unknown, args: unknown) => void
    ) => ipcRenderer.off(channel, handler),
    send: (channel: string, ...args: unknown[]) =>
      ipcRenderer.send(channel, ...args),
  },
});

interface SystemAPI {
  getStatus: (connectionId: string) => Promise<{ success: boolean; status?: any; error?: string }>;
  getMetrics: () => Promise<{ success: boolean; metrics?: any; error?: string }>;
  healthCheck: (connectionId: string) => Promise<{ success: boolean; isHealthy?: boolean; metrics?: any; error?: string }>;
  clearStatus: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  clearAllStatus: () => Promise<{ success: boolean; error?: string }>;
}

const systemAPI: SystemAPI = {
  getStatus: (connectionId) =>
    ipcRenderer.invoke("system:get-status", connectionId),
  getMetrics: () =>
    ipcRenderer.invoke("system:get-metrics"),
  healthCheck: (connectionId) =>
    ipcRenderer.invoke("system:health-check", connectionId),
  clearStatus: (connectionId) =>
    ipcRenderer.invoke("system:clear-status", connectionId),
  clearAllStatus: () =>
    ipcRenderer.invoke("system:clear-all-status"),
};

contextBridge.exposeInMainWorld("system", systemAPI);

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

interface ConnectionAPI {
  createSession: (connectionId: string, host: string, port: number, username: string) => Promise<{ success: boolean; connectionId?: string; error?: string }>;
  getActive: () => Promise<{ success: boolean; connection?: any; error?: string }>;
  getState: (connectionId: string) => Promise<{ success: boolean; state?: any; error?: string }>;
  listAll: () => Promise<{ success: boolean; connections?: any[]; error?: string }>;
  openChannel: (connectionId: string, channelType: string) => Promise<{ success: boolean; channelId?: string; error?: string }>;
  closeChannel: (connectionId: string, channelId: string) => Promise<{ success: boolean; error?: string }>;
  disconnect: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  isConnected: (connectionId: string) => Promise<{ success: boolean; isConnected?: boolean; error?: string }>;
  clearAll: () => Promise<{ success: boolean; error?: string }>;
}

const connectionAPI: ConnectionAPI = {
  createSession: (connectionId, host, port, username) =>
    ipcRenderer.invoke("connection:create-session", { connectionId, host, port, username }),
  getActive: () =>
    ipcRenderer.invoke("connection:get-active"),
  getState: (connectionId) =>
    ipcRenderer.invoke("connection:get-state", connectionId),
  listAll: () =>
    ipcRenderer.invoke("connection:list-all"),
  openChannel: (connectionId, channelType) =>
    ipcRenderer.invoke("connection:open-channel", { connectionId, channelType }),
  closeChannel: (connectionId, channelId) =>
    ipcRenderer.invoke("connection:close-channel", connectionId, channelId),
  disconnect: (connectionId) =>
    ipcRenderer.invoke("connection:disconnect", { connectionId }),
  isConnected: (connectionId) =>
    ipcRenderer.invoke("connection:is-connected", connectionId),
  clearAll: () =>
    ipcRenderer.invoke("connection:clear-all"),
};

contextBridge.exposeInMainWorld("connection", connectionAPI);
