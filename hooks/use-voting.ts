import { useState, useCallback } from "react"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  return res.json()
}

export function useVoting() {
  const { data, mutate, error } = useSWR<{ votes: Record<string, number> }>("/api/votes", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
    fallbackData: { votes: {} },
    onError: (err) => {
      console.error("[v0] Error fetching votes:", err)
    },
  })

  const votes = data?.votes || {}

  const [userVotes, setUserVotes] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fl-shortcuts-user-votes")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })

  const handleVote = useCallback(
    async (id: string) => {
      const hasVoted = userVotes.has(id)
      const action = hasVoted ? "downvote" : "upvote"

      // Optimistic update
      const newUserVotes = new Set(userVotes)
      if (hasVoted) {
        newUserVotes.delete(id)
      } else {
        newUserVotes.add(id)
      }
      setUserVotes(newUserVotes)
      localStorage.setItem("fl-shortcuts-user-votes", JSON.stringify([...newUserVotes]))

      const optimisticVotes = { ...votes }
      optimisticVotes[id] = (optimisticVotes[id] || 0) + (hasVoted ? -1 : 1)
      mutate({ votes: optimisticVotes }, false)

      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortcutId: id, action }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to vote")
        }

        mutate()
      } catch (error) {
        console.error("[v0] Error voting:", error)

        // Revert optimistic update
        const revertedUserVotes = new Set(userVotes)
        if (hasVoted) {
          revertedUserVotes.add(id)
        } else {
          revertedUserVotes.delete(id)
        }
        setUserVotes(revertedUserVotes)
        localStorage.setItem("fl-shortcuts-user-votes", JSON.stringify([...revertedUserVotes]))
        mutate()

        alert(error instanceof Error ? error.message : "Failed to vote. Please try again.")
      }
    },
    [userVotes, votes, mutate],
  )

  return {
    votes,
    userVotes,
    handleVote,
    error,
  }
}
