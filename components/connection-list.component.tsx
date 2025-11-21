"use client";

import React from "react";
import { Connection } from "@/__mock__/auth.mock";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trash2, Plus } from "lucide-react";

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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Recent Connections</h2>
                <Button
                    onClick={onAddNew}
                    size="sm"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                    <Plus className="w-4 h-4" />
                    New Connection
                </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {connections.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                        <p>No saved connections yet</p>
                    </div>
                ) : (
                    connections.map((connection) => (
                        <Card
                            key={connection.id}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 hover:bg-white/20 transition-all cursor-pointer group p-4"
                            onClick={() => onSelectConnection(connection)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="font-medium text-white">{connection.name}</h3>
                                    <p className="text-sm text-white/70">
                                        {connection.username}@{connection.host}:{connection.port}
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">
                                        Last connected: {connection.lastConnected || "Never"}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(connection.id);
                                    }}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
