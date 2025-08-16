"use client"
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { convertToBytes } from './utils'



export default function StringConverter() {
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [input, setInput] = useState("")

  const handleTextChanged = (value: string) => {
    setInput(value)
    try {
      const bytesArrray = convertToBytes(value)?.toString()
      setOutput(bytesArrray ?? "")
    } catch {
      setError("Parsing failure")
      setOutput("")
    }
  }

  return (
    <div className="p-6 h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">String encoder</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Paste your string below to convert to byte arrays. Support UTF-8 encoding.
        </p>
      </header>
      <Separator className="mb-6" />

      <div className="flex flex-col gap-4 h-[calc(100%-100px)] md:flex-row">
        {/* Input Area */}
        <div className="flex flex-col md:flex-1">
          <Textarea
            placeholder="Enter text (UTF-8) that needs to be converted."
            value={input}
            onChange={(e) => handleTextChanged(e.target.value)}
            className={cn(
              error ? "border-red-500" : "border-zinc-300",
              "h-[30vh] break-all rounded-lg shadow-sm"
            )}
          />
          {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
        </div>

        {/* Output Area */}
        <ScrollArea className="md:flex-1 rounded-lg border border-zinc-200 bg-white p-4 shadow-inner">
          <div className="text-sm text-zinc-500 break-all">
            { output ? output : "Nothing to parse yet"}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
