/**
 * Medical Knowledge Base - Symptom-Disease Associations
 * Based on evidence-based medical patterns and clinical training data
 */

export interface SymptomDiseaseAssociation {
  disease: string;
  primarySymptoms: string[];
  secondarySymptoms: string[];
  probabilityFactors: {
    symptom: string;
    weight: number; // 0-1, how strongly this symptom indicates the disease
  }[];
  ageFactors?: {
    ageRange: string;
    multiplier: number;
  }[];
  genderFactors?: {
    gender: string;
    multiplier: number;
  }[];
  urgency: 'low' | 'medium' | 'high';
  category: string;
}

// Evidence-based symptom-disease associations based on medical training data
export const MEDICAL_KNOWLEDGE_BASE: SymptomDiseaseAssociation[] = [
  // Infectious Diseases
  {
    disease: 'Typhoid Fever',
    primarySymptoms: ['fever', 'headache', 'abdominal pain', 'weakness'],
    secondarySymptoms: ['constipation', 'diarrhea', 'rash', 'loss of appetite', 'nausea'],
    probabilityFactors: [
      { symptom: 'fever', weight: 0.9 },
      { symptom: 'headache', weight: 0.7 },
      { symptom: 'abdominal pain', weight: 0.8 },
      { symptom: 'weakness', weight: 0.6 },
      { symptom: 'constipation', weight: 0.5 },
      { symptom: 'diarrhea', weight: 0.4 },
      { symptom: 'rash', weight: 0.3 },
      { symptom: 'loss of appetite', weight: 0.5 },
      { symptom: 'nausea', weight: 0.4 }
    ],
    urgency: 'high',
    category: 'Infectious Disease'
  },
  {
    disease: 'Common Cold',
    primarySymptoms: ['runny nose', 'sneezing', 'nasal congestion', 'sore throat'],
    secondarySymptoms: ['cough', 'mild headache', 'mild fever', 'fatigue', 'watery eyes'],
    probabilityFactors: [
      { symptom: 'runny nose', weight: 0.9 },
      { symptom: 'sneezing', weight: 0.85 },
      { symptom: 'nasal congestion', weight: 0.9 },
      { symptom: 'sore throat', weight: 0.7 },
      { symptom: 'cough', weight: 0.6 },
      { symptom: 'mild headache', weight: 0.4 },
      { symptom: 'mild fever', weight: 0.3 },
      { symptom: 'fatigue', weight: 0.5 }
    ],
    urgency: 'low',
    category: 'Respiratory Infection'
  },
  {
    disease: 'Influenza (Flu)',
    primarySymptoms: ['fever', 'chills', 'body aches', 'fatigue', 'headache'],
    secondarySymptoms: ['cough', 'sore throat', 'runny nose', 'nausea', 'vomiting'],
    probabilityFactors: [
      { symptom: 'fever', weight: 0.95 },
      { symptom: 'chills', weight: 0.85 },
      { symptom: 'body aches', weight: 0.9 },
      { symptom: 'fatigue', weight: 0.8 },
      { symptom: 'headache', weight: 0.7 },
      { symptom: 'cough', weight: 0.6 },
      { symptom: 'sore throat', weight: 0.5 }
    ],
    urgency: 'medium',
    category: 'Viral Infection'
  },
  {
    disease: 'Upper Respiratory Infection',
    primarySymptoms: ['cough', 'sore throat', 'nasal congestion', 'runny nose'],
    secondarySymptoms: ['headache', 'fever', 'fatigue', 'sneezing'],
    probabilityFactors: [
      { symptom: 'cough', weight: 0.85 },
      { symptom: 'sore throat', weight: 0.8 },
      { symptom: 'nasal congestion', weight: 0.75 },
      { symptom: 'runny nose', weight: 0.7 },
      { symptom: 'headache', weight: 0.5 },
      { symptom: 'fever', weight: 0.4 }
    ],
    urgency: 'low',
    category: 'Respiratory Infection'
  },
  
  // Neurological Conditions
  {
    disease: 'Migraine',
    primarySymptoms: ['severe headache', 'nausea', 'sensitivity to light', 'sensitivity to sound'],
    secondarySymptoms: ['aura', 'vomiting', 'fatigue', 'dizziness'],
    probabilityFactors: [
      { symptom: 'severe headache', weight: 0.9 },
      { symptom: 'nausea', weight: 0.7 },
      { symptom: 'sensitivity to light', weight: 0.8 },
      { symptom: 'sensitivity to sound', weight: 0.75 },
      { symptom: 'aura', weight: 0.6 },
      { symptom: 'vomiting', weight: 0.5 }
    ],
    urgency: 'medium',
    category: 'Neurological'
  },
  {
    disease: 'Tension Headache',
    primarySymptoms: ['headache', 'pressure sensation', 'tightness'],
    secondarySymptoms: ['neck pain', 'shoulder pain', 'fatigue', 'irritability'],
    probabilityFactors: [
      { symptom: 'headache', weight: 0.9 },
      { symptom: 'pressure sensation', weight: 0.7 },
      { symptom: 'tightness', weight: 0.65 },
      { symptom: 'neck pain', weight: 0.5 },
      { symptom: 'shoulder pain', weight: 0.4 }
    ],
    urgency: 'low',
    category: 'Neurological'
  },
  
  // Gastrointestinal Conditions
  {
    disease: 'Gastroenteritis',
    primarySymptoms: ['diarrhea', 'nausea', 'vomiting', 'abdominal cramps'],
    secondarySymptoms: ['fever', 'dehydration', 'loss of appetite', 'weakness'],
    probabilityFactors: [
      { symptom: 'diarrhea', weight: 0.9 },
      { symptom: 'nausea', weight: 0.85 },
      { symptom: 'vomiting', weight: 0.8 },
      { symptom: 'abdominal cramps', weight: 0.75 },
      { symptom: 'fever', weight: 0.5 },
      { symptom: 'dehydration', weight: 0.6 }
    ],
    urgency: 'medium',
    category: 'Gastrointestinal'
  },
  {
    disease: 'Food Poisoning',
    primarySymptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'],
    secondarySymptoms: ['fever', 'chills', 'weakness', 'dehydration'],
    probabilityFactors: [
      { symptom: 'nausea', weight: 0.9 },
      { symptom: 'vomiting', weight: 0.85 },
      { symptom: 'diarrhea', weight: 0.8 },
      { symptom: 'abdominal pain', weight: 0.75 },
      { symptom: 'fever', weight: 0.4 },
      { symptom: 'chills', weight: 0.3 }
    ],
    urgency: 'medium',
    category: 'Gastrointestinal'
  },
  
  // Respiratory Conditions
  {
    disease: 'Bronchitis',
    primarySymptoms: ['persistent cough', 'mucus production', 'chest discomfort', 'fatigue'],
    secondarySymptoms: ['mild fever', 'shortness of breath', 'wheezing', 'sore throat'],
    probabilityFactors: [
      { symptom: 'persistent cough', weight: 0.95 },
      { symptom: 'mucus production', weight: 0.85 },
      { symptom: 'chest discomfort', weight: 0.7 },
      { symptom: 'fatigue', weight: 0.6 },
      { symptom: 'mild fever', weight: 0.4 },
      { symptom: 'shortness of breath', weight: 0.5 }
    ],
    urgency: 'medium',
    category: 'Respiratory'
  },
  {
    disease: 'Pneumonia',
    primarySymptoms: ['cough', 'fever', 'chills', 'shortness of breath', 'chest pain'],
    secondarySymptoms: ['fatigue', 'nausea', 'vomiting', 'sweating', 'rapid breathing'],
    probabilityFactors: [
      { symptom: 'cough', weight: 0.9 },
      { symptom: 'fever', weight: 0.9 },
      { symptom: 'chills', weight: 0.85 },
      { symptom: 'shortness of breath', weight: 0.8 },
      { symptom: 'chest pain', weight: 0.75 },
      { symptom: 'rapid breathing', weight: 0.7 }
    ],
    urgency: 'high',
    category: 'Respiratory'
  },
  
  // Allergic Conditions
  {
    disease: 'Allergic Rhinitis',
    primarySymptoms: ['sneezing', 'runny nose', 'nasal congestion', 'itchy eyes'],
    secondarySymptoms: ['watery eyes', 'itchy throat', 'fatigue', 'headache'],
    probabilityFactors: [
      { symptom: 'sneezing', weight: 0.9 },
      { symptom: 'runny nose', weight: 0.85 },
      { symptom: 'nasal congestion', weight: 0.8 },
      { symptom: 'itchy eyes', weight: 0.85 },
      { symptom: 'watery eyes', weight: 0.7 },
      { symptom: 'itchy throat', weight: 0.6 }
    ],
    urgency: 'low',
    category: 'Allergy'
  },
  
  // Metabolic Conditions
  {
    disease: 'Diabetes (Hyperglycemia)',
    primarySymptoms: ['excessive thirst', 'frequent urination', 'fatigue', 'blurred vision'],
    secondarySymptoms: ['slow healing', 'weight loss', 'increased hunger', 'dry mouth'],
    probabilityFactors: [
      { symptom: 'excessive thirst', weight: 0.8 },
      { symptom: 'frequent urination', weight: 0.85 },
      { symptom: 'fatigue', weight: 0.7 },
      { symptom: 'blurred vision', weight: 0.6 },
      { symptom: 'slow healing', weight: 0.5 },
      { symptom: 'weight loss', weight: 0.4 }
    ],
    urgency: 'high',
    category: 'Metabolic'
  },
  
  // Musculoskeletal Conditions
  {
    disease: 'Back Pain',
    primarySymptoms: ['back pain', 'lower back pain', 'upper back pain', 'spine pain'],
    secondarySymptoms: ['stiffness', 'muscle spasms', 'limited mobility', 'pain when moving'],
    probabilityFactors: [
      { symptom: 'back pain', weight: 0.95 },
      { symptom: 'lower back pain', weight: 0.9 },
      { symptom: 'upper back pain', weight: 0.85 },
      { symptom: 'spine pain', weight: 0.9 },
      { symptom: 'stiffness', weight: 0.6 },
      { symptom: 'muscle spasms', weight: 0.5 },
      { symptom: 'limited mobility', weight: 0.4 }
    ],
    urgency: 'low',
    category: 'Musculoskeletal'
  }
];

