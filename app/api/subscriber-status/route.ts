import { NextResponse } from 'next/server'
import { getSubscriberStatus } from '@/lib/subscription'

// Lightweight endpoint just for client components (like Navbar) that need to
// know subscriber status but can't call the server-only getSubscriberStatus
// directly -- e.g. pages that are themselves "use client" and render Navbar
// in their own JSX, which rules out Navbar being an async Server Component.
export async function GET() {
  const { isActive } = await getSubscriberStatus()
  return NextResponse.json({ isActive })
}
