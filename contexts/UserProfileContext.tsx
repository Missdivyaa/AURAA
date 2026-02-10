'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { graphqlRequest } from '@/lib/graphql-client'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  profileImage: string
}

interface UserProfileContextType {
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  updateProfileImage: (imageUrl: string) => void // Direct update function
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

const GET_USER_PROFILE = `
  query GetUserProfile {
    me {
      id
      name
      email
      phone
      profileImage
    }
  }
`

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    if (!userLoaded || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        // Fallback to Clerk data
        setProfile({
          id: user.id,
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          profileImage: user.imageUrl || ''
        })
        setLoading(false)
        return
      }

      const profileData = await graphqlRequest(GET_USER_PROFILE, {}, token)
      
      if (profileData?.me) {
        const userData = profileData.me
        // Use profileImage from backend if property exists
        // If profileImage is null/undefined, fallback to Clerk
        // If profileImage is empty string, use empty string (explicitly removed)
        // If profileImage has value, use it
        let profileImage = ''
        // Check if profileImage property exists in the response
        if ('profileImage' in userData) {
          // Property exists - use its value
          // null/undefined means not set, empty string means explicitly removed
          if (userData.profileImage !== null && userData.profileImage !== undefined) {
            profileImage = userData.profileImage
          } else {
            // null/undefined - fallback to Clerk
            profileImage = user.imageUrl || ''
          }
        } else {
          // Property doesn't exist in response - fallback to Clerk
          profileImage = user.imageUrl || ''
        }
        
        console.log('UserProfileContext: Loaded profileImage from backend:', profileImage ? `Image present (length: ${profileImage.length}, starts: ${profileImage.substring(0, 30)}...)` : 'No image')
        
        // Always update the profile state - this triggers re-renders in all consumers
        const newProfile = {
          id: userData.id,
          name: userData.name || user.fullName || user.firstName || '',
          email: userData.email || user.primaryEmailAddress?.emailAddress || '',
          phone: userData.phone || user.primaryPhoneNumber?.phoneNumber || '',
          profileImage: profileImage
        }
        
        setProfile(newProfile)
        console.log('UserProfileContext: Profile state updated, profileImage:', newProfile.profileImage ? `Present (${newProfile.profileImage.substring(0, 30)}...)` : 'None')
      } else {
        // Fallback to Clerk data
        setProfile({
          id: user.id,
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          profileImage: user.imageUrl || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to Clerk data
      if (user) {
        setProfile({
          id: user.id,
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          profileImage: user.imageUrl || ''
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [userLoaded, user, getToken])

  const refreshProfile = async () => {
    console.log('UserProfileContext: Refreshing profile...')
    await loadProfile()
    console.log('UserProfileContext: Profile refreshed, current profileImage:', profile?.profileImage ? `Present (${profile.profileImage.substring(0, 30)}...)` : 'None')
  }

  // Direct update function to immediately update profile image without reloading
  const updateProfileImage = (imageUrl: string) => {
    console.log('UserProfileContext: Directly updating profileImage to:', imageUrl ? `Present (length: ${imageUrl.length}, starts: ${imageUrl.substring(0, 30)}...)` : 'Empty')
    setProfile(prevProfile => {
      if (!prevProfile) {
        console.log('UserProfileContext: No profile to update')
        return prevProfile
      }
      // Create a completely new object to ensure React detects the change
      const updated = {
        id: prevProfile.id,
        name: prevProfile.name,
        email: prevProfile.email,
        phone: prevProfile.phone,
        profileImage: imageUrl // This is the key change
      }
      console.log('UserProfileContext: Profile image updated directly, new profileImage:', updated.profileImage ? `Present (length: ${updated.profileImage.length})` : 'Empty')
      console.log('UserProfileContext: Old vs New image same?', prevProfile.profileImage === updated.profileImage)
      return updated
    })
  }

  return (
    <UserProfileContext.Provider value={{ profile, loading, refreshProfile, updateProfileImage }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}
