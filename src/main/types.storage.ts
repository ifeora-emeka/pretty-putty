export interface StoredConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  lastConnected?: string;
}

export interface StoredCredential {
  connectionId: string;
  encryptedPassword: string;
  expiresAt: number;
  createdAt: number;
}

export interface AppPreferences {
  theme?: "light" | "dark" | "system";
  windowSize?: { width: number; height: number };
  windowPosition?: { x: number; y: number };
}

export interface AppData {
  connections: StoredConnection[];
  preferences: AppPreferences;
}
