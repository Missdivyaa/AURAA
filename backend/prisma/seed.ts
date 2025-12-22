import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { clerkId: 'demo-user-clerk-id' },
    update: {},
    create: {
      clerkId: 'demo-user-clerk-id',
      email: 'demo@auraa.com',
      name: 'Demo User',
      phone: '+1234567890',
    },
  });

  console.log('✅ Created demo user:', demoUser.name);

  // Create demo family members
  const familyMembers = await Promise.all([
    prisma.familyMember.upsert({
      where: { id: 'demo-member-1' },
      update: {},
      create: {
        id: 'demo-member-1',
        userId: demoUser.id,
        name: 'Divya',
        email: 'divya@example.com',
        phone: '+1234567891',
        dob: new Date('1999-01-15'),
        gender: 'Female',
        relationship: 'Self',
        bloodType: 'O+',
        height: 165,
        weight: 60,
        conditions: ['Hypertension'],
        allergies: ['Penicillin'],
        emergencyContacts: {
          name: 'Emergency Contact',
          phone: '+1234567892',
          relationship: 'Spouse'
        },
        insurance: {
          provider: 'Health Insurance Co',
          policyNumber: 'POL123456'
        },
        doctor: {
          name: 'Dr. Smith',
          phone: '+1234567893',
          specialty: 'Internal Medicine'
        }
      },
    }),
    prisma.familyMember.upsert({
      where: { id: 'demo-member-2' },
      update: {},
      create: {
        id: 'demo-member-2',
        userId: demoUser.id,
        name: 'Tushar',
        email: 'tushar@example.com',
        phone: '+1234567894',
        dob: new Date('1996-05-20'),
        gender: 'Male',
        relationship: 'Brother',
        bloodType: 'A+',
        height: 175,
        weight: 70,
        conditions: [],
        allergies: [],
        emergencyContacts: {
          name: 'Emergency Contact',
          phone: '+1234567895',
          relationship: 'Sister'
        },
        insurance: {
          provider: 'Health Insurance Co',
          policyNumber: 'POL123457'
        },
        doctor: {
          name: 'Dr. Johnson',
          phone: '+1234567896',
          specialty: 'General Practice'
        }
      },
    }),
  ]);

  console.log('✅ Created family members:', familyMembers.map(m => m.name));

  // Create demo appointments
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        doctorName: 'Dr. Smith',
        specialty: 'Internal Medicine',
        hospital: 'City General Hospital',
        date: new Date('2024-12-15'),
        time: '10:00 AM',
        notes: 'Regular checkup',
        status: 'scheduled',
      },
    }),
    prisma.appointment.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[1].id,
        doctorName: 'Dr. Johnson',
        specialty: 'General Practice',
        hospital: 'Community Health Center',
        date: new Date('2025-03-10'),
        time: '2:00 PM',
        notes: 'Annual physical',
        status: 'scheduled',
      },
    }),
  ]);

  console.log('✅ Created appointments:', appointments.length);

  // Create demo medications
  const medications = await Promise.all([
    prisma.medication.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date('2024-01-01'),
        endDate: null,
        sideEffects: ['Dry cough', 'Dizziness'],
        status: 'active',
      },
    }),
    prisma.medication.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date('2024-06-01'),
        endDate: null,
        sideEffects: ['Nausea', 'Diarrhea'],
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Created medications:', medications.length);

  // Create demo reminders
  const reminders = await Promise.all([
    prisma.reminder.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        title: 'Take Lisinopril',
        description: 'Morning medication',
        type: 'medication',
        date: new Date(),
        time: '08:00',
        frequency: 'daily',
        priority: 'high',
        status: 'active',
      },
    }),
    prisma.reminder.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        title: 'Doctor Appointment',
        description: 'Regular checkup with Dr. Smith',
        type: 'appointment',
        date: new Date('2024-12-15'),
        time: '10:00',
        frequency: 'once',
        priority: 'medium',
        status: 'active',
      },
    }),
  ]);

  console.log('✅ Created reminders:', reminders.length);

  // Create demo AI insights
  const aiInsights = await Promise.all([
    prisma.aIInsight.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
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
    }),
    prisma.aIInsight.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[1].id,
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
      },
    }),
  ]);

  console.log('✅ Created AI insights:', aiInsights.length);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




