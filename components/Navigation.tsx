'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
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
  UserPlus
} from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Heart },
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'AI Insights', href: '/ai-insights', icon: Brain },
    { name: 'Reminders', href: '/reminders', icon: Bell },
    { name: 'Emergency ID', href: '/emergency-id', icon: QrCode },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
            <span className="text-xl font-bold text-gray-900">AURAA</span>
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
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm">Sign In</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Get Started</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
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
            className="md:hidden border-t border-gray-200 bg-white"
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
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
              
              <div className="pt-2 border-t border-gray-200 space-y-1 mx-2">
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Get Started</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
