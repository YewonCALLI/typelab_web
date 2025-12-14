'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import CMSHeader from '@/components/CMSHeader'

function CMSPageContent() {
  const [viewMode, setViewMode] = useState<'garden' | 'list'>('garden')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')

  useEffect(() => {
    if (postId) {
      setSelectedPostId(postId)
    }
  }, [postId])

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

  const handleToggle = (show: boolean) => {
    // 포스트가 열려있으면 무조건 먼저 닫기
    if (selectedPostId) {
      setSelectedPostId(null)
      window.history.pushState({}, '', '/cms')
    }
    
    // 모드 전환
    if (show) {
      setViewMode('list')
    } else {
      setViewMode('garden')
    }
  }

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId)
    window.history.pushState({}, '', `/cms?postId=${postId}`)
    // 리스트가 열려있으면 닫기
    if (viewMode === 'list') {
      setViewMode('garden')
    }
  }

  const handlePostClose = () => {
    setSelectedPostId(null)
    window.history.pushState({}, '', '/cms')
  }

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
      <TypelabGarden 
        initialPostId={selectedPostId}
        onPostSelect={handlePostSelect}
        onPostClose={handlePostClose}
      />
      
      {viewMode === 'list' && (
        <TypelabList 
          initialPostId={selectedPostId}
          onPostSelect={handlePostSelect}
          onPostClose={handlePostClose}
          onClose={() => setViewMode('garden')}
        />
      )}
      
      <Toggle showList={viewMode === 'list'} onToggle={handleToggle} />
      <Category viewMode={viewMode} />
    </>
  )
}

export default function CMSPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#6b5244] flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <CMSPageContent />
    </Suspense>
  )
}