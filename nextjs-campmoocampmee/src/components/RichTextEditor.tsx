'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

interface PortableTextBlock {
  _type: string
  _key?: string
  style?: string
  children?: Array<{
    _type: string
    _key?: string
    text: string
    marks?: string[]
  }>
  markDefs?: unknown[]
  listItem?: string
  level?: number
}

interface RichTextEditorProps {
  value: PortableTextBlock[]
  onChange: (value: PortableTextBlock[]) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [plainText, setPlainText] = useState('')

  // Convert Portable Text to plain text on mount
  useEffect(() => {
    const text = value
      .map((block) => {
        if (block._type === 'block' && block.children) {
          return block.children.map((child) => child.text).join('')
        }
        return ''
      })
      .join('\n\n')
    setPlainText(text)
  }, [])

  const handleTextChange = (newText: string) => {
    setPlainText(newText)

    // Convert plain text back to Portable Text format
    const paragraphs = newText.split('\n\n').filter((p) => p.trim())

    const blocks: PortableTextBlock[] = paragraphs.map((paragraph, index) => ({
      _type: 'block',
      _key: `block-${Date.now()}-${index}`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span-${Date.now()}-${index}`,
          text: paragraph,
          marks: [],
        },
      ],
      markDefs: [],
    }))

    onChange(blocks)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="body">เนื้อหา (Body)</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="ตัวหนา (Coming soon)"
            disabled
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="ตัวเอียง (Coming soon)"
            disabled
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="รายการ (Coming soon)"
            disabled
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="รายการลำดับ (Coming soon)"
            disabled
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        id="body"
        value={plainText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="เขียนรายละเอียดเกี่ยวกับลานกางเต็นท์ของคุณ...

สามารถแบ่งเป็นหลายย่อหน้าได้โดยกด Enter 2 ครั้ง"
        rows={12}
        className="font-sans"
      />
      <p className="text-xs text-muted-foreground">
        กด Enter 2 ครั้งเพื่อแบ่งย่อหน้า • รองรับข้อความธรรมดา
      </p>
    </div>
  )
}
