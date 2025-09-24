'use client'

import React from 'react'
import { Phone, MapPin, Clock, AlertTriangle } from 'lucide-react'

interface EmergencyInfoCardProps {
  emergencyContacts?: {
    name: string
    phone: string
    relationship: string
  }[]
  emergencyLocation?: string
}

export default function EmergencyInfoCard({ 
  emergencyContacts = [], 
  emergencyLocation = "Current Location" 
}: EmergencyInfoCardProps) {
  const defaultContacts = [
    { name: "Emergency Services", phone: "911", relationship: "Emergency" },
    { name: "Family Doctor", phone: "(555) 123-4567", relationship: "Medical" },
    { name: "Emergency Contact", phone: "(555) 987-6543", relationship: "Family" }
  ]

  const contacts = emergencyContacts.length > 0 ? emergencyContacts : defaultContacts

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900">Emergency Information</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm text-red-800">Location</p>
            <p className="font-medium text-red-900">{emergencyLocation}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-red-900">Emergency Contacts</h4>
          {contacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.relationship}</p>
              </div>
              <a 
                href={`tel:${contact.phone}`}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-800">
              <strong>Important:</strong> In case of emergency, call 911 immediately or go to the nearest emergency room.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}










