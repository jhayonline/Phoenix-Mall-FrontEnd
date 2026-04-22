import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { onlineStatusApi } from "@/lib/api/onlineStatus";

interface OnlineIndicatorProps {
  userId: number;
  showText?: boolean;
  showDetailedText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  userId,
  showText = false,
  showDetailedText = false,
  size = "md",
  className = "",
  textClassName = "",
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await onlineStatusApi.getUserStatus(userId);
        if (response.success && response.data) {
          setIsOnline(response.data.is_online);
          setLastSeen(response.data.last_seen_relative);
        }
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };

    loadStatus();

    // Refresh every 15 seconds
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  // Online = bright red (#FF0000), Offline = gray (#9CA3AF)
  const dotClasses = `rounded-full ${
    isOnline ? "bg-red-600 animate-pulse ring-2 ring-red-400 ring-opacity-75" : "bg-gray-400"
  } ${sizeClasses[size]} ${className}`;

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 animate-pulse ${className}`} />
    );
  }

  const tooltipText = isOnline ? "Online" : lastSeen ? `Last seen ${lastSeen}` : "Offline";
  const statusText = isOnline ? "Online" : lastSeen || "Offline";

  // For detailed text display (like "Online" or "Last seen 5 minutes ago")
  const detailedText = isOnline ? "Online" : lastSeen ? `Last seen ${lastSeen}` : "Offline";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex items-center gap-1.5">
            <div className={dotClasses} />
            {showText && !showDetailedText && (
              <span
                className={`text-xs font-medium ${isOnline ? "text-red-600" : "text-gray-500"} ${textClassName}`}
              >
                {statusText}
              </span>
            )}
            {showDetailedText && (
              <span
                className={`text-xs ${isOnline ? "text-red-600 font-medium" : "text-gray-500"} ${textClassName}`}
              >
                {detailedText}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
