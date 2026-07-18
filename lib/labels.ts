import type { IncidentCategory, ClaimType, PersonRole } from './types'

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  amber_alert: 'Amber Alert',
  silver_alert: 'Silver Alert',
  blue_alert: 'Blue Alert',
  endangered_missing_person: 'Endangered Missing Person',
  camo_alert: 'Camo Alert',
  missing_person: 'Missing Person',
  drowning_report: 'Drowning Report',
}

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  confirmed_fact: 'Confirmed',
  official_statement: 'Official Statement',
  family_claim: "Family's Claim",
  disputed_allegation: 'Disputed',
  unconfirmed_report: 'Unconfirmed',
}

export const CLAIM_TYPE_CLASSES: Record<ClaimType, string> = {
  confirmed_fact: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  official_statement: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
  family_claim: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  disputed_allegation: 'border-red-500/30 bg-red-500/10 text-red-300',
  unconfirmed_report: 'border-gray-400/30 bg-gray-400/10 text-gray-300',
}

export const PERSON_ROLE_LABELS: Record<PersonRole, string> = {
  victim: 'Victim',
  suspect: 'Suspect',
  witness: 'Witness',
  person_of_interest: 'Person of Interest',
}

export const PERSON_ROLE_CLASSES: Record<PersonRole, string> = {
  victim: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  suspect: 'border-red-500/30 bg-red-500/10 text-red-300',
  witness: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
  person_of_interest: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
}
