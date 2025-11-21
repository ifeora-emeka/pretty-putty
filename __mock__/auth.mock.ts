export interface Connection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  lastConnected?: string;
  hasStoredPassword?: boolean;
}

export interface StoredCredentials {
  connectionId: string;
  password: string;
  expiresAt: number;
}

export const mockConnections: Connection[] = [
  {
    id: "conn-1",
    name: "Production Server",
    host: "prod.example.com",
    port: 22,
    username: "admin",
    lastConnected: "2 hours ago",
    hasStoredPassword: true,
  },
  {
    id: "conn-2",
    name: "Development Server",
    host: "dev.example.com",
    port: 22,
    username: "devuser",
    lastConnected: "1 day ago",
    hasStoredPassword: false,
  },
  {
    id: "conn-3",
    name: "Staging Server",
    host: "staging.example.com",
    port: 2222,
    username: "stageadmin",
    lastConnected: "3 days ago",
    hasStoredPassword: true,
  },
];

export const mockStoredCredentials: StoredCredentials[] = [
  {
    connectionId: "conn-1",
    password: "encrypted_password_1",
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  },
  {
    connectionId: "conn-3",
    password: "encrypted_password_3",
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  },
];
