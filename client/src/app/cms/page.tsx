'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import CMSHeader from '@/components/CMSHeader'

export default function CMSPage() {
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
    if (show) {
      // 리스트 모드로 전환
      setViewMode('list')
      // 포스트가 열려있으면 닫기
      if (selectedPostId) {
        setSelectedPostId(null)
        window.history.pushState({}, '', '/cms')
      }
    } else {
      // 잔디밭 모드로 전환
      setViewMode('garden')
      // 포스트가 열려있으면 닫기
      if (selectedPostId) {
        setSelectedPostId(null)
        window.history.pushState({}, '', '/cms')
      }
    }
  }

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId)
    window.history.pushState({}, '', `/cms?postId=${postId}`)
    // 리스트에서 포스트를 선택하면 리스트 닫기
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