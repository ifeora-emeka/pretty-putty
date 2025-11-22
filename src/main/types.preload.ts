export interface StorageAPI {
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

export interface ConnectionAPI {
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

export interface SystemAPI {
  getStatus: (connectionId: string) => Promise<{ success: boolean; status?: any; error?: string }>;
  getMetrics: () => Promise<{ success: boolean; metrics?: any; error?: string }>;
  healthCheck: (connectionId: string) => Promise<{ success: boolean; isHealthy?: boolean; metrics?: any; error?: string }>;
  clearStatus: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  clearAllStatus: () => Promise<{ success: boolean; error?: string }>;
}

export interface ElectronAPI {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => Promise<any>;
    on: (channel: string, handler: (event: unknown, args: unknown) => void) => void;
    off: (channel: string, handler: (event: unknown, args: unknown) => void) => void;
    send: (channel: string, ...args: unknown[]) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    storage: StorageAPI;
    connection: ConnectionAPI;
    system: SystemAPI;
  }
}
