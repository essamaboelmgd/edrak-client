import { Button } from "@/components/ui/button"

export default function PlatformHome() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Edrak
        </div>
        <div className="flex gap-4">
          <Button variant="ghost">Login</Button>
          <Button>Get Started</Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6">
          The Future of <span className="text-blue-600">Learning</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Create your own academy in minutes. The all-in-one platform for teachers, students, and administrators.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="rounded-full px-8">Create Academy</Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">Learn More</Button>
        </div>
      </main>
    </div>
  )
}
