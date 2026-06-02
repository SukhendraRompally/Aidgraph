'use client'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from './ChatPage'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-primary text-xs font-bold">A</span>
        </div>
      )}
      <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start', 'max-w-[85%]')}>
        {/* Dataset note chip — shown when backend modified the query */}
        {!isUser && message.note && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/40 rounded-lg px-3 py-2 w-full">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent/70" />
            <span>{message.note}</span>
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed w-full',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border/40 text-foreground rounded-tl-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content || ' '}</p>
        </div>
      </div>
      {isUser && (
        <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-accent text-xs font-bold">Y</span>
        </div>
      )}
    </div>
  )
}
