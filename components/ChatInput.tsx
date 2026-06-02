'use client'
import { useRef, useEffect } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  disabled?: boolean
  streaming?: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  streaming,
  placeholder = 'Ask about any nonprofit...',
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && ref.current) ref.current.focus()
  }, [disabled])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (streaming) { onStop?.(); return }
      if (!disabled) onSubmit()
    }
  }

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 focus-within:border-primary/50 transition-colors shadow-sm">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled && !streaming}
        rows={1}
        className={cn(
          'flex-1 resize-none border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground/60',
          'focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-[200px]',
          'field-sizing-content'
        )}
      />
      <button
        onClick={streaming ? onStop : onSubmit}
        disabled={!streaming && (disabled || !value.trim())}
        className={cn(
          'shrink-0 flex items-center justify-center h-8 w-8 rounded-full transition-colors',
          streaming
            ? 'bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label={streaming ? 'Stop' : 'Send'}
      >
        {streaming ? <Square className="h-3.5 w-3.5 fill-current" /> : <ArrowUp className="h-4 w-4" />}
      </button>
    </div>
  )
}
