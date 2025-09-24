import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create AI insights records
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, memberId, insights } = body || {}
    if (!userId || !Array.isArray(insights)) {
      return NextResponse.json({ error: 'userId and insights[] required' }, { status: 400 })
    }

    const created = [] as any[]
    for (const i of insights) {
      const rec = await prisma.aIInsight.create({
        data: {
          userId,
          memberId: memberId || null,
          type: i.type || 'recommendation',
          title: i.title || 'AI Insight',
          description: i.description || '',
          severity: i.severity || 'low',
          category: i.category || 'general',
          data: i.data || {},
          actionItems: i.actionItems || {}
        }
      })
      created.push(rec)
    }
    return NextResponse.json({ ok: true, created })
  } catch (e) {
    console.error('Error creating AI insights', e)
    return NextResponse.json({ error: 'Failed to create insights' }, { status: 500 })
  }
}










