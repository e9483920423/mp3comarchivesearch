import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PREDEFINED_COLLECTIONS = [
  "O",
  "A",
  "L-2",
  "F",
  "0",
  "H",
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
  "B-2",
  "D-2",
  "P-2",
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
  "J",
  "U",
  "V",
  "P",
  "Unknown",
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: dbCollections, error } = await supabase
      .from("tracks")
      .select("collection")
      .not("collection", "is", null)
      .order("collection", { ascending: true })

    if (error) {
      console.error("Error fetching collections from database:", error)
    }
    const dbUniqueCollections = Array.from(new Set(dbCollections?.map((c) => c.collection) || []))
    const allCollections = Array.from(new Set([...PREDEFINED_COLLECTIONS, ...dbUniqueCollections]))
    const sortedCollections = allCollections.sort((a, b) => {
      const getCollectionParts = (col: string) => {
        const match = col.match(/^(.+?)(-2)?$/)
        return match ? { base: match[1], suffix: match[2] || "" } : { base: col, suffix: "" }
      }

      const aParts = getCollectionParts(a)
      const bParts = getCollectionParts(b)
      if (aParts.base === bParts.base) {
        return aParts.suffix.localeCompare(bParts.suffix)
      }

      const aIsNum = /^\d+$/.test(aParts.base)
      const bIsNum = /^\d+$/.test(bParts.base)
      if (aIsNum && !bIsNum) return -1
      if (!aIsNum && bIsNum) return 1
      if (aIsNum && bIsNum) {
        return Number.parseInt(aParts.base) - Number.parseInt(bParts.base)
      }

      return aParts.base.localeCompare(bParts.base)
    })

    console.log(`[Collections API] Returning ${sortedCollections.length} collections`)

    return NextResponse.json({
      collections: sortedCollections,
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
