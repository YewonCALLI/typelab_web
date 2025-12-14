'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [display_name, setName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error
        alert('가입 확인 이메일을 확인해주세요!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#6b5244] flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <h1 className='text-3xl font-bold mb-2'>Typelab</h1>
        <p className='text-gray-600 mb-8'>{isSignUp ? '회원가입' : '로그인'}</p>

        <form onSubmit={handleAuth} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>이메일</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent'
              placeholder='your@email.com'
              required
            />
          </div>

          {isSignUp ? (
            <>
              <div>
                <label className='block text-sm font-medium mb-2'>사용자 이름</label>
                <input
                  type='name'
                  value={display_name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent'
                  placeholder='이름'
                  required
                />
              </div>
            </>
          ) : (
            ''
          )}

          <div>
            <label className='block text-sm font-medium mb-2'>비밀번호</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent'
              placeholder='••••••••'
              required
              minLength={6}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#C8D932] text-black font-bold py-3 rounded-lg hover:bg-[#b5c62d] transition disabled:opacity-50'
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button onClick={() => setIsSignUp(!isSignUp)} className='text-sm text-gray-600 hover:text-black'>
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-[#6b5244] flex items-center justify-center'>
          <div className='text-white text-xl'>로딩 중...</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
