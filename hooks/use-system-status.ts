import { useState, useEffect, useCallback } from "react";
import { SystemMetrics, OSInfo, HardwareInfo, RemoteSystemMetrics } from "@/src/main/types.system";
import "@/src/main/types.preload";

interface UseSystemStatusOptions {
  connectionId: string | null;
  pollInterval?: number;
  enabled?: boolean;
  useRemote?: boolean;
}

export const useSystemStatus = ({
  connectionId,
  pollInterval = 5000,
  enabled = true,
  useRemote = true,
}: UseSystemStatusOptions) => {
  const [metrics, setMetrics] = useState<SystemMetrics | RemoteSystemMetrics | null>(null);
  const [osInfo, setOsInfo] = useState<OSInfo | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!connectionId || !enabled || !window.system) {
      return;
    }

    setIsLoading(true);
    try {
      let result;

      if (useRemote && typeof window.system.getRemoteMetrics === 'function') {
        result = await window.system.getRemoteMetrics(connectionId);
        if (result.success && result.metrics) {
          setMetrics(result.metrics);
          const isHealthy = result.metrics.cpu < 90 && result.metrics.memory < 90 && result.metrics.disk < 95;
          setIsHealthy(isHealthy);
          setError(null);
          return;
        }
      }

      result = await window.system.healthCheck(connectionId);

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
  }, [connectionId, enabled, useRemote]);

  const fetchSystemInfo = useCallback(async () => {
    if (!enabled || !window.system) {
      return;
    }

    try {
      if (typeof window.system.getOSInfo !== 'function') {
        console.warn("window.system.getOSInfo is not a function");
        return;
      }

      if (typeof window.system.getHardwareInfo !== 'function') {
        console.warn("window.system.getHardwareInfo is not a function");
        return;
      }

      const [osResult, hwResult] = await Promise.all([
        window.system.getOSInfo(),
        window.system.getHardwareInfo(),
      ]);

      if (osResult.success && osResult.osInfo) {
        setOsInfo(osResult.osInfo);
      }

      if (hwResult.success && hwResult.hardwareInfo) {
        setHardwareInfo(hwResult.hardwareInfo);
      }
    } catch (err) {
      console.error("Failed to fetch system info:", err);
    }
  }, [enabled]);

  useEffect(() => {
    if (!connectionId || !enabled) {
      return;
    }

    fetchStatus();
    fetchSystemInfo();

    const interval = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(interval);
  }, [connectionId, enabled, pollInterval, fetchStatus, fetchSystemInfo]);

  const refetch = useCallback(() => {
    fetchStatus();
    fetchSystemInfo();
  }, [fetchStatus, fetchSystemInfo]);

  return {
    metrics,
    osInfo,
    hardwareInfo,
    isHealthy,
    isLoading,
    error,
    refetch,
  };
};
