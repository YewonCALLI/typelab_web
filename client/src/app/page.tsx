'use client'

import { useState, useEffect } from 'react'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const [showList, setShowList] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')

  useEffect(() => {
    if (postId) {
      setSelectedPostId(postId)
    }
  }, [postId])

  const handleToggle = (show: boolean) => {
    if (show) {
      // 리스트 모드로 전환
      setShowList(true)
      // 포스트가 열려있으면 닫기
      if (selectedPostId) {
        setSelectedPostId(null)
        window.history.pushState({}, '', '/')
      }
    } else {
      // 잔디밭 모드로 전환
      setShowList(false)
      // 포스트가 열려있으면 닫기
      if (selectedPostId) {
        setSelectedPostId(null)
        window.history.pushState({}, '', '/')
      }
    }
  }

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId)
    window.history.pushState({}, '', `/?postId=${postId}`)
    // 리스트에서 포스트를 선택하면 리스트 닫기
    if (showList) {
      setShowList(false)
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
      
      {showList && (
        <TypelabList 
          initialPostId={selectedPostId}
          onPostSelect={handlePostSelect}
          onPostClose={handlePostClose}
          onClose={() => setShowList(false)}
        />
      )}
      
      <Toggle showList={showList} onToggle={handleToggle} />
      <Category viewMode={showList ? 'list' : 'garden'} />
    </>
  )
}