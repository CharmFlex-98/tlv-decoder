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
      setOutput(pretty)
      setError(null)
    } catch (err) {
      setError("Invalid JSON")
      setOutput("")
    }
  }

  return (
    <div className="flex p-6 h-full w-full">
      {/* Left: Input */}
      <div className="flex flex-col m-6 flex-1">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste raw JSON here...'
          className="flex-1 break-all rounded-lg border border-zinc-200 bg-white text-sm"
        />
        <Button onClick={formatJson} className="mt-3">Format</Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>


      {/* Right: Output */}
      <ScrollArea className="flex-1 rounded-lg border border-zinc-200 bg-white p-4 m-6 shadow-inner">
        {error ? (
          <Card className="bg-red-50 border-red-300 p-6">
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </Card>) : (
          <pre className="whitespace-pre-wrap text-sm text-zinc-500 break-all">
            {output ? output : "Pretty output here"}
          </pre>
        )}
      </ScrollArea>
    </div>
  )
}
