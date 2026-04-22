import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Bell, Plus, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api";
const API_BASE = API_BASE_URL.replace("/api", "");

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

type Tab = {
  name: string;
  icon: React.ElementType;
  path: string;
  badge?: string | null;
};

const NavButton: React.FC<{
  tab: Tab;
  active: boolean;
  onClick: () => void;
}> = ({ tab, active, onClick }) => {
  const Icon = tab.icon;

  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl"
      whileTap={{ scale: 0.88 }}
      style={{
        background: active ? "rgba(220, 38, 38, 0.1)" : "transparent",
      }}
    >
      {/* Active glow ring */}
      {active && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            boxShadow: "inset 0 0 0 1px rgba(220, 38, 38, 0.2)",
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
      )}

      {/* Icon */}
      <div className="relative">
        <Icon
          className="w-[20px] h-[20px] transition-colors duration-200"
          style={{
            color: active ? "#dc2626" : "#9ca3af",
            fill: active ? "#dc2626" : "none",
          }}
          strokeWidth={active ? 2.2 : 1.8}
        />

        {/* Badge */}
        <AnimatePresence>
          {tab.badge && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
              className="absolute -top-2 -right-2.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full text-white font-semibold"
              style={{
                fontSize: "9px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.5)",
              }}
            >
              {tab.badge}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Active dot */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-1 h-1 rounded-full bg-red-600"
          />
        )}
      </AnimatePresence>

      {!active && <div className="w-1 h-1" />}
    </motion.button>
  );
};

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [messageCount] = useState(2);
  const [notifCount] = useState(3);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const avatarUrl = resolveImageUrl(user?.avatar_url);
  const isProfileActive = isActive("/profile");

  const tabs: (Tab | "center")[] = [
    { name: "Search", icon: Search, path: "/search", badge: null },
    { name: "Wishlist", icon: Heart, path: "/wishlist", badge: null },
    "center",
    {
      name: "Messages",
      icon: MessageCircle,
      path: "/messaging",
      badge: messageCount > 0 ? String(messageCount) : null,
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: notifCount > 0 ? String(notifCount) : null,
    },
  ];

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 120, delay: 0.1 }}
      className="fixed bottom-4 left-3 right-3 z-50 md:hidden flex items-center gap-3"
    >
      {/* Main pill nav */}
      <div
        className="flex-1 rounded-[28px] overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `
            0 0 0 0.5px rgba(255, 255, 255, 0.6),
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.12),
            0 24px 48px rgba(0, 0, 0, 0.08)
          `,
        }}
      >
        {/* Subtle top shine */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          }}
        />

        <div className="flex items-center justify-between px-4 py-2">
          {tabs.map((tab, i) => {
            if (tab === "center") {
              return user ? (
                <motion.button
                  key="center"
                  onClick={() => navigate("/sell")}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex items-center justify-center w-12 h-12 rounded-2xl text-white"
                  style={{
                    background: "linear-gradient(145deg, #f87171, #dc2626)",
                    boxShadow: `
                      0 4px 12px rgba(220, 38, 38, 0.4),
                      0 2px 4px rgba(220, 38, 38, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              ) : (
                <div key="center-placeholder" className="w-12 h-12" />
              );
            }

            return (
              <NavButton
                key={tab.name}
                tab={tab}
                active={isActive(tab.path)}
                onClick={() => navigate(tab.path)}
              />
            );
          })}
        </div>
      </div>

      {/* Detached profile avatar button */}
      <motion.button
        onClick={() => navigate("/profile")}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="relative flex-shrink-0 w-[60px] h-[60px] rounded-full"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `
            0 0 0 0.5px rgba(255, 255, 255, 0.6),
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.12),
            0 24px 48px rgba(0, 0, 0, 0.08)
          `,
          padding: "6px",
        }}
      >
        {/* Active ring */}
        <AnimatePresence>
          {isProfileActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 0 2.5px #dc2626",
              }}
            />
          )}
        </AnimatePresence>

        {/* Avatar */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
          {user && avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name,
                )}&background=ef4444&color=fff&size=80`;
              }}
            />
          ) : user ? (
            <span className="text-white font-bold text-lg">
              {user.name?.charAt(0)?.toUpperCase()}
            </span>
          ) : (
            // Guest: show a generic person silhouette
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default MobileBottomNav;
