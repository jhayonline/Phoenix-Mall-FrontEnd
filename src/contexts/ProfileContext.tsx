import React, { createContext, useContext, useEffect, useState } from 'react';
import { profileApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  whatsapp_enabled: boolean;
  phone_enabled: boolean;
  is_active: boolean;
  email_verified: boolean;
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
      console.log('🔄 Refreshing profile...');
      const response = await profileApi.getProfile();
      console.log('✅ Profile response:', response);

      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error: any) {
      console.error('❌ Profile refresh error:', error);
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
      console.log('🔄 Updating profile with data:', data);
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        setProfile(prev => prev ? { ...prev, ...response.data } : response.data);
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
    <ProfileContext.Provider value={{
      profile,
      isLoading,
      refreshProfile,
      updateProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
