'use client'

import { useState, useEffect } from 'react'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const [showList, setShowList] = useState(false)
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')

  return (
    <>
      <TypelabGarden initialPostId={postId || undefined} />
      
      {showList && (
        <TypelabList 
          initialPostId={postId || undefined}
          onClose={() => setShowList(false)}
        />
      )}
      
      <Toggle showList={showList} onToggle={setShowList} />
      <Category viewMode={showList ? 'list' : 'garden'} />
    </>
  )
}