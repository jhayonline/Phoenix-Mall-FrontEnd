import React, { createContext, useContext, useEffect, useState } from 'react';
import { profileApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface UserProfile {
  pid: string;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
  role: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  location: string | null;
  whatsapp_enabled: boolean;
  phone_enabled: boolean;
  is_active: boolean | null;
  email_verified: boolean;
  follower_count: number;
  following_count: number;
  created_at: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        const d = response.data;
        setProfile({
          pid: d.pid,
          name: d.name,
          email: d.email,
          username: d.username ?? null,
          bio: d.bio ?? null,
          role: d.role ?? null,
          phone_number: d.phone_number ?? null,
          avatar_url: d.avatar_url ?? null,
          location: d.location ?? null,
          whatsapp_enabled: d.whatsapp_enabled ?? false,
          phone_enabled: d.phone_enabled ?? false,
          is_active: d.is_active ?? null,
          email_verified: d.email_verified ?? false,
          follower_count: d.follower_count ?? 0,
          following_count: d.following_count ?? 0,
          created_at: d.created_at,
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to load profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        const d = response.data;
        setProfile(prev => prev ? {
          ...prev,
          pid: d.pid ?? prev.pid,
          name: d.name ?? prev.name,
          email: d.email ?? prev.email,
          username: d.username ?? prev.username,
          bio: d.bio ?? prev.bio,
          role: d.role ?? prev.role,
          phone_number: d.phone_number ?? prev.phone_number,
          avatar_url: d.avatar_url ?? prev.avatar_url,
          location: d.location ?? prev.location,
          whatsapp_enabled: d.whatsapp_enabled ?? prev.whatsapp_enabled,
          phone_enabled: d.phone_enabled ?? prev.phone_enabled,
          is_active: d.is_active ?? prev.is_active,
          email_verified: d.email_verified ?? prev.email_verified,
          follower_count: d.follower_count ?? prev.follower_count,
          following_count: d.following_count ?? prev.following_count,
          created_at: d.created_at ?? prev.created_at,
        } : null);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refreshProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
