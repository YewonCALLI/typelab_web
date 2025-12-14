'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/Editor/RichTextEditor'

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [category, setCategory] = useState<'info' | 'document' | 'daily'>('document')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const [annotations, setAnnotations] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        
        // 프로필 정보 가져오기
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
      }
    }
    checkUser()
  }, [])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      let thumbnailUrl = null

      // 썸네일 업로드
      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop()
        const fileName = `${user.id}/thumbnail-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, thumbnail)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('post-images').getPublicUrl(fileName)

        thumbnailUrl = publicUrl
      }

      const { error } = await supabase.from('posts').insert([
        {
          author_id: user.id,
          title,
          content,
          content_json: { annotations }, 
          thumbnail_url: thumbnailUrl,
          category,
        },
      ])
      if (error) throw error

      alert('글이 발행되었습니다!')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      alert(`오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className='min-h-screen bg-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>새 글 작성</h1>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* 썸네일 업로드 */}
          <div>
            <label className='block mb-2 font-semibold'>대표 이미지 (썸네일)</label>
            <input
              type='file'
              accept='image/*'
              onChange={handleThumbnailChange}
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800'
            />
            {thumbnailPreview && (
              <div className='mt-4'>
                <img src={thumbnailPreview} alt='썸네일 미리보기' className='max-w-md rounded-lg' />
              </div>
            )}
          </div>

          {/* 카테고리 */}
          <div>
            <label className='block mb-2 font-semibold'>카테고리</label>
            <div className='flex gap-4'>
              {(['info', 'document', 'daily'] as const).map((cat) => (
                <button
                  key={cat}
                  type='button'
                  onClick={() => setCategory(cat)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    category === cat ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {cat === 'info' ? '정보' : cat === 'document' ? '문서' : '일상'}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className='block mb-2 font-semibold'>제목</label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent'
              placeholder='제목을 입력하세요'
              required
            />
          </div>

          {/* 에디터 */}
          <div>
            <label className='block mb-2 font-semibold'>내용</label>
            <RichTextEditor
              content={content}
              onChange={(html, annots) => {
                setContent(html)
                setAnnotations(annots)
              }}
              userId={user.id}
            />
          </div>

          {/* 작성자 표시 */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <p className='font-medium'>
              작성자: {profile?.display_name || '로딩 중...'}
            </p>
          </div>

          {/* 버튼 */}
          <div className='flex gap-4'>
            <button
              type='submit'
              disabled={loading}
              className='bg-[#C8D932] text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50'
            >
              {loading ? '발행 중...' : '글 발행하기'}
            </button>
            <button
              type='button'
              onClick={() => router.push('/')}
              className='bg-gray-200 text-black px-8 py-3 rounded-full font-bold hover:bg-gray-300 transition'
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}