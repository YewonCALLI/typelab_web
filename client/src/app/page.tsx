'use client'

import { useState, useEffect } from 'react'
import TypelabGarden from '@/components/Typelabgarden'
import TypelabList from '@/components/Typelablist'
import Category from '@/components/Button/Category'
import Toggle from '@/components/Button/Toggle'

interface PageProps {
  searchParams: Promise<{ postId?: string }>
}

export default function Page({ searchParams }: PageProps) {
  const [viewMode, setViewMode] = useState<'garden' | 'list'>('garden')
  const [postId, setPostId] = useState<string | undefined>(undefined)

  useEffect(() => {
    searchParams.then((params) => {
      setPostId(params.postId)
    })
  }, [searchParams])

  return (
    <>
      {viewMode === 'garden' ? (
        <TypelabGarden initialPostId={postId} />
      ) : (
        <TypelabList initialPostId={postId} />
      )}
      <Toggle viewMode={viewMode} onToggle={setViewMode} />
      <Category viewMode={viewMode} />
    </>
  )
}