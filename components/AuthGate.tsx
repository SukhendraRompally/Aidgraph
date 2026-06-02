'use client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function AuthGate() {
  const router = useRouter()

  return (
    <Dialog open disablePointerDismissal>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-primary text-lg font-bold">A</span>
          </div>
          <DialogTitle className="text-center text-xl">Continue with AidGraph</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;ve used your 3 free queries. Sign in to unlock unlimited research threads,
            conversation history, and full access to 8M+ nonprofits.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Sign in / Create account
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Free to use. No credit card required.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
