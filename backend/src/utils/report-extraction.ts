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

  // 1) Get raw text (OCR or existing)
  let rawText = existingText || '';

  if (!rawText && ocrApiKey && fileUrl) {
    rawText = await runOcrSpace(fileUrl, ocrApiKey);
  }

  if (!rawText) {
    throw new Error('No text available to extract data (OCR and extractedText both missing)');
  }

  // 2) If no OpenAI key, return empty structure
  if (!openAiKey) {
    return {
      medications: [],
      appointments: [],
      reminders: [],
    };
  }

  // 3) Use OpenAI to parse the text into structured JSON
  const parsed = await runOpenAiExtraction(rawText, openAiKey, openAiModel);
  return parsed;
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

Return strictly valid JSON in this exact shape:
{
  "medications": [ { "name": "", "dosage": "", "frequency": "", "startDate": "", "endDate": "", "prescribedBy": "", "purpose": "", "sideEffects": [] } ],
  "appointments": [ { "doctorName": "", "specialty": "", "hospital": "", "date": "", "time": "", "notes": "" } ],
  "reminders": [ { "title": "", "type": "", "date": "", "time": "" } ]
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
    };
  } catch (err: any) {
    console.error('OpenAI parse error:', err?.message || err, 'content:', content);
    throw new Error('Failed to parse OpenAI extraction result');
  }
}


