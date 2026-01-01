"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertCircle, CheckCircle, Database } from "lucide-react"

interface ScrapeResult {
  success: boolean
  totalTracks: number
  urlsScraped: number
  errors?: string[]
}

interface DatabaseStatus {
  totalTracks: number
  lastScraped: string | null
  needsScraping: boolean
}

export function ScraperControls() {
  const [isScraping, setIsScraping] = useState(false)
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/tracks/status")
        const data = await response.json()
        setDbStatus(data)
      } catch (err) {
        console.error("Error checking database status:", err)
      }
    }
    checkStatus()
  }, [result])

  const handleScrape = async (limit = 5) => {
    setIsScraping(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/scrape?limit=${limit}`)
      const data = await response.json()

      if (data.success) {
        setResult(data)
        window.dispatchEvent(new CustomEvent("tracksUpdated"))
      } else {
        setError(data.error || "Scraping failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scrape")
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900">Data Scraper</h2>
        {dbStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="h-4 w-4" />
            <span>{dbStatus.totalTracks.toLocaleString()} tracks in database</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {dbStatus?.needsScraping
          ? "Database is empty. Run the scraper to populate it with MP3 metadata from Internet Archive."
          : "Scrape additional URLs or refresh existing data."}
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button
          onClick={() => handleScrape(3)}
          disabled={isScraping}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isScraping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Test Scrape (3 URLs)
            </>
          )}
        </Button>

        <Button
          onClick={() => handleScrape(10)}
          disabled={isScraping}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          Scrape 10 URLs
        </Button>

        <Button
          onClick={() => handleScrape(41)}
          disabled={isScraping}
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          Scrape All (41 URLs)
        </Button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Scraping Complete!</h3>
              <p className="text-sm text-green-800">
                Found <strong>{result.totalTracks}</strong> tracks from <strong>{result.urlsScraped}</strong> URLs
              </p>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-green-700 cursor-pointer">
                    {result.errors.length} error(s) occurred
                  </summary>
                  <ul className="mt-2 text-xs text-green-700 list-disc list-inside">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isScraping && (
        <div className="text-sm text-gray-600">
          <p>Scraping in progress... This may take a few minutes.</p>
          <p className="text-xs mt-1">Check the browser console for detailed progress.</p>
        </div>
      )}
    </div>
  )
}
