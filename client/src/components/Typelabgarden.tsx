'use client'

import React, { useState, useEffect } from 'react'
import './TypelabGarden.css'

interface Post {
  id: string
  authorId: string
  publishedAt: Date
}

interface Tile {
  id: number
  type: 'soil' | 'grass-short' | 'grass-medium' | 'grass-tall' | 'water'
  color: string
  postCount: number
  title: string
  author: string
  date: string
}

interface TypelabGardenProps {
  posts?: Post[]
  gridSize?: number
}

const TypelabGarden: React.FC<TypelabGardenProps> = ({ posts = [], gridSize = 120 }) => {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [hoveredTile, setHoveredTile] = useState<number | null>(null)

  // 색상 팔레트
  const colors = {
    soil: ['#7A5448'],
    lime: ['#D3EB6C'],
    blue: ['#3AA8FF'],
    yellow: ['#CDDC39'],
    grass: {
      short: '#CDDC39',
      medium: '#D3EB6C',
      tall: '#C8E97D',
    },
  }

  // 랜덤 타이틀 생성 함수
  const generateRandomTitle = () => {
    const titles = [
      '프로젝트 제목인가요?',
      '오늘의 개발 일지',
      '타입랩의 미래는 어떻게 될까요?',
      '점심 메뉴는 무엇으로 할까요?',
      '어떻게 하면 더 나은 코드를 작성할 수 있을까요?',
      'GLSL 쉐이더로 불꽃 효과 만들기',
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  const generateRandomAuthor = () => {
    const authors = ['장예원', '박성훈', '김지혜', '한용파', '한예슬']
    return authors[Math.floor(Math.random() * authors.length)]
  }

  const generateRandomDate = () => {
    const year = 2025
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`
  }

  // 타일 초기화
  useEffect(() => {
    const initialTiles: Tile[] = []

    for (let i = 0; i < gridSize; i++) {
      const rand = Math.random()
      let type: Tile['type'] = 'soil'
      let color = colors.soil[0]

      if (rand < 0.15) {
        type = 'water'
        color = colors.blue[0]
      } else if (rand < 0.3) {
        type = 'grass-short'
        color = colors.grass.short
      } else if (rand < 0.4) {
        type = 'grass-medium'
        color = colors.grass.medium
      } else if (rand < 0.5) {
        type = 'grass-tall'
        color = colors.grass.tall
      }

      initialTiles.push({
        id: i,
        type,
        color,
        postCount: 0,
        title: generateRandomTitle(),
        author: generateRandomAuthor(),
        date: generateRandomDate(),
      })
    }

    setTiles(initialTiles)
  }, [gridSize])

  // 글 발행에 따라 잔디 성장
  useEffect(() => {
    if (posts.length === 0) return

    setTiles((prevTiles) => {
      if (prevTiles.length === 0) return prevTiles

      const newTiles = [...prevTiles]

      // 토양 + 잔디 타일만 필터링
      const soilTiles = newTiles.filter((tile) => tile.type === 'soil' || tile.type.startsWith('grass'))

      // 글 개수에 따라 잔디 성장
      posts.forEach((post, index) => {
        if (index < soilTiles.length) {
          const tile = soilTiles[index]
          const tileIndex = newTiles.findIndex((t) => t.id === tile.id)

          if (tileIndex !== -1) {
            const updatedCount = newTiles[tileIndex].postCount + 1

            newTiles[tileIndex] = {
              ...newTiles[tileIndex],
              postCount: updatedCount,
              type: updatedCount >= 5 ? 'grass-tall' : updatedCount >= 3 ? 'grass-medium' : 'grass-short',
            }
          }
        }
      })

      return newTiles
    })
  }, [posts])

  const getGrassColor = (type: Tile['type']): string => {
    switch (type) {
      case 'grass-short':
        return colors.grass.short
      case 'grass-medium':
        return colors.grass.medium
      case 'grass-tall':
        return colors.grass.tall
      default:
        return ''
    }
  }

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

  return (
    <div className='typelab-garden'>
      <div className='garden-header'>
        <div
          className={`relative text-white text-[clamp(3rem,14vw,9rem)] z-10 left-[50vw] lg:left-4 transform -translate-x-1/2 lg:translate-x-0 transition-all duration-300 ${
            hoveredTile !== null ? 'hovered-title' : ''
          }`}
        >
          Typelab
        </div>
        {hoveredTile !== null && (
          <div className='tile-title-display'>{tiles.find((t) => t.id === hoveredTile)?.title}</div>
        )}
      </div>

      <div className='garden-grid'>
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`garden-tile ${tile.type} ${hoveredTile === tile.id ? 'hovered' : ''}`}
            style={{
              backgroundColor: tile.type.startsWith('grass') ? getGrassColor(tile.type) : tile.color,
            }}
            onMouseEnter={() => tile.type.startsWith('grass') && setHoveredTile(tile.id)}
            onMouseLeave={() => tile.type.startsWith('grass') && setHoveredTile(null)}
          >
            {/* 벽돌 패턴 - CSS로 구현 */}
            <div className='tile-dots' />

            {/* 잔디 */}
            {tile.type.startsWith('grass') && (
              <div className='grass-container'>
                {Array.from({ length: getGrassHeight(tile.type) }).map((_, i) => (
                  <div
                    key={i}
                    className='grass-blade'
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      left: `${(i / getGrassHeight(tile.type)) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
            {tile.type === 'water' && <div className='water-ripple' />}
            {hoveredTile === tile.id && tile.type.startsWith('grass') && (
              <div className='tile-info-overlay'>
                <div className='tile-info-date'>{tile.date}</div>
                <div className='tile-info-author'>{tile.author}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TypelabGarden
