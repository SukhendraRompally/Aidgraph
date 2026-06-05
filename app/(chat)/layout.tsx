import { ChatLayoutClient } from '@/components/ChatLayoutClient'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatLayoutClient>{children}</ChatLayoutClient>
}
