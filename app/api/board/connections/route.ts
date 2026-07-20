import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

async function getOwnBoardId(db: ReturnType<typeof supabase>, userId: string): Promise<string | null> {
  const { data } = await db.from('investigation_boards').select('id').eq('user_id', userId).maybeSingle()
  return data?.id ?? null
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()
  const boardId = await getOwnBoardId(db, user.id)
  if (!boardId) return NextResponse.json({ error: 'Board not found' }, { status: 404 })

  const { itemAId, itemBId, label } = await req.json()
  if (!itemAId || !itemBId || itemAId === itemBId) {
    return NextResponse.json({ error: 'Invalid connection' }, { status: 400 })
  }

  // Confirm both pins actually belong to this board before linking them --
  // prevents connecting to another user's item id even if guessed.
  const { data: owned } = await db.from('board_items').select('id').eq('board_id', boardId).in('id', [itemAId, itemBId])
  if (!owned || owned.length !== 2) {
    return NextResponse.json({ error: 'Pin not found on your board' }, { status: 404 })
  }

  const { data, error } = await db
    .from('board_connections')
    .insert({ board_id: boardId, item_a_id: itemAId, item_b_id: itemBId, label: label || null })
    .select()
    .single()

  if (error) {
    console.error('board connection insert error:', error)
    return NextResponse.json({ error: 'Could not connect pins' }, { status: 500 })
  }

  return NextResponse.json({ success: true, connection: data })
}

export async function DELETE(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()
  const boardId = await getOwnBoardId(db, user.id)
  if (!boardId) return NextResponse.json({ error: 'Board not found' }, { status: 404 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await db.from('board_connections').delete().eq('id', id).eq('board_id', boardId)

  if (error) {
    console.error('board connection delete error:', error)
    return NextResponse.json({ error: 'Could not remove connection' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
