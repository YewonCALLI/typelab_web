'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CMSHeader() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    }

    loadUser()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className='fixed top-0 right-0 z-30 p-4 bg-white/90 backdrop-blur-sm shadow-sm'>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/write"
              className='px-4 py-2 bg-[#C8D932] text-black rounded-lg font-normal transition'
            >
              글쓰기
            </Link>
            <Link
              href="/my"
              className='px-4 py-2 bg-gray-100 rounded-lg font-normal transition'
            >
              {profile?.display_name || '마이페이지'}
            </Link>
            <button
              onClick={handleLogout}
              className='px-4 py-2 bg-gray-100 rounded-lg font-normal transition'
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className='px-4 py-2 bg-[#C8D932] text-black rounded-lg font-normal transition'
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}