import { useState, useCallback, useEffect } from "react";
import { Connection } from "@/__mock__/auth.mock";
import { AuthElectronService } from "@/src/shared/services/auth-electron.service";
import { useConnection } from "@/src/shared/connection.context";

interface UseAuthFlowReturn {
  isConnecting: boolean;
  error: string | null;
  connect: (connection: Connection, password: string, rememberFor24h: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export const useAuthFlow = (): UseAuthFlowReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setConnectionId, setMetadata, setError: setConnectionError, setLoading } = useConnection();

  const handleConnect = useCallback(
    async (connection: Connection, password: string, rememberFor24h: boolean) => {
      setIsConnecting(true);
      setError(null);
      setLoading(true);

      try {
        const sessionResult = await AuthElectronService.createSession(
          connection.id,
          connection.host,
          connection.port,
          connection.username,
          password
        );

        if (!sessionResult.success) {
          throw new Error(sessionResult.error || "Failed to create SSH session");
        }

        const healthResult = await AuthElectronService.checkConnectionHealth(connection.id);

        if (!healthResult.success) {
          throw new Error(healthResult.error || "Failed to verify connection health");
        }

        const storageResult = await AuthElectronService.saveConnectionToStorage(
          connection,
          password,
          rememberFor24h
        );

        if (!storageResult.success) {
          console.warn("Failed to save connection to storage:", storageResult.error);
        }

        await AuthElectronService.updateLastConnected(connection.id);

        setConnectionId(connection.id);
        setMetadata({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          connectionName: connection.name,
          connectedAt: Date.now(),
        });

        setError(null);
        setConnectionError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Connection failed";
        setError(errorMessage);
        setConnectionError(errorMessage);

        await AuthElectronService.disconnectSession(connection.id).catch(() => {});
      } finally {
        setIsConnecting(false);
        setLoading(false);
      }
    },
    [setConnectionId, setMetadata, setConnectionError, setLoading]
  );

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    try {
      const activeConn = await AuthElectronService.getActiveConnection();

      if (activeConn.success && activeConn.connection?.connectionId) {
        await AuthElectronService.disconnectSession(activeConn.connection.connectionId);
      }

      setConnectionId(null);
      setMetadata(null);
      setError(null);
      setConnectionError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Disconnect failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setConnectionId, setMetadata, setLoading, setConnectionError]);

  const handleClearError = useCallback(() => {
    setError(null);
    setConnectionError(null);
  }, [setConnectionError]);

  return {
    isConnecting,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    clearError: handleClearError,
  };
};
