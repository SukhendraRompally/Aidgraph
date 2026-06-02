import { NavBar } from '@/components/NavBar'
import { Sidebar } from '@/components/Sidebar'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <NavBar />
        {children}
      </div>
    </div>
  )
}
