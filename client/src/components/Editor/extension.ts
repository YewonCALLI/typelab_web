import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageWithCaption from './ImageWithCaption'

// 이미지 + 캡션 Extension
export const ImageWithCaptionExtension = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      caption: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image-with-caption"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { 'data-type': 'image-with-caption' },
      ['img', mergeAttributes(HTMLAttributes, { draggable: false })],
      ['figcaption', {}, HTMLAttributes.caption || ''],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageWithCaption)
  },
})

// 주석 Mark Extension
import { Mark } from '@tiptap/core'

export const Annotation = Mark.create({
  name: 'annotation',

  addAttributes() {
    return {
      id: {
        default: null,
      },
      text: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-annotation]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(HTMLAttributes, {
        'data-annotation': HTMLAttributes.id,
        class: 'annotation-mark bg-yellow-200 cursor-pointer',
      }),
      0,
    ]
  },
})