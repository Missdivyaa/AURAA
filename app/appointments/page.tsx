'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Appointment {
  id: string
  title: string
  doctor: string
  specialty: string
  date: string
  time: string
  duration: number
  location: string
  address: string
  phone: string
  email: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  notes: string
  familyMemberId: string
  familyMemberName: string
  reminderSent: boolean
}

interface Doctor {
  id: string
  name: string
  specialty: string
  hospital: string
  phone: string
  email: string
  rating: number
  availability: string[]
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock appointments data
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          title: 'Annual Physical Examination',
          doctor: 'Dr. Sarah Johnson',
          specialty: 'Internal Medicine',
          date: '2024-01-20',
          time: '10:00 AM',
          duration: 60,
          location: 'City Medical Center',
          address: '123 Health St, Medical City, MC 12345',
          phone: '(555) 123-4567',
          email: 'sarah.johnson@citymedical.com',
          status: 'scheduled',
          notes: 'Annual checkup, bring insurance card',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          reminderSent: false
        },
        {
          id: '2',
          title: 'Cardiology Consultation',
          doctor: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          date: '2024-01-25',
          time: '2:30 PM',
          duration: 45,
          location: 'Heart Specialist Clinic',
          address: '456 Cardiac Ave, Heart City, HC 67890',
          phone: '(555) 987-6543',
          email: 'michael.chen@heartclinic.com',
          status: 'confirmed',
          notes: 'Follow-up for blood pressure monitoring',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          reminderSent: true
        },
        {
          id: '3',
          title: 'Dental Cleaning',
          doctor: 'Dr. Emily Rodriguez',
          specialty: 'Dentistry',
          date: '2024-01-18',
          time: '9:00 AM',
          duration: 30,
          location: 'Bright Smile Dental',
          address: '789 Dental Blvd, Smile City, SC 54321',
          phone: '(555) 456-7890',
          email: 'emily.rodriguez@brightsmile.com',
          status: 'completed',
          notes: 'Regular cleaning, no issues found',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          reminderSent: true
        },
        {
          id: '4',
          title: 'Eye Examination',
          doctor: 'Dr. David Kim',
          specialty: 'Ophthalmology',
          date: '2024-02-05',
          time: '11:15 AM',
          duration: 45,
          location: 'Vision Care Center',
          address: '321 Eye St, Vision City, VC 98765',
          phone: '(555) 321-9876',
          email: 'david.kim@visioncare.com',
          status: 'scheduled',
          notes: 'Annual eye exam, bring current glasses',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          reminderSent: false
        }
      ]

      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialty: 'Internal Medicine',
          hospital: 'City Medical Center',
          phone: '(555) 123-4567',
          email: 'sarah.johnson@citymedical.com',
          rating: 4.8,
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          hospital: 'Heart Specialist Clinic',
          phone: '(555) 987-6543',
          email: 'michael.chen@heartclinic.com',
          rating: 4.9,
          availability: ['Monday', 'Wednesday', 'Friday']
        },
        {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          specialty: 'Dentistry',
          hospital: 'Bright Smile Dental',
          phone: '(555) 456-7890',
          email: 'emily.rodriguez@brightsmile.com',
          rating: 4.7,
          availability: ['Monday', 'Tuesday', 'Thursday', 'Friday']
        }
      ]

      setAppointments(mockAppointments)
      setDoctors(mockDoctors)
      
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200'
      case 'completed': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      case 'rescheduled': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Calendar
      case 'confirmed': return CheckCircle
      case 'completed': return CheckCircle
      case 'cancelled': return AlertCircle
      case 'rescheduled': return CalendarDays
      default: return Calendar
    }
  }

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'confirmed'
  )

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  )

  const tabs = [
    { id: 'upcoming', name: 'Upcoming', icon: Calendar, count: upcomingAppointments.length },
    { id: 'past', name: 'Past', icon: Clock, count: pastAppointments.length },
    { id: 'doctors', name: 'Doctors', icon: User, count: doctors.length },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  Appointments
                </h1>
                <p className="text-base text-gray-600">
                  Manage your family's medical appointments and schedules
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Schedule Appointment
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 animate-pulse text-primary-600" />
                <p className="text-gray-600">Loading appointments...</p>
              </div>
            </motion.div>
          )}

          {/* Upcoming Appointments Tab */}
          {!loading && activeTab === 'upcoming' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-6">
                  {upcomingAppointments.map((appointment, index) => {
                    const StatusIcon = getStatusIcon(appointment.status)
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${getStatusColor(appointment.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <StatusIcon className="w-5 h-5" />
                              <h3 className="text-xl font-semibold text-gray-900">{appointment.title}</h3>
                              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                {appointment.familyMemberName}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.doctor}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.date} at {appointment.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.duration} minutes</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-600">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-6">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                  <p className="text-gray-600 mb-4">Schedule your next appointment to get started</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Past Appointments Tab */}
          {!loading && activeTab === 'past' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {pastAppointments.length > 0 ? (
                <div className="grid gap-6">
                  {pastAppointments.map((appointment, index) => {
                    const StatusIcon = getStatusIcon(appointment.status)
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${getStatusColor(appointment.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <StatusIcon className="w-5 h-5" />
                              <h3 className="text-xl font-semibold text-gray-900">{appointment.title}</h3>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                {appointment.familyMemberName}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.doctor}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.date} at {appointment.time}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">{appointment.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    Status: {appointment.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No past appointments</h3>
                  <p className="text-gray-600">Your appointment history will appear here</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Doctors Tab */}
          {!loading && activeTab === 'doctors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600">{doctor.hospital}</p>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">{doctor.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phone</span>
                        <span className="text-sm text-gray-900">{doctor.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email</span>
                        <span className="text-sm text-gray-900 truncate">{doctor.email}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
                      <div className="flex flex-wrap gap-1">
                        {doctor.availability.map((day, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Book Appointment
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