/**
 * Calculate probability score for a disease based on symptoms
 * Uses weighted scoring similar to medical diagnostic algorithms
 */
export function calculateDiseaseProbability(
  disease: SymptomDiseaseAssociation,
  userSymptoms: string[],
  userAge?: number,
  userGender?: string
): number {
  const symptomNames = userSymptoms.map(s => s.toLowerCase().trim());
  
  // Calculate base probability from symptom matches
  let totalWeight = 0;
  let matchedWeight = 0;
  
  // Check primary symptoms (higher weight)
  for (const primarySymptom of disease.primarySymptoms) {
    const normalizedPrimary = primarySymptom.toLowerCase().trim();
    const factor = disease.probabilityFactors.find(f => 
      f.symptom.toLowerCase() === normalizedPrimary
    );
    
    if (factor) {
      totalWeight += factor.weight * 1.5; // Primary symptoms weighted 1.5x
      
      // Check if user has this symptom
      const hasSymptom = symptomNames.some(userSymptom => 
        userSymptom.includes(normalizedPrimary) || 
        normalizedPrimary.includes(userSymptom) ||
        areSimilarSymptoms(userSymptom, normalizedPrimary)
      );
      
      if (hasSymptom) {
        matchedWeight += factor.weight * 1.5;
      }
    }
  }
  
  // Check secondary symptoms
  for (const secondarySymptom of disease.secondarySymptoms) {
    const normalizedSecondary = secondarySymptom.toLowerCase().trim();
    const factor = disease.probabilityFactors.find(f => 
      f.symptom.toLowerCase() === normalizedSecondary
    );
    
    if (factor) {
      totalWeight += factor.weight;
      
      const hasSymptom = symptomNames.some(userSymptom => 
        userSymptom.includes(normalizedSecondary) || 
        normalizedSecondary.includes(userSymptom) ||
        areSimilarSymptoms(userSymptom, normalizedSecondary)
      );
      
      if (hasSymptom) {
        matchedWeight += factor.weight;
      }
    }
  }
  
  // Calculate base probability (0-100)
  let probability = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  
  // Apply age factors if available
  if (userAge && disease.ageFactors) {
    for (const ageFactor of disease.ageFactors) {
      if (matchesAgeRange(userAge, ageFactor.ageRange)) {
        probability *= ageFactor.multiplier;
        break;
      }
    }
  }
  
  // Apply gender factors if available
  if (userGender && disease.genderFactors) {
    for (const genderFactor of disease.genderFactors) {
      if (userGender.toLowerCase() === genderFactor.gender.toLowerCase()) {
        probability *= genderFactor.multiplier;
        break;
      }
    }
  }
  
  // Ensure probability is between 0-100
  probability = Math.min(100, Math.max(0, probability));
  
  // Boost probability if multiple primary symptoms match
  const matchedPrimaryCount = disease.primarySymptoms.filter(ps => 
    symptomNames.some(us => 
      us.includes(ps.toLowerCase()) || 
      ps.toLowerCase().includes(us) ||
      areSimilarSymptoms(us, ps.toLowerCase())
    )
  ).length;
  
  if (matchedPrimaryCount >= 2) {
    probability = Math.min(100, probability * 1.2);
  }
  
  return Math.round(probability);
}

