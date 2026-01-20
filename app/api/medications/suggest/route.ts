import { NextRequest, NextResponse } from 'next/server'

interface MedicationSuggestion {
  name: string
  commonDosages: string[]
  description?: string
}

/**
 * Smart medication suggestion API
 * Uses multiple strategies:
 * 1. OpenAI API (if available) for intelligent suggestions
 * 2. RxNorm API (free) for medication data
 * 3. Fallback to common medications database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions: MedicationSuggestion[] = []

    // Strategy 1: Try OpenAI API if available
    const openAiKey = process.env.OPENAI_API_KEY
    if (openAiKey) {
      try {
        const aiSuggestions = await getAIMedicationSuggestions(query, openAiKey, limit)
        if (aiSuggestions.length > 0) {
          return NextResponse.json({ suggestions: aiSuggestions })
        }
      } catch (error) {
        console.error('OpenAI suggestion error:', error)
        // Fall through to other strategies
      }
    }

    // Strategy 2: Try RxNorm API (free, no key required)
    try {
      const rxNormSuggestions = await getRxNormSuggestions(query, limit)
      if (rxNormSuggestions.length > 0) {
        return NextResponse.json({ suggestions: rxNormSuggestions })
      }
    } catch (error) {
      console.error('RxNorm suggestion error:', error)
      // Fall through to fallback
    }

    // Strategy 3: Fallback to common medications
    const fallbackSuggestions = getFallbackSuggestions(query, limit)
    return NextResponse.json({ suggestions: fallbackSuggestions })

  } catch (error: any) {
    console.error('Medication suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication suggestions', suggestions: [] },
      { status: 500 }
    )
  }
}

/**
 * Use OpenAI to intelligently suggest medications
 */
async function getAIMedicationSuggestions(
  query: string,
  apiKey: string,
  limit: number
): Promise<MedicationSuggestion[]> {
  const prompt = `You are a medical assistant. Given a partial medication name or search query, suggest ${limit} common medications that match.

Query: "${query}"

For each medication, provide:
- The full medication name (generic or brand name)
- Common dosages available (e.g., ["250mg", "500mg"])
- A brief description (optional)

Return ONLY valid JSON array in this format:
[
  {
    "name": "Medication Name",
    "commonDosages": ["250mg", "500mg"],
    "description": "Brief description"
  }
]

Focus on commonly prescribed medications. If the query is very short (1-2 letters), suggest the most common medications starting with those letters.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a medical assistant that provides accurate medication information. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '[]'
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)?.[0]
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch)
      return Array.isArray(parsed) ? parsed.slice(0, limit) : []
    }

    return []
  } catch (error) {
    console.error('OpenAI suggestion error:', error)
    return []
  }
}

/**
 * Use RxNorm API (free, no authentication required)
 * RxNorm provides medication names and can be queried
 */
async function getRxNormSuggestions(
  query: string,
  limit: number
): Promise<MedicationSuggestion[]> {
  try {
    // RxNorm API endpoint for drug name search
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`RxNorm API error: ${response.statusText}`)
    }

    const data = await response.json()
    const drugGroup = data.drugGroup?.conceptGroup
    
    if (!drugGroup || !Array.isArray(drugGroup)) {
      return []
    }

    const suggestions: MedicationSuggestion[] = []
    
    for (const group of drugGroup.slice(0, limit)) {
      const concepts = group.conceptProperties || []
      for (const concept of concepts.slice(0, limit)) {
        if (concept.name) {
          suggestions.push({
            name: concept.name,
            commonDosages: getCommonDosagesForMedication(concept.name),
            description: concept.synonym || undefined
          })
        }
      }
    }

    return suggestions.slice(0, limit)
  } catch (error) {
    console.error('RxNorm API error:', error)
    return []
  }
}

/**
 * Fallback: Common medications database
 * This is a minimal set for when APIs are unavailable
 */
function getFallbackSuggestions(query: string, limit: number): MedicationSuggestion[] {
  const commonMedications: MedicationSuggestion[] = [
    { name: 'Combiflam', commonDosages: ['250mg', '500mg', '400mg'] },
    { name: 'Paracetamol', commonDosages: ['500mg', '650mg', '1000mg'] },
    { name: 'Ibuprofen', commonDosages: ['200mg', '400mg', '600mg'] },
    { name: 'Lisinopril', commonDosages: ['5mg', '10mg', '20mg', '40mg'] },
    { name: 'Metformin', commonDosages: ['500mg', '850mg', '1000mg'] },
    { name: 'Atorvastatin', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },
    { name: 'Amlodipine', commonDosages: ['2.5mg', '5mg', '10mg'] },
    { name: 'Omeprazole', commonDosages: ['10mg', '20mg', '40mg'] },
    { name: 'Levothyroxine', commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg'] },
    { name: 'Metoprolol', commonDosages: ['25mg', '50mg', '100mg'] },
    { name: 'Losartan', commonDosages: ['25mg', '50mg', '100mg'] },
    { name: 'Amoxicillin', commonDosages: ['250mg', '500mg', '875mg'] },
    { name: 'Azithromycin', commonDosages: ['250mg', '500mg'] },
    { name: 'Ciprofloxacin', commonDosages: ['250mg', '500mg', '750mg'] },
    { name: 'Cetirizine', commonDosages: ['5mg', '10mg'] },
    { name: 'Montelukast', commonDosages: ['4mg', '5mg', '10mg'] },
    { name: 'Diclofenac', commonDosages: ['50mg', '75mg', '100mg'] },
    { name: 'Pantoprazole', commonDosages: ['20mg', '40mg'] },
    { name: 'Rabeprazole', commonDosages: ['10mg', '20mg'] },
    { name: 'Vitamin D3', commonDosages: ['400IU', '1000IU', '2000IU', '60000IU'] },
  ]

  const queryLower = query.toLowerCase()
  return commonMedications
    .filter(med => med.name.toLowerCase().includes(queryLower))
    .slice(0, limit)
}

/**
 * Get common dosages for a medication name
 * This can be enhanced with a dosage database
 */
function getCommonDosagesForMedication(medicationName: string): string[] {
  const nameLower = medicationName.toLowerCase()
  
  // Common dosage patterns based on medication type
  if (nameLower.includes('vitamin') || nameLower.includes('d3')) {
    return ['400IU', '1000IU', '2000IU', '60000IU']
  }
  if (nameLower.includes('thyroxine') || nameLower.includes('levothyroxine')) {
    return ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg']
  }
  if (nameLower.includes('insulin')) {
    return ['100 units/ml']
  }
  if (nameLower.includes('warfarin')) {
    return ['1mg', '2mg', '3mg', '5mg']
  }
  if (nameLower.includes('aspirin')) {
    return ['75mg', '100mg', '325mg']
  }
  
  // Default common dosages
  return ['5mg', '10mg', '20mg', '25mg', '50mg', '100mg', '250mg', '500mg']
}
