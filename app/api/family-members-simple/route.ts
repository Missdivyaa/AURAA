import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/family-members-simple - Get all family members (simple version)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Simple API: Fetching all family members...')
    
    // Get all family members without filtering by userId
    const familyMembers = await prisma.familyMember.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('👥 Simple API: Found family members:', familyMembers.length)

    return NextResponse.json(familyMembers)
  } catch (error) {
    console.error('❌ Simple API: Error fetching family members:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch family members',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

