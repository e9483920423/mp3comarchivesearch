"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-red-500/60 p-4 sm:p-5 mb-5 sm:mb-7 relative rounded-2xl shadow-sm">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-all duration-200 touch-manipulation p-1.5"
        aria-label="Close notice"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-800" />
      </button>
      <p className="text-gray-700 text-xs sm:text-sm md:text-base pr-10 sm:pr-12 leading-relaxed font-extrabold">
        <strong className="font-semibold text-gray-900">Notice:</strong> This site indexes the Internet Archive's MP3.com Rescue Barge collection. All files are hosted externally by the Internet Archive, with songs belonging to their respective owners. Inspired by{" "}
        <a
          href="https://mp3.xo.tel/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 underline decoration-blue-400/50 hover:decoration-blue-600 underline-offset-2 transition-colors duration-200 break-words font-medium text-rose-800"
        >
          mp3.xo.tel
        </a>
        , built with JavaScript, Next.js, and Tailwind CSS, with{" "}
        <a
          href="https://github.com/e9483920423/mp3comarchivesearch"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 underline decoration-blue-400/50 hover:decoration-blue-600 underline-offset-2 transition-colors duration-200 break-words font-medium text-rose-800"
        >
          open source
        </a>{" "}
        in mind.
      </p>
    </div>
  )
}
