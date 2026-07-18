export type IncidentCategory =
  | 'amber_alert'
  | 'silver_alert'
  | 'blue_alert'
  | 'endangered_missing_person'
  | 'camo_alert'
  | 'missing_person'
  | 'drowning_report'
  | 'death_investigation'

export type IncidentStatus = 'active' | 'resolved' | 'cleared'
export type ClaimType = 'confirmed_fact' | 'official_statement' | 'family_claim' | 'disputed_allegation' | 'unconfirmed_report'
export type PersonRole =
  | 'victim'
  | 'suspect'
  | 'witness'
  | 'person_of_interest'
  | 'family_member'
  | 'official'
  | 'advocate'
  | 'public_supporter'

export type Incident = {
  id: string
  slug: string | null
  category: IncidentCategory
  status: IncidentStatus
  is_hidden: boolean
  is_featured: boolean
  title: string
  description: string | null
  lat: number
  lng: number
  location_label: string | null
  source_name: string
  source_url: string | null
  image_url: string | null
  scene_description: string | null
  scene_image_url: string | null
  location_history: string | null
  published_at: string
  created_at: string
  updated_at: string
}

export type IncidentUpdate = {
  id: string
  incident_id: string
  body: string
  source_url: string | null
  claim_type: ClaimType
  event_date: string | null
  created_at: string
  contradicts_update_id: string | null
  correction_note: string | null
}

export type IncidentPerson = {
  id: string
  incident_id: string
  name: string
  role: PersonRole
  age: number | null
  status: string | null
  summary: string | null
  bio: string | null
  photo_url: string | null
  photo_fit: 'cover' | 'contain'
  sequence: number
  qa: InterviewQA[]
  connectedCases: PersonConnectedCase[]
}

export type PersonConnectedCase = {
  id: string
  person_id: string
  case_title: string
  case_summary: string
  case_year: number | null
  source_url: string | null
  sequence: number
}

export type InterviewQA = {
  id: string
  person_id: string
  question: string
  answer: string
  source_name: string
  source_url: string | null
  sequence: number
}

export type IncidentTranscriptRow = {
  id: string
  incident_id: string
  sequence: number
  speaker_label: string | null
  original_text: string
  original_language: string
  translated_text: string | null
  translated_language: string | null
  source_url: string | null
}
