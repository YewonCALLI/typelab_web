'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlock from '@tiptap/extension-code-block'
import { Extension } from '@tiptap/core'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { ImageWithCaptionExtension } from './extension'

interface RichTextEditorProps {
  content: string
  onChange: (content: string, annotations: any[]) => void
  userId: string
}

function AlignLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <path
        d='M4 6h16M4 10h10M4 14h16M4 18h10'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

function AlignCenterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <path
        d='M6 6h12M4 10h16M6 14h12M4 18h16'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

function AlignRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <path
        d='M4 6h16M10 10h10M4 14h16M10 18h10'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

export const CodeBlockAutoIndent = Extension.create({
  name: 'codeBlockAutoIndent',

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!this.editor.isActive('codeBlock')) return false

        return this.editor.commands.command(({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          tr.insertText('  ', from, to)
          dispatch?.(tr)
          return true
        })
      },

      'Shift-Tab': () => {
        if (!this.editor.isActive('codeBlock')) return false

        return this.editor.commands.command(({ tr, state, dispatch }) => {
          const { $from } = state.selection
          if ($from.parent.type.name !== 'codeBlock') return false

          // 현재 줄 시작 위치 계산
          const blockStart = $from.start()
          const cursorPos = $from.pos
          const beforeCursor = state.doc.textBetween(blockStart, cursorPos, '\n', '\n')
          const lastLine = beforeCursor.split('\n').pop() ?? ''
          const lineStartPos = cursorPos - lastLine.length

          // 현재 줄 맨 앞의 공백/탭을 확인해서 최대 2칸 제거
          const linePrefix = state.doc.textBetween(lineStartPos, cursorPos, '\n', '\n')

          if (linePrefix.startsWith('  ')) {
            tr.delete(lineStartPos, lineStartPos + 2)
          } else if (linePrefix.startsWith('\t')) {
            tr.delete(lineStartPos, lineStartPos + 1)
          } else if (linePrefix.startsWith(' ')) {
            tr.delete(lineStartPos, lineStartPos + 1)
          } else {
            return true // 들여쓰기 없으면 아무것도 안 하고 handled 처리
          }

          dispatch?.(tr)
          return true
        })
      },

      Enter: () => {
        if (!this.editor.isActive('codeBlock')) return false

        return this.editor.commands.command(({ tr, state, dispatch }) => {
          const { $from } = state.selection
          if ($from.parent.type.name !== 'codeBlock') return false

          const blockStart = $from.start()
          const cursorPos = $from.pos

          const beforeCursor = state.doc.textBetween(blockStart, cursorPos, '\n', '\n')
          const lastLine = beforeCursor.split('\n').pop() ?? ''
          const indent = lastLine.match(/^\s+/)?.[0] ?? ''

          const { from, to } = state.selection
          tr.insertText('\n' + indent, from, to)
          dispatch?.(tr)
          return true
        })
      },
    }
  },
})

