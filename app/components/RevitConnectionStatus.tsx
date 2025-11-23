'use client';

import { useEffect, useState } from 'react';

interface ConnectionStatus {
  connected: boolean;
  lastSynced?: string;
  elementCount?: number;
}

export function RevitConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRevitConnection();
    // Check every 30 seconds for updates
    const interval = setInterval(checkRevitConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkRevitConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/revit/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to check Revit connection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
        <span className="text-sm text-gray-600">Checking...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        status.connected
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      {/* Status Indicator Circle */}
      <div
        className={`w-3 h-3 rounded-full ${
          status.connected ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span
          className={`text-sm font-semibold ${
            status.connected ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {status.connected ? 'Revit Authenticated' : 'Revit Disconnected'}
        </span>
        <span className="text-xs text-gray-600">
          {status.connected ? (
            <>
              {status.elementCount > 0
                ? `${status.elementCount} elements • ${status.lastSynced}`
                : 'Ready to sync'}
            </>
          ) : (
            'Not authenticated'
          )}
        </span>
      </div>
    </div>
  );
}
