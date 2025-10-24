"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gray-300 border-2 border-red-600 p-3 sm:p-4 mb-4 sm:mb-6 relative rounded-2xl">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-700 hover:opacity-70 transition-opacity touch-manipulation p-1"
        aria-label="Close notice"
      >
        <X className="w-5 h-5" />
      </button>
      <p className="text-gray-800 text-xs sm:text-sm md:text-base pr-8 leading-relaxed">
        <strong>Notice:</strong> This site indexes the Internet Archive's MP3.com Rescue Barge collection. All files are
        hosted externally by the Internet Archive, with songs belonging to their respective owners. Inspired by
        mp3.xo.tel, built with JavaScript, Next.js, and Tailwind CSS, with{" "}
        <a
          href="https://github.com/e9483920423/mp3comarchivesearch"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-words"
        >
          open source
        </a>{" "}
        in mind.
      </p>
    </div>
  )
}
