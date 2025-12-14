'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TypelabGarden from '@/components/Typelabgarden'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import TypelabList from '@/components/Typelablist'

export default function Page() {
  const [viewMode, setViewMode] = useState<'garden' | 'list'>('garden')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')

  useEffect(() => {
    if (postId) {
      setSelectedPostId(postId)
    }
  }, [postId])

  const handleToggle = (show: boolean) => {
    // 포스트가 열려있으면 무조건 먼저 닫기
    if (selectedPostId) {
      setSelectedPostId(null)
      window.history.pushState({}, '', '/')
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
    window.history.pushState({}, '', `/?postId=${postId}`)
    // 리스트가 열려있으면 닫기
    if (viewMode === 'list') {
      setViewMode('garden')
    }
  }

  const handlePostClose = () => {
    setSelectedPostId(null)
    window.history.pushState({}, '', '/')
  }

  return (
    <>
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