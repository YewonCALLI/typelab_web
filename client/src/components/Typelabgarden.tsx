'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import PostModal from './PostModal'

interface Post {
  id: string
  author_id: string
  title: string
  content: string
  published_at: string
  category: string
}

interface Tile {
  id: number
  date: Date
  dateString: string
  type: 'soil' | 'grass-short' | 'grass-medium' | 'grass-tall' | 'water'
  color: string
  posts: Post[]
}

interface TypelabGardenProps {
  initialPostId?: string | null
  onPostSelect?: (postId: string) => void
  onPostClose?: () => void
}

const TypelabGarden: React.FC<TypelabGardenProps> = ({ initialPostId, onPostSelect, onPostClose }) => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [hoveredTile, setHoveredTile] = useState<number | null>(null)
  const [selectedTile, setSelectedTile] = useState<number | null>(null)
  const [totalPosts, setTotalPosts] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [profiles, setProfiles] = useState<{ [key: string]: { display_name: string } }>({})
  const [selectedPostId, setSelectedPostId] = useState<string | null>(initialPostId || null)
  const router = useRouter()

  const colors = {
    soil: '#7A5448',
    blue: '#3AA8FF',
    grass: {
      short: '#CFEA74',
      medium: '#A7E163',
      tall: '#6FD657',
    },
  }

  const toKSTDateString = (utcDate: Date | string): string => {
    const date = new Date(utcDate)
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    return kstDate.toISOString().split('T')[0]
  }

  const getKSTToday = (): Date => {
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const kstDateString = kstNow.toISOString().split('T')[0]
    return new Date(kstDateString + 'T00:00:00.000Z')
  }

  useEffect(() => {
    setSelectedPostId(initialPostId || null)
  }, [initialPostId])

  useEffect(() => {
    const loadGarden = async () => {
      setLoading(true)

      const startDate = new Date('2025-11-02T00:00:00.000Z')
      const endDate = getKSTToday()

      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .gte('published_at', startDate.toISOString())
        .order('published_at', { ascending: true })

      if (error) {
        console.error('Error loading posts:', error)
        setLoading(false)
        return
      }

      setTotalPosts(posts?.length || 0)

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      const postsByDate = new Map<string, Post[]>()
      posts?.forEach((post) => {
        const dateKey = toKSTDateString(post.published_at)
        if (!postsByDate.has(dateKey)) {
          postsByDate.set(dateKey, [])
        }
        postsByDate.get(dateKey)!.push(post)
      })

      if (posts && posts.length > 0) {
        const authorIds = Array.from(new Set(posts.map((p) => p.author_id)))

        const { data: profilesData } = await supabase.from('profiles').select('id, display_name').in('id', authorIds)

        if (profilesData) {
          const profileMap: { [key: string]: { display_name: string } } = {}
          profilesData.forEach((profile: any) => {
            profileMap[profile.id] = { display_name: profile.display_name }
          })
          setProfiles(profileMap)
        }
      }

      const newTiles: Tile[] = []

      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateString = date.toISOString().split('T')[0]

        const dayPosts = postsByDate.get(dateString) || []
        const postCount = dayPosts.length

        let type: Tile['type'] = 'soil'
        let color = colors.soil

        if (postCount === 0) {
          type = Math.random() < 0.2 ? 'water' : 'soil'
          color = type === 'water' ? colors.blue : colors.soil
        } else if (postCount >= 3) {
          type = 'grass-tall'
          color = colors.grass.tall
        } else if (postCount === 2) {
          type = 'grass-medium'
          color = colors.grass.medium
        } else if (postCount === 1) {
          type = 'grass-short'
          color = colors.grass.short
        }

        newTiles.push({
          id: i,
          date,
          dateString,
          type,
          color,
          posts: dayPosts,
        })
      }

      setTiles(newTiles)
      setLoading(false)
    }

    loadGarden()
  }, [])

  useEffect(() => {
    // PostModal이 열려있을 때는 handleClickOutside 작동하지 않음
    if (selectedPostId) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.garden-tile') && !target.closest('.tile-title')) {
        setSelectedTile(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [selectedPostId])

  const getGrassHeight = (type: Tile['type']): number => {
    switch (type) {
      case 'grass-short':
        return 3
      case 'grass-medium':
        return 5
      case 'grass-tall':
        return 8
      default:
        return 0
    }
  }

  const getAuthorNames = (posts: Post[]): string => {
    if (posts.length === 0) return ''
    if (posts.length === 1) {
      return profiles[posts[0].author_id]?.display_name || '익명'
    }
    const firstAuthor = profiles[posts[0].author_id]?.display_name || '익명'
    return `${firstAuthor} 외 ${posts.length - 1}명`
  }

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
  }

  const handleTileClick = (tile: Tile) => {
    if (tile.posts.length > 0) {
      if (selectedTile === tile.id) {
        setSelectedTile(null)
      } else {
        setSelectedTile(tile.id)
      }
    }
  }

  const handlePostClick = (postId: string) => {
    if (onPostSelect) {
      onPostSelect(postId)
    } else {
      setSelectedPostId(postId)
      window.history.pushState({}, '', `/?postId=${postId}`)
    }
  }

  const handleModalClose = () => {
    if (onPostClose) {
      onPostClose()
    } else {
      setSelectedPostId(null)
      window.history.pushState({}, '', '/')
    }
  }

  // SVG 패턴 생성
  const getDotPattern = (type: Tile['type']) => {
    let color = '#CFEA74' // lime

    if (type === 'soil') {
      color = '#CFEA74'
    } else if (type === 'water') {
      color = '#CFEA74'
    } else if (type.startsWith('grass')) {
      color = '#7A5448' // brown
    }

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='none'/%3E%3Crect x='0' y='0' width='6' height='12' fill='${encodeURIComponent(color)}'/%3E%3Crect x='48' y='0' width='6' height='12' fill='${encodeURIComponent(color)}'/%3E%3Crect x='24' y='48' width='6' height='12' fill='${encodeURIComponent(color)}'/%3E%3Crect x='72' y='48' width='6' height='12' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`
  }

  const displayTile = selectedTile !== null ? selectedTile : hoveredTile

  if (loading) {
  }

  return (
    <div className="w-screen min-h-screen bg-[#6b5244] flex flex-col font-['Goorm_Sans'] ">
      {/* Header */}
      <div
        className={`flex fixed z-20 flex-col lg:w-fit pointer-events-none pl-4 pt-1 ${selectedPostId ? 'mix-blend-difference' : ''}`}
      >
        <div className='flex lg:justify-start'>
          <motion.div
            className={`tracking-tight ${selectedPostId ? 'text-white' : 'text-white'}`}
            animate={{
              fontSize: displayTile !== null || selectedPostId ? 'clamp(2rem, 3.5vw, 5rem)' : 'clamp(1rem, 8vw, 9rem)',
            }}
            transition={{ duration: 0.3 }}
          >
            Typelab
          </motion.div>
        </div>

        {/* Titles */}
      </div>
      <div className='flex fixed z-20 flex-col gap-2 top-[56px] lg:top-20 xl:top-24 2xl:top-32 pointer-events-none'>
        <AnimatePresence>
          {(displayTile !== null || selectedPostId) && tiles.length > 0 && (
            <div className='flex flex-col gap-2 px-4 lg:p-0 pointer-events-auto'>
              {selectedPostId
                ? // PostModal이 열려있을 때: 선택된 포스트의 타이틀만 표시
                  (() => {
                    const selectedPost = tiles.flatMap((tile) => tile.posts).find((post) => post.id === selectedPostId)
                    return selectedPost ? (
                      <motion.div
                        key={selectedPost.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='w-full lg:max-w-[90vw]'
                      >
                        <button
                          onClick={() => handlePostClick(selectedPost.id)}
                          className='tile-title block w-fit text-left bg-black text-white px-3 py-2 text-[clamp(1.5rem,1vw,3rem)] font-normal transition-all duration-200'
                        >
                          {selectedPost.title}
                        </button>
                      </motion.div>
                    ) : null
                  })()
                : // PostModal이 닫혀있을 때: 호버/선택된 타일의 포스트들 표시
                  displayTile !== null &&
                  tiles[displayTile]?.posts.length > 0 &&
                  tiles[displayTile].posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className='lg:max-w-[90vw]'
                    >
                      <button
                        onClick={() => handlePostClick(post.id)}
                        className={`tile-title block text-left px-3 py-2 lg:px-8 lg:py-4 text-[clamp(1.5rem,4vw,3rem)] font-normal transition-all duration-200 ${
                          selectedPostId === post.id
                            ? 'bg-black text-white'
                            : 'bg-white text-[#2d2d2d] hover:text-white hover:bg-black focus:text-white focus:bg-black'
                        }`}
                      >
                        {post.title}
                      </button>
                    </motion.div>
                  ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedPostId && <PostModal postId={selectedPostId} onClose={handleModalClose} />}
      </AnimatePresence>

      {/* Grid */}
      <div className='absolute w-screen overflow-hidden grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(100px,1fr))]'>
        {tiles.map((tile) => (
          <motion.div
            key={tile.id}
            className={`garden-tile aspect-square relative overflow-hidden ${
              tile.posts.length > 0 ? 'cursor-pointer' : ''
            }`}
            style={{ backgroundColor: tile.color }}
            onMouseEnter={() => tile.posts.length > 0 && setHoveredTile(tile.id)}
            onMouseLeave={() => setHoveredTile(null)}
            onClick={() => handleTileClick(tile)}
            transition={{ duration: 0.2 }}
          >
            {/* Dot Pattern */}
            <div
              className='absolute inset-0 pointer-events-none'
              style={{
                backgroundImage: `url("${getDotPattern(tile.type)}")`,
                backgroundSize: '32px 32px',
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Grass */}
            {tile.type.startsWith('grass') && (
              <div className='absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-[10%] pointer-events-none'></div>
            )}

            {/* Water Ripple */}
            {tile.type === 'water' && (
              <motion.div
                className='absolute inset-0 bg-blue-400 opacity-20'
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Info Overlay */}
            <AnimatePresence>
              {displayTile === tile.id && tile.posts.length > 0 && (
                <motion.div
                  className='absolute bottom-0 left-0 right-0 bg-white p-2 flex flex-col gap-1 z-0'
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='text-xs text-gray-600'>{formatDate(tile.date)}</div>
                  <div className='text-xs text-[#2d2d2d] font-medium'>
                    {tile.posts.map((post) => profiles[post.author_id]?.display_name || '익명').join(', ')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TypelabGarden
