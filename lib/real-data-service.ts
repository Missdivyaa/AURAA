// Client-side service that calls API routes instead of using Prisma directly

export interface CreateFamilyMemberInput {
  name: string
  email?: string
  phone?: string
  dob: string
  gender: string
  relationship: string
  bloodType?: string
  height?: number
  weight?: number
  conditions?: string[]
  allergies?: string[]
  emergencyContacts?: any
  insurance?: any
  doctor?: any
}

export interface CreateHealthReportInput {
  fileName: string
  fileType: string
  fileUrl: string
  fileSize?: number
  memberId?: string
}

export interface CreateAppointmentInput {
  doctorName: string
  specialty: string
  hospital?: string
  date: string
  time: string
  notes?: string
  memberId?: string
}

export interface CreateMedicationInput {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  sideEffects?: string[]
  reminders?: any
  memberId?: string
}

export interface CreateReminderInput {
  title: string
  description?: string
  type: string
  date: string
  time: string
  frequency: string
  priority?: string
  notifications?: any
  memberId?: string
}

export class RealDataService {
  // Family Members
  async createFamilyMember(userId: string, data: CreateFamilyMemberInput): Promise<any> {
    const response = await fetch('/api/family-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create family member')
    }

    return await response.json()
  }

  async getFamilyMembers(userId: string): Promise<any[]> {
    const response = await fetch(`/api/family-members?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch family members')
    }

    return await response.json()
  }

  async updateFamilyMember(id: string, data: Partial<CreateFamilyMemberInput>): Promise<any> {
    const response = await fetch(`/api/family-members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update family member')
    }

    return await response.json()
  }

  async deleteFamilyMember(id: string): Promise<void> {
    const response = await fetch(`/api/family-members/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete family member')
    }
  }

  // TODO: Add other API routes for health reports, appointments, medications, reminders, AI insights
}

export const realDataService = new RealDataService()
