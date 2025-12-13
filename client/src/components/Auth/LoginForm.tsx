'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      alert(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      alert(error.message)
    } else {
      alert('가입 확인 이메일을 확인해주세요!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">로그인 / 회원가입</h2>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            로그인
          </button>
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  )
}