import { PrismaClient } from '@prisma/client';
import { extractDataFromReport } from '../utils/report-extraction';
import { validateMedicalReport } from '../utils/report-validation';
import { UserContext } from '../auth/user-context';

const prisma = new PrismaClient();

export const resolvers = {
  DateTime: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value),
  },

  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => JSON.parse(ast.value),
  },

  Query: {
    me: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.user.findUnique({
        where: { id: userContext.userId },
        include: {
          familyMembers: true,
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    familyMembers: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.familyMember.findMany({
        where: { userId: userContext.userId },
        include: {
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    familyMember: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const member = await prisma.familyMember.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: {
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });

      if (!member) throw new Error('Family member not found');
      return member;
    },

    appointments: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.appointment.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { date: 'asc' }
      });
    },

    appointment: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!appointment) throw new Error('Appointment not found');
      return appointment;
    },

    medications: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.medication.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    medication: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const medication = await prisma.medication.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!medication) throw new Error('Medication not found');
      return medication;
    },

    reminders: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.reminder.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { date: 'asc' }
      });
    },

    reminder: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const reminder = await prisma.reminder.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!reminder) throw new Error('Reminder not found');
      return reminder;
    },

    healthReports: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.healthReport.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    healthReport: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const report = await prisma.healthReport.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!report) throw new Error('Health report not found');
      return report;
    },

    aiInsights: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.aIInsight.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    aiInsight: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const insight = await prisma.aIInsight.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!insight) throw new Error('AI insight not found');
      return insight;
    },

    symptomAnalyses: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.symptomAnalysis.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    symptomAnalysis: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const analysis = await prisma.symptomAnalysis.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!analysis) throw new Error('Symptom analysis not found');
      return analysis;
    },

    healthMetrics: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.healthMetric.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { recordedAt: 'desc' }
      });
    },

    healthMetric: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const metric = await prisma.healthMetric.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!metric) throw new Error('Health metric not found');
      return metric;
    },

    wearableData: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.wearableData.findMany({
        where: { userId: userContext.userId },
        include: { member: true },
        orderBy: { syncedAt: 'desc' }
      });
    },

    wearableDataById: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const data = await prisma.wearableData.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        },
        include: { member: true }
      });

      if (!data) throw new Error('Wearable data not found');
      return data;
    },

    emergencyQR: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      // Generate QR code data for emergency ID
      const user = await prisma.user.findUnique({
        where: { id: userContext.userId },
        include: { familyMembers: true }
      });

      if (!user) throw new Error('User not found');

      const emergencyData = {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        familyMembers: user.familyMembers.map(member => ({
          name: member.name,
          relationship: member.relationship,
          bloodType: member.bloodType,
          allergies: member.allergies,
          emergencyContacts: member.emergencyContacts
        }))
      };

      return JSON.stringify(emergencyData);
    },

    userPreferences: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const user = await prisma.user.findUnique({
        where: { id: userContext.userId }
      });

      if (!user) throw new Error('User not found');
      
      // Return user preferences (can be extended)
      return {
        notifications: true,
        theme: 'light',
        language: 'en'
      };
    },

    dashboardStats: async (_: any, __: any, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const userId = userContext.userId;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get all family members with their related data
      const familyMembers = await prisma.familyMember.findMany({
        where: { userId },
        include: {
          medications: true,
          appointments: true,
          reminders: true,
        }
      });

      // Get all medications (active ones)
      const allMedications = await prisma.medication.findMany({
        where: { 
          userId,
          status: 'active'
        }
      });

      // Get upcoming appointments (next 30 days, not cancelled)
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          userId,
          date: {
            gte: now,
            lte: thirtyDaysFromNow
          },
          status: {
            not: 'cancelled'
          }
        }
      });

      // Get all appointments
      const allAppointments = await prisma.appointment.findMany({
        where: { userId }
      });

      // Get all reminders
      const allReminders = await prisma.reminder.findMany({
        where: { userId }
      });

      // Get all health reports
      const allHealthReports = await prisma.healthReport.findMany({
        where: { userId }
      });

      // Calculate average health score
      const calculateHealthScore = (member: any): number => {
        const dob = member.dob ? new Date(member.dob) : null;
        if (!dob || isNaN(dob.getTime())) return 75; // Default score
        
        const age = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        const conditionsCount = Array.isArray(member.conditions) ? member.conditions.length : 0;
        
        let score = 100;
        if (age >= 65) score -= 20;
        else if (age >= 50) score -= 15;
        else if (age >= 35) score -= 10;
        else if (age >= 18) score -= 5;
        score -= conditionsCount * 8;
        return Math.max(0, Math.min(100, score));
      };

      const healthScores = familyMembers.map(calculateHealthScore);
      const averageHealthScore = healthScores.length > 0
        ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
        : 0;

      // Calculate health alerts
      let healthAlerts = 0;
      
      for (const member of familyMembers) {
        const healthScore = calculateHealthScore(member);
        
        // Count members with poor or fair health status
        if (healthScore < 60) {
          healthAlerts++;
        }
        
        // Check for overdue checkups (more than 1 year)
        const memberAppointments = allAppointments.filter(appt => appt.memberId === member.id);
        const pastAppointments = memberAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate.getTime() <= now.getTime() && appt.status === 'completed';
        });
        
        if (pastAppointments.length > 0) {
          const latestCheckup = pastAppointments.reduce((latest, appt) => {
            const apptDate = new Date(appt.date);
            return !latest || apptDate.getTime() > new Date(latest.date).getTime() ? appt : latest;
          }, null as any);
          
          if (latestCheckup) {
            const checkupDate = new Date(latestCheckup.date);
            const daysSince = Math.floor((now.getTime() - checkupDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince > 365) {
              healthAlerts++;
            }
          }
        } else {
          // No checkup date counts as alert
          healthAlerts++;
        }
        
        // Count urgent upcoming appointments (within 7 days)
        const urgentAppointments = memberAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate.getTime() > now.getTime() && 
                 apptDate.getTime() <= sevenDaysFromNow.getTime() &&
                 appt.status !== 'cancelled';
        });
        
        if (urgentAppointments.length > 0) {
          healthAlerts++;
        }
      }

      return {
        totalMembers: familyMembers.length,
        averageHealthScore: Math.round(averageHealthScore * 10) / 10, // Round to 1 decimal
        totalMedications: allMedications.length,
        upcomingAppointments: upcomingAppointments.length,
        healthAlerts,
        totalAppointments: allAppointments.length,
        totalReminders: allReminders.length,
        totalHealthReports: allHealthReports.length,
      };
    },
  },

  Mutation: {
    // Family Member mutations
    createFamilyMember: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.familyMember.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: {
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    updateFamilyMember: async (_: any, { id, input }: { id: string, input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const member = await prisma.familyMember.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!member) throw new Error('Family member not found');

      return await prisma.familyMember.update({
        where: { id },
        data: input,
        include: {
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    deleteFamilyMember: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const member = await prisma.familyMember.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!member) throw new Error('Family member not found');

      await prisma.familyMember.delete({
        where: { id }
      });

      return true;
    },

    // Appointment mutations
    createAppointment: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.appointment.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: { member: true }
      });
    },

    updateAppointment: async (_: any, { id, input }: { id: string, input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!appointment) throw new Error('Appointment not found');

      return await prisma.appointment.update({
        where: { id },
        data: input,
        include: { member: true }
      });
    },

    deleteAppointment: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!appointment) throw new Error('Appointment not found');

      await prisma.appointment.delete({
        where: { id }
      });

      return true;
    },

    // Medication mutations
    createMedication: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.medication.create({
        data: {
          ...input,
          userId: userContext.userId,
          sideEffects: input.sideEffects || [],
        },
        include: { member: true }
      });
    },

    updateMedication: async (_: any, { id, input }: { id: string, input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const medication = await prisma.medication.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!medication) throw new Error('Medication not found');

      return await prisma.medication.update({
        where: { id },
        data: input,
        include: { member: true }
      });
    },

    deleteMedication: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const medication = await prisma.medication.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!medication) throw new Error('Medication not found');

      await prisma.medication.delete({
        where: { id }
      });

      return true;
    },

    // Reminder mutations
    createReminder: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.reminder.create({
        data: {
          ...input,
          userId: userContext.userId,
          priority: input.priority || 'medium',
        },
        include: { member: true }
      });
    },

    updateReminder: async (_: any, { id, input }: { id: string, input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const reminder = await prisma.reminder.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!reminder) throw new Error('Reminder not found');

      return await prisma.reminder.update({
        where: { id },
        data: input,
        include: { member: true }
      });
    },

    deleteReminder: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const reminder = await prisma.reminder.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!reminder) throw new Error('Reminder not found');

      await prisma.reminder.delete({
        where: { id }
      });

      return true;
    },

    // Health Report mutations
    createHealthReport: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const { autoExtract, extractedText, fileName, ...reportData } = input;
      
      // Validate the report if extracted text is available
      let validationStatus = 'pending';
      let accuracyScore: number | null = null;
      let matchedTerms: string[] = [];
      let rejectionReason: string | null = null;
      let status = 'uploaded';
      
      if (extractedText) {
        const validation = validateMedicalReport(extractedText, fileName);
        validationStatus = validation.isValid ? 'valid' : 'invalid';
        accuracyScore = validation.accuracyScore;
        matchedTerms = validation.matchedTerms;
        rejectionReason = validation.rejectionReason || null;
        status = validation.isValid ? 'validated' : 'rejected';
        
        // If validation fails, return early with rejection
        if (!validation.isValid) {
          return await prisma.healthReport.create({
            data: {
              ...reportData,
              fileName,
              extractedText,
              userId: userContext.userId,
              status: 'rejected',
              validationStatus: 'invalid',
              accuracyScore,
              matchedTerms,
              rejectionReason,
            },
            include: { member: true }
          });
        }
      }
      
      // Create the report
      const report = await prisma.healthReport.create({
        data: {
          ...reportData,
          fileName,
          extractedText,
          userId: userContext.userId,
          status: validationStatus === 'valid' ? 'validated' : 'uploaded',
          validationStatus: validationStatus === 'pending' ? null : validationStatus,
          accuracyScore,
          matchedTerms,
          rejectionReason,
        },
        include: { member: true }
      });
      
      // If autoExtract is enabled and report is valid, automatically extract and create entities
      if (autoExtract && validationStatus === 'valid' && extractedText) {
        try {
          const extracted = await extractDataFromReport(report.fileUrl || undefined, extractedText);
          const targetMemberId = report.memberId || null;
          
          // Create medications
          await Promise.all(
            (extracted.medications || []).map(async (med: any) => {
              const startDate = med.startDate ? new Date(med.startDate) : new Date();
              const endDate = med.endDate ? new Date(med.endDate) : null;
              
              return prisma.medication.create({
                data: {
                  userId: userContext.userId,
                  memberId: targetMemberId,
                  name: med.name || 'Medication',
                  dosage: med.dosage || 'N/A',
                  frequency: med.frequency || 'N/A',
                  startDate,
                  endDate,
                  sideEffects: med.sideEffects || [],
                  status: 'active',
                },
              });
            })
          );
          
          // Create appointments
          await Promise.all(
            (extracted.appointments || []).map(async (appt: any) => {
              const date = appt.date ? new Date(appt.date) : new Date();
              return prisma.appointment.create({
                data: {
                  userId: userContext.userId,
                  memberId: targetMemberId,
                  doctorName: appt.doctorName || 'Doctor',
                  specialty: appt.specialty || 'General',
                  hospital: appt.hospital || '',
                  date,
                  time: appt.time || '10:00 AM',
                  notes: appt.notes || '',
                  status: 'scheduled',
                },
              });
            })
          );
          
          // Create reminders
          await Promise.all(
            (extracted.reminders || []).map(async (rem: any) => {
              const date = rem.date ? new Date(rem.date) : new Date();
              return prisma.reminder.create({
                data: {
                  userId: userContext.userId,
                  memberId: targetMemberId,
                  title: rem.title || 'Reminder',
                  description: rem.type ? `Type: ${rem.type}` : '',
                  type: rem.type || 'other',
                  date,
                  time: rem.time || '09:00 AM',
                  frequency: 'once',
                  priority: 'medium',
                  status: 'active',
                },
              });
            })
          );
          
          // Update report status to analyzed
          await prisma.healthReport.update({
            where: { id: report.id },
            data: {
              status: 'analyzed',
              analysis: {
                extracted,
                autoExtracted: true,
                extractedAt: new Date().toISOString(),
              }
            }
          });
        } catch (error) {
          console.error('Error during auto-extraction:', error);
          // Don't fail the report creation if extraction fails
        }
      }
      
      // Return the report with updated data
      return await prisma.healthReport.findUnique({
        where: { id: report.id },
        include: { member: true }
      });
    },

    updateHealthReport: async (_: any, { id, analysis, status }: { id: string, analysis?: any, status?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const report = await prisma.healthReport.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!report) throw new Error('Health report not found');

      return await prisma.healthReport.update({
        where: { id },
        data: {
          ...(analysis && { analysis }),
          ...(status && { status }),
        },
        include: { member: true }
      });
    },

    deleteHealthReport: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const report = await prisma.healthReport.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!report) throw new Error('Health report not found');

      await prisma.healthReport.delete({
        where: { id }
      });

      return true;
    },

    // AI Insight mutations
    createAIInsight: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.aIInsight.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: { member: true }
      });
    },

    updateAIInsight: async (_: any, { id, actionItems }: { id: string, actionItems?: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const insight = await prisma.aIInsight.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!insight) throw new Error('AI insight not found');

      return await prisma.aIInsight.update({
        where: { id },
        data: { actionItems },
        include: { member: true }
      });
    },

    deleteAIInsight: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const insight = await prisma.aIInsight.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!insight) throw new Error('AI insight not found');

      await prisma.aIInsight.delete({
        where: { id }
      });

      return true;
    },

    // Symptom Analysis mutations
    createSymptomAnalysis: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.symptomAnalysis.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: { member: true }
      });
    },

    deleteSymptomAnalysis: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const analysis = await prisma.symptomAnalysis.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!analysis) throw new Error('Symptom analysis not found');

      await prisma.symptomAnalysis.delete({
        where: { id }
      });

      return true;
    },

    // Enhanced Family Member mutations
    bulkUpdateFamilyMembers: async (_: any, { input }: { input: any[] }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const updatePromises = input.map(async (updateData) => {
        const member = await prisma.familyMember.findFirst({
          where: { 
            id: updateData.id,
            userId: userContext.userId 
          }
        });

        if (!member) throw new Error(`Family member ${updateData.id} not found`);

        return await prisma.familyMember.update({
          where: { id: updateData.id },
          data: updateData,
          include: {
            healthReports: true,
            appointments: true,
            medications: true,
            reminders: true,
            aiInsights: true,
          }
        });
      });

      return await Promise.all(updatePromises);
    },

    // Enhanced Appointment mutations
    rescheduleAppointment: async (_: any, { id, newDate, newTime }: { id: string, newDate: string, newTime: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!appointment) throw new Error('Appointment not found');

      return await prisma.appointment.update({
        where: { id },
        data: { 
          date: new Date(newDate),
          time: newTime,
          status: 'rescheduled'
        },
        include: { member: true }
      });
    },

    markAppointmentCompleted: async (_: any, { id, notes }: { id: string, notes?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!appointment) throw new Error('Appointment not found');

      return await prisma.appointment.update({
        where: { id },
        data: { 
          status: 'completed',
          notes: notes || appointment.notes
        },
        include: { member: true }
      });
    },

    cancelAppointment: async (_: any, { id, reason }: { id: string, reason?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const appointment = await prisma.appointment.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!appointment) throw new Error('Appointment not found');

      return await prisma.appointment.update({
        where: { id },
        data: { 
          status: 'cancelled',
          notes: reason ? `${appointment.notes || ''}\nCancelled: ${reason}` : appointment.notes
        },
        include: { member: true }
      });
    },

    // Enhanced Medication mutations
    markMedicationCompleted: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const medication = await prisma.medication.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!medication) throw new Error('Medication not found');

      return await prisma.medication.update({
        where: { id },
        data: { 
          status: 'completed',
          endDate: new Date()
        },
        include: { member: true }
      });
    },

    updateMedicationDosage: async (_: any, { id, newDosage }: { id: string, newDosage: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const medication = await prisma.medication.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!medication) throw new Error('Medication not found');

      return await prisma.medication.update({
        where: { id },
        data: { dosage: newDosage },
        include: { member: true }
      });
    },

    // Enhanced Reminder mutations
    markReminderCompleted: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const reminder = await prisma.reminder.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!reminder) throw new Error('Reminder not found');

      return await prisma.reminder.update({
        where: { id },
        data: { status: 'completed' },
        include: { member: true }
      });
    },

    snoozeReminder: async (_: any, { id, snoozeUntil }: { id: string, snoozeUntil: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const reminder = await prisma.reminder.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!reminder) throw new Error('Reminder not found');

      return await prisma.reminder.update({
        where: { id },
        data: { 
          date: new Date(snoozeUntil),
          status: 'active'
        },
        include: { member: true }
      });
    },

    // Enhanced Health Report mutations
    processHealthReport: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const report = await prisma.healthReport.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!report) throw new Error('Health report not found');

      // Simulate AI processing
      const mockAnalysis = {
        summary: 'Health report processed successfully',
        keyFindings: ['Normal blood pressure', 'Good cholesterol levels'],
        recommendations: ['Continue current medication', 'Schedule follow-up in 3 months'],
        processedAt: new Date().toISOString()
      };

      return await prisma.healthReport.update({
        where: { id },
        data: { 
          status: 'analyzed',
          analysis: mockAnalysis
        },
        include: { member: true }
      });
    },

    extractTextFromReport: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const report = await prisma.healthReport.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!report) throw new Error('Health report not found');

      // Simulate text extraction
      const extractedText = `Extracted text from ${report.fileName}: This is a mock extraction of medical report content.`;

      return await prisma.healthReport.update({
        where: { id },
        data: { 
          status: 'processing',
          extractedText
        },
        include: { member: true }
      });
    },

    analyzeHealthReport: async (_: any, { reportId, memberId }: { reportId: string, memberId?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');

      // 1. Find report
      const report = await prisma.healthReport.findFirst({
        where: {
          id: reportId,
          userId: userContext.userId,
        }
      });

      if (!report) throw new Error('Health report not found');
      if (!report.fileUrl && !report.extractedText) {
        throw new Error('No file or extracted text available for this report');
      }

      // 2. Extract data via OCR + AI
      const extracted = await extractDataFromReport(report.fileUrl || undefined, report.extractedText || undefined);

      // 3. Determine member target
      const targetMemberId = memberId || report.memberId || null;

      // 4. Create medications
      const createdMedications = await Promise.all(
        (extracted.medications || []).map(async (med: any) => {
          const startDate = med.startDate ? new Date(med.startDate) : new Date();
          const endDate = med.endDate ? new Date(med.endDate) : null;

          return prisma.medication.create({
            data: {
              userId: userContext.userId,
              memberId: targetMemberId,
              name: med.name || 'Medication',
              dosage: med.dosage || 'N/A',
              frequency: med.frequency || 'N/A',
              startDate,
              endDate,
              sideEffects: med.sideEffects || [],
              status: 'active',
            },
            include: { member: true }
          });
        })
      );

      // 5. Create appointments
      const createdAppointments = await Promise.all(
        (extracted.appointments || []).map(async (appt: any) => {
          const date = appt.date ? new Date(appt.date) : new Date();
          return prisma.appointment.create({
            data: {
              userId: userContext.userId,
              memberId: targetMemberId,
              doctorName: appt.doctorName || 'Doctor',
              specialty: appt.specialty || 'General',
              hospital: appt.hospital || '',
              date,
              time: appt.time || '10:00 AM',
              notes: appt.notes || '',
              status: 'scheduled',
            },
            include: { member: true }
          });
        })
      );

      // 6. Create reminders
      const createdReminders = await Promise.all(
        (extracted.reminders || []).map(async (rem: any) => {
          const date = rem.date ? new Date(rem.date) : new Date();
          return prisma.reminder.create({
            data: {
              userId: userContext.userId,
              memberId: targetMemberId,
              title: rem.title || 'Reminder',
              description: rem.type ? `Type: ${rem.type}` : '',
              type: rem.type || 'other',
              date,
              time: rem.time || '09:00 AM',
              frequency: 'once',
              priority: 'medium',
              status: 'active',
            },
            include: { member: true }
          });
        })
      );

      // 7. Return created entities and extracted data
      return {
        medications: createdMedications,
        appointments: createdAppointments,
        reminders: createdReminders,
        extracted: {
          medications: extracted.medications || [],
          appointments: extracted.appointments || [],
          reminders: extracted.reminders || [],
        },
      };
    },

    // Enhanced AI Insight mutations
    generateHealthInsights: async (_: any, { memberId }: { memberId?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      // Generate mock AI insights
      const insights = [
        {
          type: 'health_trend',
          title: 'Blood Pressure Trend',
          description: 'Your blood pressure readings show improvement over the last month.',
          severity: 'low',
          category: 'cardiovascular',
          data: {
            trend: 'improving',
            readings: [140, 135, 130, 125],
            dates: ['2024-11-01', '2024-11-08', '2024-11-15', '2024-11-22']
          },
          actionItems: {
            continue: ['Taking medication as prescribed'],
            monitor: ['Blood pressure weekly'],
            consider: ['Reducing sodium intake']
          }
        },
        {
          type: 'recommendation',
          title: 'Exercise Recommendation',
          description: 'Consider increasing physical activity for better cardiovascular health.',
          severity: 'medium',
          category: 'general',
          data: {
            currentActivity: 'low',
            recommendedActivity: 'moderate',
            benefits: ['Improved heart health', 'Better sleep', 'Weight management']
          },
          actionItems: {
            start: ['30 minutes of walking daily'],
            track: ['Daily step count'],
            goal: ['10,000 steps per day']
          }
        }
      ];

      const createdInsights = await Promise.all(
        insights.map(insight => 
          prisma.aIInsight.create({
            data: {
              ...insight,
              userId: userContext.userId,
              memberId: memberId || null,
            },
            include: { member: true }
          })
        )
      );

      return createdInsights;
    },

    updateInsightActionItems: async (_: any, { id, actionItems }: { id: string, actionItems: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const insight = await prisma.aIInsight.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!insight) throw new Error('AI insight not found');

      return await prisma.aIInsight.update({
        where: { id },
        data: { actionItems },
        include: { member: true }
      });
    },

    // Enhanced Symptom Analysis mutations
    analyzeSymptoms: async (_: any, { symptoms, memberId }: { symptoms: any, memberId?: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      // Mock symptom analysis
      const analysis = {
        possibleConditions: ['Common cold', 'Allergic reaction', 'Stress'],
        urgencyLevel: 'low',
        recommendations: ['Rest and hydration', 'Monitor symptoms', 'See doctor if symptoms worsen'],
        analyzedAt: new Date().toISOString()
      };

      const conditions = {
        primary: 'Common cold',
        secondary: ['Allergic reaction'],
        ruledOut: ['Serious infection']
      };

      return await prisma.symptomAnalysis.create({
        data: {
          userId: userContext.userId,
          memberId: memberId || null,
          symptoms,
          analysis,
          conditions,
          urgencyLevel: 'low'
        },
        include: { member: true }
      });
    },

    // User Profile mutations
    updateUserProfile: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.user.update({
        where: { id: userContext.userId },
        data: input,
        include: {
          familyMembers: true,
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    updateUserPreferences: async (_: any, { preferences }: { preferences: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      // For now, we'll store preferences in a simple way
      // In a real app, you might want a separate preferences table
      return await prisma.user.update({
        where: { id: userContext.userId },
        data: { 
          // Store preferences in a JSON field or separate table
        },
        include: {
          familyMembers: true,
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    // Emergency ID mutations
    generateEmergencyQR: async (_: any, { userId }: { userId: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const user = await prisma.user.findFirst({
        where: { 
          id: userId,
          clerkId: userContext.clerkId 
        },
        include: { familyMembers: true }
      });

      if (!user) throw new Error('User not found');

      const emergencyData = {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        familyMembers: user.familyMembers.map(member => ({
          name: member.name,
          relationship: member.relationship,
          bloodType: member.bloodType,
          allergies: member.allergies,
          emergencyContacts: member.emergencyContacts
        }))
      };

      return JSON.stringify(emergencyData);
    },

    updateEmergencyContacts: async (_: any, { contacts }: { contacts: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      // This would typically update emergency contacts for all family members
      // For now, we'll just return the user
      return await prisma.user.findUnique({
        where: { id: userContext.userId },
        include: {
          familyMembers: true,
          healthReports: true,
          appointments: true,
          medications: true,
          reminders: true,
          aiInsights: true,
        }
      });
    },

    // Health Metrics mutations
    recordHealthMetric: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.healthMetric.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: { member: true }
      });
    },

    updateHealthMetric: async (_: any, { id, input }: { id: string, input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const metric = await prisma.healthMetric.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!metric) throw new Error('Health metric not found');

      return await prisma.healthMetric.update({
        where: { id },
        data: input,
        include: { member: true }
      });
    },

    deleteHealthMetric: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const metric = await prisma.healthMetric.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!metric) throw new Error('Health metric not found');

      await prisma.healthMetric.delete({
        where: { id }
      });

      return true;
    },

    // Wearable Data mutations
    syncWearableData: async (_: any, { input }: { input: any }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      return await prisma.wearableData.create({
        data: {
          ...input,
          userId: userContext.userId,
        },
        include: { member: true }
      });
    },

    processWearableData: async (_: any, { id }: { id: string }, { userContext }: { userContext: UserContext }) => {
      if (!userContext) throw new Error('Authentication required');
      
      const data = await prisma.wearableData.findFirst({
        where: { 
          id,
          userId: userContext.userId 
        }
      });

      if (!data) throw new Error('Wearable data not found');

      // Simulate data processing
      const processedData = {
        ...(data.data as object),
        processedAt: new Date().toISOString(),
        insights: ['Increased heart rate detected', 'Good sleep quality']
      };

      return await prisma.wearableData.update({
        where: { id },
        data: { 
          status: 'processed',
          processedAt: new Date(),
          data: processedData
        },
        include: { member: true }
      });
    },
  },
};

