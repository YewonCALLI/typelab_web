'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PostEditor() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'info' | 'document' | 'daily'>('document')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, category }),
    })

    if (response.ok) {
      alert('글이 발행되었습니다!')
      setTitle('')
      setContent('')
      router.push('/')
      router.refresh()
    } else {
      const error = await response.json()
      alert(`오류가 발생했습니다: ${error.error}`)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">새 글 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">카테고리</label>
          <div className="flex gap-4">
            {(['info', 'document', 'daily'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded ${
                  category === cat ? 'bg-black text-white' : 'bg-gray-200'
                }`}
              >
                {cat === 'info' ? '정보' : cat === 'document' ? '문서' : '일상'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded min-h-[400px]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#C8D932] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? '발행 중...' : '글 발행하기'}
        </button>
      </form>
    </div>
  )
}