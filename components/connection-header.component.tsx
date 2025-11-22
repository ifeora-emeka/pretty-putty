"use client";

import React from "react";
import { ChevronDown, Cpu, HardDrive, Zap } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useConnection } from "@/src/shared/connection.context";
import { useSystemStatus } from "@/hooks/use-system-status";

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
    const { connectionId } = useConnection();
    const { metrics, isHealthy, isLoading } = useSystemStatus({
        connectionId,
        pollInterval: 5000,
        enabled: !!connectionId,
    });

    const cpu = metrics?.cpu ?? 0;
    const memory = metrics?.memory ?? 0;
    const disk = metrics?.disk ?? 0;

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
                    <DropdownMenuContent align="start" className="w-80">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    System Details
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
                                                style={{ width: `${disk}%` }}
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
                                                className="h-full bg-primary rounded-full transition-all"
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
                                </div>
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
