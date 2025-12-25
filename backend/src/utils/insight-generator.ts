import { ExtractedReportData } from './report-extraction';

export interface GeneratedInsight {
  type: 'health_trend' | 'risk_assessment' | 'recommendation' | 'alert' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  data: any;
  actionItems: {
    immediate?: string[];
    shortTerm?: string[];
    longTerm?: string[];
  };
}

/**
 * Generate AI insights based on extracted report data
 */
export function generateInsightsFromReport(
  extractedData: ExtractedReportData,
  memberName?: string
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];
  const memberLabel = memberName || 'Patient';

  // Analyze medications
  if (extractedData.medications && extractedData.medications.length > 0) {
    const medicationNames = extractedData.medications.map(m => m.name.toLowerCase());
    
    // Check for diabetes medications
    if (medicationNames.some(name => name.includes('metformin') || name.includes('insulin') || name.includes('glipizide'))) {
      insights.push({
        type: 'risk_assessment',
        title: 'Diabetes Management Detected',
        description: `${memberLabel} is on diabetes medication. Regular monitoring of blood sugar levels and HbA1c is crucial for effective management.`,
        severity: 'medium',
        category: 'medication',
        data: {
          medications: extractedData.medications.filter(m => 
            m.name.toLowerCase().includes('metformin') || 
            m.name.toLowerCase().includes('insulin') ||
            m.name.toLowerCase().includes('glipizide')
          ),
          condition: 'Diabetes'
        },
        actionItems: {
          immediate: [
            'Monitor blood sugar levels regularly',
            'Follow medication schedule strictly',
            'Track HbA1c levels every 3 months'
          ],
          shortTerm: [
            'Schedule regular checkups with endocrinologist',
            'Maintain a diabetes-friendly diet',
            'Engage in regular physical activity'
          ],
          longTerm: [
            'Annual comprehensive diabetes screening',
            'Regular eye and foot examinations',
            'Cardiovascular risk assessment'
          ]
        }
      });
    }

    // Check for hypertension medications
    if (medicationNames.some(name => name.includes('amlodipine') || name.includes('lisinopril') || name.includes('losartan') || name.includes('atenolol'))) {
      insights.push({
        type: 'risk_assessment',
        title: 'Hypertension Management Active',
        description: `${memberLabel} is taking blood pressure medication. Consistent monitoring and lifestyle modifications are important for optimal control.`,
        severity: 'medium',
        category: 'medication',
        data: {
          medications: extractedData.medications.filter(m => 
            m.name.toLowerCase().includes('amlodipine') || 
            m.name.toLowerCase().includes('lisinopril') ||
            m.name.toLowerCase().includes('losartan') ||
            m.name.toLowerCase().includes('atenolol')
          ),
          condition: 'Hypertension'
        },
        actionItems: {
          immediate: [
            'Monitor blood pressure daily',
            'Take medication at the same time each day',
            'Limit sodium intake'
          ],
          shortTerm: [
            'Schedule follow-up appointment in 2-4 weeks',
            'Maintain healthy diet (DASH diet recommended)',
            'Regular exercise (30 minutes daily)'
          ],
          longTerm: [
            'Annual cardiovascular assessment',
            'Regular kidney function tests',
            'Lifestyle modification review'
          ]
        }
      });
    }

    // Check for multiple medications (polypharmacy)
    if (extractedData.medications.length >= 3) {
      insights.push({
        type: 'alert',
        title: 'Multiple Medications Detected',
        description: `${memberLabel} is taking ${extractedData.medications.length} medications. Regular medication review is recommended to prevent interactions and optimize treatment.`,
        severity: 'high',
        category: 'medication',
        data: {
          medicationCount: extractedData.medications.length,
          medications: extractedData.medications
        },
        actionItems: {
          immediate: [
            'Review all medications with healthcare provider',
            'Check for potential drug interactions',
            'Ensure medication schedule is manageable'
          ],
          shortTerm: [
            'Schedule medication review appointment',
            'Create medication schedule/reminder system',
            'Monitor for side effects'
          ],
          longTerm: [
            'Annual comprehensive medication review',
            'Consider medication simplification if possible',
            'Regular pharmacist consultation'
          ]
        }
      });
    }

    // Medication adherence insight
    insights.push({
      type: 'recommendation',
      title: 'Medication Adherence Support',
      description: `Set up reminders for ${extractedData.medications.length} medication(s) to ensure consistent adherence and optimal health outcomes.`,
      severity: 'low',
      category: 'medication',
      data: {
        medicationCount: extractedData.medications.length
      },
      actionItems: {
        immediate: [
          'Set up medication reminders',
          'Use pill organizer if needed',
          'Keep medication list updated'
        ],
        shortTerm: [
          'Track medication adherence',
          'Review medication effectiveness with doctor'
        ]
      }
    });
  }

  // Analyze conditions
  if (extractedData.conditions && extractedData.conditions.length > 0) {
    const conditions = extractedData.conditions.map(c => c.toLowerCase());
    
    // Diabetes condition
    if (conditions.some(c => c.includes('diabetes') || c.includes('diabetic'))) {
      insights.push({
        type: 'risk_assessment',
        title: 'Diabetes Condition Identified',
        description: `${memberLabel} has been diagnosed with diabetes. Comprehensive diabetes care including regular monitoring, diet management, and exercise is essential.`,
        severity: 'high',
        category: 'health',
        data: {
          conditions: extractedData.conditions.filter(c => 
            c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('diabetic')
          )
        },
        actionItems: {
          immediate: [
            'Monitor blood glucose levels regularly',
            'Follow prescribed medication regimen',
            'Schedule appointment with endocrinologist'
          ],
          shortTerm: [
            'HbA1c test every 3 months',
            'Regular foot examinations',
            'Eye examination annually'
          ],
          longTerm: [
            'Comprehensive diabetes management plan',
            'Cardiovascular risk assessment',
            'Kidney function monitoring'
          ]
        }
      });
    }

    // Hypertension condition
    if (conditions.some(c => c.includes('hypertension') || c.includes('high blood pressure'))) {
      insights.push({
        type: 'risk_assessment',
        title: 'Hypertension Condition Identified',
        description: `${memberLabel} has hypertension. Regular blood pressure monitoring and lifestyle modifications are crucial for management.`,
        severity: 'medium',
        category: 'health',
        data: {
          conditions: extractedData.conditions.filter(c => 
            c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('high blood pressure')
          )
        },
        actionItems: {
          immediate: [
            'Monitor blood pressure daily',
            'Follow low-sodium diet',
            'Take medications as prescribed'
          ],
          shortTerm: [
            'Regular follow-up appointments',
            'Lifestyle modifications (exercise, diet)',
            'Stress management techniques'
          ],
          longTerm: [
            'Annual cardiovascular assessment',
            'Regular kidney function tests',
            'Maintain healthy lifestyle'
          ]
        }
      });
    }

    // Vitamin D deficiency
    if (conditions.some(c => c.includes('vitamin d') || c.includes('vitamin d deficiency'))) {
      insights.push({
        type: 'recommendation',
        title: 'Vitamin D Supplementation Recommended',
        description: `${memberLabel} has Vitamin D deficiency. Regular supplementation and sunlight exposure can help improve levels.`,
        severity: 'low',
        category: 'health',
        data: {
          conditions: extractedData.conditions.filter(c => 
            c.toLowerCase().includes('vitamin d')
          )
        },
        actionItems: {
          immediate: [
            'Take Vitamin D supplements as prescribed',
            'Get 15-20 minutes of sunlight daily',
            'Include Vitamin D-rich foods in diet'
          ],
          shortTerm: [
            'Recheck Vitamin D levels after 8-12 weeks',
            'Continue supplementation as needed'
          ],
          longTerm: [
            'Maintain adequate Vitamin D levels',
            'Regular monitoring'
          ]
        }
      });
    }

    // Multiple conditions
    if (extractedData.conditions.length >= 2) {
      insights.push({
        type: 'alert',
        title: 'Multiple Health Conditions',
        description: `${memberLabel} has ${extractedData.conditions.length} health conditions. Coordinated care and regular monitoring are important for optimal management.`,
        severity: 'high',
        category: 'health',
        data: {
          conditionCount: extractedData.conditions.length,
          conditions: extractedData.conditions
        },
        actionItems: {
          immediate: [
            'Coordinate care between specialists',
            'Ensure all conditions are being managed',
            'Maintain comprehensive health records'
          ],
          shortTerm: [
            'Regular follow-up appointments',
            'Monitor all conditions',
            'Review treatment plans'
          ],
          longTerm: [
            'Annual comprehensive health assessment',
            'Preventive care planning',
            'Lifestyle optimization'
          ]
        }
      });
    }
  }

  // Analyze appointments
  if (extractedData.appointments && extractedData.appointments.length > 0) {
    const upcomingAppointments = extractedData.appointments.filter(apt => {
      if (!apt.date) return false;
      try {
        const aptDate = new Date(apt.date);
        return aptDate.getTime() > Date.now();
      } catch {
        return false;
      }
    });

    if (upcomingAppointments.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Upcoming Appointments Scheduled',
        description: `${memberLabel} has ${upcomingAppointments.length} upcoming appointment(s). Prepare questions and bring relevant medical records.`,
        severity: 'low',
        category: 'appointment',
        data: {
          appointments: upcomingAppointments
        },
        actionItems: {
          immediate: [
            'Prepare list of questions for doctor',
            'Bring current medications list',
            'Bring insurance card and ID'
          ],
          shortTerm: [
            'Set appointment reminders',
            'Review medical history before appointment'
          ]
        }
      });
    }
  }

  // Lifestyle recommendations based on conditions
  if (extractedData.conditions && extractedData.conditions.length > 0) {
    const hasDiabetes = extractedData.conditions.some(c => 
      c.toLowerCase().includes('diabetes')
    );
    const hasHypertension = extractedData.conditions.some(c => 
      c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('high blood pressure')
    );

    if (hasDiabetes || hasHypertension) {
      insights.push({
        type: 'recommendation',
        title: 'Lifestyle Modifications Recommended',
        description: `Based on ${memberLabel}'s health conditions, lifestyle modifications including diet, exercise, and stress management can significantly improve outcomes.`,
        severity: 'medium',
        category: 'lifestyle',
        data: {
          conditions: extractedData.conditions,
          hasDiabetes,
          hasHypertension
        },
        actionItems: {
          immediate: [
            'Follow prescribed diet plan',
            'Engage in regular physical activity (30 min/day)',
            'Monitor vital signs regularly'
          ],
          shortTerm: [
            'Work with nutritionist if needed',
            'Join support groups',
            'Track progress'
          ],
          longTerm: [
            'Maintain healthy lifestyle habits',
            'Regular health checkups',
            'Preventive care'
          ]
        }
      });
    }
  }

  // Lab tests recommendation
  if (extractedData.appointments && extractedData.appointments.some(apt => 
    apt.notes?.toLowerCase().includes('lab') || 
    apt.notes?.toLowerCase().includes('test') ||
    apt.specialty?.toLowerCase().includes('lab')
  )) {
    insights.push({
      type: 'recommendation',
      title: 'Lab Tests Recommended',
      description: `Lab tests have been recommended for ${memberLabel}. Ensure you complete them before your next appointment for accurate assessment.`,
      severity: 'medium',
      category: 'appointment',
      data: {},
      actionItems: {
        immediate: [
          'Schedule lab tests as recommended',
          'Follow fasting instructions if required',
          'Bring insurance information'
        ],
        shortTerm: [
          'Complete tests before appointment',
          'Review results with doctor'
        ]
      }
    });
  }

  return insights;
}

