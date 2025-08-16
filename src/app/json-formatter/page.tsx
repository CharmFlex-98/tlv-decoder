"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { detectDuplicates } from "./utils"

export default function JsonFormatter() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const formatJson = () => {
    try {
      const duplicatedKeys = detectDuplicates(input);
      if (duplicatedKeys.length > 0) {
        setError("Contains duplicate keys: " + duplicatedKeys)
        return
      }


      const parsed = JSON.parse(input)
      const pretty = JSON.stringify(parsed, null, 2)
      setInput(pretty)
      setError(null)
    } catch (err) {
      setError("Invalid JSON")
      setOutput("")
    }
  }

  return (
    <div className="flex flex-col p-6 h-full w-full items-center">
      <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste raw JSON here...'
          className="rounded-lg border break-all border-zinc-200 bg-white text-sm h-[60vh]"
        />
        <Button onClick={formatJson} className="mt-3 w-full items-center button">Format</Button>
        <div className="pt-2 pb-2 w-full">
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    </div>
  )
}
