import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = supabase()
    const { data, error } = await db
      .from('incidents')
      .select('*')
      .eq('is_hidden', false)
      .order('published_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, incidents: data ?? [] })
  } catch (err) {
    console.error('GET /api/incidents error:', err)
    return NextResponse.json({ success: false, message: 'Failed to load incidents' }, { status: 500 })
  }
}
