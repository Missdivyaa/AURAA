// AI Analysis Service for automatic health data processing
// This service simulates AI-powered analysis of health reports

export interface HealthData {
  medications: MedicationData[]
  appointments: AppointmentData[]
  conditions: ConditionData[]
  recommendations: RecommendationData[]
  alerts: AlertData[]
  predictions: PredictionData[]
}

export interface MedicationData {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  purpose: string
  sideEffects: string[]
  confidence: number
}

export interface AppointmentData {
  doctorName: string
  specialty: string
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  suggestedDate: string
  hospital: string
  confidence: number
}

export interface ConditionData {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  status: 'active' | 'resolved' | 'chronic'
  diagnosisDate: string
  confidence: number
}

export interface RecommendationData {
  type: 'medication' | 'lifestyle' | 'appointment' | 'test' | 'diet'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  timeframe: string
  confidence: number
}

export interface AlertData {
  type: 'medication_interaction' | 'critical_value' | 'follow_up' | 'vaccination'
  severity: 'info' | 'warning' | 'critical'
  message: string
  actionRequired: boolean
  confidence: number
}

export interface PredictionData {
  condition: string
  probability: number
  timeframe: string
  riskFactors: string[]
  preventionTips: string[]
  confidence: number
}

export interface OCRResult {
  text: string
  confidence: number
  extractedData: {
    medications: string[]
    values: { [key: string]: string }
    dates: string[]
    doctors: string[]
    hospitals: string[]
  }
}

class AIAnalysisService {
  // Quick medical term dictionary for scoring (expandable)
  private medicalTerms: string[] = [
    'hemoglobin','cholesterol','glucose','cbc','blood','platelets','wbc','rbc',
    'prescription','diagnosis','patient','doctor','hospital','mg/dl','mmhg',
    'vitamin','thyroid','tsh','t4','dosage','tablet','capsule','x-ray','mri','ct',
    'ultrasound','report','scan','lab','urine','serum','disease','hypertension',
    'diabetes','metformin','lisinopril','antibiotic','bp','pulse','appointment',
    // Added detailed CBC + lipid + differential terms
    'hct','mcv','mch','mchc','rdw-cv','neutrophils','lymphocytes','monocytes','eosinophils','basophils',
    'absolute neutrophil count','absolute lymphocyte count','absolute monocyte count','absolute eosinophil count','absolute basophil count',
    'platelet count','lipid profile','triglycerides','hdl','ldl','vldl','non hdl cholesterol','ratio','hb a1c','hba1c',
    'fasting plasma glucose','postprandial','diagnosis','reference','bio ref interval','method'
  ]

  // Regex patterns that indicate medical content (units, formats)
  private medicalPatterns: RegExp[] = [
    /\b(\d{1,3}(\.\d{1,2})?)\s*(mg\/dl|g\/dl|mmhg|miu\/l|ng\/ml|iu\/l|mmol\/l)\b/gi,
    /\b(hb|hba1c|hdl|ldl|tsh|t3|t4|crp|sgpt|sgot|alt|ast|bun|creatinine)\b/i,
    /\b(urine\s+test|lipid\s+profile|liver\s+function\s+test|thyroid\s+profile|complete\s+blood\s+count|cbc)\b/i,
    /\b(x[- ]?ray|mri|ct\s+scan|ultrasound|ecg|echo)\b/i,
    /\b(10\^?\s?\d+\s*\/\s?(?:ul|µl|μl))\b/i,
    /\b(fL|pg|%)\b/gi,
    /\b(fasting\s+glucose|post\s*meal|pre[- ]?diabetes|diabetes)\b/i
  ]

  // Validate file extension
  isAllowedExtension(file: File): boolean {
    const allowed = ['pdf','jpg','jpeg','png','gif','txt','doc','docx']
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    return allowed.includes(ext)
  }

  // Score whether OCR text is likely medical using unique hits + term density
  scoreMedicalText(text: string): { score: number; matched: string[] } {
    const lower = text.toLowerCase()
    const words = lower.split(/\s+/).filter(Boolean)
    const totalWords = Math.max(1, words.length)

    const matchedSet = new Set<string>()
    let occurrences = 0
    for (const term of this.medicalTerms) {
      const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`(?<![a-z0-9])${safe}(?![a-z0-9])`, 'gi')
      const found = lower.match(pattern)
      if (found && found.length > 0) {
        matchedSet.add(term)
        occurrences += found.length
      }
    }

