'use client'

import { motion } from 'framer-motion'
import { 
  Bell, 
  Users, 
  QrCode, 
  Brain, 
  Shield, 
  Heart, 
  Activity,
  FileText,
  Stethoscope,
  Smartphone,
  Lock,
  Lightbulb
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Bell,
      title: 'Smart Health Reminders',
      description: 'Pill intake reminders with dosage & frequency. Customizable alerts for doctor visits or test schedules.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Family Health Dashboard',
      description: 'Manage records for children, parents, or elderly family members in one account with automatic alerts.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: QrCode,
      title: 'Emergency Access Card',
      description: 'QR code on lock screen gives doctors/emergency staff access to critical health info instantly.',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Brain,
      title: 'AI-Driven Health Insights',
      description: 'Predict potential health risks and suggest preventive checkups based on your health data.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: FileText,
      title: 'Digital Reports Analyzer',
      description: 'Upload PDFs/images of lab reports → app extracts data using OCR and shows health trends.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Stethoscope,
      title: 'Symptom Checker',
      description: 'AI chatbot where users enter symptoms → app suggests possible conditions & whether to see a doctor.',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    {
      icon: Activity,
      title: 'Wearable Device Integration',
      description: 'Sync with smartwatches/fitness bands to track heart rate, sleep, oxygen levels with alerts.',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      icon: Shield,
      title: 'Encrypted & Secure Storage',
      description: 'Blockchain or zero-knowledge encryption for medical records ensuring complete privacy.',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      icon: Lightbulb,
      title: 'Personalized Health Tips',
      description: 'Diet, exercise, and wellness tips tailored to your conditions and health goals.',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive Health{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your health and your family's wellbeing in one secure, 
            intelligent platform powered by cutting-edge AI technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${feature.bgColor} p-8 rounded-2xl hover:shadow-xl transition-all duration-300 card-hover group`}
              >
                <div className="space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Special Highlight Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold">
                Elderly-Friendly Mode
              </h3>
              <p className="text-xl text-primary-100 leading-relaxed">
                Simple interface with voice navigation, large text, and caretaker alerts 
                if appointments or medicines are missed. Designed with accessibility in mind.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-medium">Voice Navigation</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Caretaker Alerts</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Large Text</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">Grandma's Dashboard</h4>
                      <p className="text-primary-100">Simple & Clear</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-lg font-semibold mb-2">Next Medication</div>
                      <div className="text-primary-100">Blood Pressure Pill</div>
                      <div className="text-sm text-primary-200">In 2 hours</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-lg font-semibold mb-2">Doctor Visit</div>
                      <div className="text-primary-100">Dr. Smith - Cardiology</div>
                      <div className="text-sm text-primary-200">Tomorrow 10:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
