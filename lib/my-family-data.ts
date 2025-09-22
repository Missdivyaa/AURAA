// Replace this with YOUR actual family health data
export interface MyFamilyMember {
  id: string
  name: string
  age: number
  relationship: string
  avatar: string
  healthScore: number
  lastCheckup: string
  nextAppointment: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    startDate: string
    purpose: string
  }>
  conditions: Array<{
    name: string
    diagnosisDate: string
    severity: 'mild' | 'moderate' | 'severe'
    status: 'active' | 'inactive' | 'managed'
    doctor: string
  }>
  vitalSigns: Array<{
    type: string
    value: string
    unit: string
    recordedDate: string
    notes?: string
  }>
  labResults: Array<{
    testName: string
    result: string
    normalRange: string
    date: string
    status: 'normal' | 'abnormal' | 'borderline'
  }>
  symptoms: Array<{
    symptom: string
    severity: number // 1-10 scale
    duration: string
    recordedDate: string
    triggers?: string[]
  }>
  allergies: Array<{
    allergen: string
    reaction: string
    severity: 'mild' | 'moderate' | 'severe'
  }>
  immunizations: Array<{
    vaccine: string
    date: string
    nextDue?: string
  }>
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

// REPLACE THIS WITH YOUR ACTUAL FAMILY DATA
export const myFamilyData: MyFamilyMember[] = [
  {
    id: 'me-1',
    name: 'Divya', // ← Your actual name
    age: 25, // ← Your actual age
    relationship: 'Self',
    avatar: 'https://ui-avatars.com/api/?name=Divya&background=0ea5e9&color=fff&size=150',
    healthScore: 85, // ← Your self-assessed health score
    lastCheckup: '2024-01-15', // ← Your last checkup date
    nextAppointment: '2024-04-15', // ← Your next appointment
    medications: [
      // Add YOUR actual medications here
      // Example:
      // {
      //   name: 'Metformin',
      //   dosage: '500mg',
      //   frequency: 'Twice daily',
      //   startDate: '2023-06-01',
      //   purpose: 'Type 2 Diabetes management'
      // }
    ],
    conditions: [
      // Add YOUR actual medical conditions here
      // Example:
      // {
      //   name: 'Type 2 Diabetes',
      //   diagnosisDate: '2023-05-15',
      //   severity: 'moderate',
      //   status: 'managed',
      //   doctor: 'Dr. Smith'
      // }
    ],
    vitalSigns: [
      // Add YOUR actual vital signs here
      {
        type: 'Blood Pressure',
        value: '120/80',
        unit: 'mmHg',
        recordedDate: '2024-01-15',
        notes: 'Normal range'
      },
      {
        type: 'Weight',
        value: '70',
        unit: 'kg',
        recordedDate: '2024-01-15'
      },
      {
        type: 'Height',
        value: '170',
        unit: 'cm',
        recordedDate: '2024-01-15'
      }
    ],
    labResults: [
      // Add YOUR actual lab results here
      // Example:
      // {
      //   testName: 'HbA1c',
      //   result: '6.2',
      //   normalRange: '4.0-5.6',
      //   date: '2024-01-15',
      //   status: 'abnormal'
      // }
    ],
    symptoms: [
      // Add any current symptoms you're experiencing
      // Example:
      // {
      //   symptom: 'Frequent urination',
      //   severity: 6,
      //   duration: '2 weeks',
      //   recordedDate: '2024-01-20',
      //   triggers: ['High sugar foods']
      // }
    ],
    allergies: [
      // Add YOUR allergies here
      // Example:
      // {
      //   allergen: 'Penicillin',
      //   reaction: 'Skin rash',
      //   severity: 'moderate'
      // }
    ],
    immunizations: [
      // Add YOUR immunizations here
      // {
      //   vaccine: 'COVID-19 Booster',
      //   date: '2023-12-01',
      //   nextDue: '2024-12-01'
      // }
    ],
    status: 'good'
  },
  {
    id: 'family-2',
    name: 'Tushra', // ← Your actual family member
    age: 50, // ← Actual age
    relationship: 'Spouse', // ← Actual relationship
    avatar: 'https://ui-avatars.com/api/?name=Tushra&background=10b981&color=fff&size=150',
    healthScore: 80,
    lastCheckup: '2024-01-10',
    nextAppointment: '2024-04-10',
    medications: [
      // Add their actual medications
    ],
    conditions: [
      // Add their actual conditions
    ],
    vitalSigns: [
      // Add their actual vital signs
    ],
    labResults: [
      // Add their actual lab results
    ],
    symptoms: [
      // Add their current symptoms
    ],
    allergies: [
      // Add their allergies
    ],
    immunizations: [
      // Add their immunizations
    ],
    status: 'good'
  }
  // Add more family members as needed...
]

