// Automatic Health Score Calculator
// Calculates health score based on actual health data, not self-reported

export interface HealthFactors {
  age: number
  medications: number
  conditions: string[]
  lastCheckup: string
  nextAppointment: string
  hasRecentCheckup: boolean
  hasUpcomingAppointment: boolean
}

export interface HealthScoreBreakdown {
  baseScore: number
  ageAdjustment: number
  conditionPenalty: number
  medicationPenalty: number
  checkupBonus: number
  appointmentBonus: number
  finalScore: number
  factors: string[]
}

// Calculate health score based on objective health factors
export const calculateHealthScore = (member: any): HealthScoreBreakdown => {
  let baseScore = 100 // Start with perfect health
  const factors: string[] = []
  
  // Age factor (objective)
  let ageAdjustment = 0
  if (member.age > 70) {
    ageAdjustment = -15
    factors.push('Age 70+: -15 points')
  } else if (member.age > 60) {
    ageAdjustment = -10
    factors.push('Age 60-69: -10 points')
  } else if (member.age > 50) {
    ageAdjustment = -5
    factors.push('Age 50-59: -5 points')
  } else if (member.age < 18) {
    ageAdjustment = 5
    factors.push('Young age: +5 points')
  }
  
  // Medical conditions (objective)
  let conditionPenalty = 0
  member.conditions.forEach((condition: string) => {
    const conditionLower = condition.toLowerCase()
    
    // Major conditions
    if (conditionLower.includes('diabetes') || conditionLower.includes('heart') || conditionLower.includes('cancer')) {
      conditionPenalty -= 20
      factors.push(`${condition}: -20 points (major condition)`)
    }
    // Chronic conditions
    else if (conditionLower.includes('hypertension') || conditionLower.includes('high blood pressure') || 
             conditionLower.includes('asthma') || conditionLower.includes('arthritis')) {
      conditionPenalty -= 15
      factors.push(`${condition}: -15 points (chronic condition)`)
    }
    // Moderate conditions
    else if (conditionLower.includes('allergy') || conditionLower.includes('migraine') || 
             conditionLower.includes('anxiety') || conditionLower.includes('depression')) {
      conditionPenalty -= 10
      factors.push(`${condition}: -10 points (moderate condition)`)
    }
    // Minor conditions
    else {
      conditionPenalty -= 5
      factors.push(`${condition}: -5 points (minor condition)`)
    }
  })
  
  // Medications (objective indicator of health complexity)
  // Only apply if a numeric count is explicitly provided; avoid bonus by default
  let medicationPenalty = 0
  if (typeof member.medications === 'number' && member.medications > 5) {
    medicationPenalty = -20
    factors.push(`${member.medications} medications: -20 points (high medication count)`)
  } else if (typeof member.medications === 'number' && member.medications > 3) {
    medicationPenalty = -15
    factors.push(`${member.medications} medications: -15 points (moderate medication count)`)
  } else if (typeof member.medications === 'number' && member.medications > 1) {
    medicationPenalty = -10
    factors.push(`${member.medications} medications: -10 points (some medications)`)
  } else if (typeof member.medications === 'number' && member.medications === 0) {
    // Do not add a positive bonus; zero meds is neutral
    medicationPenalty = 0
  }
  
  // Preventive care (objective)
  let checkupBonus = 0
  if (member.lastCheckup && member.lastCheckup.trim() !== '') {
    const lastCheckupDate = new Date(member.lastCheckup)
    const daysSinceCheckup = Math.floor((Date.now() - lastCheckupDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCheckup < 365) {
      checkupBonus = 10
      factors.push('Recent checkup (< 1 year): +10 points')
    } else if (daysSinceCheckup < 730) {
      checkupBonus = 5
      factors.push('Checkup within 2 years: +5 points')
    } else {
      checkupBonus = -10
      factors.push('No recent checkup (> 2 years): -10 points')
    }
  } else {
    checkupBonus = -15
    factors.push('No checkup date recorded: -15 points')
  }
  
  // Upcoming appointments (shows proactive care)
  let appointmentBonus = 0
  if (member.nextAppointment && member.nextAppointment.trim() !== '') {
    const nextAppointmentDate = new Date(member.nextAppointment)
    const daysToAppointment = Math.floor((nextAppointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (daysToAppointment > 0 && daysToAppointment < 90) {
      appointmentBonus = 5
      factors.push('Upcoming appointment: +5 points')
    } else if (daysToAppointment > 0) {
      appointmentBonus = 2
      factors.push('Future appointment scheduled: +2 points')
    }
  } else {
    appointmentBonus = -5
    factors.push('No upcoming appointments: -5 points')
  }
  
  // Calculate final score
  const finalScore = Math.max(0, Math.min(100, 
    baseScore + ageAdjustment + conditionPenalty + medicationPenalty + checkupBonus + appointmentBonus
  ))
  
  return {
    baseScore: 100,
    ageAdjustment,
    conditionPenalty,
    medicationPenalty,
    checkupBonus,
    appointmentBonus,
    finalScore,
    factors
  }
}

// Get health status based on calculated score
export const getHealthStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

// Get health recommendations based on score breakdown
export const getHealthRecommendations = (breakdown: HealthScoreBreakdown): string[] => {
  const recommendations: string[] = []
  
  if (breakdown.conditionPenalty < -30) {
    recommendations.push('Consider consulting with specialists for your medical conditions')
  }
  
  if (breakdown.medicationPenalty < -15) {
    recommendations.push('Review medications with your doctor to optimize treatment')
  }
  
  if (breakdown.checkupBonus <= 0) {
    recommendations.push('Schedule a routine health checkup')
  }
  
  if (breakdown.appointmentBonus <= 0) {
    recommendations.push('Book your next preventive care appointment')
  }
  
  if (breakdown.finalScore < 70) {
    recommendations.push('Focus on lifestyle modifications and regular medical follow-ups')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining your current health routine')
  }
  
  return recommendations
}

// Example usage and explanation
export const explainHealthScore = (member: any): string => {
  const breakdown = calculateHealthScore(member)
  const status = getHealthStatus(breakdown.finalScore)
  
  return `
Health Score: ${breakdown.finalScore}% (${status})
Base Score: 100 points

Adjustments:
${breakdown.factors.join('\n')}

This score is calculated objectively based on:
• Age and health risk factors
• Number and severity of medical conditions  
• Medication complexity
• Preventive care history
• Upcoming medical appointments

The score helps track health trends over time and provides objective insights for health management.
  `.trim()
}

