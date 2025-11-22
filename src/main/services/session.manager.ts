import { ConnectionSession, OpenChannel, ChannelType, ConnectionState } from "../types.connection";
import { SSHConnectionService, SSHConnectionConfig } from "./ssh-connection.service";
import { v4 as uuidv4 } from "uuid";

export class SessionManager {
    private session: ConnectionSession | null = null;
    private sshConnection: SSHConnectionService | null = null;

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

    async connectSSH(password: string): Promise<void> {
        if (!this.session) throw new Error("No active session");

        const config: SSHConnectionConfig = {
            host: this.session.host,
            port: this.session.port,
            username: this.session.username,
            password,
        };

        this.sshConnection = new SSHConnectionService(this.session.connectionId, config);

        this.sshConnection.on("ready", () => {
            if (this.session) {
                this.session.state = "connected";
                this.session.connectedAt = Date.now();
            }
        });

        this.sshConnection.on("error", (error: Error) => {
            if (this.session) {
                this.session.state = "error";
                this.session.error = error.message;
            }
        });

        this.sshConnection.on("close", () => {
            if (this.session) {
                this.session.state = "disconnecting";
            }
        });

        this.sshConnection.on("end", () => {
            if (this.session) {
                this.session.state = "idle";
            }
        });

        this.setConnectionState("connecting");

        try {
            await this.sshConnection.connect();
            this.session.sshClient = this.sshConnection.getClient();
            this.setConnectionState("connected");
        } catch (error) {
            this.setConnectionState("error", error instanceof Error ? error.message : "Connection failed");
            throw error;
        }
    }

    async disconnectSSH(): Promise<void> {
        if (!this.sshConnection) return;

        this.setConnectionState("disconnecting");

        try {
            await this.sshConnection.disconnect();
            this.sshConnection = null;
            this.session!.sshClient = null;
            this.setConnectionState("idle");
        } catch (error) {
            console.error("Error disconnecting SSH:", error);
            this.setConnectionState("error", error instanceof Error ? error.message : "Disconnect failed");
        }
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

    getSSHConnection(): SSHConnectionService | null {
        return this.sshConnection;
    }

    async executeCommand(command: string): Promise<string> {
        if (!this.sshConnection) {
            throw new Error("SSH connection not established");
        }
        return this.sshConnection.executeCommand(command);
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