// Function to get your family member
export const getMyFamilyMember = (memberId: string): MyFamilyMember | null => {
  return myFamilyData.find(member => member.id === memberId) || null
}

// Function to get all your family members
export const getAllMyFamilyMembers = (): MyFamilyMember[] => {
  return myFamilyData
}

// Function to add new symptom
export const addSymptom = (memberId: string, symptom: string, severity: number, duration: string) => {
  const member = getMyFamilyMember(memberId)
  if (member) {
    member.symptoms.push({
      symptom,
      severity,
      duration,
      recordedDate: new Date().toISOString().split('T')[0]
    })
  }
}

// Function to add new lab result
export const addLabResult = (memberId: string, testName: string, result: string, normalRange: string) => {
  const member = getMyFamilyMember(memberId)
  if (member) {
    member.labResults.push({
      testName,
      result,
      normalRange,
      date: new Date().toISOString().split('T')[0],
      status: 'normal' // You can add logic to determine this
    })
  }
}

// Function to add new family member
export const addNewFamilyMember = (memberData: Partial<MyFamilyMember>) => {
  const newMember: MyFamilyMember = {
    id: `family-${Date.now()}`,
    name: memberData.name || 'New Member',
    age: memberData.age || 0,
    relationship: memberData.relationship || 'Family Member',
    avatar: memberData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.name || 'New Member')}&background=6366f1&color=fff&size=150`,
    healthScore: memberData.healthScore || 80,
    lastCheckup: memberData.lastCheckup || '',
    nextAppointment: memberData.nextAppointment || '',
    medications: memberData.medications || [],
    conditions: memberData.conditions || [],
    vitalSigns: memberData.vitalSigns || [],
    labResults: memberData.labResults || [],
    symptoms: memberData.symptoms || [],
    allergies: memberData.allergies || [],
    immunizations: memberData.immunizations || [],
    status: memberData.status || 'good'
  }
  
  myFamilyData.push(newMember)
  return newMember
}

// Function to remove family member
export const removeFamilyMember = (memberId: string) => {
  const memberIndex = myFamilyData.findIndex(member => member.id === memberId)
  if (memberIndex !== -1) {
    const removedMember = myFamilyData.splice(memberIndex, 1)[0]
    return removedMember
  }
  return null
}

// Function to update family member data
export const updateFamilyMember = (memberId: string, updatedData: Partial<MyFamilyMember>) => {
  const memberIndex = myFamilyData.findIndex(member => member.id === memberId)
  if (memberIndex !== -1) {
    myFamilyData[memberIndex] = { ...myFamilyData[memberIndex], ...updatedData }
    // Auto-calculate health score when data is updated
    updateHealthScore(memberId)
    return myFamilyData[memberIndex]
  }
  return null
}

// Function to update health score based on new data
export const updateHealthScore = (memberId: string) => {
  const member = getMyFamilyMember(memberId)
  if (!member) return

  let score = 100 // Start with perfect score
  
  // Deduct points for conditions
  member.conditions.forEach(condition => {
    if (condition.severity === 'severe') score -= 20
    else if (condition.severity === 'moderate') score -= 10
    else if (condition.severity === 'mild') score -= 5
  })
  
  // Deduct points for active symptoms
  member.symptoms.forEach(symptom => {
    score -= symptom.severity * 2 // Higher severity = more points deducted
  })
  
  // Deduct points for abnormal lab results
  member.labResults.forEach(lab => {
    if (lab.status === 'abnormal') score -= 10
    else if (lab.status === 'borderline') score -= 5
  })
  
  member.healthScore = Math.max(0, score) // Don't go below 0
  member.status = getHealthStatus(member.healthScore)
}

const getHealthStatus = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}
