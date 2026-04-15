import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Settings,
  Heart,
  Package,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/lib/api';

const Profile: React.FC = () => {
  const { profile, isLoading, updateProfile } = useProfile();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    whatsapp_enabled: false,
    phone_enabled: false,
  });

  const [stats, setStats] = useState({
    total_listings: 0,
    active_listings: 0,
    sold_listings: 0,
    total_views: 0,
  });

  // Initialize edit data when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        whatsapp_enabled: profile.whatsapp_enabled || false,
        phone_enabled: profile.phone_enabled || false,
      });
    }
  }, [profile]);

  // Load stats
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await profileApi.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a storage service first
      // For now, we'll just use a placeholder URL
      const avatarUrl = URL.createObjectURL(file);
      try {
        await updateProfile({ avatar_url: avatarUrl });
      } catch (error) {
        // Error handling is done in the context
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold font-heading mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Basic Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6"
            >
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{profile.first_name?.charAt(0) || profile.email?.charAt(0)}</span>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-xl font-semibold">{fullName || 'User'}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-blue-600 mt-1 capitalize">{profile.role}</p>
                {profile.email_verified ? (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified</span>
                ) : (
                  <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Not Verified</span>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 mt-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Listings</span>
                  </div>
                  <span className="font-semibold">{stats.total_listings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Total Views</span>
                  </div>
                  <span className="font-semibold">{stats.total_views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-600">Active Listings</span>
                  </div>
                  <span className="font-semibold">{stats.active_listings}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/profile/listings')}
              >
                View My Listings
              </Button>
            </motion.div>
          </div>

          {/* Right Column - Editable Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  <Input
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  <Input
                    value={editData.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your phone number (e.g., 024XXXXXXX)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your location (e.g., Accra, Kumasi)"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Contact Preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.whatsapp_enabled}
                      onChange={(e) => setEditData({ ...editData, whatsapp_enabled: e.target.checked })}
                      disabled={!isEditing}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable WhatsApp contact</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.phone_enabled}
                      onChange={(e) => setEditData({ ...editData, phone_enabled: e.target.checked })}
                      disabled={!isEditing}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable phone call contact</span>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
