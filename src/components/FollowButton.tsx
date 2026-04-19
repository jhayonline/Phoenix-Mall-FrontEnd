import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck } from 'lucide-react';
import { followsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface FollowButtonProps {
  userId: number;
  userPid?: string;
  username?: string;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'outline' | 'compact';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  userPid,
  username,
  onFollowChange,
  variant = 'default'
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Compare by pid if available, otherwise fall back to id string comparison
  const isOwnProfile = userPid
    ? user?.id === userPid
    : user?.id === userId.toString();

  useEffect(() => {
    if (user && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId, user]);

  // After all hooks — safe early return
  if (!user || isOwnProfile) return null;

  const checkFollowStatus = async () => {
    try {
      const response = await followsApi.getIsFollowing(userId);
      setIsFollowing(response.is_following);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to follow users",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await followsApi.unfollow(userId);
        setIsFollowing(false);
        onFollowChange?.(false);
        toast({
          title: "Unfollowed",
          description: username ? `You unfollowed ${username}` : "User unfollowed",
        });
      } else {
        await followsApi.follow(userId);
        setIsFollowing(true);
        onFollowChange?.(true);
        toast({
          title: "Following",
          description: username ? `You are now following ${username}` : "Now following this user",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Safe to early return AFTER all hooks
  if (user?.id === userId.toString()) {
    return null;
  }

  const buttonVariants = {
    default: isFollowing
      ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
      : "bg-blue-600 text-white hover:bg-blue-700",
    outline: isFollowing
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
      : "border border-blue-600 text-blue-600 hover:bg-blue-50",
    compact: isFollowing
      ? "p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
      : "p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
  };

  const sizeClasses = variant === 'compact' ? 'p-1.5' : 'px-4 py-2';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg font-medium transition-all duration-200 ${sizeClasses} ${buttonVariants[variant]}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          {variant !== 'compact' && <span>Following</span>}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          {variant !== 'compact' && <span>Follow</span>}
        </>
      )}
    </motion.button>
  );
};

export default FollowButton;
