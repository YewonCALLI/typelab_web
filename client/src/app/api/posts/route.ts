import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, category } = await request.json()

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        author_id: user.id,
        title,
        content,
        category,
      }
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  let query = supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false })

  if (userId) {
    query = query.eq('author_id', userId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}