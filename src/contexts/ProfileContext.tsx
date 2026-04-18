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
      const response = await profileApi.getProfile();

      if (response.success && response.data) {
        setProfile({
          id: response.data.id,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          role: response.data.role,
          phone: response.data.phone,
          avatar_url: response.data.avatar_url,
          location: response.data.location,
          whatsapp_enabled: response.data.whatsapp_enabled,
          phone_enabled: response.data.phone_enabled,
          is_active: response.data.is_active,
          email_verified: response.data.email_verified,
          created_at: response.data.created_at,  // Make sure this line exists
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
