// Mock API service for local development
// This simulates a real API service but works with local data

import { FamilyMember } from '@/lib/client-data-service'
import { sqliteDatabase } from '@/lib/sqlite-database'

export class MockAPIService {
  familyMembers = {
    async getAll(userId: string): Promise<FamilyMember[]> {
      console.log('🔄 Mock API: Getting all family members for user:', userId)
      // For now, always throw an error to force fallback to SQLite
      throw new Error('Mock API not available - using SQLite fallback')
    },

    async create(data: any, userId: string): Promise<FamilyMember> {
      console.log('🔄 Mock API: Creating family member:', data.name)
      // For now, always throw an error to force fallback to SQLite
      throw new Error('Mock API not available - using SQLite fallback')
    },

    async update(data: any): Promise<void> {
      console.log('🔄 Mock API: Updating family member:', data.id)
      // For now, always throw an error to force fallback to SQLite
      throw new Error('Mock API not available - using SQLite fallback')
    },

    async delete(id: string): Promise<void> {
      console.log('🔄 Mock API: Deleting family member:', id)
      // For now, always throw an error to force fallback to SQLite
      throw new Error('Mock API not available - using SQLite fallback')
    }
  }
}

// Export singleton instance
export const apiService = new MockAPIService()

