'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setMessage(decodeURIComponent(error))
    }
    
    const confirmed = searchParams.get('confirmed')
    if (confirmed === 'true') {
      setMessage('✅ 이메일 확인 완료! 이제 로그인할 수 있습니다.')
    }
  }, [searchParams])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPassword = password.trim()

      if (isSignUp) {
        if (!displayName.trim()) {
          setMessage('닉네임을 입력해주세요.')
          setLoading(false)
          return
        }

        // 회원가입
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              display_name: displayName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        
        if (signUpError) throw signUpError

        if (signUpData.user) {
          // 프로필 생성
          await supabase
            .from('profiles')
            .upsert([
              {
                id: signUpData.user.id,
                display_name: displayName.trim(),
              }
            ], {
              onConflict: 'id'
            })
        }

        setMessage('✉️ 이메일을 확인해주세요! 가입 확인 링크를 보내드렸습니다.')
        
      } else {
        // 로그인
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        })
        
        if (signInError) throw signInError
        
        if (signInData.session) {
          router.push('/cms')
          router.refresh()
        } else {
          throw new Error('세션 생성 실패')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      let errorMessage = '오류가 발생했습니다.'
      
      if (error.message.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다. 로그인하세요.'
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다. 이메일 확인을 완료하셨나요?'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '이메일 확인이 필요합니다. 메일함을 확인해주세요.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?reset=true`,
      })
      
      if (error) throw error
      
      alert('비밀번호 재설정 이메일을 보냈습니다. 메일함을 확인해주세요.')
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#6b5244] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Typelab</h1>
        <p className="text-gray-600 mb-8">
          {isSignUp ? '회원가입' : '로그인'}
        </p>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('✉️') || message.includes('✅')
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-2">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent"
                placeholder="다른 사람에게 보여질 이름"
                required={isSignUp}
                autoComplete="name"
              />
              <p className="text-xs text-gray-500 mt-1">
                글을 작성할 때 이 이름으로 표시됩니다.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8D932] focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8D932] text-black font-bold py-3 rounded-lg hover:bg-[#b5c62d] transition disabled:opacity-50"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        {!isSignUp && (
          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full mt-3 text-sm text-gray-600 hover:text-black"
          >
            비밀번호를 잊으셨나요?
          </button>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            className="text-sm text-gray-600 hover:text-black"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  )
}