'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatPage } from '@/components/ChatPage'

function HomeInner() {
  const params = useSearchParams()
  return <ChatPage key={params.get('t') ?? '0'} />
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  )
}
