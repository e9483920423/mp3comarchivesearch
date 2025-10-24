import SearchInterface from "@/components/search-interface"
import NoticeBanner from "@/components/notice-banner"

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black relative">
      {/* 2000s-style ambient background glow */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-900 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-950 rounded-full blur-3xl"></div>
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
      
      <div className="relative z-10">
        <header className="text-white py-4 md:py-6 shadow-lg bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-rose-900/20 backdrop-blur-sm">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-1 md:mb-2 bg-gradient-to-r from-rose-800 to-rose-600 bg-clip-text text-transparent">
              MP3.com Archive Search
            </h1>
            <p className="text-center text-xs sm:text-sm md:text-base text-rose-700/90">
              Search the MP3.com Internet Archive! 
            </p>
          </div>
        </header>

        <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-6xl">
          <NoticeBanner />
          <SearchInterface />
        </div>
      </div>
    </main>
  )
}
