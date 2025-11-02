import { useMemo } from "react"
import { shortcuts, type Category, type Context } from "@/lib/shortcuts-data"

export function useShortcutsFilter(
  searchQuery: string,
  selectedCategory: Category | "all",
  selectedContext: Context | "all",
  selectedModifier: string,
  sortBy: "alphabetical" | "votes",
  platform: "windows" | "mac",
  votes: Record<string, number>
) {
  const filteredAndSortedShortcuts = useMemo(() => {
    const filtered = shortcuts.filter((shortcut) => {
      const matchesSearch =
        searchQuery === "" ||
        shortcut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.keys.windows.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.keys.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || shortcut.category === selectedCategory
      const matchesContext = selectedContext === "all" || shortcut.context === selectedContext

      const keyString = platform === "windows" ? shortcut.keys.windows : shortcut.keys.mac
      const matchesModifier =
        selectedModifier === "all" ||
        (selectedModifier === "ctrl" && (keyString.includes("Ctrl") || keyString.includes("Cmd"))) ||
        (selectedModifier === "alt" && (keyString.includes("Alt") || keyString.includes("Opt"))) ||
        (selectedModifier === "shift" && keyString.includes("Shift"))

      return matchesSearch && matchesCategory && matchesContext && matchesModifier
    })

    filtered.sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title)
      } else {
        return (votes[b.id] || 0) - (votes[a.id] || 0)
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, selectedContext, selectedModifier, sortBy, platform, votes])

  return filteredAndSortedShortcuts
}
