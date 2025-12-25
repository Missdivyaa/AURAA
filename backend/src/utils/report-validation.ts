/**
 * Medical Report Validation Utility
 * Validates uploaded reports to ensure they are legitimate medical documents
 */

export interface ValidationResult {
  isValid: boolean;
  accuracyScore: number; // 0.0 to 1.0
  matchedTerms: string[];
  rejectionReason?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Comprehensive medical terms dictionary
const MEDICAL_TERMS = [
  // Lab tests and results
  'hemoglobin', 'cholesterol', 'glucose', 'cbc', 'blood', 'platelets', 'wbc', 'rbc',
  'hct', 'mcv', 'mch', 'mchc', 'rdw-cv', 'neutrophils', 'lymphocytes', 'monocytes',
  'eosinophils', 'basophils', 'platelet count', 'lipid profile', 'triglycerides',
  'hdl', 'ldl', 'vldl', 'non hdl cholesterol', 'hb a1c', 'hba1c',
  'fasting plasma glucose', 'postprandial', 'reference', 'bio ref interval', 'method',
  
  // Medical procedures and imaging
  'prescription', 'diagnosis', 'patient', 'doctor', 'hospital', 'x-ray', 'mri', 'ct',
  'ultrasound', 'report', 'scan', 'lab', 'urine', 'serum', 'ecg', 'echo',
  
  // Medical conditions
  'disease', 'hypertension', 'diabetes', 'metformin', 'lisinopril', 'antibiotic',
  'thyroid', 'tsh', 't4', 't3', 'vitamin', 'bp', 'pulse',
  
  // Medications and dosage
  'dosage', 'tablet', 'capsule', 'mg/dl', 'mmhg', 'appointment',
  
  // Medical units and measurements
  'miu/l', 'ng/ml', 'iu/l', 'mmol/l', 'g/dl', 'fl', 'pg', '%',
  
  // Additional medical terms
  'symptom', 'treatment', 'therapy', 'medication', 'drug', 'pharmacy',
  'clinic', 'physician', 'surgeon', 'nurse', 'medical', 'health',
  'examination', 'checkup', 'consultation', 'follow-up', 'discharge',
  'admission', 'surgery', 'operation', 'procedure', 'test result',
  'laboratory', 'pathology', 'radiology', 'cardiology', 'neurology',
  'oncology', 'dermatology', 'orthopedics', 'pediatrics', 'gynecology'
];

// Patterns that indicate medical content
const MEDICAL_PATTERNS: RegExp[] = [
  // Lab values with units
  /\b(\d{1,3}(\.\d{1,2})?)\s*(mg\/dl|g\/dl|mmhg|miu\/l|ng\/ml|iu\/l|mmol\/l)\b/gi,
  // Medical abbreviations
  /\b(hb|hba1c|hdl|ldl|tsh|t3|t4|crp|sgpt|sgot|alt|ast|bun|creatinine)\b/i,
  // Test names
  /\b(urine\s+test|lipid\s+profile|liver\s+function\s+test|thyroid\s+profile|complete\s+blood\s+count|cbc)\b/i,
  // Imaging procedures
  /\b(x[- ]?ray|mri|ct\s+scan|ultrasound|ecg|echo)\b/i,
  // Cell counts
  /\b(10\^?\s?\d+\s*\/\s?(?:ul|µl|μl))\b/i,
  // Units
  /\b(fL|pg|%)\b/gi,
  // Diabetes related
  /\b(fasting\s+glucose|post\s*meal|pre[- ]?diabetes|diabetes)\b/i,
  // Date patterns in medical context
  /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/gi,
  // Prescription patterns
  /\b(take|dosage|frequency|daily|twice|thrice|before|after|meal)\b/gi
];

// Patterns that indicate non-medical content (should be rejected)
const NON_MEDICAL_PATTERNS: RegExp[] = [
  /\b(semester|marksheet|academic|grade|gpa|cgpa|course|subject|exam|test\s+paper)\b/i,
  /\b(invoice|receipt|bill|payment|transaction|bank|statement)\b/i,
  /\b(advertisement|ad|promotion|offer|discount|sale)\b/i
];

/**
 * Validate if text content is a legitimate medical report
 */
export function validateMedicalReport(text: string, fileName?: string): ValidationResult {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName?.toLowerCase() || '';
  
  // Check for non-medical content first (hard rejection)
  for (const pattern of NON_MEDICAL_PATTERNS) {
    if (pattern.test(lowerText) || pattern.test(lowerFileName)) {
      return {
        isValid: false,
        accuracyScore: 0,
        matchedTerms: [],
        rejectionReason: 'Document appears to be non-medical (academic, financial, or promotional content detected)',
        confidence: 'high'
      };
    }
  }
  
  // Check filename for obvious non-medical indicators
  if ((/\bsem(ester)?\b/.test(lowerFileName) || lowerFileName.includes('marksheet')) && 
      lowerFileName.includes('result')) {
    return {
      isValid: false,
      accuracyScore: 0,
      matchedTerms: [],
      rejectionReason: 'Filename indicates academic result, not a medical report',
      confidence: 'high'
    };
  }
  
  // Score medical content
  const words = lowerText.split(/\s+/).filter(Boolean);
  const totalWords = Math.max(1, words.length);
  
  const matchedSet = new Set<string>();
  let termOccurrences = 0;
  
  // Count medical term matches
  for (const term of MEDICAL_TERMS) {
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<![a-z0-9])${safeTerm}(?![a-z0-9])`, 'gi');
    const found = lowerText.match(pattern);
    if (found && found.length > 0) {
      matchedSet.add(term);
      termOccurrences += found.length;
    }
  }
  
  // Count pattern hits (units, lab abbreviations)
  let patternHits = 0;
  for (const rx of MEDICAL_PATTERNS) {
    const found = lowerText.match(rx);
    if (found) {
      patternHits += Array.isArray(found) ? found.length : 1;
    }
  }
  
  // Calculate scores
  const uniqueHits = matchedSet.size;
  const scoreUnique = Math.min(1, uniqueHits / 20); // Normalize to 0-1
  const density = (termOccurrences + patternHits) / totalWords;
  const scoreDensity = Math.min(1, density * 8); // Amplify density
  
  // Weighted blend
  let accuracyScore = Math.max(0, Math.min(1, 0.7 * scoreDensity + 0.3 * scoreUnique));
  
  // Boost if many medical unit patterns are present
  if (patternHits >= 3) {
    accuracyScore = Math.max(accuracyScore, Math.min(1, 0.6 + 0.05 * (patternHits - 2)));
  }
  
  // Minimum length check
  if (totalWords < 50) {
    accuracyScore *= 0.7; // Penalize very short documents
  }
  
  // Determine validation status
  const MEDICAL_THRESHOLD = 0.6; // 60% accuracy required
  const isValid = accuracyScore >= MEDICAL_THRESHOLD;
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (accuracyScore >= 0.8 && patternHits >= 5 && uniqueHits >= 10) {
    confidence = 'high';
  } else if (accuracyScore >= 0.6 && patternHits >= 3 && uniqueHits >= 5) {
    confidence = 'medium';
  }
  
  const rejectionReason = !isValid
    ? matchedSet.size === 0
      ? 'No medical terms detected in the document'
      : `Insufficient medical content. Accuracy: ${Math.round(accuracyScore * 100)}% (minimum 60% required)`
    : undefined;
  
  return {
    isValid,
    accuracyScore: Math.round(accuracyScore * 1000) / 1000, // Round to 3 decimal places
    matchedTerms: Array.from(matchedSet).slice(0, 20), // Limit to top 20 terms
    rejectionReason,
    confidence
  };
}


