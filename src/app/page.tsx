// app/page.tsx
import VeoTester from '@/components/VeoTester'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Video Generator</h1>
      <VeoTester />
    </main>
  )
}
