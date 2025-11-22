import { SessionManager } from "./session.manager";
import { ConnectionState_Serialized } from "../types.connection";

export class ConnectionManager {
  private static instance: ConnectionManager;
  private sessions: Map<string, SessionManager> = new Map();
  private activeConnectionId: string | null = null;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  createSession(connectionId: string, host: string, port: number, username: string): SessionManager {
    const session = new SessionManager();
    session.createSession(connectionId, host, port, username);
    this.sessions.set(connectionId, session);
    return session;
  }

  getSession(connectionId: string): SessionManager | undefined {
    return this.sessions.get(connectionId);
  }

  setActiveConnection(connectionId: string): void {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    this.activeConnectionId = connectionId;
  }

  getActiveConnection(): SessionManager | null {
    if (!this.activeConnectionId) return null;
    return this.sessions.get(this.activeConnectionId) || null;
  }

  getActiveConnectionId(): string | null {
    return this.activeConnectionId;
  }

  hasActiveConnection(): boolean {
    if (!this.activeConnectionId) return false;
    const session = this.sessions.get(this.activeConnectionId);
    return session?.isConnected() ?? false;
  }

  listConnections(): ConnectionState_Serialized[] {
    return Array.from(this.sessions.values()).map((session) => {
      const state = session.getSessionState();
      if (!state) {
        return {
          connectionId: "unknown",
          state: "idle",
        };
      }
      return {
        connectionId: state.connectionId,
        state: state.state,
        connectedAt: state.connectedAt,
        error: state.error,
      };
    });
  }

  removeSession(connectionId: string): void {
    if (this.activeConnectionId === connectionId) {
      this.activeConnectionId = null;
    }
    this.sessions.delete(connectionId);
  }

  clearAllSessions(): void {
    this.sessions.clear();
    this.activeConnectionId = null;
  }
}