export default function RichTextEditor({ content, onChange, userId }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      CodeBlock,
      CodeBlockAutoIndent,
      ImageWithCaptionExtension,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), [])
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-2',
      },

      handleDOMEvents: {
        keydown: (view, event) => {
          const t = event.target as HTMLElement | null

          if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return true

          if (event.key !== 'Tab') return false

          const { state } = view
          const { selection } = state
          const { $from } = selection

          if ($from.parent.type.name !== 'codeBlock') return false

          event.preventDefault()

          const tr = state.tr
          const INDENT = '  '

          const blockStart = $from.start()

          const fromInBlock = Math.max(0, selection.from - blockStart)
          const toInBlock = Math.max(0, selection.to - blockStart)

          const blockText = state.doc.textBetween(blockStart, $from.end(), '\n', '\n')

          const lineStarts: number[] = [0]
          for (let i = 0; i < blockText.length; i++) {
            if (blockText[i] === '\n') lineStarts.push(i + 1)
          }

          const affectedLineStarts = lineStarts.filter((s) => {
            if (s > toInBlock) return false
            const lineEnd = blockText.indexOf('\n', s)
            const e = lineEnd === -1 ? blockText.length : lineEnd
            return e >= fromInBlock
          })
          const startsDesc = [...affectedLineStarts].sort((a, b) => b - a)

          if (!event.shiftKey) {
            for (const startOffset of startsDesc) {
              const pos = blockStart + startOffset
              tr.insertText(INDENT, pos, pos)
            }
            view.dispatch(tr)
            return true
          }

          for (const startOffset of startsDesc) {
            const pos = blockStart + startOffset

            const firstTwo = state.doc.textBetween(pos, Math.min(pos + 2, $from.end()), '\n', '\n')
            const firstOne = firstTwo.slice(0, 1)

            if (firstTwo === INDENT) {
              tr.delete(pos, pos + INDENT.length)
            } else if (firstOne === '\t') {
              tr.delete(pos, pos + 1)
            } else if (firstOne === ' ') {
              tr.delete(pos, pos + 1)
            }
          }

          view.dispatch(tr)
          return true
        },

        mousedown: (_view, event) => {
          const t = event.target as HTMLElement | null
          if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return true
          return false
        },

        click: (_view, event) => {
          const t = event.target as HTMLElement | null
          if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return true
          return false
        },
      },

      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file)
            return true
          }
        }
        return false
      },
    },
  })

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage.from('post-images').upload(fileName, file)
      if (error) throw error

      const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)
      const publicUrl = data.publicUrl

      if (editor) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'imageWithCaption',
            attrs: { src: publicUrl, alt: '', caption: '' },
          })
          .run()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('이미지 업로드 실패')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) await uploadImage(file)
    }
    input.click()
  }

  if (!editor) return null

  return (
    <div className='space-y-4'>
      <div className='border rounded-lg'>
        {/* Toolbar */}
        <div className='sticky top-0 z-10 bg-white border-b p-2 flex flex-wrap gap-1 items-center'>
          <button
            type='button'
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className='px-2 py-1.5 rounded hover:bg-gray-200 disabled:opacity-50 transition text-sm'
            title='실행 취소'
          >
            ↶
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className='px-2 py-1.5 rounded hover:bg-gray-200 disabled:opacity-50 transition text-sm'
            title='다시 실행'
          >
            ↷
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1.5 rounded text-sm font-semibold transition ${
              editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            대제목
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1.5 rounded text-sm font-normal transition ${
              editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            중제목
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1.5 rounded text-xs font-normal transition ${
              editor.isActive('heading', { level: 3 }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            소제목
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1.5 rounded font-bold text-sm transition ${
              editor.isActive('bold') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            B
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1.5 rounded italic text-sm transition ${
              editor.isActive('italic') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            I
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1.5 rounded underline text-sm transition ${
              editor.isActive('underline') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
          >
            U
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1.5 rounded text-sm transition ${
              editor.isActive('bulletList') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='글머리 기호 목록'
          >
            • List
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1.5 rounded text-sm transition ${
              editor.isActive('orderedList') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='번호 매기기 목록'
          >
            1. List
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1.5 rounded text-sm transition ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='왼쪽 정렬'
          >
            <AlignLeftIcon />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-2 py-1.5 rounded text-sm transition ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='가운데 정렬'
          >
            <AlignCenterIcon />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1.5 rounded text-sm transition ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='오른쪽 정렬'
          >
            <AlignRightIcon />
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1.5 rounded text-sm font-mono transition ${
              editor.isActive('codeBlock') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='코드 블록'
          >
            {'</>'}
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1.5 rounded text-sm font-mono transition ${
              editor.isActive('code') ? 'bg-black text-white' : 'hover:bg-gray-200'
            }`}
            title='인라인 코드'
          >
            {'>_'}
          </button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <button
            type='button'
            onClick={handleImageUpload}
            disabled={isUploading}
            className='px-2 py-1.5 rounded hover:bg-gray-200 transition text-sm disabled:opacity-50'
            title='이미지 업로드'
          >
            {isUploading ? '업로드 중...' : '이미지 추가'}
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
