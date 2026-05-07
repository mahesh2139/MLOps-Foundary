import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  joinDate: string;
  avatar: string | null; // base64 or URL
}

export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || 'User',
    email: user?.email || 'user@org.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'ML Ops Engineer | Data Science Enthusiast',
    joinDate: new Date().toLocaleDateString(),
    avatar: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(profileData);

  // Load avatar from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileData(profile);
      setFormData(profile);
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showNotification('Avatar file must be less than 2MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfileData(prev => ({ ...prev, avatar: base64 }));
        setFormData(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
      showNotification('Avatar updated successfully', 'success');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(formData);
      localStorage.setItem('userProfile', JSON.stringify(formData));
      setIsEditing(false);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />

        {/* Profile Header */}
        <div className={`rounded-xl p-8 mb-8 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full object-cover border-4"
                    style={{ borderColor: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-slate-700'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-slate-200'
                  }`}>
                    {getInitials(profileData.name)}
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  className={`absolute bottom-0 right-0 p-2 rounded-full transition ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title="Change avatar"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Basic Info */}
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {profileData.name}
                </h1>
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                </p>
                <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  <Calendar size={16} />
                  Joined {profileData.joinDate}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <User size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                />
              ) : (
                <p className={`px-3 py-2 ${theme === 'dark' ? 'text-white/90' : 'text-slate-900'}`}>
                  {profileData.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                <Phone size={16} />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                />
              ) : (
                <p className={`px-3 py-2 ${theme === 'dark' ? 'text-white/90' : 'text-slate-900'}`}>
                  {profileData.phone}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                <MapPin size={16} />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                />
              ) : (
                <p className={`px-3 py-2 ${theme === 'dark' ? 'text-white/90' : 'text-slate-900'}`}>
                  {profileData.location}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                <User size={16} />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border transition resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500/50`}
                />
              ) : (
                <p className={`px-3 py-2 ${theme === 'dark' ? 'text-white/90' : 'text-slate-900'}`}>
                  {profileData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-8 justify-end">
              <button
                onClick={handleCancel}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  isSaving
                    ? theme === 'dark'
                      ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                      : 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className={`rounded-xl p-8 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Account Security
          </h2>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-700/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Password
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  Last changed 3 months ago
                </p>
              </div>
              <button className={`px-4 py-2 rounded-lg font-medium transition ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                Change
              </button>
            </div>

            <div className={`p-4 rounded-lg flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-700/50 border border-slate-600' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Two-Factor Authentication
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  Not enabled
                </p>
              </div>
              <button className={`px-4 py-2 rounded-lg font-medium transition ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </div>
  );
}
