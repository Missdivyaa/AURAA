import { NextRequest, NextResponse } from 'next/server'
import { realDataService } from '@/lib/real-data-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const memberId = searchParams.get('memberId')
    
    const appointments = await realDataService.getAppointments(userId, memberId || undefined)
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user'
    
    const appointment = await realDataService.createAppointment(userId, body)
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}









