'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface PostModalProps {
  postId: string
  onClose: () => void
}

export default function PostModal({ postId, onClose }: PostModalProps) {
  const [post, setPost] = useState<any>(null)
  const [author, setAuthor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadPost = async () => {
      const { data: postData } = await supabase.from('posts').select('*').eq('id', postId).single()

      if (postData) {
        setPost(postData)

        const { data: authorData } = await supabase.from('profiles').select('*').eq('id', postData.author_id).single()

        setAuthor(authorData)
      }
      setLoading(false)
    }

    loadPost()

    // ESC 키로 닫기
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [postId])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return `${kstDate.getFullYear()}년 ${kstDate.getMonth() + 1}월 ${kstDate.getDate()}일 ${kstDate.toISOString().substr(11, 5)}`
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

  const copyLink = () => {
    const url = `${window.location.origin}/post/${postId}`
    navigator.clipboard.writeText(url)
    alert('링크가 복사되었습니다!')
  }

  if (loading) {
    return (
      <motion.div
        className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className='text-white text-xl'>로딩 중...</div>
      </motion.div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <motion.div
      className='fixed inset-0 z-[5] flex items-center justify-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className='bg-white w-screen max-h-[100vh] overflow-y-auto relative'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className='relative w-full'>
          {post.thumbnail_url && (
            <img src={post.thumbnail_url} alt={post.title} className='h-[80dvh] lg:h-[20dvh] w-full object-cover' />
          )}

          <button
            onClick={onClose}
            className='
          fixed top-2 right-2
          text-white/80 hover:text-white
          text-3xl w-10 h-10
          flex items-center justify-center z-40 mix-blend-difference'
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className='p-6 mt-0 lg:mt-12 max-w-7xl font-[Pretendard]'>
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-gray-600 text-sm'>{formatDate(post.published_at)}</span>
            <span className='bg-gray-100 px-3 py-1 rounded text-sm'>{getCategoryLabel(post.category)}</span>
            <span className='text-gray-600 text-sm'>작성자: {author?.display_name || '익명'}</span>
          </div>
          <div className='prose prose-lg max-w-none' dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* 주석 - 이 부분 추가! */}
          {post.content_json?.annotations?.length > 0 && (
            <div className='mt-8 pt-6 border-t-2 border-gray-300'>
              <div className='space-y-3'>
                {post.content_json.annotations.map((ann: any) => (
                  <div key={ann.id} className=''>
                    <p className='text-sm text-gray-600 mb-1'>{`"${ann.selectedText}"`}</p>
                    <p className='text-sm font-medium'>{ann.annotationText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 작성자 */}
          <div className='mt-8 pt-6 mb-12 border-t'>
            <p className='font-medium'>작성자: {author?.display_name || '익명'}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
