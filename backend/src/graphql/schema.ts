import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    clerkId: String!
    email: String!
    name: String!
    phone: String
    profileImage: String
    preferences: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    familyMembers: [FamilyMember!]!
    healthReports: [HealthReport!]!
    appointments: [Appointment!]!
    medications: [Medication!]!
    reminders: [Reminder!]!
    aiInsights: [AIInsight!]!
  }

  type FamilyMember {
    id: ID!
    userId: String!
    name: String!
    email: String
    phone: String
    dob: DateTime!
    gender: String!
    relationship: String!
    bloodType: String
    height: Float
    weight: Float
    conditions: [String!]!
    allergies: [String!]!
    emergencyContacts: JSON
    insurance: JSON
    doctor: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    healthReports: [HealthReport!]!
    appointments: [Appointment!]!
    medications: [Medication!]!
    reminders: [Reminder!]!
    aiInsights: [AIInsight!]!
  }

  type HealthReport {
    id: ID!
    userId: String!
    memberId: String
    fileName: String!
    fileType: String!
    fileUrl: String!
    fileSize: Int
    extractedText: String
    analysis: JSON
    status: String!
    validationStatus: String
    accuracyScore: Float
    matchedTerms: [String!]!
    rejectionReason: String
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type Appointment {
    id: ID!
    userId: String!
    memberId: String
    doctorName: String!
    specialty: String!
    hospital: String
    date: DateTime!
    time: String!
    notes: String
    status: String!
    reminderSent: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type Medication {
    id: ID!
    userId: String!
    memberId: String
    name: String!
    dosage: String!
    frequency: String!
    startDate: DateTime!
    endDate: DateTime
    sideEffects: [String!]!
    reminders: JSON
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type Reminder {
    id: ID!
    userId: String!
    memberId: String
    title: String!
    description: String
    type: String!
    date: DateTime!
    time: String!
    frequency: String!
    priority: String!
    status: String!
    notifications: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type AIInsight {
    id: ID!
    userId: String!
    memberId: String
    type: String!
    title: String!
    description: String!
    severity: String!
    category: String!
    data: JSON
    actionItems: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type SymptomAnalysis {
    id: ID!
    userId: String!
    memberId: String
    symptoms: JSON!
    analysis: JSON!
    conditions: JSON!
    urgencyLevel: String!
    createdAt: DateTime!
    user: User!
    member: FamilyMember
  }

  # Input types for mutations
  input CreateFamilyMemberInput {
    name: String!
    email: String
    phone: String
    dob: DateTime!
    gender: String!
    relationship: String!
    bloodType: String
    height: Float
    weight: Float
    conditions: [String!]
    allergies: [String!]
    emergencyContacts: JSON
    insurance: JSON
    doctor: JSON
  }

  input UpdateFamilyMemberInput {
    name: String
    email: String
    phone: String
    dob: DateTime
    gender: String
    relationship: String
    bloodType: String
    height: Float
    weight: Float
    conditions: [String!]
    allergies: [String!]
    emergencyContacts: JSON
    insurance: JSON
    doctor: JSON
  }

  input CreateAppointmentInput {
    memberId: String
    doctorName: String!
    specialty: String!
    hospital: String
    date: DateTime!
    time: String!
    notes: String
  }

  input UpdateAppointmentInput {
    memberId: String
    doctorName: String
    specialty: String
    hospital: String
    date: DateTime
    time: String
    notes: String
    status: String
  }

  input CreateMedicationInput {
    memberId: String
    name: String!
    dosage: String!
    frequency: String!
    startDate: DateTime!
    endDate: DateTime
    sideEffects: [String!]
    reminders: JSON
  }

  input UpdateMedicationInput {
    memberId: String
    name: String
    dosage: String
    frequency: String
    startDate: DateTime
    endDate: DateTime
    sideEffects: [String!]
    reminders: JSON
    status: String
  }

  input CreateReminderInput {
    memberId: String
    title: String!
    description: String
    type: String!
    date: DateTime!
    time: String!
    frequency: String!
    priority: String
    notifications: JSON
  }

  input UpdateReminderInput {
    memberId: String
    title: String
    description: String
    type: String
    date: DateTime
    time: String
    frequency: String
    priority: String
    status: String
    notifications: JSON
  }

  input CreateHealthReportInput {
    memberId: String
    fileName: String!
    fileType: String!
    fileUrl: String!
    fileSize: Int
    extractedText: String
    analysis: JSON
    autoExtract: Boolean # If true, automatically extract medications/appointments/reminders after validation
  }

  input CreateAIInsightInput {
    memberId: String
    type: String!
    title: String!
    description: String!
    severity: String!
    category: String!
    data: JSON
    actionItems: JSON
  }

  input CreateSymptomAnalysisInput {
    memberId: String
    symptoms: JSON!
    analysis: JSON!
    conditions: JSON!
    urgencyLevel: String!
  }

  # Additional input types for enhanced functionality
  input UpdateUserProfileInput {
    name: String
    phone: String
    profileImage: String
  }

  input CreateHealthMetricInput {
    memberId: String
    type: String!
    value: Float!
    unit: String!
    recordedAt: DateTime!
    notes: String
  }

  input UpdateHealthMetricInput {
    value: Float
    unit: String
    recordedAt: DateTime
    notes: String
  }

  input SyncWearableDataInput {
    memberId: String
    deviceType: String!
    data: JSON!
    syncedAt: DateTime!
  }

  # Additional types for health metrics and wearable data
  type HealthMetric {
    id: ID!
    userId: String!
    memberId: String
    type: String!
    value: Float!
    unit: String!
    recordedAt: DateTime!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  type WearableData {
    id: ID!
    userId: String!
    memberId: String
    deviceType: String!
    data: JSON!
    syncedAt: DateTime!
    processedAt: DateTime
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    member: FamilyMember
  }

  # Extracted data structures from health reports (OCR + AI)
  type ExtractedMedication {
    name: String!
    dosage: String
    frequency: String
    startDate: String
    endDate: String
    prescribedBy: String
    purpose: String
    sideEffects: [String!]
  }

  type ExtractedAppointment {
    doctorName: String
    specialty: String
    hospital: String
    date: String
    time: String
    notes: String
  }

  type ExtractedReminder {
    title: String!
    type: String
    date: String
    time: String
  }

  type ExtractedReportData {
    medications: [ExtractedMedication!]!
    appointments: [ExtractedAppointment!]!
    reminders: [ExtractedReminder!]!
  }

  type AnalyzeHealthReportResult {
    medications: [Medication!]!
    appointments: [Appointment!]!
    reminders: [Reminder!]!
    extracted: ExtractedReportData!
  }

  type DashboardStats {
    totalMembers: Int!
    averageHealthScore: Float!
    totalMedications: Int!
    upcomingAppointments: Int!
    healthAlerts: Int!
    totalAppointments: Int!
    totalReminders: Int!
    totalHealthReports: Int!
  }

  # Queries
  type Query {
    me: User
    familyMembers: [FamilyMember!]!
    familyMember(id: ID!): FamilyMember
    appointments: [Appointment!]!
    appointment(id: ID!): Appointment
    medications: [Medication!]!
    medication(id: ID!): Medication
    reminders: [Reminder!]!
    reminder(id: ID!): Reminder
    healthReports: [HealthReport!]!
    healthReport(id: ID!): HealthReport
    aiInsights: [AIInsight!]!
    aiInsight(id: ID!): AIInsight
    symptomAnalyses: [SymptomAnalysis!]!
    symptomAnalysis(id: ID!): SymptomAnalysis
    healthMetrics: [HealthMetric!]!
    healthMetric(id: ID!): HealthMetric
    wearableData: [WearableData!]!
    wearableDataById(id: ID!): WearableData
    emergencyQR: String
    userPreferences: JSON
    dashboardStats: DashboardStats!
  }

  # Mutations
  type Mutation {
    # Family Member mutations
    createFamilyMember(input: CreateFamilyMemberInput!): FamilyMember!
    updateFamilyMember(id: ID!, input: UpdateFamilyMemberInput!): FamilyMember!
    deleteFamilyMember(id: ID!): Boolean!
    bulkUpdateFamilyMembers(input: [UpdateFamilyMemberInput!]!): [FamilyMember!]!

    # Appointment mutations
    createAppointment(input: CreateAppointmentInput!): Appointment!
    updateAppointment(id: ID!, input: UpdateAppointmentInput!): Appointment!
    deleteAppointment(id: ID!): Boolean!
    rescheduleAppointment(id: ID!, newDate: DateTime!, newTime: String!): Appointment!
    markAppointmentCompleted(id: ID!, notes: String): Appointment!
    cancelAppointment(id: ID!, reason: String): Appointment!

    # Medication mutations
    createMedication(input: CreateMedicationInput!): Medication!
    updateMedication(id: ID!, input: UpdateMedicationInput!): Medication!
    deleteMedication(id: ID!): Boolean!
    markMedicationCompleted(id: ID!): Medication!
    updateMedicationDosage(id: ID!, newDosage: String!): Medication!

    # Reminder mutations
    createReminder(input: CreateReminderInput!): Reminder!
    updateReminder(id: ID!, input: UpdateReminderInput!): Reminder!
    deleteReminder(id: ID!): Boolean!
    markReminderCompleted(id: ID!): Reminder!
    snoozeReminder(id: ID!, snoozeUntil: DateTime!): Reminder!

    # Health Report mutations
    createHealthReport(input: CreateHealthReportInput!): HealthReport!
    updateHealthReport(id: ID!, analysis: JSON, status: String): HealthReport!
    deleteHealthReport(id: ID!): Boolean!
    processHealthReport(id: ID!): HealthReport!
    extractTextFromReport(id: ID!): HealthReport!
    analyzeHealthReport(reportId: ID!, memberId: ID): AnalyzeHealthReportResult!

    # AI Insight mutations
    createAIInsight(input: CreateAIInsightInput!): AIInsight!
    updateAIInsight(id: ID!, actionItems: JSON): AIInsight!
    deleteAIInsight(id: ID!): Boolean!
    generateHealthInsights(memberId: ID): [AIInsight!]!
    updateInsightActionItems(id: ID!, actionItems: JSON!): AIInsight!

    # Symptom Analysis mutations
    createSymptomAnalysis(input: CreateSymptomAnalysisInput!): SymptomAnalysis!
    deleteSymptomAnalysis(id: ID!): Boolean!
    analyzeSymptoms(symptoms: JSON!, memberId: ID): SymptomAnalysis!

    # User Profile mutations
    updateUserProfile(input: UpdateUserProfileInput!): User!
    updateUserPreferences(preferences: JSON!): User!

    # Emergency ID mutations
    generateEmergencyQR(userId: ID!): String!
    updateEmergencyContacts(contacts: JSON!): User!

    # Health Metrics mutations
    recordHealthMetric(input: CreateHealthMetricInput!): HealthMetric!
    updateHealthMetric(id: ID!, input: UpdateHealthMetricInput!): HealthMetric!
    deleteHealthMetric(id: ID!): Boolean!

    # Wearable Data mutations
    syncWearableData(input: SyncWearableDataInput!): WearableData!
    processWearableData(id: ID!): WearableData!
  }
`;

