import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/family-members - Get all family members for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 Fetching family members for userId:', userId)

    // Filter by userId if provided
    const whereClause = userId ? { userId } : undefined
    const members = await prisma.familyMember.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        medications: true,
        appointments: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 1
        }
      }
    })

    const familyMembers = members.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      name: m.name,
      email: m.email,
      phone: m.phone,
      dob: m.dob,
      gender: m.gender,
      relationship: m.relationship,
      bloodType: m.bloodType,
      height: m.height,
      weight: m.weight,
      conditions: m.conditions,
      allergies: m.allergies,
      emergencyContacts: m.emergencyContacts,
      insurance: m.insurance,
      doctor: m.doctor,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      medications: Array.isArray(m.medications) ? m.medications.length : 0,
      nextAppointment: m.appointments && m.appointments[0] ? m.appointments[0].date.toISOString() : ''
    }))

    console.log('👥 Found family members:', familyMembers.length)

    return NextResponse.json(familyMembers)
  } catch (error) {
    console.error('❌ Error fetching family members:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch family members',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/family-members - Create a new family member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, relationship, dob, gender, email, phone, bloodType, height, weight, conditions, allergies, emergencyContacts, insurance, doctor } = body

    console.log('➕ Creating family member:', name)

    if (!userId) {
      throw new Error('userId is required')
    }

    // Ensure a user exists for the provided userId
    let existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      // Create a lightweight user record so foreign key constraint passes
      existingUser = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`,
          name: 'Demo User'
        }
      })
    }

    // Validate and parse the date
    const parsedDob = dob ? new Date(dob) : new Date()
    if (isNaN(parsedDob.getTime())) {
      throw new Error('Invalid date format for date of birth')
    }

    const familyMember = await prisma.familyMember.create({
      data: {
        userId: existingUser.id,
        name,
        relationship,
        dob: parsedDob,
        gender: gender || 'Unknown',
        email,
        phone,
        bloodType,
        height,
        weight,
        conditions: Array.isArray(conditions) ? conditions : [],
        allergies: Array.isArray(allergies) ? allergies : [],
        emergencyContacts: emergencyContacts || {},
        insurance: insurance || {},
        doctor: doctor || {}
      }
    })

    console.log('✅ Family member created:', familyMember.name)
    return NextResponse.json(familyMember, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating family member:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create family member',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}