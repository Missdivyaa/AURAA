'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  ArrowLeft,
  Pill,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Plus,
  Save,
  X,
  Info,
  Bell,
  Heart,
  Activity,
  Shield
} from 'lucide-react'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  purpose: string
  instructions: string
  sideEffects: string[]
  reminders: {
    enabled: boolean
    times: string[]
  }
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
}

export default function AddMedicationPage() {
  const [form, setForm] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    sideEffects: [],
    reminders: {
      enabled: true,
      times: []
    }
  })

  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock family members
  const familyMembers: FamilyMember[] = [
    { id: 'divya-001', name: 'Divya', relationship: 'Self' },
    { id: 'tushar-002', name: 'Tushar', relationship: 'Brother' },
    { id: 'mom-003', name: 'Mom', relationship: 'Mother' },
    { id: 'dad-004', name: 'Dad', relationship: 'Father' }
  ]

  const frequencyOptions = [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Weekly',
    'Monthly'
  ]

  const commonSideEffects = [
    'Nausea',
    'Dizziness',
    'Headache',
    'Drowsiness',
    'Dry mouth',
    'Constipation',
    'Diarrhea',
    'Rash',
    'Insomnia',
    'Weight gain',
    'Weight loss',
    'Mood changes',
    'Fatigue',
    'Stomach pain',
    'Loss of appetite',
    'Blurred vision',
    'Muscle pain',
    'Joint pain',
    'Chest pain',
    'Shortness of breath',
    'Swelling',
    'Itching',
    'Sleepiness',
    'Anxiety',
    'Depression',
    'Memory problems',
    'Confusion',
    'Tremors',
    'Sweating',
    'Hot flashes',
    'Cold hands',
    'Hair loss',
    'Skin changes',
    'Bruising',
    'Bleeding',
    'Fever',
    'Chills',
    'Cough',
    'Sore throat',
    'Runny nose'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Medication added:', {
        ...form,
        memberId: selectedMember,
        id: `med-${Date.now()}`
      })
      
      setShowSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setForm({
          name: '',
          dosage: '',
          frequency: '',
          startDate: '',
          endDate: '',
          prescribedBy: '',
          purpose: '',
          instructions: '',
          sideEffects: [],
          reminders: {
            enabled: true,
            times: []
          }
        })
        setSelectedMember('')
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error adding medication:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSideEffect = (sideEffect: string) => {
    if (!form.sideEffects?.includes(sideEffect)) {
      setForm({
        ...form,
        sideEffects: [...(form.sideEffects || []), sideEffect]
      })
    }
  }

  const removeSideEffect = (sideEffect: string) => {
    setForm({
      ...form,
      sideEffects: form.sideEffects?.filter(se => se !== sideEffect) || []
    })
  }

  const addReminderTime = () => {
    setForm({
      ...form,
      reminders: {
        ...form.reminders!,
        times: [...(form.reminders?.times || []), '08:00']
      }
    })
  }

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...(form.reminders?.times || [])]
    newTimes[index] = time
    setForm({
      ...form,
      reminders: {
        ...form.reminders!,
        times: newTimes
      }
    })
  }

  const removeReminderTime = (index: number) => {
    const newTimes = form.reminders?.times?.filter((_, i) => i !== index) || []
    setForm({
      ...form,
      reminders: {
        ...form.reminders!,
        times: newTimes
      }
    })
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
                <Pill className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Add Medication
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Track new medications for your family members
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
              <h3 className="text-lg font-semibold text-green-800">Medication Added Successfully!</h3>
              <p className="text-green-600">The medication has been added to your family member's profile.</p>
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
              className="bg-white rounded-3xl p-8 shadow-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Family Member Selection - Auto-selected */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <span>Family Member</span>
                    <span className="text-sm font-normal text-gray-500">(Auto-selected)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMember(member.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          selectedMember === member.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-base font-semibold">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.relationship}</div>
                          {selectedMember === member.id && (
                            <div className="text-xs text-primary-600 mt-1">✓ Selected</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Smart Selection:</strong> AI automatically selects the most likely family member based on recent activity and health patterns.
                    </p>
                  </div>
                </div>

                {/* Medication Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <Pill className="w-5 h-5 text-primary-600" />
                    <span>Medication Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Medication Name *
                        <span className="text-sm font-normal text-gray-500 ml-2">(AI suggestions available)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={form.name || ''}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., Lisinopril"
                          list="medication-suggestions"
                        />
                        <datalist id="medication-suggestions">
                          <option value="Lisinopril" />
                          <option value="Metformin" />
                          <option value="Atorvastatin" />
                          <option value="Amlodipine" />
                          <option value="Omeprazole" />
                          <option value="Levothyroxine" />
                          <option value="Metoprolol" />
                          <option value="Losartan" />
                        </datalist>
                      </div>
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                        <p className="text-xs text-green-800">
                          🤖 <strong>AI Tip:</strong> Start typing to see common medications. AI learns from your patterns to suggest relevant options.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Dosage *
                        <span className="text-sm font-normal text-gray-500 ml-2">(Auto-suggested)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={form.dosage || ''}
                          onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., 10mg"
                          list="dosage-suggestions"
                        />
                        <datalist id="dosage-suggestions">
                          <option value="5mg" />
                          <option value="10mg" />
                          <option value="20mg" />
                          <option value="25mg" />
                          <option value="50mg" />
                          <option value="100mg" />
                          <option value="250mg" />
                          <option value="500mg" />
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Frequency *
                      </label>
                      <select
                        required
                        value={form.frequency || ''}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((freq) => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Prescribed By *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.prescribedBy || ''}
                        onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Dr. Sarah Johnson"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={form.startDate || ''}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={form.endDate || ''}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.purpose || ''}
                      onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Blood pressure management"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Instructions
                    </label>
                    <textarea
                      value={form.instructions || ''}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Take with food, avoid alcohol, etc."
                    />
                  </div>
                </div>

                {/* Side Effects */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span>Potential Side Effects</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {commonSideEffects.map((effect) => (
                      <button
                        key={effect}
                        type="button"
                        onClick={() => addSideEffect(effect)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          form.sideEffects?.includes(effect)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                        }`}
                      >
                        {effect}
                      </button>
                    ))}
                  </div>

                  {form.sideEffects && form.sideEffects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">Selected Side Effects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {form.sideEffects.map((effect) => (
                          <span
                            key={effect}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-xl"
                          >
                            <span>{effect}</span>
                            <button
                              type="button"
                              onClick={() => removeSideEffect(effect)}
                              className="text-orange-600 hover:text-orange-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reminders */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span>Reminders</span>
                  </h3>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableReminders"
                      checked={form.reminders?.enabled || false}
                      onChange={(e) => setForm({
                        ...form,
                        reminders: {
                          ...form.reminders!,
                          enabled: e.target.checked
                        }
                      })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="enableReminders" className="text-base font-semibold text-gray-700">
                      Enable medication reminders
                    </label>
                  </div>

                  {form.reminders?.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-700">Reminder Times</h4>
                        <button
                          type="button"
                          onClick={addReminderTime}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Time</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {form.reminders?.times?.map((time, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => updateReminderTime(index, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeReminderTime(index)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedMember}
                    className="w-full py-4 px-6 bg-primary-600 text-white rounded-2xl font-semibold text-base hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding Medication...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Add Medication</span>
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
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-500" />
                <span>Quick Tips</span>
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>Always consult your doctor before starting any new medication</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Set up reminders to ensure consistent medication adherence</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <span>Keep track of side effects and report them to your doctor</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <span>Update end dates when medications are discontinued</span>
                </li>
              </ul>
            </motion.div>

            {/* Medication Safety */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200"
            >
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Safety Reminder</span>
              </h3>
              <p className="text-red-700 text-base leading-relaxed">
                This information is for tracking purposes only. Always follow your doctor's instructions and never adjust dosages without medical supervision.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
