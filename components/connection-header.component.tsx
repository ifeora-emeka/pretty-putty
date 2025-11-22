"use client";

import React, { useState } from "react";
import { ChevronDown, Cpu, HardDrive, Zap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useConnection } from "@/src/shared/connection.context";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useAuth } from "@/src/shared/auth.context";

interface ConnectionHeaderProps {
    connectionName: string;
    host?: string;
    username?: string;
}

export const ConnectionHeaderComponent: React.FC<ConnectionHeaderProps> = ({
    connectionName,
    host = "example.com",
    username = "admin",
}) => {
    const router = useRouter();
    const { disconnect } = useAuth();
    const { connectionId } = useConnection();
    const { metrics, isHealthy, isLoading } = useSystemStatus({
        connectionId,
        pollInterval: 3000,
        enabled: !!connectionId,
    });
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            await disconnect();
            router.push("/");
        } catch (error) {
            console.error("Disconnect error:", error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const cpu = metrics?.cpu ?? 0;
    const memory = metrics?.memory ?? 0;
    const disk = metrics?.disk ?? 0;
    const memoryUsed = metrics?.memoryUsed ?? 0;
    const memoryTotal = metrics?.memoryTotal ?? 0;
    const diskUsed = metrics?.diskUsed ?? 0;
    const diskTotal = metrics?.diskTotal ?? 0;

    return (
        <div className="border-b border-border bg-card">
            <div className="px-6 py-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:opacity-75 transition-opacity group bg-background px-2 rounded-md">
                            <div>
                                <h1 className="text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                    {connectionName}
                                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                                </h1>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-96 max-h-96 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    System Metrics
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-muted rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="w-4 h-4 text-primary" />
                                            <span className="text-xs text-muted-foreground">CPU</span>
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {cpu}%
                                        </p>
                                        <div className="w-full bg-border rounded-full h-1">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${cpu}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-muted rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-accent" />
                                            <span className="text-xs text-muted-foreground">
                                                Memory
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {memory}%
                                        </p>
                                        <div className="w-full bg-border rounded-full h-1">
                                            <div
                                                className="h-full bg-accent rounded-full transition-all"
                                                style={{ width: `${memory}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-muted rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="w-4 h-4 text-destructive" />
                                            <span className="text-xs text-muted-foreground">Disk</span>
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {disk}%
                                        </p>
                                        <div className="w-full bg-border rounded-full h-1">
                                            <div
                                                className="bg-destructive h-1 rounded-full transition-all"
                                                style={{ width: `${disk}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Host</span>
                                        <span className="text-foreground font-medium">{host}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">User</span>
                                        <span className="text-foreground font-medium">
                                            {username}
                                        </span>
                                    </div>
                                    {metrics?.memoryTotal && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">RAM</span>
                                            <span className="text-foreground font-medium">
                                                {memoryUsed}GB / {memoryTotal}GB
                                            </span>
                                        </div>
                                    )}
                                    {metrics?.diskTotal && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Storage</span>
                                            <span className="text-foreground font-medium">
                                                {diskUsed}GB / {diskTotal}GB
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {metrics && (
                                <div className="pt-2 border-t border-border">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        VPS Information
                                    </p>
                                    <div className="space-y-1 text-xs">
                                        {metrics.osName && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">OS</span>
                                                <span className="text-foreground font-medium text-right">{metrics.osName}</span>
                                            </div>
                                        )}
                                        {metrics.kernel && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Kernel</span>
                                                <span className="text-foreground font-medium text-right">{metrics.kernel}</span>
                                            </div>
                                        )}
                                        {metrics.hostname && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Hostname</span>
                                                <span className="text-foreground font-medium">{metrics.hostname}</span>
                                            </div>
                                        )}
                                        {metrics.uptime && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Uptime</span>
                                                <span className="text-foreground font-medium text-right">{metrics.uptime}</span>
                                            </div>
                                        )}
                                        {metrics.cpuModel && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">CPU</span>
                                                <span className="text-foreground font-medium text-right">{metrics.cpuModel}</span>
                                            </div>
                                        )}
                                        {metrics.cpuCores && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Cores</span>
                                                <span className="text-foreground font-medium">{metrics.cpuCores}</span>
                                            </div>
                                        )}
                                        {metrics.loadAverage && (
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground">Load Avg</span>
                                                <span className="text-foreground font-medium">
                                                    {metrics.loadAverage[0].toFixed(2)}, {metrics.loadAverage[1].toFixed(2)}, {metrics.loadAverage[2].toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full mt-4"
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
