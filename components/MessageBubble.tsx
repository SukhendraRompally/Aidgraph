'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from './ChatPage'

const mdComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:opacity-80">
      {children}
    </a>
  ),
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start', 'max-w-[80%]')}>
        {!isUser && message.note && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted border border-border/60 rounded-lg px-3 py-2 w-full">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
            <span>{message.note}</span>
          </div>
        )}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card border border-border text-foreground rounded-bl-sm'
        )}>
          <div className="prose prose-sm max-w-none break-words prose-p:my-1 prose-p:leading-relaxed prose-headings:font-semibold prose-headings:my-2 prose-ul:my-1 prose-ul:pl-4 prose-ol:my-1 prose-ol:pl-4 prose-li:my-0.5 prose-strong:font-semibold prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted prose-pre:rounded-lg prose-pre:p-3 prose-table:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.content || ' '}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
