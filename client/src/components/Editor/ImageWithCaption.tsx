import { NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'

export default function ImageWithCaption({ node, updateAttributes }: any) {
  const [caption, setCaption] = useState(node.attrs.caption || '')

  return (
    <NodeViewWrapper className="image-with-caption my-4">
      <figure>
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          className="w-full rounded-lg"
        />
        <div className="mt-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value)
              updateAttributes({ caption: e.target.value })
            }}
            placeholder="이미지 캡션을 입력하세요..."
            className="w-full text-sm text-gray-600 text-center border-b border-gray-300 focus:border-gray-500 focus:outline-none py-1"
          />
        </div>
      </figure>
    </NodeViewWrapper>
  )
}