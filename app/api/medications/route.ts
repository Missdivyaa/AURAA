import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const memberId = searchParams.get('memberId') || undefined

    const medications = await prisma.medication.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(memberId ? { memberId } : {})
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, memberId, name, dosage, frequency, startDate, endDate, sideEffects, reminders, status } = body

    if (!userId) throw new Error('userId is required')
    if (!name || !dosage || !frequency || !startDate) throw new Error('Missing required fields')

    const medication = await prisma.medication.create({
      data: {
        userId,
        memberId: memberId || null,
        name,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        sideEffects: Array.isArray(sideEffects) ? sideEffects : [],
        reminders: reminders || {},
        status: status || 'active'
      }
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
  }
}

