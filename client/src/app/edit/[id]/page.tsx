'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PostModal from '@/components/PostModal'
import { motion, AnimatePresence } from 'framer-motion'

interface Post {
  id: string
  title: string
  content: string
  published_at: string
  category: string
  thumbnail_url?: string
}

export default function MyPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // 내 글 가져오기
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error loading posts:', error)
      } else {
        setPosts(postsData || [])
      }

      setLoading(false)
    }

    loadUserData()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      alert('삭제되었습니다.')
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
      case 'info': return '정보'
      case 'document': return '문서'
      case 'daily': return '일상'
      default: return category
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#6b5244] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
              <p className="text-xl opacity-90">{profile?.display_name || '익명'}</p>
              <p className="text-sm opacity-75 mt-1">총 {posts.length}개의 글</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                홈으로
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">내가 쓴 글</h2>
          <Link
            href="/write"
            className="bg-[#C8D932] text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            새 글 쓰기
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">아직 작성한 글이 없습니다.</p>
            <Link
              href="/write"
              className="inline-block bg-[#C8D932] text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
            >
              첫 글 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setSelectedPostId(post.id)}
                      className="text-left w-full"
                    >
                      <h3 className="text-xl font-semibold mb-2 hover:text-[#C8D932] transition truncate">
                        {post.title}
                      </h3>
                    </button>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/edit/${post.id}`}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {post.thumbnail_url && (
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPostId && (
          <PostModal
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}