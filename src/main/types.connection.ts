export type ConnectionState = "idle" | "connecting" | "connected" | "disconnecting" | "error";

export type ChannelType = "shell" | "sftp" | "forward";

export interface OpenChannel {
  id: string;
  type: ChannelType;
  data: unknown;
  createdAt: number;
}

export interface ConnectionSession {
  connectionId: string;
  host: string;
  port: number;
  username: string;
  state: ConnectionState;
  sshClient: unknown;
  channels: Map<string, OpenChannel>;
  sftpClient?: unknown;
  connectedAt?: number;
  error?: string;
}

export interface ConnectionState_Serialized {
  connectionId: string;
  state: ConnectionState;
  connectedAt?: number;
  error?: string;
}

export interface CreateConnectionRequest {
  connectionId: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  privateKeyPassphrase?: string;
}

export interface OpenChannelRequest {
  connectionId: string;
  channelType: ChannelType;
}

export interface OpenChannelResponse {
  success: boolean;
  channelId?: string;
  error?: string;
}

export interface SendCommandRequest {
  connectionId: string;
  shellChannelId: string;
  command: string;
}

export interface SendCommandResponse {
  success: boolean;
  output?: string;
  error?: string;
}

export interface ListDirRequest {
  connectionId: string;
  remotePath: string;
}

export interface ListDirResponse {
  success: boolean;
  files?: Array<{ name: string; type: "file" | "directory"; size?: number }>;
  error?: string;
}

export interface DisconnectRequest {
  connectionId: string;
}

export interface DisconnectResponse {
  success: boolean;
  error?: string;
}

export interface ConnectionStatusResponse {
  connectionId: string;
  state: ConnectionState;
  connectedAt?: number;
  error?: string;
}
