// Hybrid data service that works with both real API and fallback data
// This ensures the app works even when database is not set up

import { FamilyMember } from '@/lib/client-data-service'
import { apiService } from '@/lib/real-api-service'
import { sqliteDatabase } from '@/lib/sqlite-database'
import { getAllMyFamilyMembers, updateFamilyMember, addNewFamilyMember, removeFamilyMember } from '@/lib/my-family-data'

export class HybridDataService {
  private static instance: HybridDataService
  private useRealAPI: boolean = false
  private fallbackData: FamilyMember[] = []

  private constructor() {
    this.initializeFallbackData()
  }

  public static getInstance(): HybridDataService {
    if (!HybridDataService.instance) {
      HybridDataService.instance = new HybridDataService()
    }
    return HybridDataService.instance
  }

  private initializeFallbackData() {
    // Convert the existing family data to the expected format
    const realFamilyMembers = getAllMyFamilyMembers()
    this.fallbackData = realFamilyMembers.map(member => ({
      id: member.id,
      name: member.name,
      age: member.age,
      relationship: member.relationship,
      avatar: member.avatar,
      healthScore: member.healthScore,
      lastCheckup: member.lastCheckup,
      nextAppointment: member.nextAppointment,
      medications: member.medications.length,
      conditions: member.conditions.map(c => c.name),
      status: member.status
    }))
  }

  // Test if real API is available
  private async testAPI(): Promise<boolean> {
    try {
      await apiService.familyMembers.getAll('demo-user-123')
      return true
    } catch (error) {
      console.log('Real API not available, using SQLite database')
      return false
    }
  }

  // Get all family members
  async getAllFamilyMembers(userId?: string): Promise<FamilyMember[]> {
    try {
      console.log('🔄 Hybrid service: Loading all family members...')
      
      // Try real API first
      this.useRealAPI = await this.testAPI()
      
      if (this.useRealAPI) {
        const members = await apiService.familyMembers.getAll(userId || 'demo-user-123')
        // Update fallback data for offline use
        this.fallbackData = members
        localStorage.setItem('auraa_members', JSON.stringify(members))
        console.log('✅ Hybrid service: Loaded from real API:', members.length, 'members')
        return members
      } else {
        // Use SQLite database
        const members = await sqliteDatabase.getAllFamilyMembers(userId || 'demo-user-123')
        // Always sync with SQLite data to ensure consistency
        this.fallbackData = members
        localStorage.setItem('auraa_members', JSON.stringify(members))
        console.log('✅ Hybrid service: Loaded from SQLite:', members.length, 'members')
        return members
      }
    } catch (error) {
      console.error('❌ Hybrid service: Error loading family members:', error)
      // Fallback to SQLite
      const members = await sqliteDatabase.getAllFamilyMembers(userId || 'demo-user-123')
      this.fallbackData = members
      localStorage.setItem('auraa_members', JSON.stringify(members))
      console.log('✅ Hybrid service: Loaded from fallback SQLite:', members.length, 'members')
      return members
    }
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
    try {
      console.log('🔄 Creating family member via hybrid service:', data.name)
      
      if (this.useRealAPI) {
        const newMember = await apiService.familyMembers.create(data, userId || 'demo-user-123')
        console.log('✅ Created via real API:', newMember.name)
        return newMember
      } else {
        // Create in SQLite database
        const newMember = await sqliteDatabase.createFamilyMember({
          ...data,
          age: data.age
        }, userId || 'demo-user-123')
        
        console.log('✅ Created via SQLite:', newMember.name)
        return newMember
      }
    } catch (error) {
      console.error('❌ Error creating family member:', error)
      // Fallback to SQLite
      const newMember = await sqliteDatabase.createFamilyMember({
        ...data,
        age: data.age
      }, userId || 'demo-user-123')
      
      console.log('✅ Created via fallback SQLite:', newMember.name)
      return newMember
    }
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
    try {
      if (this.useRealAPI) {
        await apiService.familyMembers.update(data)
      } else {
        // Update in SQLite database
        await sqliteDatabase.updateFamilyMember(data)
      }
      
      // Update fallback data regardless
      const memberIndex = this.fallbackData.findIndex(m => m.id === data.id)
      if (memberIndex !== -1) {
        this.fallbackData[memberIndex] = {
          ...this.fallbackData[memberIndex],
          ...data,
          status: data.healthScore ? this.getHealthStatus(data.healthScore) : this.fallbackData[memberIndex].status
        }
        localStorage.setItem('auraa_members', JSON.stringify(this.fallbackData))
      }
    } catch (error) {
      console.error('Error updating family member:', error)
      // Fallback to SQLite
      await sqliteDatabase.updateFamilyMember(data)
    }
  }

  // Delete family member
  async deleteFamilyMember(id: string): Promise<void> {
    try {
      if (this.useRealAPI) {
        await apiService.familyMembers.delete(id)
      } else {
        // Delete from SQLite database
        await sqliteDatabase.deleteFamilyMember(id)
      }
      
      // Remove from fallback data regardless
      this.fallbackData = this.fallbackData.filter(m => m.id !== id)
      localStorage.setItem('auraa_members', JSON.stringify(this.fallbackData))
    } catch (error) {
      console.error('Error deleting family member:', error)
      // Fallback to SQLite
      await sqliteDatabase.deleteFamilyMember(id)
      this.fallbackData = this.fallbackData.filter(m => m.id !== id)
    }
  }

  // Helper function to get health status
  private getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    return 'poor'
  }

  // Get current data source
  getDataSource(): 'api' | 'sqlite' | 'fallback' {
    if (this.useRealAPI) return 'api'
    return 'sqlite'
  }
}

// Export singleton instance
export const hybridDataService = HybridDataService.getInstance()
