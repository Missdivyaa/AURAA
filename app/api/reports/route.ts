import { NextRequest, NextResponse } from 'next/server'
import { realDataService } from '@/lib/real-data-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const memberId = searchParams.get('memberId')
    
    const reports = await realDataService.getHealthReports(userId, memberId || undefined)
    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching health reports:', error)
    return NextResponse.json({ error: 'Failed to fetch health reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string || 'demo-user'
    const fileName = formData.get('fileName') as string
    const fileType = formData.get('fileType') as string
    const fileUrl = formData.get('fileUrl') as string
    const fileSize = formData.get('fileSize') ? parseInt(formData.get('fileSize') as string) : undefined
    const memberId = formData.get('memberId') as string || undefined
    
    const report = await realDataService.createHealthReport(userId, {
      fileName,
      fileType,
      fileUrl,
      fileSize,
      memberId,
    })
    
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating health report:', error)
    return NextResponse.json({ error: 'Failed to create health report' }, { status: 500 })
  }
}

