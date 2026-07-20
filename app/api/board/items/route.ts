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

  const body = await req.json()
  const { itemType, incidentId, personId, suspectName, note, posX, posY } = body

  if (!['case_pin', 'person_pin', 'suspect_note'].includes(itemType)) {
    return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
  }
  if (itemType === 'case_pin' && !incidentId) {
    return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })
  }
  if (itemType === 'person_pin' && !personId) {
    return NextResponse.json({ error: 'Missing personId' }, { status: 400 })
  }
  // Freeform "suspect" entries are deliberately text-only -- no photo field
  // exists on this row at all, so there's nothing to upload even if the
  // client tried.
  if (itemType === 'suspect_note' && !suspectName) {
    return NextResponse.json({ error: 'Missing suspectName' }, { status: 400 })
  }

  const { data, error } = await db
    .from('board_items')
    .insert({
      board_id: boardId,
      item_type: itemType,
      incident_id: itemType === 'case_pin' ? incidentId : null,
      person_id: itemType === 'person_pin' ? personId : null,
      suspect_name: itemType === 'suspect_note' ? suspectName : null,
      note: note || null,
      pos_x: typeof posX === 'number' ? posX : 40,
      pos_y: typeof posY === 'number' ? posY : 40,
    })
    .select()
    .single()

  if (error) {
    console.error('board item insert error:', error)
    return NextResponse.json({ error: 'Could not add pin' }, { status: 500 })
  }

  return NextResponse.json({ success: true, item: data })
}

export async function PATCH(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()
  const boardId = await getOwnBoardId(db, user.id)
  if (!boardId) return NextResponse.json({ error: 'Board not found' }, { status: 404 })

  const { id, posX, posY, note, width, height } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

  const update: Record<string, unknown> = {}
  if (typeof posX === 'number') update.pos_x = posX
  if (typeof posY === 'number') update.pos_y = posY
  if (typeof note === 'string') update.note = note
  if (typeof width === 'number') update.width = clamp(width, 120, 420)
  if (typeof height === 'number') update.height = clamp(height, 120, 420)

  const { error } = await db.from('board_items').update(update).eq('id', id).eq('board_id', boardId)

  if (error) {
    console.error('board item update error:', error)
    return NextResponse.json({ error: 'Could not update pin' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
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

  const { error } = await db.from('board_items').delete().eq('id', id).eq('board_id', boardId)

  if (error) {
    console.error('board item delete error:', error)
    return NextResponse.json({ error: 'Could not remove pin' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
