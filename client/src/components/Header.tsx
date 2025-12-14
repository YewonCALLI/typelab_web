'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface HeaderProps {
  transparent?: boolean
}

export default function Header({ transparent = false }: HeaderProps) {
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

  return (
    <header
      className={`fixed top-0 right-0 z-30 p-4 ${
        transparent ? 'mix-blend-difference' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/write"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                transparent
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              글쓰기
            </Link>
            <Link
              href="/my"
              className={`px-4 py-2 rounded-lg font-medium transition ${
                transparent
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {profile?.display_name || '마이페이지'}
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className={`px-4 py-2 rounded-lg font-medium transition ${
              transparent
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}