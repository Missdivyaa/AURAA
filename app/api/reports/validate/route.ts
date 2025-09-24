import { NextRequest, NextResponse } from 'next/server'

// Very light server-side validation stub (no file upload handling here).
// Expects JSON: { text: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = body?.text || ''
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ ok: false, reason: 'No text provided' }, { status: 400 })
    }

    const medicalTerms = [
      'hemoglobin','cholesterol','glucose','cbc','blood','platelets','wbc','rbc',
      'prescription','diagnosis','patient','doctor','hospital','mg/dl','mmhg',
      'vitamin','thyroid','tsh','t4','dosage','tablet','capsule','x-ray','mri','ct',
      'ultrasound','report','scan','lab','urine','serum','disease','hypertension',
      'diabetes','metformin','lisinopril','antibiotic','bp','pulse','appointment'
    ]
    const lower = text.toLowerCase()
    let hits = 0
    for (const term of medicalTerms) if (lower.includes(term)) hits++
    const lenWeight = Math.min(1, lower.length / 500)
    const base = hits / Math.min(medicalTerms.length, 40)
    const score = Math.max(0, Math.min(1, base * 0.8 + lenWeight * 0.2))

    const valid = score >= 0.35
    return NextResponse.json({ ok: true, valid, score, hits })
  } catch (e) {
    return NextResponse.json({ ok: false, reason: 'Validation error' }, { status: 500 })
  }
}