    // Count pattern hits (units, lab abbreviations)
    let patternHits = 0
    for (const rx of this.medicalPatterns) {
      const found = lower.match(rx)
      if (found) {
        patternHits += Array.isArray(found) ? found.length : 1
      }
    }

    const uniqueHits = matchedSet.size
    const scoreUnique = uniqueHits / 20 // increase sensitivity for real reports
    const density = (occurrences + patternHits) / totalWords // fraction of medical indicators
    const scoreDensity = Math.min(1, density * 8) // amplify density; ~12.5% -> 1.0

    // Weighted blend; density dominates to differentiate real reports from random text
    let score = Math.max(0, Math.min(1, 0.8 * scoreDensity + 0.2 * scoreUnique))
    // Boost if many medical unit patterns are present
    if (patternHits >= 3) {
      score = Math.max(score, Math.min(1, 0.6 + 0.05 * (patternHits - 2)))
    }
    return { score, matched: Array.from(matchedSet) }
  }

  // Simulate OCR processing of uploaded files
  async processDocument(file: File): Promise<OCRResult> {
    console.log(`[AI] Processing document: ${file.name}`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock OCR results based on filename heuristics
    const mockResults = this.getMockOCRResult(file)
    
    return mockResults
  }

  // Analyze extracted text and generate health insights
  async analyzeHealthData(ocrResult: OCRResult, familyMemberId: string): Promise<HealthData> {
    console.log(`[AI] Analyzing health data for member: ${familyMemberId}`)
    
    // Simulate AI analysis time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysis = this.generateHealthAnalysis(ocrResult)
    // Try to infer high-level dates
    const dateMatch = ocrResult.text.match(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})/g)
    if (dateMatch && dateMatch.length) {
      // Earliest as last checkup, latest as next suggested
      const parsed = dateMatch.map(d => new Date(d)).filter(d => !isNaN(d.getTime())).sort((a,b)=>a.getTime()-b.getTime())
      if (parsed.length >= 1) {
        analysis.recommendations.push({
          type: 'appointment',
          title: 'Last checkup detected',
          description: `Last checkup around ${parsed[0].toISOString().split('T')[0]}`,
          priority: 'low', timeframe: 'info', confidence: 0.6
        })
      }
      const future = parsed.find(d => d.getTime() > Date.now())
      if (future) {
        analysis.appointments.push({
          doctorName: 'Follow-up', specialty: 'General Medicine', reason: 'Based on report date',
          urgency: 'low', suggestedDate: future.toISOString().split('T')[0], hospital: 'Clinic', confidence: 0.6
        })
      }
    }
    
    return analysis
  }

  // Auto-create medications from analysis
  async createMedicationsFromAnalysis(medications: MedicationData[], familyMemberId: string) {
    console.log(`[AI] Creating ${medications.length} medications for member: ${familyMemberId}`)
    
    for (const med of medications) {
      if (med.confidence > 0.7) {
        // Auto-create medication reminder
        await this.createMedicationReminder(med, familyMemberId)
      }
    }
  }

  // Auto-schedule appointments from analysis
  async scheduleAppointmentsFromAnalysis(appointments: AppointmentData[], familyMemberId: string) {
    console.log(`[AI] Scheduling ${appointments.length} appointments for member: ${familyMemberId}`)
    
    for (const apt of appointments) {
      if (apt.confidence > 0.8 && apt.urgency !== 'low') {
        // Auto-schedule appointment
        await this.createAppointmentReminder(apt, familyMemberId)
      }
    }
  }

  // Generate health predictions
  async generatePredictions(healthData: HealthData, familyMemberId: string): Promise<PredictionData[]> {
    console.log(`[AI] Generating health predictions for member: ${familyMemberId}`)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return this.generateMockPredictions(healthData)
  }

  // Private helper methods
  private getMockOCRResult(file: File): OCRResult {
    const fileName = file.name
    const lower = fileName.toLowerCase()
    const ext = (fileName.split('.').pop() || '').toLowerCase()

    // Heuristics for medical vs non-medical filenames
    const medicalNameHints = /(blood|cbc|lab|report|medical|prescription|rx|scan|x-?ray|mri|ct|thyroid|tsh|glucose|cholesterol|hospital|doctor|clinic)/i
    const nonMedicalNameHints = /(semester|result|marks?heet|assignment|invoice|bill|receipt|ticket|travel|photo|image|selfie|wallpaper|music|song|video|movie|party|wedding|holiday)/i

    const mockData = {
      'blood_test.pdf': {
        text: 'Complete Blood Count\nHemoglobin: 14.2 g/dL\nWhite Blood Cells: 7,500/μL\nPlatelets: 250,000/μL\nGlucose: 95 mg/dL\nCholesterol: 180 mg/dL\nDr. Sarah Johnson\nCity General Hospital\nDate: 2024-01-15',
        medications: ['Metformin 500mg twice daily', 'Lisinopril 10mg once daily'],
        values: {
          'Hemoglobin': '14.2 g/dL',
          'Glucose': '95 mg/dL',
          'Cholesterol': '180 mg/dL'
        },
        dates: ['2024-01-15'],
        doctors: ['Dr. Sarah Johnson'],
        hospitals: ['City General Hospital']
      },
      'prescription.pdf': {
        text: 'Prescription\nPatient: John Doe\nMedication: Lisinopril 10mg\nDosage: Once daily\nDuration: 3 months\nPrescribed by: Dr. Michael Chen\nDate: 2024-01-10',
        medications: ['Lisinopril 10mg once daily'],
        values: {},
        dates: ['2024-01-10'],
        doctors: ['Dr. Michael Chen'],
        hospitals: []
      },
      'lab_results.pdf': {
        text: 'Laboratory Results\nThyroid Stimulating Hormone: 2.5 mIU/L\nFree T4: 1.2 ng/dL\nVitamin D: 25 ng/mL (Low)\nDr. Emily Rodriguez\nChildren\'s Medical Center',
        medications: ['Vitamin D supplement'],
        values: {
          'TSH': '2.5 mIU/L',
          'Free T4': '1.2 ng/dL',
          'Vitamin D': '25 ng/mL'
        },
        dates: [],
        doctors: ['Dr. Emily Rodriguez'],
        hospitals: ['Children\'s Medical Center']
      }
    }

    // If filename strongly suggests medical, use medical-like mock
    if (medicalNameHints.test(fileName)) {
      const data = mockData['blood_test.pdf']
      return {
        text: data.text,
        confidence: 0.92,
        extractedData: {
          medications: data.medications,
          values: data.values,
          dates: data.dates,
          doctors: data.doctors,
          hospitals: data.hospitals
        }
      }
    }

    // Non-medical heuristic: images or obvious non-medical names
    const looksNonMedical = nonMedicalNameHints.test(lower) || file.type.startsWith('image/') || ['zip','rar','7z'].includes(ext)
    if (looksNonMedical) {
      const nonMedicalText = 'Semester Result\nCourse: Data Structures\nGrade: A\nCredits: 4\nUniversity Registrar\nThis document lists academic performance and grades. No medical content.'
      return {
        text: nonMedicalText,
        confidence: 0.85,
        extractedData: { medications: [], values: {}, dates: [], doctors: [], hospitals: [] }
      }
    }

    // Neutral fallback: short generic text with minimal hints
    const genericText = 'Report document\nSummary: General information. Please see attached pages.'
    return {
      text: genericText,
      confidence: 0.6,
      extractedData: { medications: [], values: {}, dates: [], doctors: [], hospitals: [] }
    }
  }

  private generateHealthAnalysis(ocrResult: OCRResult): HealthData {
    const medications: MedicationData[] = []
    const appointments: AppointmentData[] = []
    const conditions: ConditionData[] = []
    const recommendations: RecommendationData[] = []
    const alerts: AlertData[] = []
    const predictions: PredictionData[] = []

    // Analyze medications
    ocrResult.extractedData.medications.forEach(med => {
      const parsed = this.parseMedication(med)
      if (parsed) medications.push(parsed)
    })

    // Analyze lab values
    Object.entries(ocrResult.extractedData.values).forEach(([key, value]) => {
      const analysis = this.analyzeLabValue(key, value)
      if (analysis.condition) conditions.push(analysis.condition)
      if (analysis.recommendation) recommendations.push(analysis.recommendation)
      if (analysis.alert) alerts.push(analysis.alert)
    })

    // Generate appointments based on conditions
    conditions.forEach(condition => {
      if (condition.severity === 'severe' || condition.severity === 'moderate') {
        appointments.push({
          doctorName: 'Specialist',
          specialty: this.getSpecialtyForCondition(condition.name),
          reason: `Follow-up for ${condition.name}`,
          urgency: condition.severity === 'severe' ? 'high' : 'medium',
          suggestedDate: this.getSuggestedDate(condition.severity),
          hospital: 'General Hospital',
          confidence: 0.85
        })
      }
    })

    return {
      medications,
      appointments,
      conditions,
      recommendations,
      alerts,
      predictions
    }
  }

  private parseMedication(medString: string): MedicationData | null {
    // Simple medication parsing (in real implementation, use NLP)
    const match = medString.match(/(\w+)\s+(\d+mg)\s+(.+)/)
    if (!match) return null

    return {
      name: match[1],
      dosage: match[2],
      frequency: match[3],
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: 'Dr. AI Analysis',
      purpose: 'As prescribed',
      sideEffects: this.getCommonSideEffects(match[1]),
      confidence: 0.88
    }
  }

  private analyzeLabValue(test: string, value: string): {
    condition?: ConditionData
    recommendation?: RecommendationData
    alert?: AlertData
  } {
    const result: any = {}

    // Analyze specific lab values
    if (test.includes('Glucose') || test.includes('Blood Sugar')) {
      const glucose = parseFloat(value)
      if (glucose > 126) {
        result.condition = {
          name: 'Diabetes',
          severity: 'moderate',
          status: 'active',
          diagnosisDate: new Date().toISOString().split('T')[0],
          confidence: 0.9
        }
        result.recommendation = {
          type: 'lifestyle',
          title: 'Diabetes Management',
          description: 'Monitor blood sugar levels and follow diabetic diet',
          priority: 'high',
          timeframe: 'Immediate',
          confidence: 0.95
        }
      }
    }

    if (test.includes('Cholesterol')) {
      const cholesterol = parseFloat(value)
      if (cholesterol > 200) {
        result.alert = {
          type: 'critical_value',
          severity: 'warning',
          message: 'High cholesterol detected - lifestyle changes recommended',
          actionRequired: true,
          confidence: 0.85
        }
      }
    }

    if (test.includes('Vitamin D')) {
      const vitaminD = parseFloat(value)
      if (vitaminD < 30) {
        result.recommendation = {
          type: 'medication',
          title: 'Vitamin D Supplement',
          description: 'Low vitamin D levels detected - supplement recommended',
          priority: 'medium',
          timeframe: 'Within 1 week',
          confidence: 0.9
        }
      }
    }

    return result
  }

  private getCommonSideEffects(medication: string): string[] {
    const sideEffects: { [key: string]: string[] } = {
      'Lisinopril': ['Dry cough', 'Dizziness', 'Fatigue'],
      'Metformin': ['Nausea', 'Diarrhea', 'Stomach upset'],
      'Vitamin': ['Nausea', 'Constipation']
    }
    return sideEffects[medication] || ['Nausea', 'Dizziness']
  }

  private getSpecialtyForCondition(condition: string): string {
    const specialties: { [key: string]: string } = {
      'Diabetes': 'Endocrinology',
      'Hypertension': 'Cardiology',
      'Thyroid': 'Endocrinology'
    }
    return specialties[condition] || 'General Medicine'
  }

  private getSuggestedDate(severity: string): string {
    const days = severity === 'severe' ? 3 : severity === 'moderate' ? 14 : 30
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  private async createMedicationReminder(medication: MedicationData, familyMemberId: string) {
    console.log(`[AI] Creating medication reminder for ${medication.name}`)
    // In real implementation, this would create actual reminders
  }

  private async createAppointmentReminder(appointment: AppointmentData, familyMemberId: string) {
    console.log(`[AI] Creating appointment reminder for ${appointment.specialty}`)
    // In real implementation, this would schedule actual appointments
  }

  private generateMockPredictions(healthData: HealthData): PredictionData[] {
    const predictions: PredictionData[] = []

    // Generate predictions based on current health data
    if (healthData.conditions.some(c => c.name === 'Diabetes')) {
      predictions.push({
        condition: 'Cardiovascular Disease',
        probability: 0.75,
        timeframe: '5-10 years',
        riskFactors: ['Diabetes', 'High Blood Pressure'],
        preventionTips: ['Regular exercise', 'Healthy diet', 'Medication adherence'],
        confidence: 0.85
      })
    }

    if (healthData.medications.some(m => m.name === 'Lisinopril')) {
      predictions.push({
        condition: 'Kidney Function Decline',
        probability: 0.45,
        timeframe: '10-15 years',
        riskFactors: ['Hypertension medication'],
        preventionTips: ['Regular kidney function tests', 'Blood pressure monitoring'],
        confidence: 0.7
      })
    }

    return predictions
  }
}

export const aiAnalysisService = new AIAnalysisService()

