'use client'
import { useRouter } from 'next/navigation'
import { LogOut, FileText, Zap, Shield } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase'

export function NavBar() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-border/40 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground tracking-tight">AidGraph</span>
        <span className="hidden sm:block text-xs text-muted-foreground/70 border border-border/40 rounded px-1.5 py-0.5">
          AI for Good
        </span>
      </div>
      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-1.5 py-1 text-xs text-muted-foreground truncate">{user.email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/api-access')} className="flex items-center gap-2 cursor-pointer">
                <Zap className="h-4 w-4" /> API Access
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/terms')} className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" /> Terms of Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/privacy')} className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4" /> Privacy Policy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
