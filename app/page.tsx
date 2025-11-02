"use client"

import { useState, memo } from "react"
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  Music,
  Grid3x3,
  Sliders,
  KeyboardIcon,
  Command,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { shortcuts, type Category, type Context } from "@/lib/shortcuts-data"
import { useVoting } from "@/hooks/use-voting"
import { useShortcutsFilter } from "@/hooks/use-shortcuts-filter"

// Extracted components for better organization
const Header = memo(function Header({ platform, setPlatform }: {
  platform: "windows" | "mac"
  setPlatform: (platform: "windows" | "mac") => void
}) {
  return (
    <header className="border-b border-white/5 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-3 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                FL Studio Shortcuts
              </h1>
              <a
                href="https://www.drumkits4.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 sm:gap-1.5 mt-1 mb-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-md hover:from-orange-500/20 hover:to-orange-600/20 hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/20 transition-all duration-500 ease-out group"
              >
                <span className="text-orange-400 font-medium text-[10px] sm:text-xs">DRUMKITS4.ME</span>
                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <p className="text-xs sm:text-sm text-zinc-400">FL Studio shortcut index by (K4L)</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10 w-full sm:w-auto">
            <Button
              variant={platform === "windows" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlatform("windows")}
              className={`flex-1 sm:flex-initial ${platform === "windows" ? "bg-white/10" : ""}`}
            >
              Windows
            </Button>
            <Button
              variant={platform === "mac" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlatform("mac")}
              className={`flex-1 sm:flex-initial ${platform === "mac" ? "bg-white/10" : ""}`}
            >
              Mac
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
})

const SearchAndFilters = memo(function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedContext,
  setSelectedContext,
  selectedModifier,
  setSelectedModifier,
  sortBy,
  setSortBy,
  categories,
  contexts,
  filteredCount
}: {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: Category | "all"
  setSelectedCategory: (category: Category | "all") => void
  selectedContext: Context | "all"
  setSelectedContext: (context: Context | "all") => void
  selectedModifier: string
  setSelectedModifier: (modifier: string) => void
  sortBy: "alphabetical" | "votes"
  setSortBy: (sort: "alphabetical" | "votes") => void
  categories: any[]
  contexts: any[]
  filteredCount: number
}) {
  return (
    <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 sm:pl-12 h-12 sm:h-14 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 backdrop-blur-xl text-base sm:text-lg"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? "default" : "outline"}
            className={`cursor-pointer px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${selectedCategory === cat.value ? cat.color : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg p-1 border border-white/10 overflow-x-auto">
          {contexts.map((ctx) => {
            const Icon = ctx.icon
            return (
              <Button
                key={ctx.value}
                variant={selectedContext === ctx.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedContext(ctx.value)}
                className={`gap-1 sm:gap-2 text-xs whitespace-nowrap flex-shrink-0 ${selectedContext === ctx.value ? "bg-white/10" : ""}`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{ctx.label}</span>
                <span className="sm:hidden">
                  {ctx.value === "all" ? "All" : ctx.value === "piano-roll" ? "Piano" : ctx.label}
                </span>
              </Button>
            )
          })}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
          <span className="text-[10px] sm:text-xs text-zinc-400 px-1 sm:px-2">Modifier:</span>
          {["all", "ctrl", "alt", "shift"].map((mod) => (
            <Button
              key={mod}
              variant={selectedModifier === mod ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedModifier(mod)}
              className={`text-xs ${selectedModifier === mod ? "bg-white/10" : ""}`}
            >
              {mod === "all" ? "All" : mod.charAt(0).toUpperCase() + mod.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
          <span className="text-[10px] sm:text-xs text-zinc-400 px-1 sm:px-2">Sort:</span>
          <Button
            variant={sortBy === "votes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("votes")}
            className={`gap-1 sm:gap-2 text-xs ${sortBy === "votes" ? "bg-white/10" : ""}`}
          >
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Most Useful</span>
            <span className="sm:hidden">Votes</span>
          </Button>
          <Button
            variant={sortBy === "alphabetical" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("alphabetical")}
            className={`gap-1 sm:gap-2 text-xs ${sortBy === "alphabetical" ? "bg-white/10" : ""}`}
          >
            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">A-Z</span>
            <span className="sm:hidden">A-Z</span>
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs sm:text-sm text-zinc-400 text-center">
        Showing {filteredCount} of {shortcuts.length} shortcuts
      </div>
    </div>
  )
})

const ShortcutCard = memo(function ShortcutCard({
  shortcut,
  platform,
  categoryData,
  contextIcon,
  voteCount,
  hasVoted,
  onVote,
}: {
  shortcut: any
  platform: "windows" | "mac"
  categoryData: any
  contextIcon: any
  voteCount: number
  hasVoted: boolean
  onVote: (id: string) => void
}) {
  const categoryColor = categoryData?.color || "bg-zinc-700"
  const glowColor = categoryData?.glowColor || "shadow-zinc-500/50"
  const hoverBgColor = categoryData?.hoverBgColor || "hover:bg-zinc-500/20"
  const ContextIcon = contextIcon
  const keyString = platform === "windows" ? shortcut.keys.windows : shortcut.keys.mac

  const keys = keyString === "+" || keyString === "-" ? [keyString] : keyString.split("+").map((k: string) => k.trim())

  return (
    <Card
      className={`p-2 sm:p-3 bg-white/5 border-white/10 backdrop-blur-xl ${hoverBgColor} transition-all duration-5500 ease-out hover:shadow-lg hover:${glowColor} hover:border-white/20`}
    >
      <div className="flex flex-col items-center justify-center gap-0">
        <button
          onClick={() => onVote(shortcut.id)}
          className={`flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg border transition-all flex-shrink-0 mx-auto ${
            hasVoted
              ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
              : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
          }`}
          aria-label={hasVoted ? "Remove vote" : "Vote for this shortcut"}
        >
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[10px] sm:text-xs font-bold mt-0.5">{voteCount}</span>
        </button>

        <div className="flex-1 min-w-0 w-full text-center mt-3">
          {/* Icon and Title - centered with consistent spacing */}
          <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
              <ContextIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            </div>
            <p className="text-white font-medium text-xs sm:text-sm leading-tight">{shortcut.title}</p>
          </div>

          {/* Description - centered with fixed min-height for uniformity */}
          <div className="flex items-center justify-center min-h-[2.5rem] sm:min-h-[3rem] mb-2">
            <p className="text-zinc-400 text-[10px] sm:text-xs leading-tight px-1">{shortcut.shortcutDescription}</p>
          </div>

          {/* Keys - centered with consistent spacing */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap mb-2 min-h-[1.75rem] sm:min-h-[2rem]">
            {keys.map((key: string, idx: number) => (
              <div key={idx} className="flex items-center gap-1">
                <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-mono font-semibold text-white bg-gradient-to-b from-zinc-700 to-zinc-800 border border-zinc-600 rounded shadow-md min-w-[1.5rem] sm:min-w-[1.75rem] text-center">
                  {key}
                </kbd>
                {idx < keys.length - 1 && <span className="text-zinc-500 text-[10px] sm:text-xs">+</span>}
              </div>
            ))}
          </div>

          {/* Badge - centered with consistent spacing */}
          <div className="flex items-center justify-center pt-1">
            <Badge variant="outline" className={`text-[10px] sm:text-xs ${categoryColor} border`}>
              {shortcut.category}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
})

const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12 sm:mt-16 py-6 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4 text-center text-zinc-500 text-xs sm:text-sm">
        <p>© kits4leaks</p>
        <p className="mt-2">
          Data sourced from{" "}
          <a
            href="https://www.image-line.com/fl-studio-learning/fl-studio-online-manual"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 hover:font-bold transition-all duration-500 ease-out inline-flex items-baseline"
          >
            FL Studio Online Manual
          </a>{" "}
        </p>
      </div>
    </footer>
  )
})

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [selectedContext, setSelectedContext] = useState<Context | "all">("all")
  const [selectedModifier, setSelectedModifier] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"alphabetical" | "votes">("votes")
  const [platform, setPlatform] = useState<"windows" | "mac">("windows")

  const { votes, userVotes, handleVote, error } = useVoting()

  const filteredAndSortedShortcuts = useShortcutsFilter(
    searchQuery,
    selectedCategory,
    selectedContext,
    selectedModifier,
    sortBy,
    platform,
    votes
  )

  const categories = [
    { value: "all", label: "All", color: "bg-zinc-700", glowColor: "shadow-zinc-500/50", hoverBgColor: "hover:bg-slate-700 hover:bg-zinc-500/10" },
    {
      value: "navigation",
      label: "Navigation",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      glowColor: "shadow-blue-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-blue-500/10",
    },
    {
      value: "editing",
      label: "Editing",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      glowColor: "shadow-green-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-green-500/10",
    },
    {
      value: "tools",
      label: "Tools",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      glowColor: "shadow-orange-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-orange-500/10",
    },
    {
      value: "playback",
      label: "Playback",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      glowColor: "shadow-purple-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-purple-500/10",
    },
    {
      value: "selection",
      label: "Selection",
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      glowColor: "shadow-cyan-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-cyan-500/10",
    },
    {
      value: "view",
      label: "View",
      color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      glowColor: "shadow-pink-500/50",
      hoverBgColor: "hover:bg-slate-700 hover:bg-pink-500/10",
    },
  ]

  const contexts = [
    { value: "all", label: "All Contexts", icon: KeyboardIcon },
    { value: "global", label: "Global", icon: Command },
    { value: "playlist", label: "Playlist", icon: Grid3x3 },
    { value: "piano-roll", label: "Piano Roll", icon: Music },
    { value: "mixer", label: "Mixer", icon: Sliders },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-950">
      <Header platform={platform} setPlatform={setPlatform} />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedContext={selectedContext}
          setSelectedContext={setSelectedContext}
          selectedModifier={selectedModifier}
          setSelectedModifier={setSelectedModifier}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          contexts={contexts}
          filteredCount={filteredAndSortedShortcuts.length}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            Failed to load votes. Please refresh the page.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredAndSortedShortcuts.map((shortcut) => {
            const categoryData = categories.find((c) => c.value === shortcut.category)
            const contextIcon = contexts.find((c) => c.value === shortcut.context)?.icon || KeyboardIcon
            const voteCount = votes[shortcut.id] || 0
            const hasVoted = userVotes.has(shortcut.id)

            return (
              <ShortcutCard
                key={shortcut.id}
                shortcut={shortcut}
                platform={platform}
                categoryData={categoryData}
                contextIcon={contextIcon}
                voteCount={voteCount}
                hasVoted={hasVoted}
                onVote={handleVote}
              />
            )
          })}
        </div>

        {filteredAndSortedShortcuts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-zinc-400 text-base sm:text-lg">No shortcuts found matching your filters.</p>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
