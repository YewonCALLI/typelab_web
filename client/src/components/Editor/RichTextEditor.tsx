'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImageWithCaptionExtension, Annotation } from './extension'

interface RichTextEditorProps {
  content: string
  onChange: (content: string, annotations: any[]) => void
  userId: string
}

export default function RichTextEditor({ content, onChange, userId }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [annotations, setAnnotations] = useState<any[]>([])
  const [showAnnotationInput, setShowAnnotationInput] = useState(false)
  const [annotationText, setAnnotationText] = useState('')
  const supabase = createClient()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ImageWithCaptionExtension,
      Underline,
      Annotation,
      Placeholder.configure({
        placeholder: '글을 작성해보세요...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), annotations)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-2',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
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
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from('post-images').upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('post-images').getPublicUrl(fileName)

      if (editor) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'imageWithCaption',
            attrs: { src: publicUrl },
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
      if (file) {
        await uploadImage(file)
      }
    }
    input.click()
  }

  const addAnnotation = () => {
    if (!editor || !annotationText.trim()) return

    const { from, to } = editor.state.selection
    if (from === to) {
      alert('주석을 달 텍스트를 먼저 드래그하세요')
      return
    }

    const selectedText = editor.state.doc.textBetween(from, to)
    const annotationId = `annotation-${Date.now()}`

    editor
      .chain()
      .focus()
      .setMark('annotation', {
        id: annotationId,
        text: annotationText,
      })
      .run()

    const newAnnotation = {
      id: annotationId,
      selectedText,
      annotationText,
    }

    setAnnotations([...annotations, newAnnotation])
    setAnnotationText('')
    setShowAnnotationInput(false)
  }

  const checkSelection = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      setShowAnnotationInput(true)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className='space-y-4'>
      <div className='border rounded-lg overflow-hidden'>
        {/* 툴바 */}
        <div className='bg-gray-50 border-b p-2 flex gap-2 flex-wrap'>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            대제목
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            중제목
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 rounded text-sm ${
              editor.isActive('heading', { level: 3 }) ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            소제목
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded font-bold text-sm ${
              editor.isActive('bold') ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            B
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded italic text-sm ${
              editor.isActive('italic') ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            I
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 rounded underline text-sm ${
              editor.isActive('underline') ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            U
          </button>
          <button
            type='button'
            onClick={handleImageUpload}
            disabled={isUploading}
            className='px-3 py-1 rounded bg-white hover:bg-gray-100 text-sm'
          >
            {isUploading ? '업로드 중...' : '이미지 추가'}
          </button>
          <button
            type='button'
            onClick={checkSelection}
            className='px-3 py-1 rounded bg-white hover:bg-gray-100 text-sm'
          >
            주석 추가
          </button>
        </div>

        {/* 주석 입력 */}
        {showAnnotationInput && (
          <div className='bg-yellow-50 border-b p-3 space-y-2'>
            <p className='text-sm text-gray-700'>텍스트를 드래그한 상태에서 주석을 입력하세요</p>
            <div className='flex gap-2'>
              <input
                type='text'
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder='주석 내용...'
                className='flex-1 px-3 py-2 border rounded'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addAnnotation()
                  }
                }}
              />
              <button
                type='button'
                onClick={addAnnotation}
                className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
              >
                추가
              </button>
              <button
                type='button'
                onClick={() => setShowAnnotationInput(false)}
                className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 에디터 */}
        <EditorContent editor={editor} />
      </div>

      {/* 주석 목록 */}
      {annotations.length > 0 && (
        <div className='border-t-2 border-gray-300 pt-2'>
          {annotations.map((ann) => (
            <div key={ann.id} className='p-3'>
              <p className='text-sm text-gray-600 mb-1'>"{ann.selectedText}"</p>
              <p className='text-sm font-medium'>{ann.annotationText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
