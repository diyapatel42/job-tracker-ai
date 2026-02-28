import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
      <div className="space-y-3">
        <h1 className="text-5xl font-semibold tracking-tight">JobTracker AI</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">Track applications, analyze resumes, and land your next role — powered by AI.</p>
      </div>
      <div className="flex gap-3">
        <Link href="/auth/register">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline" size="lg">Sign In</Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl">
        <div className="space-y-2">
          <p className="text-sm font-medium">AI Parsing</p>
          <p className="text-xs text-muted-foreground">Paste a job posting. AI extracts every detail instantly.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Resume Match</p>
          <p className="text-xs text-muted-foreground">See how your resume scores against any job description.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Stay Organized</p>
          <p className="text-xs text-muted-foreground">Track every application from saved to offered in one place.</p>
        </div>
      </div>
    </div>
  )
}
