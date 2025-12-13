import TypelabGarden from '@/components/Typelabgarden'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }> 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  return (
    <>
      <TypelabGarden initialPostId={params.postId} />
      <Toggle />
      <Category />
    </>
  )
}