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
        setProfile({
          id: userData.id,
          name: userData.name || user.fullName || user.firstName || '',
          email: userData.email || user.primaryEmailAddress?.emailAddress || '',
          phone: userData.phone || user.primaryPhoneNumber?.phoneNumber || '',
          profileImage: userData.profileImage || user.imageUrl || ''
        })
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
    await loadProfile()
  }

  return (
    <UserProfileContext.Provider value={{ profile, loading, refreshProfile }}>
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
