import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PREDEFINED_COLLECTIONS = [
  "O",
  "A",
  "L-2",
  "F",
  "0",
  "H",
  "Y",
  "S",
  "G",
  "K",
  "L",
  "D",
  "N",
  "C",
  "E",
  "M-2",
  "S-2",
  "T",
  "X",
  "B-2",
  "D-2",
  "P-2",
  "W",
  "Z",
  "F-2",
  "M",
  "Q",
  "A-2",
  "I",
  "I-2",
  "B",
  "C-2",
  "R",
  "T-2",
  "W-2",
  "J",
  "U",
  "V",
  "P",
  "Unknown",
]

export function formatCollectionForDisplay(collection: string): string {
  return collection === "Unknown" ? "Extra" : collection
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get distinct collections from tracks table to see which have data
    const { data: dbCollections, error } = await supabase
      .from("tracks")
      .select("collection")
      .not("collection", "is", null)
      .order("collection", { ascending: true })

    if (error) {
      console.error("Error fetching collections from database:", error)
    }

    // Extract unique collection names from database
    const dbUniqueCollections = Array.from(new Set(dbCollections?.map((c) => c.collection) || []))

    const allCollections = Array.from(new Set([...PREDEFINED_COLLECTIONS, ...dbUniqueCollections]))

    // Sort collections: numbers first, then letters, handling -2 suffixes
    const sortedCollections = allCollections.sort((a, b) => {
      // Extract base and suffix
      const getCollectionParts = (col: string) => {
        const match = col.match(/^(.+?)(-2)?$/)
        return match ? { base: match[1], suffix: match[2] || "" } : { base: col, suffix: "" }
      }

      const aParts = getCollectionParts(a)
      const bParts = getCollectionParts(b)

      // If bases are the same, sort by suffix (no suffix before -2)
      if (aParts.base === bParts.base) {
        return aParts.suffix.localeCompare(bParts.suffix)
      }

      // Numbers before letters
      const aIsNum = /^\d+$/.test(aParts.base)
      const bIsNum = /^\d+$/.test(bParts.base)

      if (aIsNum && !bIsNum) return -1
      if (!aIsNum && bIsNum) return 1

      // Both numbers or both letters - sort naturally
      if (aIsNum && bIsNum) {
        return Number.parseInt(aParts.base) - Number.parseInt(bParts.base)
      }

      return aParts.base.localeCompare(bParts.base)
    })

    console.log(`[Collections API] Returning ${sortedCollections.length} collections`)

    // Format collection names for display
    const formattedCollections = sortedCollections.map(formatCollectionForDisplay)

    return NextResponse.json({
      collections: formattedCollections,
    })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch collections",
      },
      { status: 500 },
    )
  }
}
