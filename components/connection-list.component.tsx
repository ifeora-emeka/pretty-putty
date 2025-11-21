"use client";

import React from "react";
import { Connection } from "@/__mock__/auth.mock";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trash2, Plus, Edit, Cable } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "./ui/context-menu";

interface ConnectionListComponentProps {
    connections: Connection[];
    onSelectConnection: (connection: Connection) => void;
    onAddNew: () => void;
    onDelete: (connectionId: string) => void;
}

export const ConnectionListComponent: React.FC<ConnectionListComponentProps> = ({
    connections,
    onSelectConnection,
    onAddNew,
    onDelete,
}) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Connections</h2>
                <Button
                    onClick={onAddNew}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New
                </Button>
            </div>

            <div className="space-y-2">
                {connections.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No saved connections yet</p>
                    </div>
                ) : (
                    connections.map((connection) => (
                        <ContextMenu key={connection.id}>
                            <ContextMenuTrigger asChild>
                                <Card
                                    className="hover:bg-accent/50 transition-colors cursor-pointer group p-4 border-border shadow-none"
                                    onClick={() => onSelectConnection(connection)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground mb-1">{connection.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {connection.username}@{connection.host}:{connection.port}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70">
                                                {connection.lastConnected ? `Last connected ${connection.lastConnected}` : "Never connected"}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-56">
                                <ContextMenuItem
                                    onClick={() => onSelectConnection(connection)}
                                    className="cursor-pointer"
                                >
                                    <Cable className="mr-2 h-4 w-4" />
                                    <span>Connect</span>
                                </ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => onSelectConnection(connection)}
                                    className="cursor-pointer"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => onDelete(connection.id)}
                                    className="cursor-pointer text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    ))
                )}
            </div>
        </div>
    );
};
