"use client"
import { useState } from 'react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// ===== Types & Helpers remain unchanged ======
type TLVRecord = {
  tag: string
  length: number
  valueHex: string
  format: 'ascii' | 'numeric' | 'binary' | 'raw'
  decoded: string
  children?: TLVRecord[]
}

function normalizeHexString(s: string) {
  return s.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
}
function hexToBytes(hex: string): Uint8Array {
  const clean = normalizeHexString(hex)
  if (clean.length % 2 !== 0) throw new Error('Hex string length must be even')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16)
  }
  return out
}
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}
function decodeValue(valueHex: string, format: TLVRecord['format']): string {
  try {
    if (!valueHex) return ''
    switch (format) {
      case 'ascii': return new TextDecoder().decode(hexToBytes(valueHex))
      case 'numeric': return BigInt('0x' + valueHex).toString()
      case 'binary': return BigInt('0x' + valueHex).toString(2).padStart(valueHex.length * 4, '0')
      case 'raw':
      default: return valueHex
    }
  } catch {
    return valueHex
  }
}
function parseBuffer(buf: Uint8Array, start = 0, end = buf.length): TLVRecord[] {
  const records: TLVRecord[] = []
  let i = start
  while (i < end) {
    const tagBytes: number[] = [buf[i++]]
    if ((tagBytes[0] & 0x1F) === 0x1F) {
      while (i < end) {
        const b = buf[i++]
        tagBytes.push(b)
        if ((b & 0x80) === 0) break
      }
    }
    const tag = tagBytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    const firstLenByte = buf[i++]
    let length = 0
    if ((firstLenByte & 0x80) !== 0) {
      const numLenBytes = firstLenByte & 0x7F
      if (numLenBytes === 0) throw new Error('Indefinite lengths not supported')
      for (let k = 0; k < numLenBytes; k++) length = (length << 8) | buf[i++]
    } else {
      length = firstLenByte
    }
    if (i + length > end) break
    const valueBytes = buf.slice(i, i + length)
    i += length
    const valueHex = bytesToHex(valueBytes)
    const isConstructed = (tagBytes[0] & 0x20) === 0x20
    const rec: TLVRecord = {
      tag,
      length,
      valueHex,
      format: 'ascii',
      decoded: isConstructed ? '' : decodeValue(valueHex, 'ascii')
    }
    if (isConstructed && valueBytes.length > 0) {
      try { rec.children = parseBuffer(valueBytes, 0, valueBytes.length) }
      catch { rec.children = [] }
    }
    records.push(rec)
  }
  return records
}
function parseTLV(hexOrBytes: string | Uint8Array): TLVRecord[] {
  let buf: Uint8Array
  if (typeof hexOrBytes === 'string') {
    const trimmed = hexOrBytes.trim()
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed) || !parsed.every(n => typeof n === 'number')) {
        throw new Error('Invalid byte array')
      }
      buf = new Uint8Array(parsed)
    } else {
      buf = hexToBytes(trimmed)
    }
  } else if (hexOrBytes instanceof Uint8Array) {
    buf = hexOrBytes
  } else {
    throw new Error('Invalid byte array')
  }
  return parseBuffer(buf, 0, buf.length)
}
function updateFormatAtPath(records: TLVRecord[], path: number[], newFormat: TLVRecord['format']): TLVRecord[] {
  if (path.length === 0) return records
  const idx = path[0]
  if (idx < 0 || idx >= records.length) return records
  const head = records[idx]
  const clone = { ...head }
  if (path.length === 1) {
    clone.format = newFormat
    clone.decoded = decodeValue(clone.valueHex, newFormat)
  } else {
    const rest = path.slice(1)
    clone.children = clone.children ? updateFormatAtPath(clone.children, rest, newFormat) : clone.children
  }
  const newRecords = records.slice()
  newRecords[idx] = clone
  return newRecords
}

// ===== TLVNode Component =====
function TLVNode({
  record,
  path,
  onUpdateFormat,
}: {
  record: TLVRecord
  path: number[]
  onUpdateFormat: (path: number[], fmt: TLVRecord['format']) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = !!record.children && record.children.length > 0

  return (
    <Card className="shadow-sm border border-zinc-200 bg-white rounded-xl">
      <CardContent className="text-sm space-y-1 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold">
              Tag: <span className="text-blue-600">{record.tag}</span>
              {hasChildren && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  [{expanded ? '-' : '+'}]
                </button>
              )}
            </div>
            <div className="text-zinc-700">Length: {record.length}</div>
            <div className='break-all whitespace-normal text-zinc-700'>Value: {record.valueHex}</div>
          </div>
          {!hasChildren && (
            <Select value={record.format} onValueChange={(val) => onUpdateFormat(path, val as TLVRecord['format'])}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascii">ASCII</SelectItem>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="binary">Binary</SelectItem>
                <SelectItem value="raw">Raw</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        {!hasChildren && (
          <div className="text-zinc-700"><strong>Decoded:</strong> {record.decoded}</div>
        )}
        {hasChildren && expanded && (
          <div className="ml-4 mt-2 space-y-2">
            {record.children!.map((child, idx) => (
              <TLVNode
                key={`${record.tag}-${path.join('-')}-${idx}`}
                record={child}
                path={[...path, idx]}
                onUpdateFormat={onUpdateFormat}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ===== Main Component =====
export default function TLVDecoderCard() {
  const [hex, setHex] = useState('')
  const [records, setRecords] = useState<TLVRecord[]>([])
  const [isError, setIsError] = useState(false)

  const onUpdateFormat = (path: number[], newFormat: TLVRecord['format']) => {
    setRecords(prev => updateFormatAtPath(prev, path, newFormat))
  }

  const handleHexChange = (value: string) => {
    setHex(value)
    try {
      const parsed = parseTLV(value)
      setRecords(parsed)
      setIsError(false)
    } catch {
      setRecords([])
      setIsError(true)
    }
  }

  return (
    <div className="p-6 h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">TLV Decoder</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Paste your TLV hex string or byte array below to decode and explore the tag-length-value structure interactively.
        </p>
      </header>
      <Separator className="mb-6" />

      <div className="flex gap-4 h-[calc(100%-100px)]">
        {/* Input Area */}
        <div className="flex flex-col w-1/2">
          <Textarea
            placeholder="Enter TLV hex string or byte array"
            value={hex}
            onChange={(e) => handleHexChange(e.target.value)}
            className={cn(
              isError ? "border-red-500" : "border-zinc-300",
              "h-[30vh] break-words rounded-lg shadow-sm"
            )}
          />
          {isError && <div className="text-sm text-red-600 mt-1">Invalid TLV input. Please check the format.</div>}
        </div>

        {/* Output Area */}
        <ScrollArea className="flex-1 rounded-lg border border-zinc-200 bg-white p-4 shadow-inner">
          {records.length === 0 ? (
            <div className="text-sm text-zinc-500">No TLV parsed yet.</div>
          ) : (
            records.map((r, idx) => (
              <TLVNode key={`${r.tag}-${idx}`} record={r} path={[idx]} onUpdateFormat={onUpdateFormat} />
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
