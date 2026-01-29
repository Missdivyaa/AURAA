import { PrismaClient } from '@prisma/client';

// Note: This function should receive prisma instance as parameter to avoid multiple instances
// For now, we'll create one instance but ideally it should be passed from the resolver
let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export interface HealthPrediction {
  condition: string;
  probability: number; // 0-100
  timeframe: string;
  riskFactors: string[];
  preventionTips: string[];
  confidence: number; // 0-1
  severity: 'low' | 'medium' | 'high';
  basedOn: string[]; // What data was used for this prediction
}

export interface MemberHealthData {
  age: number;
  gender: string;
  conditions: string[];
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  appointments: Array<{ specialty: string; date: Date }>;
  reports: Array<{ conditions?: string[]; medications?: any[] }>;
}

/**
 * Generate health predictions based on real health data
 */
export async function generateHealthPredictions(
  userId: string,
  memberId?: string,
  prisma?: PrismaClient
): Promise<HealthPrediction[]> {
  const predictions: HealthPrediction[] = [];
  const prismaClient = prisma || getPrisma();

  try {
    // Get member data
    const members = await prismaClient.familyMember.findMany({
      where: {
        userId,
        id: memberId || undefined
      },
      include: {
        medications: {
          where: { status: 'active' }
        },
        appointments: {
          where: { status: { not: 'cancelled' } },
          orderBy: { date: 'desc' },
          take: 10
        },
        healthReports: {
          where: { status: 'analyzed' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    for (const member of members) {
      const age = calculateAge(member.dob);
      const conditions = Array.isArray(member.conditions) ? member.conditions : [];
      const medications = member.medications.map(m => ({
        name: m.name.toLowerCase(),
        dosage: m.dosage,
        frequency: m.frequency
      }));
      
      const basedOn: string[] = [];
      
      // Extract conditions from reports
      const reportConditions: string[] = [];
      member.healthReports.forEach(report => {
        if (report.analysis && typeof report.analysis === 'object') {
          const analysis = report.analysis as any;
          if (analysis.extracted?.conditions) {
            reportConditions.push(...analysis.extracted.conditions);
          }
        }
      });
      
      const allConditions = [...new Set([...conditions, ...reportConditions])];
      const conditionNames = allConditions.map(c => c.toLowerCase());

      // 1. Cardiovascular Disease Prediction
      const cardiovascularRiskFactors: string[] = [];
      let cardiovascularProbability = 0;
      
      if (conditionNames.some(c => c.includes('diabetes') || c.includes('diabetic'))) {
        cardiovascularRiskFactors.push('Diabetes');
        cardiovascularProbability += 30;
        basedOn.push('Diabetes condition detected');
      }
      
      if (conditionNames.some(c => c.includes('hypertension') || c.includes('high blood pressure'))) {
        cardiovascularRiskFactors.push('Hypertension');
        cardiovascularProbability += 25;
        basedOn.push('Hypertension condition detected');
      }
      
      if (medications.some(m => m.name.includes('metformin') || m.name.includes('insulin'))) {
        cardiovascularRiskFactors.push('Diabetes medication');
        cardiovascularProbability += 20;
        basedOn.push('Diabetes medication usage');
      }
      
      if (medications.some(m => m.name.includes('amlodipine') || m.name.includes('lisinopril') || m.name.includes('losartan'))) {
        cardiovascularRiskFactors.push('Hypertension medication');
        cardiovascularProbability += 15;
        basedOn.push('Hypertension medication usage');
      }
      
      if (age >= 50) {
        cardiovascularRiskFactors.push(`Age ${age}`);
        cardiovascularProbability += age >= 65 ? 20 : 10;
        basedOn.push(`Age factor (${age} years)`);
      }
      
      if (medications.length >= 3) {
        cardiovascularRiskFactors.push('Multiple medications');
        cardiovascularProbability += 10;
        basedOn.push('Polypharmacy (multiple medications)');
      }

      if (cardiovascularRiskFactors.length > 0) {
        cardiovascularProbability = Math.min(95, cardiovascularProbability);
        // Calculate severity from probability (real calculation)
        const severity = cardiovascularProbability >= 60 ? 'high' : 
                        cardiovascularProbability >= 40 ? 'medium' : 'low';
        
        predictions.push({
          condition: 'Cardiovascular Disease',
          probability: Math.round(cardiovascularProbability),
          timeframe: age >= 50 ? '5-10 years' : '10-15 years',
          riskFactors: cardiovascularRiskFactors,
          preventionTips: [
            'Maintain healthy blood pressure',
            'Control blood sugar levels',
            'Regular cardiovascular exercise (30 min/day)',
            'Follow heart-healthy diet (low sodium, low saturated fat)',
            'Regular cardiac checkups',
            'Manage stress levels',
            'Avoid smoking and limit alcohol'
          ],
          confidence: cardiovascularRiskFactors.length >= 3 ? 0.85 : 
                     cardiovascularRiskFactors.length >= 2 ? 0.75 : 0.65,
          severity,
          basedOn: [...basedOn]
        });
      }

      // 2. Diabetic Complications Prediction
      if (conditionNames.some(c => c.includes('diabetes')) || 
          medications.some(m => m.name.includes('metformin') || m.name.includes('insulin'))) {
        const complicationRiskFactors: string[] = ['Diabetes'];
        let complicationProbability = 40; // Base risk for diabetes complications
        
        if (age >= 50) {
          complicationRiskFactors.push(`Age ${age}`);
          complicationProbability += 15;
        }
        
        if (conditionNames.some(c => c.includes('hypertension'))) {
          complicationRiskFactors.push('Hypertension');
          complicationProbability += 20;
        }
        
        if (medications.length >= 3) {
          complicationRiskFactors.push('Multiple medications');
          complicationProbability += 10;
        }

        complicationProbability = Math.min(90, complicationProbability);
        // Calculate severity from probability (real calculation)
        const severity = complicationProbability >= 60 ? 'high' : 
                        complicationProbability >= 45 ? 'medium' : 'low';
        
        predictions.push({
          condition: 'Diabetic Complications (Neuropathy, Retinopathy, Nephropathy)',
          probability: Math.round(complicationProbability),
          timeframe: '5-10 years',
          riskFactors: complicationRiskFactors,
          preventionTips: [
            'Maintain HbA1c below 7%',
            'Regular eye examinations (annually)',
            'Regular foot examinations',
            'Kidney function monitoring',
            'Blood pressure control',
            'Cholesterol management',
            'Regular exercise and weight management'
          ],
          confidence: 0.80,
          severity,
          basedOn: ['Diabetes condition/medication', ...basedOn.filter(b => !b.includes('Diabetes'))]
        });
      }

      // 3. Kidney Disease Prediction
      if (conditionNames.some(c => c.includes('hypertension') || c.includes('diabetes')) ||
          medications.some(m => m.name.includes('lisinopril') || m.name.includes('amlodipine'))) {
        const kidneyRiskFactors: string[] = [];
        let kidneyProbability = 0;
        
        if (conditionNames.some(c => c.includes('hypertension'))) {
          kidneyRiskFactors.push('Hypertension');
          kidneyProbability += 25;
        }
        
        if (conditionNames.some(c => c.includes('diabetes'))) {
          kidneyRiskFactors.push('Diabetes');
          kidneyProbability += 30;
        }
        
        if (medications.some(m => m.name.includes('lisinopril'))) {
          kidneyRiskFactors.push('ACE inhibitor use (kidney monitoring needed)');
          kidneyProbability += 15;
        }
        
        if (age >= 60) {
          kidneyRiskFactors.push(`Age ${age}`);
          kidneyProbability += 10;
        }

        if (kidneyRiskFactors.length > 0) {
          kidneyProbability = Math.min(85, kidneyProbability);
          // Calculate severity from probability (real calculation)
          const severity = kidneyProbability >= 50 ? 'high' : 
                          kidneyProbability >= 35 ? 'medium' : 'low';
          
          predictions.push({
            condition: 'Chronic Kidney Disease',
            probability: Math.round(kidneyProbability),
            timeframe: '10-15 years',
            riskFactors: kidneyRiskFactors,
            preventionTips: [
              'Regular kidney function tests (creatinine, eGFR)',
              'Control blood pressure',
              'Manage diabetes effectively',
              'Stay hydrated',
              'Avoid NSAIDs if possible',
              'Monitor protein in urine',
              'Follow kidney-friendly diet if needed'
            ],
            confidence: kidneyRiskFactors.length >= 2 ? 0.75 : 0.65,
            severity,
            basedOn: [...basedOn]
          });
        }
      }

      // 4. Medication-Related Issues Prediction
      if (medications.length >= 3) {
        const medicationRiskProbability = Math.min(60, 30 + (medications.length - 3) * 5); // Base 30% + 5% per additional med
        // Calculate severity from probability (real calculation)
        const severity = medicationRiskProbability >= 50 ? 'high' : 
                        medicationRiskProbability >= 40 ? 'medium' : 'low';
        
        predictions.push({
          condition: 'Medication Interactions or Side Effects',
          probability: Math.round(medicationRiskProbability),
          timeframe: '1-2 years',
          riskFactors: [
            `Taking ${medications.length} medications`,
            'Polypharmacy increases interaction risk'
          ],
          preventionTips: [
            'Regular medication review with pharmacist',
            'Use one pharmacy for all medications',
            'Monitor for side effects',
            'Keep updated medication list',
            'Inform all doctors about all medications',
            'Consider medication simplification if possible'
          ],
          confidence: 0.70,
          severity,
          basedOn: [`${medications.length} active medications`]
        });
      }

      // 5. Mental Health Prediction (if anxiety/depression medications)
      const mentalHealthMeds = medications.filter(m => 
        m.name.includes('sertraline') || 
        m.name.includes('fluoxetine') || 
        m.name.includes('citalopram') ||
        m.name.includes('escitalopram')
      );
      
      if (mentalHealthMeds.length > 0) {
        // Mental health is ongoing, so probability reflects need for management
        const mentalHealthProbability = 60; // Ongoing management need
        // Calculate severity from probability (real calculation)
        const severity = mentalHealthProbability >= 60 ? 'high' : 
                        mentalHealthProbability >= 40 ? 'medium' : 'low';
        
        predictions.push({
          condition: 'Mental Health Management Needs',
          probability: mentalHealthProbability,
          timeframe: 'Ongoing',
          riskFactors: [
            'Mental health medication usage',
            'Requires ongoing support'
          ],
          preventionTips: [
            'Regular therapy/counseling sessions',
            'Medication adherence',
            'Stress management techniques',
            'Regular follow-ups with psychiatrist',
            'Support group participation',
            'Healthy lifestyle habits',
            'Sleep hygiene'
          ],
          confidence: 0.75,
          severity,
          basedOn: ['Mental health medication detected']
        });
      }

      // 6. Vitamin D Deficiency Complications
      if (conditionNames.some(c => c.includes('vitamin d'))) {
        // Calculate probability based on age and deficiency
        let boneHealthProbability = 25; // Base risk
        if (age >= 50) {
          boneHealthProbability += 15; // Age increases risk
        }
        if (age >= 65) {
          boneHealthProbability += 10; // Further increase for seniors
        }
        boneHealthProbability = Math.min(60, boneHealthProbability);
        
        // Calculate severity from probability (real calculation)
        const severity = boneHealthProbability >= 50 ? 'high' : 
                        boneHealthProbability >= 35 ? 'medium' : 'low';
        
        predictions.push({
          condition: 'Bone Health Issues (Osteoporosis Risk)',
          probability: Math.round(boneHealthProbability),
          timeframe: '10-15 years',
          riskFactors: [
            'Vitamin D deficiency',
            age >= 50 ? `Age ${age}` : null
          ].filter(Boolean) as string[],
          preventionTips: [
            'Maintain adequate Vitamin D levels',
            'Calcium-rich diet',
            'Weight-bearing exercises',
            'Regular bone density scans (if high risk)',
            'Sunlight exposure (15-20 min/day)',
            'Vitamin D supplementation as prescribed'
          ],
          confidence: 0.65,
          severity,
          basedOn: ['Vitamin D deficiency detected']
        });
      }
    }

    return predictions;
  } catch (error) {
    console.error('Error generating health predictions:', error);
    return [];
  }
}

function calculateAge(dob: Date | string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

