"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { SystemMetrics } from "@/src/main/types.system";

interface ConnectionMetadata {
  host?: string;
  port?: number;
  username?: string;
  connectedAt?: number;
  connectionName?: string;
}

interface ConnectionContextType {
  isLoading: boolean;
  connectionId: string | null;
  error: string | null;
  metadata: ConnectionMetadata | null;
  systemMetrics: SystemMetrics | null;
  isHealthy: boolean;
  setLoading: (loading: boolean) => void;
  setConnectionId: (connectionId: string | null) => void;
  setError: (error: string | null) => void;
  setMetadata: (metadata: ConnectionMetadata | null) => void;
  setSystemMetrics: (metrics: SystemMetrics | null) => void;
  setIsHealthy: (healthy: boolean) => void;
  updateStatus: (connectionId: string, metadata: ConnectionMetadata, metrics: SystemMetrics | null, isHealthy: boolean) => void;
  clearConnection: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ConnectionMetadata | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);

  const updateLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const updateConnectionId = useCallback((id: string | null) => {
    setConnectionId(id);
  }, []);

  const updateError = useCallback((err: string | null) => {
    setError(err);
  }, []);

  const updateMetadata = useCallback((meta: ConnectionMetadata | null) => {
    setMetadata(meta);
  }, []);

  const updateSystemMetrics = useCallback((metrics: SystemMetrics | null) => {
    setSystemMetrics(metrics);
  }, []);

  const updateIsHealthy = useCallback((healthy: boolean) => {
    setIsHealthy(healthy);
  }, []);

  const handleUpdateStatus = useCallback(
    (
      connId: string,
      meta: ConnectionMetadata,
      metrics: SystemMetrics | null,
      healthy: boolean
    ) => {
      setConnectionId(connId);
      setMetadata(meta);
      setSystemMetrics(metrics);
      setIsHealthy(healthy);
    },
    []
  );

  const handleClearConnection = useCallback(() => {
    setConnectionId(null);
    setMetadata(null);
    setSystemMetrics(null);
    setIsHealthy(true);
    setError(null);
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        isLoading,
        connectionId,
        error,
        metadata,
        systemMetrics,
        isHealthy,
        setLoading: updateLoading,
        setConnectionId: updateConnectionId,
        setError: updateError,
        setMetadata: updateMetadata,
        setSystemMetrics: updateSystemMetrics,
        setIsHealthy: updateIsHealthy,
        updateStatus: handleUpdateStatus,
        clearConnection: handleClearConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within ConnectionProvider");
  }
  return context;
};
