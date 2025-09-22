'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Heart,
  Activity,
  Bell,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Doctor {
  id: string
  name: string
  specialty: string
  hospital: string
  address: string
  phone: string
  email: string
  rating: number
  availableSlots: string[]
  avatar: string
}

interface Appointment {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  duration: number
  type: 'consultation' | 'follow-up' | 'checkup' | 'emergency'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  familyMemberId: string
  familyMemberName: string
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
}

export default function ScheduleAppointmentPage() {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [appointmentType, setAppointmentType] = useState<string>('consultation')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Mock family members
  const familyMembers: FamilyMember[] = [
    { id: 'divya-001', name: 'Divya', relationship: 'Self' },
    { id: 'tushar-002', name: 'Tushar', relationship: 'Brother' },
    { id: 'mom-003', name: 'Mom', relationship: 'Mother' },
    { id: 'dad-004', name: 'Dad', relationship: 'Father' }
  ]

  // Mock doctors
  const doctors: Doctor[] = [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      hospital: 'City General Hospital',
      address: '123 Medical Center Dr, City, State 12345',
      phone: '(555) 123-4567',
      email: 'sarah.johnson@citygeneral.com',
      rating: 4.8,
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff&size=150'
    },
    {
      id: 'doc-2',
      name: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      hospital: 'Skin Care Clinic',
      address: '456 Health Plaza, City, State 12345',
      phone: '(555) 234-5678',
      email: 'michael.chen@skincare.com',
      rating: 4.6,
      availableSlots: ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'],
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=150'
    },
    {
      id: 'doc-3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      hospital: 'Children\'s Medical Center',
      address: '789 Kids Lane, City, State 12345',
      phone: '(555) 345-6789',
      email: 'emily.rodriguez@childrens.com',
      rating: 4.9,
      availableSlots: ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'],
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=f59e0b&color=fff&size=150'
    },
    {
      id: 'doc-4',
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      hospital: 'Sports Medicine Center',
      address: '321 Athletic Blvd, City, State 12345',
      phone: '(555) 456-7890',
      email: 'james.wilson@sportsmed.com',
      rating: 4.7,
      availableSlots: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'],
      avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=ef4444&color=fff&size=150'
    }
  ]

  const specialties = ['All', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Oncology', 'Psychiatry']

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', icon: User },
    { value: 'follow-up', label: 'Follow-up', icon: CheckCircle },
    { value: 'checkup', label: 'Checkup', icon: Heart },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle }
  ]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const appointment: Appointment = {
        id: `apt-${Date.now()}`,
        doctorId: selectedDoctor,
        doctorName: doctors.find(d => d.id === selectedDoctor)?.name || '',
        specialty: doctors.find(d => d.id === selectedDoctor)?.specialty || '',
        date: selectedDate,
        time: selectedTime,
        duration: 30,
        type: appointmentType as any,
        status: 'scheduled',
        notes,
        familyMemberId: selectedMember,
        familyMemberName: familyMembers.find(m => m.id === selectedMember)?.name || ''
      }
      
      console.log('Appointment scheduled:', appointment)
      
      setShowSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setSelectedMember('')
        setSelectedDoctor('')
        setSelectedDate('')
        setSelectedTime('')
        setAppointmentType('consultation')
        setNotes('')
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error scheduling appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableTimes = () => {
    if (!selectedDoctor || !selectedDate) return []
    const doctor = doctors.find(d => d.id === selectedDoctor)
    return doctor?.availableSlots || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-2xl">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Schedule Appointment
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Book an appointment with your healthcare provider
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3"
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Appointment Scheduled!</h3>
              <p className="text-green-600">Your appointment has been successfully scheduled.</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Family Member Selection */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <span>Who is the appointment for?</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMember(member.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedMember === member.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.relationship}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-primary-600" />
                    <span>Choose Your Doctor</span>
                  </h3>
                  
                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search doctors, specialties, or hospitals..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                        {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {showFilters && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="block text-base font-semibold text-gray-700 mb-3">Specialty</label>
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {specialties.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Doctor Cards */}
                  <div className="space-y-4">
                    {filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doctor.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDoctor === doctor.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={doctor.avatar}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl font-bold text-gray-900">{doctor.name}</h4>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-semibold text-gray-700">{doctor.rating}</span>
                                <span className="text-yellow-500">★</span>
                              </div>
                            </div>
                            <p className="text-lg text-primary-600 font-semibold mb-2">{doctor.specialty}</p>
                            <p className="text-gray-600 mb-2">{doctor.hospital}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{doctor.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span>Appointment Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Time *
                      </label>
                      <select
                        required
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        disabled={!selectedDoctor || !selectedDate}
                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      >
                        <option value="">Select time</option>
                        {getAvailableTimes().map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Appointment Type *
                      </label>
                      <select
                        required
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {appointmentTypes.map((type) => {
                          const Icon = type.icon
                          return (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Duration
                      </label>
                      <div className="px-4 py-3 text-lg border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                        30 minutes
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any specific concerns or questions you'd like to discuss..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedMember || !selectedDoctor || !selectedDate || !selectedTime}
                    className="w-full py-4 px-6 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Scheduling Appointment...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Schedule Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-500" />
                <span>Appointment Tips</span>
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span>Arrive 15 minutes early for check-in</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Bring your insurance card and ID</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>Prepare a list of questions beforehand</span>
                </li>
                <li className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <span>Bring current medications list</span>
                </li>
              </ul>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200"
            >
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Emergency?</span>
              </h3>
              <p className="text-red-700 text-lg leading-relaxed mb-4">
                If this is a medical emergency, call 911 immediately or go to your nearest emergency room.
              </p>
              <button className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                Call Emergency Services
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
