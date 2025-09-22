'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dr. Ananya Iyer',
      role: 'Cardiologist, Apollo Hospital',
      image: 'https://ui-avatars.com/api/?name=Ananya+Iyer&background=0ea5e9&color=fff&size=150',
      content: 'AURAA has revolutionized how we manage patient data. The AI insights help us identify potential health risks before they become critical.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Cardiologist, Apollo Hospital',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=fff&size=150',
      content: 'Managing my family\'s health records was always chaotic. AURAA made it simple and the emergency QR code gives me peace of mind.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Diabetes Patient',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=f59e0b&color=fff&size=150',
      content: 'The smart reminders and AI insights have helped me manage my diabetes better than ever. My HbA1c levels have improved significantly.',
      rating: 5
    },
    {
      name: 'Dr. Arjun Rao',
      role: 'Emergency Physician',
      image: 'https://ui-avatars.com/api/?name=Arjun+Rao&background=6366f1&color=fff&size=150',
      content: 'The emergency QR code feature is a game-changer. Having instant access to critical health information saves precious time in emergencies.',
      rating: 5
    },
    {
      name: 'Anita Patel',
      role: 'Caretaker for Elderly Parents',
      image: 'https://ui-avatars.com/api/?name=Anita+Patel&background=14b8a6&color=fff&size=150',
      content: 'The elderly mode is perfect for my parents. The large text and voice navigation make it so easy for them to use independently.',
      rating: 5
    },
    {
      name: 'Dr. Ritu Sharma',
      role: 'Pediatrician',
      image: 'https://ui-avatars.com/api/?name=Ritu+Sharma&background=ef4444&color=fff&size=150',
      content: 'Tracking vaccination schedules and growth charts for multiple children is effortless with AURAA. The family dashboard is brilliant.',
      rating: 5
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
            Loved by{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Healthcare Professionals
            </span>
            {' '}& Families
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Early feedback from mock users and mentors. This is a student project in active development.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group"
            >
              <div className="space-y-6">
                {/* Quote Icon */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 lg:p-12 text-white">
            <div className="space-y-6">
              <h3 className="text-3xl lg:text-4xl font-bold">
                Trusted by Healthcare Community
              </h3>
              
              <div className="flex justify-center items-center space-x-4">
                <div className="text-6xl font-bold">4.9</div>
                <div className="text-left">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-primary-100">Based on 6 testimonials</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-primary-100">Would recommend</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-primary-100">Ease of use</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-primary-100">Data security</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
