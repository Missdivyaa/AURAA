import { PrismaClient } from '@prisma/client';
import { extractDataFromReport } from '../utils/report-extraction';
import { generateInsightsFromReport } from '../utils/insight-generator';
import { generateHealthPredictions } from '../utils/prediction-generator';
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
      
      try {
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
      } catch (error: any) {
        console.error('Error fetching family members:', error);
        if (error.message?.includes('Can\'t reach database server')) {
          throw new Error('Database connection failed. Please check your DATABASE_URL and ensure the database server is running.');
        }
        throw error;
      }
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
      
      try {
        return await prisma.appointment.findMany({
          where: { userId: userContext.userId },
          include: { member: true },
          orderBy: { date: 'asc' }
        });
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        if (error.message?.includes('Can\'t reach database server')) {
          throw new Error('Database connection failed. Please check your DATABASE_URL and ensure the database server is running.');
        }
        throw error;
      }
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
      
      // Return user preferences with defaults
      const preferences = user.preferences as any || {};
      return {
        notifications: preferences.notifications || {
          push: true,
          email: true,
          sms: false,
          reminders: true,
          healthAlerts: true,
          weeklyReports: false
        },
        privacy: preferences.privacy || {
          dataSharing: false,
          analytics: true,
          emergencyAccess: true,
          familySharing: true
        },
        appearance: preferences.appearance || {
          theme: 'light'
        },
        ...preferences
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
      
      const medication = await prisma.medication.create({
        data: {
          ...input,
          userId: userContext.userId,
          sideEffects: input.sideEffects || [],
        },
        include: { member: true }
      });

      // Automatically create reminders based on medication frequency
      try {
        const frequency = input.frequency?.toLowerCase() || '';
        const medicationName = input.name || 'Medication';
        const startDate = new Date(input.startDate);
        
        // Determine reminder times based on frequency
        let reminderTimes: string[] = [];
        let reminderFrequency = 'daily';
        
        if (frequency.includes('twice') || frequency.includes('2 times')) {
          reminderTimes = ['09:00', '21:00']; // Morning and evening
        } else if (frequency.includes('three times') || frequency.includes('3 times') || frequency.includes('thrice')) {
          reminderTimes = ['08:00', '14:00', '20:00']; // Morning, afternoon, evening
        } else if (frequency.includes('four times') || frequency.includes('4 times')) {
          reminderTimes = ['08:00', '12:00', '18:00', '22:00'];
        } else if (frequency.includes('weekly') || frequency.includes('once a week')) {
          reminderTimes = ['10:00'];
          reminderFrequency = 'weekly';
        } else if (frequency.includes('monthly') || frequency.includes('once a month')) {
          reminderTimes = ['10:00'];
          reminderFrequency = 'monthly';
        } else {
          // Default: once daily
          reminderTimes = ['09:00'];
        }

        // Create reminders for each time
        for (const time of reminderTimes) {
          await prisma.reminder.create({
            data: {
              userId: userContext.userId,
              memberId: input.memberId || null,
              title: `Take ${medicationName}`,
              description: `${medicationName} ${input.dosage || ''}`.trim(),
              type: 'medication',
              date: startDate,
              time: time,
              frequency: reminderFrequency,
              priority: 'high',
              status: 'active',
            }
          });
        }
        
        console.log(`✅ Created ${reminderTimes.length} reminder(s) for medication: ${medicationName}`);
      } catch (reminderError: any) {
        console.error('⚠️ Error creating reminders for medication:', reminderError);
        // Don't fail medication creation if reminder creation fails
      }

      return medication;
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
      
      // Validate the report - REQUIRED for upload
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('Report validation failed: No text content found in the document. Please upload a readable medical report.');
      }
      
      const validation = validateMedicalReport(extractedText, fileName);
      
      // REJECT invalid reports - do not save to database
      if (!validation.isValid) {
        throw new Error(
          `Report validation failed: ${validation.rejectionReason || 'Document does not appear to be a valid medical report.'} ` +
          `Accuracy: ${Math.round(validation.accuracyScore * 100)}% (minimum 60% required). ` +
          `Please upload a valid medical report only.`
        );
      }
      
      // Only proceed if validation passes
      const validationStatus = 'valid';
      const accuracyScore = validation.accuracyScore;
      const matchedTerms = validation.matchedTerms;
      const status = 'validated';
      
      // Create the report (only valid reports reach here)
      // Ensure memberId is explicitly set from input
      const reportMemberId = input.memberId || null;
      
      const report = await prisma.healthReport.create({
        data: {
          ...reportData,
          memberId: reportMemberId, // Explicitly set memberId
          fileName,
          extractedText,
          userId: userContext.userId,
          status: 'validated',
          validationStatus: 'valid',
          accuracyScore,
          matchedTerms,
          rejectionReason: null, // No rejection reason for valid reports
        },
        include: { member: true }
      });
      
      console.log(`📄 Created health report ${report.id} for memberId: ${reportMemberId || 'null (no member assigned)'}`);
      
      // If autoExtract is enabled and report is valid, automatically extract and create entities
      if (autoExtract && validationStatus === 'valid' && extractedText) {
        try {
          const extracted = await extractDataFromReport(report.fileUrl || undefined, extractedText);
          // Use the explicitly set memberId from the report
          const targetMemberId = report.memberId || reportMemberId || null;
          
          console.log(`🔍 Extracting data for report ${report.id}, targetMemberId: ${targetMemberId || 'null'}`);
          
          // CRITICAL: Only create medications/appointments/reminders if we have a valid memberId
          if (!targetMemberId) {
            console.warn(`⚠️ Cannot auto-extract data: No memberId specified for report ${report.id}`);
            // Update report status but don't create medications without a member
            await prisma.healthReport.update({
              where: { id: report.id },
              data: {
                status: 'validated',
                analysis: {
                  extracted,
                  autoExtracted: false,
                  reason: 'No memberId specified - cannot assign medications/appointments',
                  extractedAt: new Date().toISOString(),
                }
              }
            });
            return report;
          }
          
          // Update family member with conditions and patient info if memberId exists
          if (targetMemberId && (extracted.conditions?.length > 0 || extracted.patientInfo)) {
            const member = await prisma.familyMember.findFirst({
              where: { id: targetMemberId, userId: userContext.userId }
            });
            
            if (member) {
              const existingConditions = Array.isArray(member.conditions) ? member.conditions : [];
              const newConditions = extracted.conditions || [];
              // Merge conditions, removing duplicates
              const updatedConditions = [...new Set([...existingConditions, ...newConditions])];
              
              const updateData: any = {
                conditions: updatedConditions,
              };
              
              // Update patient info if available
              if (extracted.patientInfo) {
                if (extracted.patientInfo.bloodType && !member.bloodType) {
                  updateData.bloodType = extracted.patientInfo.bloodType;
                }
                // Note: age and gender are typically set during member creation, but we can update if needed
              }
              
              await prisma.familyMember.update({
                where: { id: targetMemberId },
                data: updateData,
              });
              
              console.log(`✅ Updated family member ${targetMemberId} with ${updatedConditions.length} conditions`);
            }
          }
          
          // Verify the target member exists and belongs to the user
          const targetMember = await prisma.familyMember.findFirst({
            where: {
              id: targetMemberId,
              userId: userContext.userId
            }
          });
          
          if (!targetMember) {
            console.error(`❌ Target member ${targetMemberId} not found or doesn't belong to user ${userContext.userId}`);
            throw new Error(`Family member not found or access denied`);
          }
          
          console.log(`✅ Verified target member: ${targetMember.name} (${targetMember.id})`);
          
          // Create medications
          console.log(`📋 Extracted medications count: ${extracted.medications?.length || 0}`);
          console.log(`📋 Extracted medications:`, JSON.stringify(extracted.medications, null, 2));
          console.log(`📋 Creating medications for memberId: ${targetMemberId} (${targetMember.name})`);
          
          // Filter out medications with invalid or empty names
          const validMedications = (extracted.medications || []).filter((med: any) => {
            const name = (med.name || '').trim();
            return name.length > 0 && name !== 'Medication'; // Don't create generic "Medication" entries
          });
          
          console.log(`✅ Valid medications after filtering: ${validMedications.length}`);
          
          const createdMedications = await Promise.all(
            validMedications.map(async (med: any) => {
              try {
                const startDate = med.startDate ? new Date(med.startDate) : new Date();
                const endDate = med.endDate ? new Date(med.endDate) : null;
                
                // Ensure name is not empty
                const medicationName = (med.name || '').trim();
                if (!medicationName || medicationName.length === 0) {
                  console.warn(`⚠️ Skipping medication with empty name:`, med);
                  return null;
                }

                const medication = await prisma.medication.create({
                  data: {
                    userId: userContext.userId,
                    memberId: targetMemberId, // Explicitly use targetMemberId - should never be null here
                    name: medicationName,
                    dosage: (med.dosage || '').trim() || 'N/A',
                    frequency: (med.frequency || '').trim() || 'N/A',
                    startDate,
                    endDate,
                    sideEffects: Array.isArray(med.sideEffects) ? med.sideEffects : [],
                    status: 'active',
                  },
                  include: { member: true }
                });
                
                console.log(`✅ Created medication "${medication.name}" for member: ${medication.member?.name || 'unknown'} (memberId: ${medication.memberId})`);
                return medication;
              } catch (error: any) {
                console.error(`❌ Error creating medication ${med.name}:`, error.message);
                // Don't throw - continue with other medications
                return null;
              }
            })
          );
          
          // Filter out null values from failed creations
          const successfulMedications = createdMedications.filter((med: any) => med !== null);
          console.log(`✅ Successfully created ${successfulMedications.length} medications out of ${validMedications.length} valid medications`);
          
          // Create appointments
          const createdAppointments = await Promise.all(
            (extracted.appointments || []).map(async (appt: any) => {
              // Parse date string (handle formats like "20 January 2026")
              let date = new Date();
              if (appt.date) {
                const parsedDate = new Date(appt.date);
                if (!isNaN(parsedDate.getTime())) {
                  date = parsedDate;
                }
              }
              
              return prisma.appointment.create({
                data: {
                  userId: userContext.userId,
                  memberId: targetMemberId, // Explicitly use targetMemberId
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
          
          console.log(`✅ Created ${createdAppointments.length} appointments for memberId: ${targetMemberId}`);
          
          // Create reminders
          const createdReminders = await Promise.all(
            (extracted.reminders || []).map(async (rem: any) => {
              let date = new Date();
              if (rem.date) {
                const parsedDate = new Date(rem.date);
                if (!isNaN(parsedDate.getTime())) {
                  date = parsedDate;
                }
              }
              
              return prisma.reminder.create({
                data: {
                  userId: userContext.userId,
                  memberId: targetMemberId, // Explicitly use targetMemberId
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
          
          console.log(`✅ Created ${createdReminders.length} reminders for memberId: ${targetMemberId}`);
          
          // Generate AI insights from the extracted data
          let createdInsights: any[] = [];
          try {
            const member = targetMemberId ? await prisma.familyMember.findFirst({
              where: { id: targetMemberId, userId: userContext.userId }
            }) : null;
            
            const insights = generateInsightsFromReport(extracted, member?.name);
            console.log(`🤖 Generated ${insights.length} insights from report`);
            
            createdInsights = await Promise.all(
              insights.map(insight =>
                prisma.aIInsight.create({
                  data: {
                    userId: userContext.userId,
                    memberId: targetMemberId,
                    type: insight.type,
                    title: insight.title,
                    description: insight.description,
                    severity: insight.severity,
                    category: insight.category,
                    data: insight.data,
                    actionItems: insight.actionItems,
                  },
                  include: { member: true }
                })
              )
            );
            
            console.log(`✅ Created ${createdInsights.length} AI insights`);
          } catch (insightError: any) {
            console.error('❌ Error generating insights:', insightError.message);
            // Don't fail the report analysis if insights fail
          }
          
          // Update report status to analyzed
          await prisma.healthReport.update({
            where: { id: report.id },
            data: {
              status: 'analyzed',
              analysis: {
                extracted,
                autoExtracted: true,
                extractedAt: new Date().toISOString(),
                medicationsCreated: successfulMedications.length,
                appointmentsCreated: createdAppointments.length,
                remindersCreated: createdReminders.length,
                conditionsExtracted: extracted.conditions?.length || 0,
                insightsCreated: createdInsights.length,
              }
            }
          });
          
          console.log(`✅ Report ${report.id} fully analyzed and data extracted`);
        } catch (error) {
          console.error('❌ Error during auto-extraction:', error);
          // Update report status to error but don't fail the report creation
          await prisma.healthReport.update({
            where: { id: report.id },
            data: {
              status: 'error',
              analysis: {
                error: error instanceof Error ? error.message : 'Unknown extraction error',
                extractedAt: new Date().toISOString(),
              }
            }
          });
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
      console.log(`📋 Extracted medications count: ${extracted.medications?.length || 0}`);
      console.log(`📋 Extracted medications:`, JSON.stringify(extracted.medications, null, 2));
      
      // Filter out medications with invalid or empty names
      const validMedications = (extracted.medications || []).filter((med: any) => {
        const name = (med.name || '').trim();
        return name.length > 0 && name !== 'Medication'; // Don't create generic "Medication" entries
      });
      
      console.log(`✅ Valid medications after filtering: ${validMedications.length}`);
      
      const createdMedications = await Promise.all(
        validMedications.map(async (med: any) => {
          try {
            const startDate = med.startDate ? new Date(med.startDate) : new Date();
            const endDate = med.endDate ? new Date(med.endDate) : null;
            
            // Ensure name is not empty
            const medicationName = (med.name || '').trim();
            if (!medicationName || medicationName.length === 0) {
              console.warn(`⚠️ Skipping medication with empty name:`, med);
              return null;
            }

            const medication = await prisma.medication.create({
              data: {
                userId: userContext.userId,
                memberId: targetMemberId,
                name: medicationName,
                dosage: (med.dosage || '').trim() || 'N/A',
                frequency: (med.frequency || '').trim() || 'N/A',
                startDate,
                endDate,
                sideEffects: Array.isArray(med.sideEffects) ? med.sideEffects : [],
                status: 'active',
              },
              include: { member: true }
            });
            
            console.log(`✅ Created medication: ${medication.name}`);
            return medication;
          } catch (error: any) {
            console.error(`❌ Error creating medication ${med.name}:`, error.message);
            // Don't throw - continue with other medications
            return null;
          }
        })
      );
      
      // Filter out null values from failed creations
      const successfulMedications = createdMedications.filter((med: any) => med !== null);
      console.log(`✅ Successfully created ${successfulMedications.length} medications out of ${validMedications.length} valid medications`);

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

      // 7. Generate AI insights from extracted data
      let createdInsights: any[] = [];
      try {
        const member = targetMemberId ? await prisma.familyMember.findFirst({
          where: { id: targetMemberId, userId: userContext.userId }
        }) : null;
        
        const insights = generateInsightsFromReport(extracted, member?.name);
        console.log(`🤖 Generated ${insights.length} insights from report analysis`);
        
        createdInsights = await Promise.all(
          insights.map(insight =>
            prisma.aIInsight.create({
              data: {
                userId: userContext.userId,
                memberId: targetMemberId,
                type: insight.type,
                title: insight.title,
                description: insight.description,
                severity: insight.severity,
                category: insight.category,
                data: insight.data,
                actionItems: insight.actionItems,
              },
              include: { member: true }
            })
          )
        );
        
        console.log(`✅ Created ${createdInsights.length} AI insights`);
      } catch (insightError: any) {
        console.error('❌ Error generating insights:', insightError.message);
        // Don't fail the analysis if insights fail
      }

      // 8. Generate health predictions based on all health data (including this new report)
      try {
        const predictions = await generateHealthPredictions(userContext.userId, targetMemberId || undefined, prisma);
        console.log(`🔮 Generated ${predictions.length} health predictions`);
        
        // Convert predictions to insights and save
        for (const prediction of predictions) {
          const predictionInsight = await prisma.aIInsight.create({
            data: {
              userId: userContext.userId,
              memberId: targetMemberId,
              type: 'prediction',
              title: `Health Prediction: ${prediction.condition}`,
              description: `Based on current health data, there is a ${prediction.probability}% probability of ${prediction.condition} within ${prediction.timeframe}. Risk factors: ${prediction.riskFactors.join(', ')}.`,
              severity: prediction.severity,
              category: 'health',
              data: {
                condition: prediction.condition,
                probability: prediction.probability,
                timeframe: prediction.timeframe,
                riskFactors: prediction.riskFactors,
                confidence: prediction.confidence,
                basedOn: prediction.basedOn
              },
              actionItems: {
                immediate: prediction.preventionTips.slice(0, 3),
                shortTerm: prediction.preventionTips.slice(3, 5),
                longTerm: prediction.preventionTips.slice(5)
              }
            },
            include: { member: true }
          });
          
          createdInsights.push(predictionInsight);
        }
      } catch (predictionError: any) {
        console.error('❌ Error generating predictions:', predictionError.message);
        // Don't fail if predictions fail
      }

      // 8. Return created entities and extracted data
      return {
        medications: successfulMedications,
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
      
      try {
        console.log(`🤖 Generating health insights for memberId: ${memberId || 'all members'}`);
        
        // First, clean up any existing duplicate predictions
        try {
          const allExistingPredictions = await prisma.aIInsight.findMany({
            where: {
              userId: userContext.userId,
              memberId: memberId || undefined,
              type: 'prediction'
            },
            orderBy: { createdAt: 'desc' }
          });

          // Group by condition (normalized) and memberId, keep only most recent
          const predictionGroups = new Map<string, any[]>();
          allExistingPredictions.forEach(p => {
            try {
              const data = p.data as any;
              const condition = (data?.condition || '').toLowerCase().trim();
              const key = `${condition}-${p.memberId || 'all'}`;
              if (!predictionGroups.has(key)) {
                predictionGroups.set(key, []);
              }
              predictionGroups.get(key)!.push(p);
            } catch (err) {
              console.warn(`⚠️ Error processing prediction ${p.id} for cleanup:`, err);
            }
          });

          // Delete duplicates, keeping only the most recent one
          for (const [key, group] of predictionGroups.entries()) {
            if (group.length > 1) {
              const toDelete = group.slice(1); // Keep first (most recent), delete rest
              for (const duplicate of toDelete) {
                try {
                  await prisma.aIInsight.delete({ where: { id: duplicate.id } });
                  console.log(`🗑️ Cleaned up duplicate prediction: ${key}`);
                } catch (deleteError) {
                  console.warn(`⚠️ Error deleting duplicate prediction ${duplicate.id}:`, deleteError);
                }
              }
            }
          }
        } catch (cleanupError: any) {
          console.warn('⚠️ Error during cleanup of duplicate predictions:', cleanupError.message);
          // Continue with generation even if cleanup fails
        }
      
      // Get all health reports for the user (optionally filtered by member)
      const reports = await prisma.healthReport.findMany({
        where: {
          userId: userContext.userId,
          memberId: memberId || undefined,
          status: 'analyzed', // Only analyze reports that have been processed
        },
        include: {
          member: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Analyze last 10 reports
      });

      console.log(`📊 Found ${reports.length} analyzed reports to generate insights from`);

      const allInsights: any[] = [];

      // Generate insights from each report
      for (const report of reports) {
        try {
          if (!report.analysis || typeof report.analysis !== 'object') {
            console.warn(`⚠️ Report ${report.id} has no analysis data, skipping`);
            continue;
          }

          const analysis = report.analysis as any;
          const extracted = analysis.extracted;

          if (!extracted) {
            console.warn(`⚠️ Report ${report.id} has no extracted data, skipping`);
            continue;
          }

          const memberName = report.member?.name;
          const insights = generateInsightsFromReport(extracted, memberName);
          
          console.log(`✅ Generated ${insights.length} insights from report ${report.id}`);
          
          // Create insights in database
          const createdInsights = await Promise.all(
            insights.map(insight =>
              prisma.aIInsight.create({
                data: {
                  userId: userContext.userId,
                  memberId: report.memberId || memberId || null,
                  type: insight.type,
                  title: insight.title,
                  description: insight.description,
                  severity: insight.severity,
                  category: insight.category,
                  data: insight.data,
                  actionItems: insight.actionItems,
                },
                include: { member: true }
              })
            )
          );

          allInsights.push(...createdInsights);
        } catch (error: any) {
          console.error(`❌ Error generating insights from report ${report.id}:`, error.message);
          // Continue with other reports
        }
      }

      // Generate health predictions based on all health data
      console.log('🔮 Generating health predictions from real data...');
      try {
        const predictions = await generateHealthPredictions(userContext.userId, memberId, prisma);
        console.log(`✅ Generated ${predictions.length} health predictions`);

        // Check for ALL existing predictions to prevent duplicates (not just last week)
        const existingPredictions = await prisma.aIInsight.findMany({
          where: {
            userId: userContext.userId,
            memberId: memberId || undefined,
            type: 'prediction'
          }
        });

        // Create a set of existing conditions to check for duplicates
        // Use condition name only (case-insensitive) to catch duplicates even with slight variations
        const existingConditions = new Set(
          existingPredictions.map(p => {
            const data = p.data as any;
            const condition = (data?.condition || '').toLowerCase().trim();
            return `${condition}-${p.memberId || 'all'}`;
          })
        );

        // Delete old duplicate predictions before creating new ones
        // Group by condition and keep only the most recent one
        const conditionGroups = new Map<string, any[]>();
        existingPredictions.forEach(p => {
          const data = p.data as any;
          const condition = (data?.condition || '').toLowerCase().trim();
          const key = `${condition}-${p.memberId || 'all'}`;
          if (!conditionGroups.has(key)) {
            conditionGroups.set(key, []);
          }
          conditionGroups.get(key)!.push(p);
        });

        // Delete duplicates, keeping only the most recent
        for (const [key, group] of conditionGroups.entries()) {
          if (group.length > 1) {
            // Sort by createdAt descending, keep first, delete rest
            group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const toDelete = group.slice(1);
            for (const duplicate of toDelete) {
              await prisma.aIInsight.delete({ where: { id: duplicate.id } });
              console.log(`🗑️ Deleted duplicate prediction: ${key}`);
            }
          }
        }

        // Convert predictions to insights and save to database (only if not duplicate)
        for (const prediction of predictions) {
          const conditionKey = prediction.condition.toLowerCase().trim();
          const uniqueKey = `${conditionKey}-${memberId || 'all'}`;
          
          // Skip if this prediction already exists
          if (existingConditions.has(uniqueKey)) {
            console.log(`⏭️ Skipping duplicate prediction: ${prediction.condition}`);
            continue;
          }

          const member = memberId ? await prisma.familyMember.findFirst({
            where: { id: memberId, userId: userContext.userId }
          }) : null;

          // Calculate severity from probability (real calculation)
          let severity: 'low' | 'medium' | 'high' = 'low';
          if (prediction.probability >= 60) {
            severity = 'high';
          } else if (prediction.probability >= 40) {
            severity = 'medium';
          } else {
            severity = 'low';
          }

          const predictionInsight = await prisma.aIInsight.create({
            data: {
              userId: userContext.userId,
              memberId: memberId || null,
              type: 'prediction',
              title: `Health Prediction: ${prediction.condition}`,
              description: `Based on your current health data, there is a ${prediction.probability}% probability of developing ${prediction.condition} within ${prediction.timeframe}. Risk factors: ${prediction.riskFactors.join(', ')}.`,
              severity: severity, // Use calculated severity from probability
              category: 'health',
              data: {
                condition: prediction.condition,
                probability: prediction.probability,
                timeframe: prediction.timeframe,
                riskFactors: prediction.riskFactors,
                confidence: prediction.confidence,
                basedOn: prediction.basedOn
              },
              actionItems: {
                immediate: prediction.preventionTips.slice(0, 3),
                shortTerm: prediction.preventionTips.slice(3, 5),
                longTerm: prediction.preventionTips.slice(5)
              }
            },
            include: { member: true }
          });

          allInsights.push(predictionInsight);
          existingConditions.add(uniqueKey); // Track newly created to prevent duplicates in same batch
        }
      } catch (predictionError: any) {
        console.error('❌ Error generating predictions:', predictionError.message);
        // Don't fail if predictions fail
      }

      // Always generate insights from current health data (medications, appointments, reminders)
      console.log('📝 Generating insights from current health data (medications, appointments, reminders)');
      
      // Get comprehensive member data
      const members = await prisma.familyMember.findMany({
        where: {
          userId: userContext.userId,
          id: memberId || undefined
        },
        include: {
          medications: {
            where: { status: 'active' }
          },
          appointments: {
            where: { status: { not: 'cancelled' } },
            orderBy: { date: 'desc' }
          },
          reminders: {
            where: { status: 'active' }
          },
          healthReports: {
            where: { status: 'analyzed' },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      for (const member of members) {
        try {
          const memberName = member.name;
          
          // Generate insights based on medications
          if (member.medications.length > 0) {
          const activeMedications = member.medications.filter(m => m.status === 'active');
          const medicationNames = activeMedications.map(m => m.name.toLowerCase());
          
          // Check for medication reminders created
          const medicationReminders = member.reminders.filter(r => 
            r.type === 'medication' && r.status === 'active'
          );
          
          if (medicationReminders.length > 0) {
            const recentReminder = medicationReminders.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            
            // Check if this insight already exists
            const existingInsight = await prisma.aIInsight.findFirst({
              where: {
                userId: userContext.userId,
                memberId: member.id,
                title: { contains: 'Medication Reminder Created' },
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
              }
            });
            
            if (!existingInsight) {
              allInsights.push(
                await prisma.aIInsight.create({
                  data: {
                    userId: userContext.userId,
                    memberId: member.id,
                    type: 'medication',
                    title: 'Medication Reminder Created',
                    description: `AI detected ${activeMedications.length} active medication(s) and automatically created reminder(s) for ${memberName}.`,
                    severity: 'high',
                    category: 'medication',
                    data: { 
                      medicationCount: activeMedications.length,
                      reminderTime: recentReminder.time,
                      medications: activeMedications.map(m => ({ name: m.name, dosage: m.dosage }))
                    },
                    actionItems: {
                      immediate: ['Follow medication schedule', 'Set up reminders'],
                      shortTerm: ['Track medication adherence'],
                    }
                  },
                  include: { member: true }
                })
              );
            }
          }

          // Diabetes medication insight
          if (medicationNames.some(name => name.includes('metformin') || name.includes('insulin') || name.includes('glipizide'))) {
            const existingInsight = await prisma.aIInsight.findFirst({
              where: {
                userId: userContext.userId,
                memberId: member.id,
                title: { contains: 'Diabetes Management' },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Within last week
              }
            });
            
            if (!existingInsight) {
              allInsights.push(
                await prisma.aIInsight.create({
                  data: {
                    userId: userContext.userId,
                    memberId: member.id,
                    type: 'recommendation',
                    title: 'Diabetes Management Active',
                    description: `${memberName} is on diabetes medication. Regular monitoring of blood sugar levels and HbA1c is crucial for effective management.`,
                    severity: 'medium',
                    category: 'medication',
                    data: { 
                      medications: activeMedications.filter(m => 
                        m.name.toLowerCase().includes('metformin') || 
                        m.name.toLowerCase().includes('insulin') ||
                        m.name.toLowerCase().includes('glipizide')
                      ).map(m => ({ name: m.name, dosage: m.dosage }))
                    },
                    actionItems: {
                      immediate: ['Monitor blood sugar regularly', 'Follow medication schedule', 'Track HbA1c levels'],
                      shortTerm: ['Schedule regular checkups with endocrinologist', 'Maintain diabetes-friendly diet'],
                      longTerm: ['Annual comprehensive diabetes screening', 'Regular eye and foot examinations']
                    }
                  },
                  include: { member: true }
                })
              );
            }
          }

          // Hypertension medication insight
          if (medicationNames.some(name => name.includes('amlodipine') || name.includes('lisinopril') || name.includes('losartan') || name.includes('atenolol'))) {
            const existingInsight = await prisma.aIInsight.findFirst({
              where: {
                userId: userContext.userId,
                memberId: member.id,
                title: { contains: 'Hypertension Management' },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
              }
            });
            
            if (!existingInsight) {
              allInsights.push(
                await prisma.aIInsight.create({
                  data: {
                    userId: userContext.userId,
                    memberId: member.id,
                    type: 'recommendation',
                    title: 'Hypertension Management Active',
                    description: `${memberName} is taking blood pressure medication. Consistent monitoring and lifestyle modifications are important for optimal control.`,
                    severity: 'medium',
                    category: 'medication',
                    data: { 
                      medications: activeMedications.filter(m => 
                        m.name.toLowerCase().includes('amlodipine') || 
                        m.name.toLowerCase().includes('lisinopril') ||
                        m.name.toLowerCase().includes('losartan') ||
                        m.name.toLowerCase().includes('atenolol')
                      ).map(m => ({ name: m.name, dosage: m.dosage }))
                    },
                    actionItems: {
                      immediate: ['Monitor blood pressure daily', 'Take medication at same time each day', 'Limit sodium intake'],
                      shortTerm: ['Schedule follow-up appointment', 'Maintain healthy diet (DASH diet recommended)'],
                      longTerm: ['Annual cardiovascular assessment', 'Regular kidney function tests']
                    }
                  },
                  include: { member: true }
                })
              );
            }
          }

          // Multiple medications (polypharmacy) insight
          if (activeMedications.length >= 3) {
            const existingInsight = await prisma.aIInsight.findFirst({
              where: {
                userId: userContext.userId,
                memberId: member.id,
                title: { contains: 'Multiple Medications' },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
              }
            });
            
            if (!existingInsight) {
              allInsights.push(
                await prisma.aIInsight.create({
                  data: {
                    userId: userContext.userId,
                    memberId: member.id,
                    type: 'alert',
                    title: 'Multiple Medications Detected',
                    description: `${memberName} is taking ${activeMedications.length} medications. Regular medication review is recommended to prevent interactions and optimize treatment.`,
                    severity: 'high',
                    category: 'medication',
                    data: { 
                      medicationCount: activeMedications.length,
                      medications: activeMedications.map(m => ({ name: m.name, dosage: m.dosage }))
                    },
                    actionItems: {
                      immediate: ['Review all medications with healthcare provider', 'Check for potential drug interactions'],
                      shortTerm: ['Schedule medication review appointment', 'Create medication schedule/reminder system'],
                      longTerm: ['Annual comprehensive medication review', 'Consider medication simplification if possible']
                    }
                  },
                  include: { member: true }
                })
              );
            }
          }
        }

        // Generate insights based on appointments
        if (member.appointments.length > 0) {
          const upcomingAppointments = member.appointments.filter(apt => {
            const aptDate = new Date(apt.date)
            return aptDate.getTime() > Date.now() && apt.status !== 'cancelled'
          });
          
          if (upcomingAppointments.length > 0) {
            const nextAppointment = upcomingAppointments.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
            
            const daysUntil = Math.floor((new Date(nextAppointment.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 7) {
              const existingInsight = await prisma.aIInsight.findFirst({
                where: {
                  userId: userContext.userId,
                  memberId: member.id,
                  title: { contains: 'Upcoming Appointment' },
                  createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
              });
              
              if (!existingInsight) {
                allInsights.push(
                  await prisma.aIInsight.create({
                    data: {
                      userId: userContext.userId,
                      memberId: member.id,
                      type: 'appointment',
                      title: 'Upcoming Appointment Scheduled',
                      description: `${memberName} has an appointment with ${nextAppointment.doctorName} (${nextAppointment.specialty}) ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}. Prepare questions and bring relevant medical records.`,
                      severity: daysUntil <= 1 ? 'high' : 'medium',
                      category: 'appointment',
                      data: { 
                        appointmentId: nextAppointment.id,
                        doctorName: nextAppointment.doctorName,
                        specialty: nextAppointment.specialty,
                        date: nextAppointment.date,
                        daysUntil
                      },
                      actionItems: {
                        immediate: ['Prepare list of questions for doctor', 'Bring current medications list', 'Bring insurance card and ID'],
                        shortTerm: ['Set appointment reminders', 'Review medical history before appointment']
                      }
                    },
                    include: { member: true }
                  })
                );
              }
            }
          }
        }

        // Generate insights based on conditions
        if (member.conditions.length > 0) {
          const existingInsight = await prisma.aIInsight.findFirst({
            where: {
              userId: userContext.userId,
              memberId: member.id,
              title: { contains: 'Health Conditions' },
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          });
          
          if (!existingInsight) {
            allInsights.push(
              await prisma.aIInsight.create({
                data: {
                  userId: userContext.userId,
                  memberId: member.id,
                  type: 'risk_assessment',
                  title: 'Health Conditions Detected',
                  description: `${memberName} has ${member.conditions.length} health condition(s): ${member.conditions.join(', ')}. Regular monitoring and management are crucial.`,
                  severity: member.conditions.length >= 2 ? 'high' : 'medium',
                  category: 'health',
                  data: { conditions: member.conditions },
                  actionItems: {
                    immediate: ['Follow treatment plan', 'Monitor symptoms', 'Coordinate care between specialists'],
                    shortTerm: ['Schedule regular checkups', 'Review treatment plans'],
                    longTerm: ['Annual comprehensive health assessment', 'Preventive care planning']
                  }
                },
                include: { member: true }
              })
            );
          }
        }
        } catch (memberError: any) {
          console.error(`❌ Error generating insights for member ${member.id}:`, memberError.message);
          // Continue with next member
        }
      }

        console.log(`✅ Generated total of ${allInsights.length} insights and predictions`);
        return allInsights;
      } catch (error: any) {
        console.error('❌ Error in generateHealthInsights:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));
        // Return empty array instead of throwing to prevent frontend error
        // The frontend will handle empty results gracefully
        return [];
      }
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
      
      console.log('🔍 Analyzing symptoms with AI:', symptoms);
      
      try {
        // Check for recent similar analysis in database (caching mechanism)
        const symptomList = Array.isArray(symptoms) ? symptoms : [symptoms];
        const symptomHash = JSON.stringify(symptomList.map((s: any) => ({
          name: s.name?.toLowerCase().trim(),
          severity: s.severity,
          duration: s.duration
        })).sort());
        
        // Look for recent analysis (within last 24 hours) with same symptoms
        const recentAnalysis = await prisma.symptomAnalysis.findFirst({
          where: {
            userId: userContext.userId,
            memberId: memberId || null,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        // If recent analysis exists and symptoms match, return cached result
        if (recentAnalysis) {
          const recentSymptoms = JSON.stringify((recentAnalysis.symptoms as any[] || []).map((s: any) => ({
            name: s.name?.toLowerCase().trim(),
            severity: s.severity,
            duration: s.duration
          })).sort());
          
          if (recentSymptoms === symptomHash) {
            console.log('✅ Returning cached symptom analysis');
            return await prisma.symptomAnalysis.findUnique({
              where: { id: recentAnalysis.id },
              include: { member: true }
            });
          }
        }
        
        // Get user's health context for better analysis
        const member = memberId ? await prisma.familyMember.findFirst({
          where: { id: memberId, userId: userContext.userId },
          include: {
            medications: { where: { status: 'active' } },
            conditions: true
          }
        }) : null;

        // Prepare symptom data for AI analysis (already have symptomList from cache check)
        const symptomText = symptomList.map((s: any) => {
          const parts = [s.name];
          if (s.severity) parts.push(`Severity: ${s.severity}`);
          if (s.duration) parts.push(`Duration: ${s.duration}`);
          if (s.frequency) parts.push(`Frequency: ${s.frequency}`);
          return parts.join(', ');
        }).join('; ');

        // Get user context for better analysis
        const userContextInfo = member ? {
          age: member.dob ? Math.floor((Date.now() - new Date(member.dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null,
          gender: member.gender,
          medications: member.medications.map(m => m.name).join(', '),
          conditions: member.conditions.join(', ')
        } : {};

        // Call OpenAI for real AI analysis
        const openAiKey = process.env.OPENAI_API_KEY;
        const openAiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!openAiKey) {
          console.warn('⚠️ OPENAI_API_KEY not set, using fallback analysis');
          // Fallback to basic analysis if OpenAI not available
          return await createFallbackAnalysis(symptoms, userContext, memberId);
        }

        // Create comprehensive AI prompt leveraging OpenAI's medical training data
        const prompt = `You are an advanced medical AI assistant trained on extensive medical literature, clinical data, symptom-disease associations, and evidence-based medicine. You have access to medical knowledge from textbooks, research papers, clinical guidelines, and real-world medical data. Analyze the following symptoms using your comprehensive medical training.

SYMPTOMS PRESENTED:
${symptomText}

PATIENT CONTEXT:
${userContextInfo.age ? `Age: ${userContextInfo.age} years` : 'Age: Not specified'}
${userContextInfo.gender ? `Gender: ${userContextInfo.gender}` : 'Gender: Not specified'}
${userContextInfo.medications ? `Current Medications: ${userContextInfo.medications}` : 'Medications: None specified'}
${userContextInfo.conditions ? `Existing Conditions: ${userContextInfo.conditions}` : 'Conditions: None specified'}

INSTRUCTIONS:
Use your comprehensive medical training to analyze these symptoms. Draw from:
- Medical textbooks and clinical guidelines
- Evidence-based symptom-disease associations
- Real-world clinical patterns and case studies
- Medical research and peer-reviewed studies
- Clinical decision support algorithms

ANALYSIS REQUIREMENTS:
1. Use your medical training to identify possible conditions based on symptom-disease associations from medical literature
2. Consider symptom combinations and their clinical significance based on evidence-based medicine
3. Calculate probability scores based on:
   - How strongly symptoms match known disease patterns from medical databases
   - Symptom combinations that are clinically significant per medical guidelines
   - Age and gender factors where medically relevant
   - Existing medical conditions and medications that may influence diagnosis
   - Epidemiological data and prevalence rates
4. Provide accurate, evidence-based assessments similar to clinical decision support systems used in healthcare

Please provide a JSON response with the following structure:
{
  "overview": "A comprehensive overview explaining what the symptom/condition is, similar to Google's format. For example, if symptom is 'back pain', explain: 'Back pain, a common, often temporary issue, typically stems from muscle strains, poor posture, or injuries to the spine's muscles, ligaments, or discs.'",
  "possibleConditions": [
    {
      "name": "Condition name (use standard medical terminology)",
      "probability": 0-100,
      "overview": "Brief overview of this condition",
      "commonCauses": {
        "strainsAndSprains": ["Cause 1", "Cause 2", ...],
        "structuralIssues": ["Cause 1", "Cause 2", ...],
        "lifestyleFactors": ["Factor 1", "Factor 2", ...],
        "medicalConditions": ["Condition 1", "Condition 2", ...]
      },
      "description": "Detailed evidence-based explanation referencing symptom patterns and clinical associations",
      "urgency": "low|medium|high",
      "recommendations": ["Evidence-based recommendation 1", "recommendation 2", ...],
      "whenToSeekHelp": "Specific guidance on when to seek medical attention for this condition"
    }
  ],
  "urgencyLevel": "low|medium|high",
  "generalRecommendations": ["general recommendation 1", ...],
  "whenToSeekHelp": "When to seek immediate medical attention based on symptom severity"
}

CRITICAL REQUIREMENTS:
- Provide a comprehensive OVERVIEW section explaining what the symptom/condition is (like Google does). For example, if symptom is "back pain", explain: "Back pain, a common, often temporary issue, typically stems from muscle strains, poor posture, or injuries to the spine's muscles, ligaments, or discs."
- For each condition, include COMMON CAUSES broken down into categories with SPECIFIC EXAMPLES:
  * Strains and Sprains: List specific causes like "Improper lifting, twisting, or sudden movements that damage muscles or ligaments"
  * Structural Issues: List specific anatomical problems like "Herniated (ruptured) discs, bulging discs, spinal stenosis"
  * Lifestyle Factors: List specific factors like "Sedentary behavior, poor ergonomics, obesity"
  * Medical Conditions: List specific conditions like "Osteoporosis, infections, inflammation"
- Provide ACTIONABLE RECOMMENDATIONS - what the user should actually DO (not just "consult a doctor")
- Include specific "When to Seek Help" guidance with clear criteria
- AVOID REPETITIVE GENERIC ADVICE - each recommendation should be unique and specific
- Base analysis on medical training data patterns, not generic assumptions
- Use symptom-disease associations similar to clinical diagnostic algorithms
- Consider how symptoms typically present together in medical literature
- Provide probability scores that reflect actual clinical likelihood
- Reference specific symptom patterns that support each diagnosis
- Be precise and evidence-based, similar to how medical AI models are trained
- Make the information detailed, informative, and useful - similar to what users see when searching symptoms on Google
- DO NOT repeat the same generic advice multiple times - provide diverse, specific recommendations

Return ONLY valid JSON, no additional text.`;

        // Retry logic with exponential backoff for rate limiting
        const maxRetries = 3;
        let retryCount = 0;
        let aiResponse: Response | null = null;
        let lastError: Error | null = null;
        
        while (retryCount <= maxRetries) {
          try {
            aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`
              },
              body: JSON.stringify({
                model: openAiModel,
                messages: [
                  {
                    role: 'system',
                    content: 'You are an advanced medical AI assistant trained on extensive medical literature, clinical data, symptom-disease associations, and evidence-based medicine. You have access to medical knowledge from textbooks, research papers, clinical guidelines, and real-world medical data. You analyze symptoms using your comprehensive medical training - drawing from medical databases, clinical decision support systems, and evidence-based medicine. Always base your analysis on real medical training data patterns, not generic assumptions. Always respond with valid JSON only.'
                  },
                  {
                    role: 'user',
                    content: prompt
                  }
                ],
                temperature: 0.3, // Slightly higher for more diverse, detailed responses
                max_tokens: 2500 // Increased for more detailed responses
              })
            });
            
            // If successful, break out of retry loop
            if (aiResponse.ok) {
              break;
            }
            
            // If rate limited (429), wait and retry
            if (aiResponse.status === 429 && retryCount < maxRetries) {
              const retryAfter = aiResponse.headers.get('Retry-After');
              const waitTime = retryAfter 
                ? parseInt(retryAfter) * 1000 
                : Math.min(1000 * Math.pow(2, retryCount), 60000); // Exponential backoff, max 60s
              
              console.log(`⏳ Rate limit hit. Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${maxRetries}...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            }
            
            // For other errors, break and handle below
            break;
            
          } catch (fetchError: any) {
            lastError = fetchError;
            if (retryCount < maxRetries) {
              const waitTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
              console.log(`⏳ Request failed. Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${maxRetries}...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
            } else {
              throw fetchError;
            }
          }
        }
        
        if (!aiResponse) {
          throw lastError || new Error('Failed to get response from OpenAI API');
        }

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          let errorMessage = '';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorText;
          } catch {
            errorMessage = errorText;
          }
          
          console.error('❌ OpenAI API error:', {
            status: aiResponse.status,
            statusText: aiResponse.statusText,
            error: errorMessage
          });
          
          // Handle different error types
          if (aiResponse.status === 401) {
            throw new Error('OpenAI API authentication failed. Please check your OPENAI_API_KEY.');
          } else if (aiResponse.status === 429) {
            throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again, or upgrade your OpenAI plan for higher rate limits.');
          } else if (aiResponse.status === 500 || aiResponse.status === 502 || aiResponse.status === 503) {
            throw new Error('OpenAI API service temporarily unavailable. Please try again in a few moments.');
          } else {
            throw new Error(`OpenAI API error (${aiResponse.status}): ${errorMessage || aiResponse.statusText}`);
          }
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0]?.message?.content || '{}';
        
        // Parse AI response
        let aiAnalysis;
        try {
          // Clean the response (remove markdown code blocks if present)
          const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          aiAnalysis = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error('❌ Error parsing AI response:', parseError);
          console.error('Raw AI response:', aiContent);
          throw new Error(`Failed to parse AI response: ${parseError}. Please try again.`);
        }

        // Use AI analysis directly - fully AI-powered, no manual knowledge base
        const enhancedConditions = (aiAnalysis.possibleConditions || []).map((aiCond: any) => ({
          name: aiCond.name,
          probability: aiCond.probability || 50,
          overview: aiCond.overview || null,
          commonCauses: aiCond.commonCauses || null,
          description: aiCond.description || '',
          urgency: aiCond.urgency || 'medium',
          recommendations: aiCond.recommendations || [],
          whenToSeekHelp: aiCond.whenToSeekHelp || null
        }));
        
        // Sort by probability
        enhancedConditions.sort((a: any, b: any) => b.probability - a.probability);
        
        const urgencyLevel = aiAnalysis.urgencyLevel || 
          (enhancedConditions.length > 0 ? enhancedConditions[0].urgency : 'medium');

        // Create comprehensive analysis object
        const analysis = {
          overview: aiAnalysis.overview || null,
          possibleConditions: enhancedConditions,
          urgencyLevel,
          generalRecommendations: aiAnalysis.generalRecommendations || [],
          whenToSeekHelp: aiAnalysis.whenToSeekHelp || 'If symptoms persist or worsen, consult a healthcare professional.',
          analyzedAt: new Date().toISOString(),
          aiModel: openAiModel,
          confidence: 'high',
          aiPowered: true,
          medicalTrainingDataUsed: true
        };

        // Format conditions for database storage
        const formattedConditions = enhancedConditions.map((c: any) => ({
          name: c.name,
          probability: c.probability || 50,
          overview: c.overview || null,
          commonCauses: c.commonCauses || null,
          description: c.description || '',
          urgency: c.urgency || 'medium',
          recommendations: c.recommendations || [],
          whenToSeekHelp: c.whenToSeekHelp || null
        }));

        console.log('✅ AI symptom analysis completed:', formattedConditions.length, 'conditions identified');

        return await prisma.symptomAnalysis.create({
          data: {
            userId: userContext.userId,
            memberId: memberId || null,
            symptoms,
            analysis,
            conditions: formattedConditions,
            urgencyLevel
          },
          include: { member: true }
        });

      } catch (error: any) {
        console.error('❌ Error in AI symptom analysis:', error);
        
        // Re-throw with better context if it's already a formatted error
        if (error.message && error.message.includes('OpenAI API')) {
          throw error;
        }
        
        // Handle missing API key specifically
        if (error.message && error.message.includes('OPENAI_API_KEY')) {
          throw new Error('AI symptom analysis requires OPENAI_API_KEY to be set in your environment variables. Please configure your OpenAI API key.');
        }
        
        // Generic error fallback
        throw new Error(`AI symptom analysis failed: ${error.message || 'Unknown error'}. Please check your OpenAI API configuration and try again.`);
      }
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
      
      // Get current user to merge preferences
      const currentUser = await prisma.user.findUnique({
        where: { id: userContext.userId }
      });

      if (!currentUser) throw new Error('User not found');

      // Merge existing preferences with new ones
      const existingPreferences = currentUser.preferences as any || {};
      const mergedPreferences = { ...existingPreferences, ...preferences };

      return await prisma.user.update({
        where: { id: userContext.userId },
        data: { 
          preferences: mergedPreferences
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

