import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { onlineStatusApi } from "@/lib/api/onlineStatus";

interface OnlineStatusContextType {
  getUserStatus: (
    userId: number | string,
  ) => Promise<{ isOnline: boolean; lastSeen: string | null }>;
  isUserOnline: (userId: number) => boolean;
  onlineUsers: Set<number>;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error("useOnlineStatus must be used within OnlineStatusProvider");
  }
  return context;
};

export const OnlineStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [onlineUsers] = useState<Set<number>>(new Set());
  const [statusCache, setStatusCache] = useState<Map<string, any>>(new Map());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get the numeric user ID
  const userId = user?.id ? Number(user.id) : null;

  // Heartbeat effect - wait for auth to finish loading
  useEffect(() => {
    // Clear existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only start heartbeat if authenticated and we have a valid user ID
    if (!isAuthenticated || !userId) {
      return;
    }

    const sendHeartbeat = async () => {
      try {
        await onlineStatusApi.heartbeat();
      } catch {
        //
      }
    };

    // Send immediately on mount/authentication
    sendHeartbeat();

    // Then every 30 seconds
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);

    // Send heartbeat before page unload
    const handleBeforeUnload = () => {
      navigator.sendBeacon("http://localhost:5150/api/online-status/heartbeat", JSON.stringify({}));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [authLoading, isAuthenticated, userId]); // Add authLoading to dependencies

  const getUserStatus = useCallback(
    async (identifier: number | string) => {
      const cacheKey = identifier.toString();
      const cached = statusCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 10000) {
        return cached.data;
      }

      try {
        const response = await onlineStatusApi.getUserStatus(identifier);
        if (response.success && response.data) {
          const data = {
            isOnline: response.data.is_online,
            lastSeen: response.data.last_seen_relative || null,
          };

          setStatusCache((prev) =>
            new Map(prev).set(cacheKey, {
              data,
              timestamp: Date.now(),
            }),
          );

          if (typeof identifier === "number") {
            if (data.isOnline) {
              onlineUsers.add(identifier);
            } else {
              onlineUsers.delete(identifier);
            }
          }

          return data;
        }
      } catch (error) {
        console.error("Failed to get user status for", identifier, ":", error);
      }

      return { isOnline: false, lastSeen: null };
    },
    [statusCache, onlineUsers],
  );

  const isUserOnline = useCallback(
    (userId: number) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers],
  );

  return (
    <OnlineStatusContext.Provider value={{ getUserStatus, isUserOnline, onlineUsers }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
