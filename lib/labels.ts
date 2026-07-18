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

export const CATEGORY_COLORS: Record<IncidentCategory, string> = {
  amber_alert: '#F59E0B',
  silver_alert: '#9CA3AF',
  blue_alert: '#2563EB',
  endangered_missing_person: '#F97316',
  camo_alert: '#16A34A',
  missing_person: '#7C3AED',
  drowning_report: '#0D9488',
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
  family_member: 'Family Member',
  official: 'Official',
  advocate: 'Family Advocate',
  public_supporter: 'Public Supporter',
}

export const PERSON_ROLE_CLASSES: Record<PersonRole, string> = {
  victim: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  suspect: 'border-red-500/30 bg-red-500/10 text-red-300',
  witness: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
  person_of_interest: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  family_member: 'border-pink-400/30 bg-pink-400/10 text-pink-300',
  official: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  advocate: 'border-purple-400/30 bg-purple-400/10 text-purple-300',
  public_supporter: 'border-[#C9A24A]/30 bg-[#C9A24A]/10 text-[#E8D19A]',
}
