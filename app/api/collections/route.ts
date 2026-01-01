import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get distinct collections from tracks table
    const { data: collections, error } = await supabase
      .from("tracks")
      .select("collection")
      .not("collection", "is", null)
      .order("collection", { ascending: true })

    if (error) {
      throw error
    }

    // Extract unique collection names
    const uniqueCollections = Array.from(new Set(collections?.map((c) => c.collection) || []))

    return NextResponse.json({
      collections: uniqueCollections,
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
