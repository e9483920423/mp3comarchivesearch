import SearchInterface from "@/components/search-interface"
import NoticeBanner from "@/components/notice-banner"

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-neutral-950">
      <header className="text-white py-4 md:py-6 shadow-md bg-neutral-900">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-1 md:mb-2 text-rose-900">
            MP3.com Archive Search
          </h1>
          <p className="text-center text-xs sm:text-sm md:text-base text-rose-800">
            Search the MP3.com Internet Archive! 
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
