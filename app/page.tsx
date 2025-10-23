import SearchInterface from "@/components/search-interface"
import NoticeBanner from "@/components/notice-banner"

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-red-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">MP3.com Archive Search</h1>
          <p className="text-center text-white/90 text-sm md:text-base">
            Search the MP3.com archive by track title or artist!
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <NoticeBanner />
        <SearchInterface />
      </div>
    </main>
  )
}
