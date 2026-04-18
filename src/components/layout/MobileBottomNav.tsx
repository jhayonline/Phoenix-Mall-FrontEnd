import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, ShoppingCart, Plus, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
        background: active ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
      }}
    >
      {/* Active glow ring */}
      {active && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'rgba(220, 38, 38, 0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(220, 38, 38, 0.2)',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      )}

      {/* Icon */}
      <div className="relative">
        <Icon
          className="w-[18px] h-[18px] transition-colors duration-200"
          style={{ color: active ? '#dc2626' : '#9ca3af' }}
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
              transition={{ type: 'spring', damping: 15, stiffness: 400 }}
              className="absolute -top-2 -right-2.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full text-white font-semibold"
              style={{
                fontSize: '9px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.5)',
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

      {/* Invisible spacer when not active to keep height consistent */}
      {!active && <div className="w-1 h-1" />}
    </motion.button>
  );
};

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [messageCount] = useState(2);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const tabs: (Tab | 'center')[] = [
    { name: 'Home', icon: Home, path: '/', badge: null },
    { name: 'Shop', icon: ShoppingCart, path: '/shop', badge: null },
    'center',
    {
      name: 'Messages',
      icon: MessageCircle,
      path: '/messaging',
      badge: messageCount > 0 ? String(messageCount) : null,
    },
    { name: 'Profile', icon: User, path: '/profile', badge: null },
  ];

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.1 }}
      className="fixed bottom-4 left-3 right-3 z-50 md:hidden"
    >
      <div
        className="rounded-[28px] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}
        />

        <div className="flex items-center justify-between px-4 py-2">
          {tabs.map((tab, i) => {
            if (tab === 'center') {
              return user ? (
                <motion.button
                  key="center"
                  onClick={() => navigate('/sell')}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative flex items-center justify-center w-12 h-12 rounded-2xl text-white"
                  style={{
                    background: 'linear-gradient(145deg, #f87171, #dc2626)',
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
                // Placeholder to maintain layout when user is not logged in
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
    </motion.div>
  );
};

export default MobileBottomNav;
