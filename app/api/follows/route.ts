import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid } from '@/lib/friends'

// Returns the current user's following/followers lists, each hydrated with
// the other person's profile plus whether the relationship is mutual (so
// the UI can show "Follow Back" vs "Following") and their friendStatus
// (so the same modal can offer "Partner Up" without a second round-trip).
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()

  const [{ data: followingRows }, { data: followerRows }, { data: friendRows }] = await Promise.all([
    db.from('subscriber_follows').select('followed_id').eq('follower_id', user.id),
    db.from('subscriber_follows').select('follower_id').eq('followed_id', user.id),
    db
      .from('friend_requests')
      .select('sender_id, recipient_id, status')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
  ])

  const followingIds = new Set((followingRows ?? []).map((r) => r.followed_id))
  const followerIds = new Set((followerRows ?? []).map((r) => r.follower_id))
  const friendIds = new Set(
    (friendRows ?? []).map((r) => (r.sender_id === user.id ? r.recipient_id : r.sender_id))
  )

  const allIds = Array.from(new Set([...followingIds, ...followerIds]))
  const { data: profiles } = allIds.length
    ? await db.from('subscriber_profiles').select('user_id, callsign, role, avatar_url, is_verified').in('user_id', allIds)
    : { data: [] }
  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  const hydrate = (id: string) => ({
    otherUser: profileById.get(id) ?? { user_id: id, callsign: null, role: null, avatar_url: null, is_verified: false },
    isFollowedByMe: followingIds.has(id),
    followsMe: followerIds.has(id),
    isFriend: friendIds.has(id),
  })

  return NextResponse.json({
    success: true,
    following: Array.from(followingIds).map(hydrate),
    followers: Array.from(followerIds).map(hydrate),
    followingCount: followingIds.size,
    followerCount: followerIds.size,
  })
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { followedId } = await req.json()
  if (!isUuid(followedId)) return NextResponse.json({ error: 'Invalid followedId' }, { status: 400 })
  if (followedId === user.id) return NextResponse.json({ error: "Can't follow yourself" }, { status: 400 })

  const db = supabase()
  const { error } = await db.from('subscriber_follows').insert({ follower_id: user.id, followed_id: followedId })

  if (error && error.code !== '23505') {
    console.error('follow insert error:', error)
    return NextResponse.json({ error: 'Could not follow' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const followedId = req.nextUrl.searchParams.get('followedId')
  if (!isUuid(followedId)) return NextResponse.json({ error: 'Invalid followedId' }, { status: 400 })

  const db = supabase()
  const { error } = await db
    .from('subscriber_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('followed_id', followedId)

  if (error) {
    console.error('unfollow error:', error)
    return NextResponse.json({ error: 'Could not unfollow' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
