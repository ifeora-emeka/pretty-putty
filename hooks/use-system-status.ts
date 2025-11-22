import { useState, useEffect, useCallback } from "react";
import { RemoteSystemMetrics } from "@/src/main/types.system";
import "@/src/main/types.preload";

interface UseSystemStatusOptions {
  connectionId: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

export const useSystemStatus = ({
  connectionId,
  pollInterval = 3000,
  enabled = true,
}: UseSystemStatusOptions) => {
  const [metrics, setMetrics] = useState<RemoteSystemMetrics | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVPSMetrics = useCallback(async () => {
    if (!connectionId || !enabled || !window.system) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.system.getRemoteMetrics(connectionId);
      
      if (result.success && result.metrics) {
        setMetrics(result.metrics);
        const isHealthy = 
          result.metrics.cpu < 90 && 
          result.metrics.memory < 90 && 
          result.metrics.disk < 95;
        setIsHealthy(isHealthy);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch VPS metrics");
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

    fetchVPSMetrics();
    const interval = setInterval(fetchVPSMetrics, pollInterval);

    return () => clearInterval(interval);
  }, [connectionId, enabled, pollInterval, fetchVPSMetrics]);

  const refetch = useCallback(() => {
    fetchVPSMetrics();
  }, [fetchVPSMetrics]);

  return {
    metrics,
    isHealthy,
    isLoading,
    error,
    refetch,
  };
};
