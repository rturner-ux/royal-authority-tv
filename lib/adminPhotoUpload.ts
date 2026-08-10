import 'server-only'
import { supabase } from './supabase/server'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB, matching picture-scan's cap
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export class PhotoValidationError extends Error {}

// Validates and uploads an admin-supplied photo to the case-photos bucket,
// returning its public URL. `case-photos` is public-read but has no
// Storage RLS policy granting authenticated writes (unlike
// subscriber-avatars, which has a real migration for it) -- uploading via
// the service-role client here avoids needing one.
export async function uploadToCasePhotos(file: File, pathPrefix: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new PhotoValidationError('Please upload a JPEG, PNG, or WEBP image')
  }
  if (file.size > MAX_BYTES) {
    throw new PhotoValidationError('Image must be under 8MB')
  }

  const ext = EXT_BY_TYPE[file.type]
  const path = `${pathPrefix}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const db = supabase()
  const { error } = await db.storage.from('case-photos').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  })
  if (error) throw new Error(`Photo upload failed: ${error.message}`)

  const { data } = db.storage.from('case-photos').getPublicUrl(path)
  return data.publicUrl
}
