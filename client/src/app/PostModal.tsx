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
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className='sticky top-0 bg-white border-b p-6 flex justify-between items-start z-10'>
          <div className='flex-1'>
            <div className='flex gap-2 items-center mb-3'>
              <span className='bg-gray-100 px-3 py-1 rounded text-sm'>{getCategoryLabel(post.category)}</span>
              <span className='text-gray-600 text-sm'>{formatDate(post.published_at)}</span>
            </div>
            <h1 className='text-3xl font-bold mb-2'>{post.title}</h1>
            <div className='text-gray-600'>작성자: {author?.display_name || '익명'}</div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-black text-3xl w-10 h-10 flex items-center justify-center flex-shrink-0'
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className='p-6'>
          <div className='prose prose-lg max-w-none'>
            <div className='whitespace-pre-wrap text-gray-800 leading-relaxed'>{post.content}</div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className='sticky bottom-0 bg-white border-t p-6 flex gap-3'>
          <button
            onClick={copyLink}
            className='px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition font-medium'
          >
            🔗 링크 복사
          </button>
          <Link
            href={`/post/${postId}`}
            target='_blank'
            className='px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium'
          >
            새 탭에서 열기
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
