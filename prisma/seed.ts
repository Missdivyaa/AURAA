import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@auraa.com' },
    update: {},
    create: {
      email: 'demo@auraa.com',
      name: 'Demo User',
      phone: '+91 98765 43210',
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create demo family members
  const familyMembers = await Promise.all([
    prisma.familyMember.upsert({
      where: { id: 'divya-001' },
      update: {},
      create: {
        id: 'divya-001',
        userId: demoUser.id,
        name: 'Divya Sharma',
        email: 'divya.sharma@example.com',
        phone: '+91 98765 43210',
        dob: new Date('1990-05-15'),
        gender: 'Female',
        relationship: 'Self',
        bloodType: 'O+',
        height: 165,
        weight: 60,
        conditions: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin', 'Shellfish'],
        emergencyContacts: {
          primary: {
            name: 'Raj Sharma',
            phone: '+91 98765 43211',
            relationship: 'Spouse'
          },
          secondary: {
            name: 'Dr. Priya Singh',
            phone: '+91 98765 43212',
            relationship: 'Doctor'
          }
        },
        insurance: {
          provider: 'Health Insurance Co.',
          policyNumber: 'HI123456789',
          expiryDate: '2024-12-31'
        },
        doctor: {
          name: 'Dr. Priya Singh',
          specialty: 'Internal Medicine',
          phone: '+91 98765 43212',
          hospital: 'City General Hospital'
        }
      },
    }),
    prisma.familyMember.upsert({
      where: { id: 'raj-002' },
      update: {},
      create: {
        id: 'raj-002',
        userId: demoUser.id,
        name: 'Raj Sharma',
        email: 'raj.sharma@example.com',
        phone: '+91 98765 43211',
        dob: new Date('1988-03-22'),
        gender: 'Male',
        relationship: 'Spouse',
        bloodType: 'A+',
        height: 175,
        weight: 75,
        conditions: ['Asthma'],
        allergies: ['Dust', 'Pollen'],
        emergencyContacts: {
          primary: {
            name: 'Divya Sharma',
            phone: '+91 98765 43210',
            relationship: 'Spouse'
          }
        }
      },
    }),
  ])

  console.log('✅ Family members created:', familyMembers.length)

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
        sideEffects: ['Dry cough', 'Dizziness'],
        reminders: {
          times: ['08:00'],
          notifications: { push: true, email: true }
        }
      },
    }),
    prisma.medication.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: new Date('2024-01-01'),
        sideEffects: ['Nausea', 'Diarrhea'],
        reminders: {
          times: ['08:00', '20:00'],
          notifications: { push: true, email: true }
        }
      },
    }),
  ])

  console.log('✅ Medications created:', medications.length)

  // Create demo appointments
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        doctorName: 'Dr. Priya Singh',
        specialty: 'Internal Medicine',
        hospital: 'City General Hospital',
        date: new Date('2024-02-15'),
        time: '10:00',
        notes: 'Regular checkup and blood pressure monitoring'
      },
    }),
    prisma.appointment.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[1].id,
        doctorName: 'Dr. Amit Kumar',
        specialty: 'Pulmonology',
        hospital: 'City General Hospital',
        date: new Date('2024-02-20'),
        time: '14:00',
        notes: 'Asthma follow-up'
      },
    }),
  ])

  console.log('✅ Appointments created:', appointments.length)

  // Create demo reminders
  const reminders = await Promise.all([
    prisma.reminder.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        title: 'Take Lisinopril',
        description: 'Morning blood pressure medication',
        type: 'medication',
        date: new Date(),
        time: '08:00',
        frequency: 'daily',
        priority: 'high',
        notifications: { push: true, email: true }
      },
    }),
    prisma.reminder.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        title: 'Blood Sugar Check',
        description: 'Check blood sugar levels',
        type: 'measurement',
        date: new Date(),
        time: '09:00',
        frequency: 'daily',
        priority: 'medium',
        notifications: { push: true }
      },
    }),
  ])

  console.log('✅ Reminders created:', reminders.length)

  // Create demo AI insights
  const insights = await Promise.all([
    prisma.aIInsight.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        type: 'health_trend',
        title: 'Blood Pressure Trend',
        description: 'Your blood pressure has been stable over the past month',
        severity: 'low',
        category: 'cardiovascular',
        data: {
          trend: 'stable',
          averageBP: '125/80',
          period: '30 days'
        },
        actionItems: {
          continue: ['Keep taking Lisinopril'],
          monitor: ['Check BP weekly']
        }
      },
    }),
    prisma.aIInsight.create({
      data: {
        userId: demoUser.id,
        memberId: familyMembers[0].id,
        type: 'recommendation',
        title: 'Exercise Recommendation',
        description: 'Consider adding 30 minutes of walking to your daily routine',
        severity: 'medium',
        category: 'general',
        data: {
          currentActivity: 'low',
          recommendedActivity: 'moderate'
        },
        actionItems: {
          start: ['Begin with 15-minute walks'],
          increase: ['Gradually increase to 30 minutes']
        }
      },
    }),
  ])

  console.log('✅ AI insights created:', insights.length)

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })









