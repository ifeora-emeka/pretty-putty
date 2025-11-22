import { ConnectionSession, OpenChannel, ChannelType, ConnectionState } from "../types.connection";
import { v4 as uuidv4 } from "uuid";

export class SessionManager {
    private session: ConnectionSession | null = null;

    createSession(connectionId: string, host: string, port: number, username: string): ConnectionSession {
        this.session = {
            connectionId,
            host,
            port,
            username,
            state: "idle",
            sshClient: null,
            channels: new Map(),
        };
        return this.session;
    }

    getSession(): ConnectionSession | null {
        return this.session;
    }

    isConnected(): boolean {
        return this.session?.state === "connected";
    }

    setConnectionState(state: ConnectionState, error?: string): void {
        if (!this.session) throw new Error("No active session");

        this.session.state = state;
        if (error) {
            this.session.error = error;
        } else {
            this.session.error = undefined;
        }

        if (state === "connected") {
            this.session.connectedAt = Date.now();
        }
    }

    setSshClient(client: unknown): void {
        if (!this.session) throw new Error("No active session");
        this.session.sshClient = client;
    }

    getSshClient(): unknown {
        if (!this.session) throw new Error("No active session");
        return this.session.sshClient;
    }

    setSftpClient(sftpClient: unknown): void {
        if (!this.session) throw new Error("No active session");
        this.session.sftpClient = sftpClient;
    }

    getSftpClient(): unknown {
        if (!this.session) throw new Error("No active session");
        return this.session.sftpClient;
    }

    openChannel(type: ChannelType, data: unknown): string {
        if (!this.session) throw new Error("No active session");

        const channelId = uuidv4();
        const channel: OpenChannel = {
            id: channelId,
            type,
            data,
            createdAt: Date.now(),
        };

        this.session.channels.set(channelId, channel);
        return channelId;
    }

    getChannel(channelId: string): OpenChannel | undefined {
        if (!this.session) return undefined;
        return this.session.channels.get(channelId);
    }

    getAllChannels(): OpenChannel[] {
        if (!this.session) return [];
        return Array.from(this.session.channels.values());
    }

    getChannelsByType(type: ChannelType): OpenChannel[] {
        if (!this.session) return [];
        return Array.from(this.session.channels.values()).filter((ch) => ch.type === type);
    }

    closeChannel(channelId: string): void {
        if (!this.session) throw new Error("No active session");
        this.session.channels.delete(channelId);
    }

    closeAllChannels(): void {
        if (!this.session) throw new Error("No active session");
        this.session.channels.clear();
    }

    clearSession(): void {
        this.session = null;
    }

    getSessionState() {
        if (!this.session) return null;

        return {
            connectionId: this.session.connectionId,
            state: this.session.state,
            host: this.session.host,
            port: this.session.port,
            username: this.session.username,
            connectedAt: this.session.connectedAt,
            error: this.session.error,
            channelCount: this.session.channels.size,
        };
    }
}
