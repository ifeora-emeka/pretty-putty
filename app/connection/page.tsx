"use client";

import React from "react";
import { redirect } from "next/navigation";
import { ConnectionHeaderComponent } from "@/components/connection-header.component";
import { useConnection } from "@/src/shared/connection.context";

export default function ConnectionPage() {
  const { connectionId, metadata } = useConnection();

  if (!connectionId || !metadata) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ConnectionHeaderComponent
        connectionName={metadata.connectionName || "Unknown Server"}
        host={metadata.host}
        username={metadata.username}
      />
      <div className="flex-1 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground">
            Connection dashboard will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}
