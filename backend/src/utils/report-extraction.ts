import fetch from 'node-fetch';

export interface ExtractedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  purpose?: string;
  sideEffects?: string[];
}

export interface ExtractedAppointment {
  doctorName?: string;
  specialty?: string;
  hospital?: string;
  date?: string;
  time?: string;
  notes?: string;
}

export interface ExtractedReminder {
  title: string;
  type?: string;
  date?: string;
  time?: string;
}

export interface ExtractedReportData {
  medications: ExtractedMedication[];
  appointments: ExtractedAppointment[];
  reminders: ExtractedReminder[];
  conditions?: string[]; // Diseases/conditions found in report
  patientName?: string; // Patient name extracted from report
  patientInfo?: {
    age?: number;
    gender?: string;
    bloodType?: string;
  };
}

/**
 * Extract data from a health report using OCR + LLM.
 * Tries OCR.space if OCRSPACE_API_KEY is present, otherwise uses existing extractedText.
 * Then uses OpenAI (if OPENAI_API_KEY) to structure the data.
 */
export async function extractDataFromReport(
  fileUrl?: string,
  existingText?: string
): Promise<ExtractedReportData> {
  const ocrApiKey = process.env.OCRSPACE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const openAiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  
  // Debug logging
  console.log('🔍 Environment check:');
  console.log('  - OPENAI_API_KEY exists:', !!openAiKey);
  console.log('  - OPENAI_API_KEY length:', openAiKey ? openAiKey.length : 0);
  console.log('  - OPENAI_MODEL:', openAiModel);
  console.log('  - OCRSPACE_API_KEY exists:', !!ocrApiKey);

  // 1) Get raw text (OCR or existing)
  let rawText = existingText || '';

  if (!rawText && ocrApiKey && fileUrl) {
    rawText = await runOcrSpace(fileUrl, ocrApiKey);
  }

  if (!rawText) {
    throw new Error('No text available to extract data (OCR and extractedText both missing)');
  }

  // 2) If no OpenAI key, use fallback parser
  if (!openAiKey) {
    console.log('⚠️ No OpenAI API key found, using fallback parser');
    return parseReportFallback(rawText);
  }

  // 3) Use OpenAI to parse the text into structured JSON
  try {
    const parsed = await runOpenAiExtraction(rawText, openAiKey, openAiModel);
    return parsed;
  } catch (error) {
    console.error('OpenAI extraction failed, falling back to parser:', error);
    return parseReportFallback(rawText);
  }
}

async function runOcrSpace(fileUrl: string, apiKey: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('url', fileUrl);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!resp.ok) {
      throw new Error(`OCR API request failed: ${resp.statusText}`);
    }

    const json: any = await resp.json();
    const parsedText = json?.ParsedResults?.[0]?.ParsedText || '';
    return parsedText;
  } catch (error: any) {
    console.error('OCR error:', error?.message || error);
    throw new Error('OCR failed');
  }
}