/**
 * Check if two symptoms are similar (fuzzy matching)
 */
function areSimilarSymptoms(symptom1: string, symptom2: string): boolean {
  const synonyms: { [key: string]: string[] } = {
    'headache': ['head ache', 'head pain', 'cephalgia'],
    'fever': ['high temperature', 'pyrexia', 'febrile'],
    'cough': ['coughing', 'hacking'],
    'cold': ['common cold', 'rhinovirus'],
    'sore throat': ['throat pain', 'pharyngitis'],
    'nausea': ['feeling sick', 'queasy'],
    'vomiting': ['throwing up', 'emesis'],
    'diarrhea': ['loose stools', 'diarrhoea'],
    'abdominal pain': ['stomach pain', 'belly ache', 'stomachache'],
    'fatigue': ['tiredness', 'exhaustion', 'weakness'],
    'runny nose': ['rhinorrhea', 'nasal discharge'],
    'nasal congestion': ['stuffy nose', 'blocked nose']
  };
  
  const s1 = symptom1.toLowerCase();
  const s2 = symptom2.toLowerCase();
  
  // Direct match
  if (s1 === s2) return true;
  
  // Check synonyms
  for (const [key, values] of Object.entries(synonyms)) {
    if ((s1 === key || values.includes(s1)) && (s2 === key || values.includes(s2))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if age matches a range (e.g., "18-65", "65+", "<18")
 */
function matchesAgeRange(age: number, range: string): boolean {
  if (range.includes('+')) {
    const minAge = parseInt(range.replace('+', ''));
    return age >= minAge;
  } else if (range.includes('<')) {
    const maxAge = parseInt(range.replace('<', ''));
    return age < maxAge;
  } else if (range.includes('-')) {
    const [min, max] = range.split('-').map(n => parseInt(n.trim()));
    return age >= min && age <= max;
  }
  return false;
}

/**
 * Find matching diseases for given symptoms using medical knowledge base
 */
export function findMatchingDiseases(
  userSymptoms: string[],
  userAge?: number,
  userGender?: string
): Array<{ disease: SymptomDiseaseAssociation; probability: number }> {
  const results = MEDICAL_KNOWLEDGE_BASE.map(disease => ({
    disease,
    probability: calculateDiseaseProbability(disease, userSymptoms, userAge, userGender)
  }))
  .filter(result => result.probability > 0)
  .sort((a, b) => b.probability - a.probability);
  
  return results;
}
