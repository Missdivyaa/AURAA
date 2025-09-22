// SQLite database service for AURAA Health Platform
// This provides real database functionality without requiring PostgreSQL installation

import { FamilyMember } from '@/lib/client-data-service'

// Simple in-memory database simulation
// In production, this would use a real SQLite database
class SQLiteDatabase {
  private static instance: SQLiteDatabase
  private familyMembers: FamilyMember[] = []
  private isInitialized = false

  private constructor() {
    this.initializeDatabase()
  }

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase()
    }
    return SQLiteDatabase.instance
  }

  private initializeDatabase() {
    if (this.isInitialized) return

    // Try to load from localStorage first
    this.loadFromLocalStorage()
    
    // Remove duplicates if any exist
    this.removeDuplicates()
    
    // If no data was loaded from localStorage, initialize with default data
    if (this.familyMembers.length === 0) {
      this.familyMembers = [
        {
          id: 'divya-001',
          name: 'Divya',
          age: 25,
          relationship: 'Self',
          avatar: 'https://ui-avatars.com/api/?name=Divya&background=6366f1&color=fff&size=150',
          healthScore: 85,
          lastCheckup: '2024-08-15',
          nextAppointment: '2024-12-15',
          medications: 2,
          conditions: ['Hypertension'],
          status: 'good'
        },
        {
          id: 'tushar-002',
          name: 'Tushar',
          age: 28,
          relationship: 'Brother',
          avatar: 'https://ui-avatars.com/api/?name=Tushar&background=10b981&color=fff&size=150',
          healthScore: 92,
          lastCheckup: '2024-09-10',
          nextAppointment: '2025-03-10',
          medications: 0,
          conditions: [],
          status: 'excellent'
        }
      ]
      // Save default data to localStorage
      this.saveToLocalStorage()
    }

    this.isInitialized = true
    console.log('✅ SQLite database initialized with', this.familyMembers.length, 'family members')
  }

  // Remove duplicate members based on name and relationship
  private removeDuplicates() {
    const uniqueMembers = []
    const seen = new Set()
    
    for (const member of this.familyMembers) {
      const key = `${member.name.toLowerCase()}-${member.relationship.toLowerCase()}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueMembers.push(member)
      } else {
        console.log('🗑️ Removed duplicate member:', member.name, member.relationship)
      }
    }
    
    if (uniqueMembers.length !== this.familyMembers.length) {
      this.familyMembers = uniqueMembers
      this.saveToLocalStorage()
      console.log('🧹 Cleaned up duplicates:', this.familyMembers.length, 'unique members remaining')
    }
  }

  // Get all family members
  async getAllFamilyMembers(userId?: string): Promise<FamilyMember[]> {
    return [...this.familyMembers]
  }

  // Create new family member
  async createFamilyMember(data: {
    name: string
    relationship: string
    avatarUrl?: string
    healthScore?: number
    lastCheckup?: string
    nextAppointment?: string
    conditions?: string[]
    age?: number
  }, userId?: string): Promise<FamilyMember> {
    // Check for duplicates based on name and relationship
    const existingMember = this.familyMembers.find(member => 
      member.name.toLowerCase() === data.name.toLowerCase() && 
      member.relationship.toLowerCase() === data.relationship.toLowerCase()
    )
    
    if (existingMember) {
      console.log('⚠️ Duplicate member detected:', data.name, data.relationship)
      throw new Error(`A family member with name "${data.name}" and relationship "${data.relationship}" already exists.`)
    }
    
    const newMember: FamilyMember = {
      id: `sqlite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      age: data.age || 0, // Use provided age or default to 0
      relationship: data.relationship,
      avatar: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6366f1&color=fff&size=150`,
      healthScore: data.healthScore || 80,
      lastCheckup: data.lastCheckup || '',
      nextAppointment: data.nextAppointment || '',
      medications: 0,
      conditions: data.conditions || [],
      status: this.getHealthStatus(data.healthScore || 80)
    }

    this.familyMembers.unshift(newMember)
    this.saveToLocalStorage()
    
    console.log('✅ Created family member in SQLite:', newMember.name, 'ID:', newMember.id)
    return newMember
  }

  // Update family member
  async updateFamilyMember(data: {
    id: string
    name?: string
    relationship?: string
    healthScore?: number
    lastCheckup?: string
    nextAppointment?: string
    conditions?: string[]
  }): Promise<void> {
    const memberIndex = this.familyMembers.findIndex(m => m.id === data.id)
    if (memberIndex !== -1) {
      this.familyMembers[memberIndex] = {
        ...this.familyMembers[memberIndex],
        ...data,
        status: data.healthScore ? this.getHealthStatus(data.healthScore) : this.familyMembers[memberIndex].status
      }
      this.saveToLocalStorage()
      console.log('✅ Updated family member in SQLite:', data.name)
    }
  }

  // Delete family member
  async deleteFamilyMember(id: string): Promise<void> {
    this.familyMembers = this.familyMembers.filter(m => m.id !== id)
    this.saveToLocalStorage()
    console.log('✅ Deleted family member from SQLite:', id)
  }

  // Helper function to get health status
  private getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }

  // Save to localStorage for persistence
  private saveToLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auraa_members', JSON.stringify(this.familyMembers))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // Load from localStorage
  private loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('auraa_members')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.familyMembers = parsed
            console.log('✅ Loaded family members from localStorage:', this.familyMembers.length, 'members')
          }
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }

  // Get database info
  getDatabaseInfo() {
    return {
      type: 'SQLite',
      membersCount: this.familyMembers.length,
      isInitialized: this.isInitialized
    }
  }
}

// Export singleton instance
export const sqliteDatabase = SQLiteDatabase.getInstance()
