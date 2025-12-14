'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostModal from './PostModal'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string
  author_id: string
  title: string
  content: string
  published_at: string
  category: string
  thumbnail_url?: string
}

interface TypelabListProps {
  initialPostId?: string
  onClose: () => void
}

export default function TypelabList({ initialPostId, onClose }: TypelabListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [profiles, setProfiles] = useState<{ [key: string]: { display_name: string } }>({})
  const [loading, setLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId || null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'info' | 'document' | 'daily'>('all')
  const supabase = createClient()

  useEffect(() => {
    if (initialPostId) {
      setSelectedPostId(initialPostId)
    }
  }, [initialPostId])

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)

      let query = supabase.from('posts').select('*').order('published_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data: posts, error } = await query

      if (error) {
        console.error('Error loading posts:', error)
        setLoading(false)
        return
      }

      setPosts(posts || [])

      if (posts && posts.length > 0) {
        const authorIds = Array.from(new Set(posts.map((p) => p.author_id)))
        const { data: profilesData } = await supabase.from('profiles').select('id, display_name').in('id', authorIds)

        if (profilesData) {
          const profileMap: { [key: string]: { display_name: string } } = {}
          profilesData.forEach((profile: any) => {
            profileMap[profile.id] = { display_name: profile.display_name }
          })
          setProfiles(profileMap)
        }
      }

      setLoading(false)
    }

    loadPosts()
  }, [selectedCategory])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return `${kstDate.getFullYear()}.${(kstDate.getMonth() + 1).toString().padStart(2, '0')}.${kstDate
      .getDate()
      .toString()
      .padStart(2, '0')}`
  }

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'info':
        return '정보'
      case 'document':
        return '문서'
      case 'daily':
        return '일상'
      default:
        return category
    }
  }

  return (
    <>
      <motion.div
        className='fixed inset-0 z-30 flex items-start justify-center top-16 lg:top-1/2 lg:-translate-y-1/2 p-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className='relative w-full max-w-7xl bg-white overflow-hidden max-h-[85vh] flex flex-col border border-black'
          onClick={(e) => e.stopPropagation()}
        >

          {/* 카테고리 필터 */}
          <div className='border-b border-black p-4'>
            <div className='flex gap-2 flex-wrap'>
              {(['all', 'info', 'document', 'daily'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 border border-black font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {cat === 'all' ? '전체' : cat === 'info' ? '정보' : cat === 'document' ? '문서' : '일상'}
                </button>
              ))}
            </div>
          </div>

          {/* 리스트 컨텐츠 */}
          <div className='flex-1 overflow-y-auto p-4'>
            {loading ? (
              <div className='text-center py-20 text-black'>로딩 중...</div>
            ) : posts.length === 0 ? (
              <div className='text-center py-20 text-black'>게시글이 없습니다.</div>
            ) : (
              <div className='space-y-2'>
                {posts.map((post) => (
                  <motion.button
                    key={post.id}
                    onClick={() => {
                      setSelectedPostId(post.id)
                      window.history.pushState({}, '', `/?postId=${post.id}`)
                    }}
                    className='w-full text-left border border-black py-4 px-4 transition-all group'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-semibold mb-2 transition-colors truncate'>
                          {post.title}
                        </h3>
                        <div className='flex items-center gap-3 text-sm text-black'>
                          <span className='border border-black px-2 py-1 text-xs'>
                            {getCategoryLabel(post.category)}
                          </span>
                          <span>{profiles[post.author_id]?.display_name || '익명'}</span>
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                      </div>
                      {post.thumbnail_url && (
                        <div className='w-20 h-20 flex-shrink-0 overflow-hidden bg-black'>
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPostId && (
          <PostModal
            postId={selectedPostId}
            onClose={() => {
              setSelectedPostId(null)
              window.history.pushState({}, '', '/')
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}