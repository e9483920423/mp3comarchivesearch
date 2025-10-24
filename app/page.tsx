import SearchInterface from "@/components/search-interface"
import NoticeBanner from "@/components/notice-banner"

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <header className="bg-red-600 text-white py-4 md:py-6 shadow-md">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-1 md:mb-2">
            MP3.com Archive Search
          </h1>
          <p className="text-center text-white/90 text-xs sm:text-sm md:text-base">
            Search the MP3.com Internet Archive! ~( °٢° )~
          </p>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-6xl">
        <NoticeBanner />
        <SearchInterface />
      </div>
    </main>
  )
}
