import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { onlineStatusApi } from "@/lib/api/onlineStatus";

export const Heartbeat = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const userId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

    const sendHeartbeat = async () => {
      try {
        await onlineStatusApi.heartbeat();
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    const handleBeforeUnload = () => {
      navigator.sendBeacon("http://localhost:5150/api/online-status/heartbeat", JSON.stringify({}));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.id]);

  return null;
};