async function runOpenAiExtraction(
  rawText: string,
  apiKey: string,
  model: string
): Promise<ExtractedReportData> {
  const prompt = `
You are a medical information extractor. Given raw text from a medical report, extract:

- medications: name, dosage, frequency, startDate (if any), endDate (if any), prescribedBy (if present), purpose (if present), sideEffects (array, if present)
- appointments: doctorName, specialty, hospital, date, time, notes (if present)
- reminders: title, type (medication|appointment|checkup|other if you can infer), date, time
- conditions: array of diseases/conditions mentioned in the report (e.g., ["Type 2 Diabetes", "Hypertension"])
- patientName: full name of the patient (string) if mentioned in the report
- patientInfo: age (number), gender (string), bloodType (string) if mentioned

Return strictly valid JSON in this exact shape:
{
  "medications": [ { "name": "", "dosage": "", "frequency": "", "startDate": "", "endDate": "", "prescribedBy": "", "purpose": "", "sideEffects": [] } ],
  "appointments": [ { "doctorName": "", "specialty": "", "hospital": "", "date": "", "time": "", "notes": "" } ],
  "reminders": [ { "title": "", "type": "", "date": "", "time": "" } ],
  "conditions": [ "condition1", "condition2" ],
  "patientName": "Patient Full Name",
  "patientInfo": { "age": 0, "gender": "", "bloodType": "" }
}

If a field is unknown, omit it or set an empty string. Dates can be left as strings exactly as they appear in the text; do not invent dates.
Text:
"""
${rawText}
"""
`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a strict JSON extraction assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI request failed: ${resp.status} ${text}`);
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content || '';

  try {
    const parsed = JSON.parse(content);
    return {
      medications: parsed.medications || [],
      appointments: parsed.appointments || [],
      reminders: parsed.reminders || [],
      conditions: parsed.conditions || [],
      patientName: parsed.patientName || '',
      patientInfo: parsed.patientInfo || {},
    };
  } catch (err: any) {
    console.error('OpenAI parse error:', err?.message || err, 'content:', content);
    throw new Error('Failed to parse OpenAI extraction result');
  }
}

/**
 * Fallback parser that extracts data using regex patterns when OpenAI is not available
 */
function parseReportFallback(rawText: string): ExtractedReportData {
  const text = rawText.toLowerCase();
  const medications: ExtractedMedication[] = [];
  const appointments: ExtractedAppointment[] = [];
  const reminders: ExtractedReminder[] = [];
  const conditions: string[] = [];
  const patientInfo: any = {};
  let patientName = '';

  // Extract patient name - look for "Patient Name:" pattern
  const patientNameMatch = rawText.match(/patient\s+name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
  if (patientNameMatch) {
    patientName = patientNameMatch[1].trim();
  }

  // Extract conditions/diseases from diagnosis section
  const diagnosisMatch = rawText.match(/diagnosis[:\s]+(.*?)(?:\n\n|prescribed|medication|appointment|follow|lab|future|doctor|$)/is);
  if (diagnosisMatch) {
    const diagnosisText = diagnosisMatch[1];
    // Split by numbers, bullets, or newlines
    const conditionList = diagnosisText
      .split(/\d+\.|\n|•|,/)
      .map(c => c.trim())
      .filter(c => c.length > 2 && !c.match(/^(and|or|the|a|an)$/i));
    conditions.push(...conditionList);
  }

  // Extract specific conditions from the text
  const commonConditions = [
    'type 2 diabetes', 'diabetes', 'hypertension', 'asthma', 'arthritis', 'anemia', 'thyroid',
    'depression', 'anxiety', 'migraine', 'epilepsy', 'pneumonia', 'bronchitis',
    'sinusitis', 'gastritis', 'ulcer', 'kidney', 'liver', 'heart', 'stroke',
    'cancer', 'tumor', 'fracture', 'sprain', 'infection', 'allergy', 'vitamin d deficiency'
  ];

  commonConditions.forEach(condition => {
    if (text.includes(condition)) {
      const capitalized = condition.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!conditions.some(c => c.toLowerCase().includes(condition))) {
        conditions.push(capitalized);
      }
    }
  });

  // Extract medications - look for medication patterns
  const medicationSection = rawText.match(/prescribed\s+medications?[:\s]+(.*?)(?:\n\n|lifestyle|lab|future|appointment|$)/is);
  if (medicationSection) {
    const medText = medicationSection[1];
    // Pattern: Medication name (can include numbers like D3), dosage, frequency
    // Split by numbered list (1., 2., etc.) or newlines
    const medLines = medText.split(/\n|\d+\./).filter(line => line.trim().length > 5);
    
    medLines.forEach(line => {
      // Improved pattern: Medication name can include numbers (like Vitamin D3), followed by dosage
      // Pattern matches: "Metformin 500 mg", "Vitamin D3 60,000 IU", "Amlodipine 5 mg"
      const medMatch = line.match(/([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*)\s+(\d+(?:,\d+)?\s*(?:mg|ml|mcg|units?|iu|tablets?|capsules?))\s*(?:[-–]\s*)?(.*?)(?:\n|$)/i);
      if (medMatch) {
        const name = medMatch[1].trim();
        const dosage = medMatch[2].trim();
        // Extract frequency from the rest of the line
        const frequencyMatch = line.match(/(?:[-–]\s*)?(.*?)(?:\s+for\s+\d+|$)/i);
        const frequency = frequencyMatch?.[1]?.trim() || medMatch[3]?.trim() || line.match(/(?:once|twice|thrice|daily|weekly|monthly|after|before)\s+(?:daily|meals?|day|week|month|lunch|breakfast|dinner|meals)/i)?.[0] || 'As prescribed';
        
        if (name && name.length > 0) {
          medications.push({
            name,
            dosage,
            frequency,
          });
        }
      } else {
        // Fallback: Try to extract medication name even if pattern doesn't fully match
        // Look for lines that start with a capitalized word followed by numbers (dosage)
        const fallbackMatch = line.match(/([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*)\s+(\d+)/);
        if (fallbackMatch) {
          const name = fallbackMatch[1].trim();
          const dosagePart = line.match(/(\d+(?:,\d+)?\s*(?:mg|ml|mcg|units?|iu))/i);
          const frequencyPart = line.match(/(?:[-–]\s*)?(.*?)(?:\s+for\s+\d+|$)/i);
          
          if (name && name.length > 0) {
            medications.push({
              name,
              dosage: dosagePart?.[0]?.trim() || fallbackMatch[2] + ' mg',
              frequency: frequencyPart?.[1]?.trim() || 'As prescribed',
            });
          }
        }
      }
    });
  }

  // Extract appointments - look for future appointment section
  const appointmentMatch = rawText.match(/(?:future\s+)?appointment[:\s]+(.*?)(?:\n\n|doctor|purpose|department|$)/is);
  if (appointmentMatch) {
    const apptText = appointmentMatch[1];
    const doctorMatch = rawText.match(/doctor[:\s]+(?:dr\.?\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const dateMatch = apptText.match(/(\d{1,2}[\s-](?:january|february|march|april|may|june|july|august|september|october|november|december)[\s-]\d{4})/i);
    const hospitalMatch = rawText.match(/hospital[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    const specialtyMatch = rawText.match(/(?:department|specialty)[:\s]+([A-Z][a-z]+)/i);
    
    if (dateMatch || doctorMatch) {
      appointments.push({
        doctorName: doctorMatch ? `Dr. ${doctorMatch[1]}` : 'Doctor',
        specialty: specialtyMatch ? specialtyMatch[1] : 'General',
        hospital: hospitalMatch ? hospitalMatch[1] : '',
        date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
        time: rawText.match(/time[:\s]+(\d{1,2}:\d{2}\s*(?:am|pm)?)/i)?.[1] || '10:00 AM',
        notes: apptText.match(/purpose[:\s]+(.*?)(?:\n|$)/i)?.[1]?.trim() || '',
      });
    }
  }

  // Extract patient info
  const ageMatch = rawText.match(/age[:\s]+(\d+)/i);
  if (ageMatch) patientInfo.age = parseInt(ageMatch[1]);

  const genderMatch = rawText.match(/gender[:\s]+(male|female|other)/i);
  if (genderMatch) patientInfo.gender = genderMatch[1];

  const bloodTypeMatch = rawText.match(/blood\s*type[:\s]+([ABO][+-]?|ab[+-]?)/i);
  if (bloodTypeMatch) patientInfo.bloodType = bloodTypeMatch[1].toUpperCase();

  // Create reminders from medications
  medications.forEach(med => {
    if (med.frequency) {
      reminders.push({
        title: `Take ${med.name}`,
        type: 'medication',
        time: '09:00 AM',
      });
    }
  });

  // Create reminders from appointments
  appointments.forEach(appt => {
    if (appt.date) {
      reminders.push({
        title: `Appointment with ${appt.doctorName}`,
        type: 'appointment',
        date: appt.date,
        time: appt.time || '10:00 AM',
      });
    }
  });

  return {
    medications,
    appointments,
    reminders,
    conditions: [...new Set(conditions.filter(c => c.length > 2))], // Remove duplicates and short strings
    patientName,
    patientInfo,
  };
}


