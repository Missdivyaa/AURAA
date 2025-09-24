// Initialize demo data for testing
const { Pool } = require('pg')

// Simple demo data setup without requiring full database
const demoData = {
  familyMembers: [
    {
      id: 'demo-1',
      name: 'Rahul Sharma',
      age: 45,
      relationship: 'Self',
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0ea5e9&color=fff&size=150',
      healthScore: 85,
      lastCheckup: '2024-01-15',
      nextAppointment: '2024-02-15',
      medications: 3,
      conditions: ['Hypertension', 'Diabetes Type 2'],
      status: 'good'
    },
    {
      id: 'demo-2',
      name: 'Neha Verma',
      age: 42,
      relationship: 'Spouse',
      avatar: 'https://ui-avatars.com/api/?name=Neha+Verma&background=10b981&color=fff&size=150',
      healthScore: 92,
      lastCheckup: '2024-01-10',
      nextAppointment: '2024-03-10',
      medications: 1,
      conditions: ['Allergies'],
      status: 'excellent'
    }
  ],
  healthMetrics: [
    { name: 'Blood Pressure', current: '120/80', trend: 'stable', status: 'good' },
    { name: 'Heart Rate', current: '72 BPM', trend: 'improving', status: 'good' },
    { name: 'Blood Sugar', current: '95 mg/dL', trend: 'stable', status: 'good' }
  ],
  aiInsights: [
    {
      id: 'insight-1',
      title: 'Diabetes Risk Assessment',
      confidence: 85,
      status: 'moderate',
      description: 'Based on your recent lab results and lifestyle patterns, there\'s a moderate risk of developing Type 2 diabetes.',
      recommendations: [
        'Maintain regular blood sugar monitoring',
        'Increase physical activity to 150 minutes per week',
        'Consider dietary modifications'
      ],
      timeframe: 'Next 6 months',
      icon: 'AlertTriangle',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]
}

// Save demo data to localStorage for testing
console.log('🎉 AURAA Health Platform - Demo Data Ready!')
console.log('📊 Demo data includes:')
console.log(`   - ${demoData.familyMembers.length} family members`)
console.log(`   - ${demoData.healthMetrics.length} health metrics`)
console.log(`   - ${demoData.aiInsights.length} AI insights`)
console.log('')
console.log('🚀 To start the application:')
console.log('   npm run dev')
console.log('')
console.log('🌐 Then visit:')
console.log('   http://localhost:3000')
console.log('')
console.log('💡 The app will use demo data until you set up a real database.')
console.log('   Check SETUP.md for database configuration instructions.')

module.exports = demoData












