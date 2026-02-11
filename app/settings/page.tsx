'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import { graphqlRequest } from '@/lib/graphql-client'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import toast from 'react-hot-toast'
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  Loader2,
  Camera,
  X
} from 'lucide-react'

// GraphQL queries and mutations
const GET_USER_PROFILE = `
  query GetUserProfile {
    me {
      id
      name
      email
      phone
      profileImage
      preferences
    }
  }
`

const GET_FAMILY_MEMBERS = `
  query GetFamilyMembers {
    familyMembers {
      id
      name
      phone
      relationship
      email
    }
  }
`

const GET_USER_PREFERENCES = `
  query GetUserPreferences {
    userPreferences
  }
`

const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      email
      phone
      profileImage
    }
  }
`

const UPDATE_USER_PREFERENCES = `
  mutation UpdateUserPreferences($preferences: JSON!) {
    updateUserPreferences(preferences: $preferences) {
      id
      preferences
    }
  }
`

export default function Settings() {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken } = useAuth()
  const { theme: currentTheme, setTheme: setThemeGlobal } = useTheme()
  const { profile: userProfile, refreshProfile, updateProfileImage } = useUserProfile()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [countryCode, setCountryCode] = useState<string>('+91')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [isSavingProfile, setIsSavingProfile] = useState(false) // Flag to prevent reload after save
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: ''
  })

  // Common country codes
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  ]

  // Preferences state
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    reminders: true,
    healthAlerts: true,
    weeklyReports: false
  })
  
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    emergencyAccess: true,
    familySharing: true
  })
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(currentTheme)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'data', name: 'Data', icon: Database },
  ]

  // Helper function to parse phone number and extract country code
  const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
    if (!phone) return { countryCode: '+91', number: '' }
    
    // Check if phone starts with a country code
    for (const country of countryCodes) {
      if (phone.startsWith(country.code)) {
        return {
          countryCode: country.code,
          number: phone.substring(country.code.length).trim()
        }
      }
    }
    
    // If no country code found, default to +91
    return { countryCode: '+91', number: phone.trim() }
  }

  // Load user data and preferences
  useEffect(() => {
    if (!userLoaded || !user || isSavingProfile) return // Don't reload while saving

    const loadUserData = async () => {
      try {
        setLoading(true)
        const token = await getToken()

        // Use profile from context if available
        if (userProfile) {
          // Load family members to get Self phone number
          let selfPhoneNumber = ''
          try {
            const familyData = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
            if (familyData?.familyMembers) {
              const selfMember = familyData.familyMembers.find((member: any) => 
                member.relationship?.toLowerCase() === 'self'
              )
              if (selfMember?.phone) {
                selfPhoneNumber = selfMember.phone
              }
            }
          } catch (err) {
            console.log('Could not load family members for phone number')
          }

          const phoneNumber = selfPhoneNumber || userProfile.phone || ''
          // Parse phone number to extract country code
          const parsedPhone = parsePhoneNumber(phoneNumber)
          setCountryCode(parsedPhone.countryCode)
          setPhoneNumber(parsedPhone.number)
          // Use profileImage from context - check if it exists as a property (even if empty string)
          const profileImage = userProfile.hasOwnProperty('profileImage') 
            ? (userProfile.profileImage || '') 
            : ''
          setProfile({
            name: userProfile.name,
            email: userProfile.email,
            phone: phoneNumber,
            profileImage: profileImage
          })
          // Only update imagePreview if we're not currently saving (to prevent overwriting during save)
          if (!isSavingProfile) {
            setImagePreview(profileImage)
          }
        } else {
          // Load user profile from backend
          const profileData = await graphqlRequest(GET_USER_PROFILE, {}, token)
          
          // Load family members to get Self phone number
          let selfPhoneNumber = ''
          try {
            const familyData = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
            if (familyData?.familyMembers) {
              const selfMember = familyData.familyMembers.find((member: any) => 
                member.relationship?.toLowerCase() === 'self'
              )
              if (selfMember?.phone) {
                selfPhoneNumber = selfMember.phone
              }
            }
          } catch (err) {
            console.log('Could not load family members for phone number')
          }
          
          if (profileData?.me) {
            const userData = profileData.me
            const phoneNumber = selfPhoneNumber || userData.phone || user.primaryPhoneNumber?.phoneNumber || ''
            // Use profileImage from backend if property exists (even if empty string), otherwise fallback to Clerk
            // Check if profileImage property exists in the response (not just if it's truthy)
            const profileImage = userData.hasOwnProperty('profileImage') 
              ? (userData.profileImage || '') 
              : (user.imageUrl || '')
            // Parse phone number to extract country code
            const parsedPhone = parsePhoneNumber(phoneNumber)
            setCountryCode(parsedPhone.countryCode)
            setPhoneNumber(parsedPhone.number)
            
            setProfile({
              name: userData.name || user.firstName || user.fullName || '',
              email: userData.email || user.primaryEmailAddress?.emailAddress || '',
              phone: phoneNumber,
              profileImage: profileImage
            })
            // Only update imagePreview if we're not currently saving (to prevent overwriting during save)
            if (!isSavingProfile) {
              setImagePreview(profileImage)
            }
          } else {
            // Fallback to Clerk data if backend doesn't have it
            const phoneNumber = selfPhoneNumber || user.primaryPhoneNumber?.phoneNumber || ''
            const profileImage = user.imageUrl || ''
            // Parse phone number to extract country code
            const parsedPhone = parsePhoneNumber(phoneNumber)
            setCountryCode(parsedPhone.countryCode)
            setPhoneNumber(parsedPhone.number)
            
            setProfile({
              name: user.fullName || user.firstName || '',
              email: user.primaryEmailAddress?.emailAddress || '',
              phone: phoneNumber,
              profileImage: profileImage
            })
            // Only update imagePreview if we're not currently saving
            if (!isSavingProfile) {
              setImagePreview(profileImage)
            }
          }
        }

        // Load user preferences
        try {
          const preferencesData = await graphqlRequest(GET_USER_PREFERENCES, {}, token)
          if (preferencesData?.userPreferences) {
            const prefs = preferencesData.userPreferences
            if (prefs.notifications) {
              setNotifications(prefs.notifications)
            }
            if (prefs.privacy) {
              setPrivacy(prefs.privacy)
            }
            if (prefs.appearance?.theme) {
              const savedTheme = prefs.appearance.theme as 'light' | 'dark' | 'auto'
              setTheme(savedTheme)
              setThemeGlobal(savedTheme)
            }
          }
        } catch (prefError) {
          console.log('Preferences not found, using defaults')
        }
      } catch (error: any) {
        console.error('Error loading user data:', error)
        toast.error('Failed to load user data')
        // Fallback to Clerk data
        if (user) {
          // Don't use Clerk imageUrl as fallback if user explicitly removed image
          const profileImage = ''
          const phoneNumber = user.primaryPhoneNumber?.phoneNumber || ''
          // Parse phone number to extract country code
          const parsedPhone = parsePhoneNumber(phoneNumber)
          setCountryCode(parsedPhone.countryCode)
          setPhoneNumber(parsedPhone.number)
          
          setProfile({
            name: user.fullName || user.firstName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            phone: phoneNumber,
            profileImage: profileImage
          })
          // Only update imagePreview if we're not currently saving
          if (!isSavingProfile) {
            setImagePreview(profileImage)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userLoaded, user, getToken, userProfile, isSavingProfile])

  const handleSaveSettings = async () => {
    if (!user) {
      toast.error('Please sign in to save settings')
      return
    }

    try {
      setSaving(true)
      const token = await getToken()

      // Save profile if on profile tab
      if (activeTab === 'profile') {
        // Set flag to prevent useEffect from reloading
        setIsSavingProfile(true)
        
        try {
          // Validate name
          if (!profile.name || profile.name.trim().length === 0) {
            toast.error('Name is required')
            setSaving(false)
            setIsSavingProfile(false)
            return
          }

          // Validate phone number - must be exactly 10 digits (excluding country code)
          const phoneDigits = phoneNumber.replace(/\D/g, '') // Remove all non-digits
          if (phoneNumber && phoneDigits.length !== 10) {
            toast.error('Phone number must be exactly 10 digits')
            setSaving(false)
            setIsSavingProfile(false)
            return
          }

          // Handle profile image - use imagePreview (contains base64 data URL if uploaded)
          // IMPORTANT: imagePreview contains the current image (either newly uploaded base64 or existing URL)
          const imageUrl = imagePreview || ''
          
          // Combine country code and phone number
          const fullPhone = phoneDigits ? `${countryCode} ${phoneDigits}`.trim() : ''
          
          console.log('Saving profile with imageUrl:', imageUrl ? `Image present (length: ${imageUrl.length}, starts with: ${imageUrl.substring(0, 30)}...)` : 'No image')
          
          // Save profile to backend
          const updatedProfile = await graphqlRequest(UPDATE_USER_PROFILE, {
            input: {
              name: profile.name.trim(),
              phone: fullPhone,
              profileImage: imageUrl
            }
          }, token)
          
          console.log('Backend response:', updatedProfile?.updateUserProfile)
          console.log('Backend returned profileImage:', updatedProfile?.updateUserProfile?.profileImage ? `Present (${updatedProfile.updateUserProfile.profileImage.substring(0, 30)}...)` : 'Missing or empty')
          
          // Determine the final image URL - prioritize backend response, fallback to what we sent
          let finalImageUrl = imageUrl
          if (updatedProfile?.updateUserProfile?.profileImage) {
            // Backend returned an image - use it
            finalImageUrl = updatedProfile.updateUserProfile.profileImage
            console.log('Using image from backend response')
          } else if (imageUrl) {
            // Backend didn't return image but we sent one - use what we sent
            finalImageUrl = imageUrl
            console.log('Using image we sent (backend may not have returned it)')
          }
          
          console.log('Final image URL:', finalImageUrl ? `Present (length: ${finalImageUrl.length})` : 'No image')
          
          // CRITICAL: Update local state IMMEDIATELY with the image
          // This ensures Settings page shows the image right away
          const updatedName = updatedProfile?.updateUserProfile?.name || profile.name.trim()
          const updatedPhone = updatedProfile?.updateUserProfile?.phone || fullPhone
          
          setProfile({
            name: updatedName,
            email: profile.email,
            phone: updatedPhone,
            profileImage: finalImageUrl
          })
          
          // CRITICAL: Always update imagePreview to match what we're saving
          // This ensures the preview shows the saved image immediately
          setImagePreview(finalImageUrl)
          console.log('Updated local state and imagePreview')
          
          // CRITICAL: Directly update the UserProfileContext immediately
          // This ensures Navigation updates right away without waiting for refresh
          if (updateProfileImage) {
            console.log('Directly updating UserProfileContext with image:', finalImageUrl ? `Present (length: ${finalImageUrl.length})` : 'Empty')
            updateProfileImage(finalImageUrl || '') // Pass empty string if no image
          }
          
          // Update Self family member phone number if it exists
          try {
            const familyData = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
            if (familyData?.familyMembers) {
              const selfMember = familyData.familyMembers.find((member: any) => 
                member.relationship?.toLowerCase() === 'self'
              )
              if (selfMember) {
                const phoneDigits = phoneNumber.replace(/\D/g, '')
                const fullPhone = phoneDigits ? `${countryCode} ${phoneDigits}`.trim() : ''
                const UPDATE_FAMILY_MEMBER = `
                  mutation UpdateFamilyMember($id: ID!, $input: UpdateFamilyMemberInput!) {
                    updateFamilyMember(id: $id, input: $input) {
                      id
                      phone
                    }
                  }
                `
                await graphqlRequest(UPDATE_FAMILY_MEMBER, {
                  id: selfMember.id,
                  input: { phone: fullPhone }
                }, token)
              }
            }
          } catch (err) {
            console.log('Could not update Self family member phone number')
          }
          
          // Clear file after successful save
          setImageFile(null)
          
          // CRITICAL: Update the profile context IMMEDIATELY with the saved image
          // This ensures Navigation and other components update right away
          console.log('Updating profile context with saved image:', finalImageUrl ? 'Image present' : 'No image')
          
          // Wait a moment to ensure backend has saved
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Refresh profile context - this will update Navigation and all components
          console.log('Step 1: Refreshing profile context...')
          await refreshProfile()
          
          // Wait for context to propagate
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Force a second refresh to ensure we have the latest data
          console.log('Step 2: Second refresh to ensure update...')
          await refreshProfile()
          
          // Trigger custom event to force Navigation to update immediately
          if (typeof window !== 'undefined') {
            console.log('Step 3: Dispatching profileUpdated event with image:', finalImageUrl ? 'Present' : 'None')
            window.dispatchEvent(new CustomEvent('profileUpdated', { 
              detail: { profileImage: finalImageUrl } 
            }))
          }
          
          toast.success('Profile updated successfully')
          
          // Reset flag after allowing time for context to update
          setTimeout(() => {
            setIsSavingProfile(false)
          }, 500)
        } catch (saveError: any) {
          console.error('Error saving profile:', saveError)
          toast.error(saveError.message || 'Failed to save profile')
          setIsSavingProfile(false)
        }
      }

      // Save preferences
      const preferencesToSave: any = {}
      
      if (activeTab === 'notifications') {
        preferencesToSave.notifications = notifications
      } else if (activeTab === 'privacy') {
        preferencesToSave.privacy = privacy
      } else       if (activeTab === 'appearance') {
        preferencesToSave.appearance = { theme }
        // Apply theme immediately
        setThemeGlobal(theme)
      } else if (activeTab === 'profile') {
        // Save all preferences when saving profile
        preferencesToSave.notifications = notifications
        preferencesToSave.privacy = privacy
        preferencesToSave.appearance = { theme }
        // Apply theme immediately
        setThemeGlobal(theme)
      }

      if (Object.keys(preferencesToSave).length > 0) {
        await graphqlRequest(UPDATE_USER_PREFERENCES, {
          preferences: preferencesToSave
        }, token)
        
        if (activeTab !== 'profile') {
          toast.success('Settings saved successfully')
        }
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!userLoaded || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-8">
      <Navigation />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <SettingsIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your account preferences and privacy settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              // Only allow digits and spaces, limit to 10 digits
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                              setPhoneNumber(value)
                            }}
                            placeholder="9876543210"
                            maxLength={10}
                            className="w-full flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Phone number must be exactly 10 digits</p>
                      </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"%3E%3C/path%3E%3Ccircle cx="12" cy="7" r="4"%3E%3C/circle%3E%3C/svg%3E'
                                }}
                              />
                            ) : (
                              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          {imagePreview && (
                            <button
                              onClick={() => {
                                // Clear image preview and profile image
                                setImagePreview('')
                                setProfile({ ...profile, profileImage: '' })
                                setImageFile(null)
                                // Immediately save the removal to backend
                                const saveImageRemoval = async () => {
                                  try {
                                    const token = await getToken()
                                    if (token) {
                                      await graphqlRequest(UPDATE_USER_PROFILE, {
                                        input: {
                                          name: profile.name,
                                          phone: profile.phone,
                                          profileImage: '' // Explicitly set to empty string
                                        }
                                      }, token)
                                      // Refresh profile context to update everywhere
                                      await refreshProfile()
                                      toast.success('Profile image removed')
                                    }
                                  } catch (error) {
                                    console.error('Error removing profile image:', error)
                                    toast.error('Failed to remove profile image')
                                  }
                                }
                                saveImageRemoval()
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                              title="Remove profile image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
                            <Camera className="w-4 h-4 mr-2" />
                            {imagePreview ? 'Change Image' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  // Validate file size (5MB max)
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast.error('Image size must be less than 5MB')
                                    return
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    toast.error('Please select a valid image file')
                                    return
                                  }
                                  
                                  setImageFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    const result = reader.result as string
                                    console.log('Image loaded, size:', result.length, 'bytes')
                                    setImagePreview(result)
                                    setProfile({ ...profile, profileImage: result })
                                  }
                                  reader.onerror = () => {
                                    toast.error('Failed to load image')
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {key === 'push' && <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            {key === 'email' && <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            {key === 'sms' && <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            {key === 'reminders' && <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            {key === 'healthAlerts' && <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            {key === 'weeklyReports' && <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                        <div className="flex space-x-4">
                          {(['light', 'dark', 'auto'] as const).map((themeOption) => (
                            <button
                              key={themeOption}
                              onClick={async () => {
                                setTheme(themeOption)
                                await setThemeGlobal(themeOption)
                                // Save immediately to backend
                                try {
                                  const token = await getToken()
                                  if (token) {
                                    await graphqlRequest(UPDATE_USER_PREFERENCES, {
                                      preferences: {
                                        appearance: { theme: themeOption }
                                      }
                                    }, token)
                                  }
                                } catch (error) {
                                  console.error('Failed to save theme:', error)
                                }
                              }}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                theme === themeOption
                                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
                        <p className="text-sm text-gray-600 mb-3">Download all your health data</p>
                        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Import Data</h3>
                        <p className="text-sm text-gray-600 mb-3">Import health data from other sources</p>
                        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </button>
                      </div>
                      
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
                        <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
