'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { graphqlRequest } from '@/lib/graphql-client'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const GET_USER_PREFERENCES = `
  query GetUserPreferences {
    userPreferences
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

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode, initialTheme?: Theme }) {
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken } = useAuth()
  const [theme, setThemeState] = useState<Theme>(initialTheme || 'light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [isLoadingTheme, setIsLoadingTheme] = useState(true)

  // Load theme from backend preferences first, then localStorage as fallback
  useEffect(() => {
    const loadTheme = async () => {
      // First, try to load from localStorage immediately (for instant UI)
      const localTheme = localStorage.getItem('theme') as Theme | null
      if (localTheme) {
        setThemeState(localTheme)
        // Apply theme immediately
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        if (localTheme === 'auto') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          root.classList.add(systemPrefersDark ? 'dark' : 'light')
          setResolvedTheme(systemPrefersDark ? 'dark' : 'light')
        } else {
          root.classList.add(localTheme)
          setResolvedTheme(localTheme)
        }
      }

      // Then, if user is logged in, load from backend and override localStorage
      if (userLoaded && user) {
        try {
          const token = await getToken()
          if (token) {
            const preferencesData = await graphqlRequest(GET_USER_PREFERENCES, {}, token)
            if (preferencesData?.userPreferences?.appearance?.theme) {
              const backendTheme = preferencesData.userPreferences.appearance.theme as Theme
              setThemeState(backendTheme)
              // Sync localStorage with backend
              localStorage.setItem('theme', backendTheme)
              // Apply theme immediately
              const root = window.document.documentElement
              root.classList.remove('light', 'dark')
              if (backendTheme === 'auto') {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                root.classList.add(systemPrefersDark ? 'dark' : 'light')
                setResolvedTheme(systemPrefersDark ? 'dark' : 'light')
              } else {
                root.classList.add(backendTheme)
                setResolvedTheme(backendTheme)
              }
            }
          }
        } catch (error) {
          console.log('Could not load theme from backend, using localStorage')
        }
      }
      setIsLoadingTheme(false)
    }

    loadTheme()
  }, [userLoaded, user, getToken])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Determine resolved theme
    let resolved: 'light' | 'dark' = 'light'
    
    if (theme === 'auto') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      resolved = systemPrefersDark ? 'dark' : 'light'
    } else {
      resolved = theme
    }
    
    setResolvedTheme(resolved)
    root.classList.add(resolved)
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      const resolved = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      root.classList.add(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    // Save to localStorage immediately
    localStorage.setItem('theme', newTheme)
    
    // Save to backend if user is logged in
    if (userLoaded && user) {
      try {
        const token = await getToken()
        if (token) {
          await graphqlRequest(UPDATE_USER_PREFERENCES, {
            preferences: {
              appearance: { theme: newTheme }
            }
          }, token)
        }
      } catch (error) {
        console.error('Failed to save theme to backend:', error)
        // Theme is still saved to localStorage, so it will persist
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
