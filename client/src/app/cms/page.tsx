'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import CMSHeader from '@/components/CMSHeader'

export default function CMSPage() {
  const [viewMode, setViewMode] = useState<'garden' | 'list'>('garden')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // 로그인 안 되어 있으면 로그인 페이지로
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#6b5244] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <CMSHeader />
      {viewMode === 'garden' ? (
        <TypelabGarden initialPostId={undefined} />
      ) : (
        <TypelabList initialPostId={undefined} />
      )}
      <Toggle viewMode={viewMode} onToggle={setViewMode} />
      <Category viewMode={viewMode} />
    </>
  )
}