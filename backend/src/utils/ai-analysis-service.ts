// AI Analysis Service for AURAA Health Platform
// This service handles AI-powered health insights and analysis

export interface HealthInsight {
  type: 'health_trend' | 'risk_assessment' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'cardiovascular' | 'diabetes' | 'general' | 'medication';
  data: any;
  actionItems: any;
}

export interface SymptomAnalysisResult {
  possibleConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  confidence: number;
}

export class AIAnalysisService {
  // Generate health insights based on user data
  static async generateHealthInsights(
    userData: any,
    familyMemberData?: any
  ): Promise<HealthInsight[]> {
    const insights: HealthInsight[] = [];

    // Blood Pressure Analysis
    if (userData.bloodPressureReadings) {
      const avgBP = this.calculateAverageBP(userData.bloodPressureReadings);
      if (avgBP.systolic > 140 || avgBP.diastolic > 90) {
        insights.push({
          type: 'alert',
          title: 'High Blood Pressure Alert',
          description: 'Your blood pressure readings indicate hypertension. Please consult your doctor.',
          severity: 'high',
          category: 'cardiovascular',
          data: {
            averageSystolic: avgBP.systolic,
            averageDiastolic: avgBP.diastolic,
            readings: userData.bloodPressureReadings
          },
          actionItems: {
            immediate: ['Consult your doctor immediately'],
            monitor: ['Check blood pressure daily'],
            lifestyle: ['Reduce sodium intake', 'Increase physical activity']
          }
        });
      }
    }

    // Medication Adherence Analysis
    if (userData.medications) {
      const adherenceRate = this.calculateMedicationAdherence(userData.medications);
      if (adherenceRate < 0.8) {
        insights.push({
          type: 'recommendation',
          title: 'Medication Adherence Improvement',
          description: `Your medication adherence rate is ${Math.round(adherenceRate * 100)}%. Improving adherence can significantly benefit your health.`,
          severity: 'medium',
          category: 'medication',
          data: {
            adherenceRate,
            medications: userData.medications
          },
          actionItems: {
            improve: ['Set daily medication reminders', 'Use pill organizers'],
            track: ['Log medication intake daily'],
            consult: ['Discuss adherence challenges with your doctor']
          }
        });
      }
    }

    // Exercise and Activity Analysis
    if (userData.activityData) {
      const weeklyActivity = this.calculateWeeklyActivity(userData.activityData);
      if (weeklyActivity < 150) { // Less than WHO recommended 150 minutes
        insights.push({
          type: 'recommendation',
          title: 'Increase Physical Activity',
          description: 'Your weekly activity level is below recommended guidelines. Increasing activity can improve your overall health.',
          severity: 'medium',
          category: 'general',
          data: {
            weeklyMinutes: weeklyActivity,
            recommendedMinutes: 150,
            activityData: userData.activityData
          },
          actionItems: {
            start: ['Begin with 30 minutes of walking daily'],
            increase: ['Gradually increase to 150 minutes per week'],
            variety: ['Include both cardio and strength training']
          }
        });
      }
    }

    // Sleep Quality Analysis
    if (userData.sleepData) {
      const avgSleepHours = this.calculateAverageSleep(userData.sleepData);
      if (avgSleepHours < 7) {
        insights.push({
          type: 'recommendation',
          title: 'Improve Sleep Quality',
          description: `You're averaging ${avgSleepHours.toFixed(1)} hours of sleep per night. Aim for 7-9 hours for optimal health.`,
          severity: 'medium',
          category: 'general',
          data: {
            averageHours: avgSleepHours,
            recommendedHours: 7,
            sleepData: userData.sleepData
          },
          actionItems: {
            routine: ['Establish consistent bedtime routine'],
            environment: ['Keep bedroom cool and dark'],
            habits: ['Avoid screens 1 hour before bed']
          }
        });
      }
    }

    return insights;
  }

  // Analyze symptoms and provide recommendations
  static async analyzeSymptoms(symptoms: any): Promise<SymptomAnalysisResult> {
    const symptomKeywords = this.extractSymptomKeywords(symptoms);
    
    // Mock symptom analysis based on common patterns
    const analysis = this.performSymptomAnalysis(symptomKeywords);
    
    return analysis;
  }

  // Process health report and extract insights
  static async processHealthReport(reportText: string): Promise<any> {
    // Mock health report processing
    const analysis = {
      summary: 'Health report processed successfully',
      keyFindings: this.extractKeyFindings(reportText),
      recommendations: this.generateRecommendations(reportText),
      riskFactors: this.identifyRiskFactors(reportText),
      processedAt: new Date().toISOString()
    };

    return analysis;
  }

  // Helper methods
  private static calculateAverageBP(readings: any[]): { systolic: number; diastolic: number } {
    const systolicSum = readings.reduce((sum, reading) => sum + reading.systolic, 0);
    const diastolicSum = readings.reduce((sum, reading) => sum + reading.diastolic, 0);
    
    return {
      systolic: systolicSum / readings.length,
      diastolic: diastolicSum / readings.length
    };
  }

  private static calculateMedicationAdherence(medications: any[]): number {
    // Mock calculation - in real implementation, this would analyze actual adherence data
    return Math.random() * 0.4 + 0.6; // Random between 0.6 and 1.0
  }

  private static calculateWeeklyActivity(activityData: any[]): number {
    // Mock calculation - sum up weekly activity minutes
    return activityData.reduce((sum, day) => sum + (day.minutes || 0), 0);
  }

  private static calculateAverageSleep(sleepData: any[]): number {
    const totalHours = sleepData.reduce((sum, night) => sum + (night.hours || 0), 0);
    return totalHours / sleepData.length;
  }

  private static extractSymptomKeywords(symptoms: any): string[] {
    // Extract keywords from symptoms input
    if (typeof symptoms === 'string') {
      return symptoms.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
    }
    return [];
  }

  private static performSymptomAnalysis(keywords: string[]): SymptomAnalysisResult {
    // Mock symptom analysis based on keywords
    const commonConditions = [
      'Common cold', 'Flu', 'Allergic reaction', 'Stress', 'Anxiety',
      'Headache', 'Migraine', 'Digestive issues', 'Sleep problems'
    ];

    const urgentKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'fainting'];
    const hasUrgentSymptoms = keywords.some(keyword => 
      urgentKeywords.some(urgent => urgent.includes(keyword))
    );

    return {
      possibleConditions: commonConditions.slice(0, 3),
      urgencyLevel: hasUrgentSymptoms ? 'high' : 'low',
      recommendations: [
        'Rest and stay hydrated',
        'Monitor symptoms closely',
        'Consult healthcare provider if symptoms worsen'
      ],
      confidence: 0.75
    };
  }

  private static extractKeyFindings(reportText: string): string[] {
    // Mock key findings extraction
    return [
      'Normal blood pressure readings',
      'Good cholesterol levels',
      'Stable blood sugar levels'
    ];
  }

  private static generateRecommendations(reportText: string): string[] {
    // Mock recommendations generation
    return [
      'Continue current medication regimen',
      'Schedule follow-up appointment in 3 months',
      'Maintain healthy diet and exercise routine'
    ];
  }

  private static identifyRiskFactors(reportText: string): string[] {
    // Mock risk factor identification
    return [
      'Family history of cardiovascular disease',
      'Sedentary lifestyle',
      'High sodium diet'
    ];
  }
}



