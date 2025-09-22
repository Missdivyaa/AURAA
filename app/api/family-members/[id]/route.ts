import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/family-members/[id] - Update a family member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, relationship, dob, gender, email, phone, bloodType, height, weight, conditions, allergies, emergencyContacts, insurance, doctor } = body

    // Validate and parse the date
    const parsedDob = dob ? new Date(dob) : undefined
    if (parsedDob && isNaN(parsedDob.getTime())) {
      throw new Error('Invalid date format for date of birth')
    }

    const familyMember = await prisma.familyMember.update({
      where: { id: params.id },
      data: {
        name,
        relationship,
        ...(parsedDob && { dob: parsedDob }),
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

    return NextResponse.json(familyMember)
  } catch (error) {
    console.error('Error updating family member:', error)
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    )
  }
}

// DELETE /api/family-members/[id] - Delete a family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.familyMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting family member:', error)
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    )
  }
}