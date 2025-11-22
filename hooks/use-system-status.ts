import { useState, useEffect, useCallback } from "react";
import { SystemMetrics } from "@/src/main/types.system";
import "@/src/main/types.preload";

interface UseSystemStatusOptions {
  connectionId: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

export const useSystemStatus = ({
  connectionId,
  pollInterval = 5000,
  enabled = true,
}: UseSystemStatusOptions) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!connectionId || !enabled || !window.system) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.system.healthCheck(connectionId);

      if (result.success) {
        setMetrics(result.metrics || null);
        setIsHealthy(result.isHealthy ?? true);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch system status");
        setIsHealthy(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId, enabled]);

  useEffect(() => {
    if (!connectionId || !enabled) {
      return;
    }

    fetchStatus();

    const interval = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(interval);
  }, [connectionId, enabled, pollInterval, fetchStatus]);

  const refetch = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    metrics,
    isHealthy,
    isLoading,
    error,
    refetch,
  };
};
