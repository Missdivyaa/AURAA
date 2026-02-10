'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { 
  Menu, 
  X, 
  Heart, 
  Shield, 
  Brain, 
  Users, 
  Bell, 
  QrCode,
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileImageKey, setProfileImageKey] = useState(0) // Force re-render when image changes
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const { profile: userProfile } = useUserProfile()
  
  // Use profile image from backend if it exists and is not empty, otherwise fallback to Clerk
  // Check if profileImage is a non-empty string (base64 data URL or URL)
  // Use useMemo to ensure this recalculates when userProfile changes
  const profileImage = useMemo(() => {
    const backendImage = userProfile?.profileImage && userProfile.profileImage.trim().length > 0
      ? userProfile.profileImage
      : null
    const image = backendImage || user?.imageUrl || ''
    return image
  }, [userProfile?.profileImage, user?.imageUrl]) // Only depend on actual data, not the key

  const displayName = userProfile?.name || user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'

  // Update key when profileImage actually changes (to force img tag re-render)
  // Use a ref to track previous value and prevent infinite loops
  const prevProfileImageRef = useRef<string | undefined>(undefined)
  
  useEffect(() => {
    const currentImage = userProfile?.profileImage
    // Only update if the value actually changed
    if (currentImage !== prevProfileImageRef.current) {
      prevProfileImageRef.current = currentImage
      console.log('Navigation: profileImage changed:', currentImage ? `Present (${currentImage.substring(0, 30)}...)` : 'None')
      // Update key to force img tag re-render
      setProfileImageKey(prev => prev + 1)
    }
  }, [userProfile?.profileImage]) // Only depend on the actual profileImage value
  
  // Listen for custom profile update events to force immediate update
  useEffect(() => {
    const handleProfileUpdate = (event: any) => {
      console.log('Navigation: Received profileUpdated event')
      if (event.detail?.profileImage) {
        console.log('Navigation: Event contains image, forcing refresh')
      }
      // Force re-render by updating the key
      setProfileImageKey(prev => prev + 1)
      // Also force a small delay to ensure context has updated
      setTimeout(() => {
        setProfileImageKey(prev => prev + 1)
      }, 100)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('profileUpdated', handleProfileUpdate as EventListener)
      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener)
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Heart },
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain },
    { name: 'Reminders', href: '/reminders', icon: Bell },
    { name: 'Emergency ID', href: '/emergency-id', icon: QrCode },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AURAA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm leading-none">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoaded && isSignedIn && user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300">
                  {profileImage ? (
                    <img 
                      key={`profile-img-${profileImageKey}-${profileImage.substring(0, 20)}`}
                      src={profileImage} 
                      alt={displayName} 
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        // If image fails to load, hide it and show placeholder
                        console.error('Navigation: Image failed to load:', profileImage.substring(0, 50))
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Navigation: Image loaded successfully')
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {displayName}
                  </span>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm">Sign In</span>
                </Link>
                <Link
                  href="/login?signup=true"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setIsOpen(false)
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1 mx-2">
                {isLoaded && isSignedIn && user ? (
                  <>
                    {/* User Info Mobile */}
                    <div className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300">
                      {profileImage ? (
                        <img 
                          key={`profile-img-mobile-${profileImageKey}-${profileImage.substring(0, 20)}`}
                          src={profileImage}
                          onError={(e) => {
                            console.error('Navigation Mobile: Image failed to load:', profileImage.substring(0, 50))
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('Navigation Mobile: Image loaded successfully')
                          }} 
                          alt={displayName} 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            // If image fails to load, hide it and show placeholder
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {displayName}
                        </p>
                        {userProfile?.email && displayName !== userProfile.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile.email}</p>
                        )}
                      </div>
                    </div>
                    {/* Logout Button Mobile */}
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/login?signup=true"
                      className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Get Started</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
