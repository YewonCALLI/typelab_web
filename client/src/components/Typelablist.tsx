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
}

export default function TypelabList({ initialPostId }: TypelabListProps) {
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

      let query = supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })

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

  if (loading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-xl'>로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen bg-white font-['Pretendard']">
      {/* Header 제거됨 - CMS 페이지에서만 사용 */}
      
      {/* Sticky Header */}
      <div className='sticky top-0 bg-white z-10 border-b'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <h1 className='text-4xl font-bold mb-4'>Typelab</h1>
          
          {/* Category Filter */}
          <div className='flex gap-2'>
            {(['all', 'info', 'document', 'daily'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? '전체' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {posts.length === 0 ? (
          <div className='text-center py-20 text-gray-500'>게시글이 없습니다.</div>
        ) : (
          <div className='space-y-2'>
            {posts.map((post) => (
              <motion.button
                key={post.id}
                onClick={() => {
                  setSelectedPostId(post.id)
                  window.history.pushState({}, '', `/?postId=${post.id}`)
                }}
                className='w-full text-left border-b border-gray-200 py-4 px-4 hover:bg-gray-50 transition-colors group'
                whileHover={{ x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <h2 className='text-xl font-semibold mb-2 group-hover:text-[#C8D932] transition-colors truncate'>
                      {post.title}
                    </h2>
                    <div className='flex items-center gap-3 text-sm text-gray-600'>
                      <span className='bg-gray-100 px-2 py-1 rounded text-xs'>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span>{profiles[post.author_id]?.display_name || '익명'}</span>
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                  </div>
                  {post.thumbnail_url && (
                    <div className='w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100'>
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
    </div>
  )
}