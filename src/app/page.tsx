"use client"
import { useState } from 'react'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

type TLVRecord = {
  tag: string
  length: number
  valueHex: string
  format: 'ascii' | 'numeric' | 'binary' | 'raw'
  decoded: string
}

function parseTLV(hexOrBytes: string | Uint8Array): TLVRecord[] {
  const records: TLVRecord[] = []
  const hex = typeof hexOrBytes === 'string'
    ? hexOrBytes.replace(/\s+/g, '').toUpperCase()
    : Buffer.from(hexOrBytes).toString('hex').toUpperCase()

  let i = 0

  while (i < hex.length) {
    let tag = hex.substring(i, i + 2)
    i += 2
    if ((parseInt(tag, 16) & 0x1F) === 0x1F) {
      tag += hex.substring(i, i + 2)
      i += 2
    }

    const lengthByte = parseInt(hex.substring(i, i + 2), 16)
    i += 2
    let length = 0
    if (lengthByte & 0x80) {
      const numLengthBytes = lengthByte & 0x7F
      const lengthHex = hex.substring(i, i + numLengthBytes * 2)
      length = parseInt(lengthHex, 16)
      i += numLengthBytes * 2
    } else {
      length = lengthByte
    }

    const valueHex = hex.substring(i, i + length * 2)
    i += length * 2

    const defaultFormat: TLVRecord['format'] = 'ascii'
    records.push({
      tag,
      length,
      valueHex,
      format: defaultFormat,
      decoded: decodeValue(valueHex, defaultFormat)
    })
  }

  return records
}

function decodeValue(valueHex: string, format: TLVRecord['format']): string {
  try {
    switch (format) {
      case 'ascii':
        return Buffer.from(valueHex, 'hex').toString('ascii')
      case 'numeric':
        return parseInt(valueHex, 16).toString()
      case 'binary':
        return parseInt(valueHex, 16).toString(2).padStart(valueHex.length * 4, '0')
      case 'raw':
      default:
        return valueHex
    }
  } catch {
    return valueHex
  }
}

// React Component
export default function TLVDecoderCard() {
  const [hex, setHex] = useState('')
  const [records, setRecords] = useState<TLVRecord[]>([])
  const [isError, setIsError] = useState(false)

  const updateRecordFormat = (index: number, newFormat: TLVRecord['format']) => {
    const updated = [...records]
    updated[index].format = newFormat
    updated[index].decoded = decodeValue(updated[index].valueHex, newFormat)
    setRecords(updated)
  }

  const handleHexChange = (value: string) => {
    setHex(value)

    try {
      let input: string | Uint8Array

      if (value.trim().startsWith('[')) {
        const parsedArray = JSON.parse(value)
        if (Array.isArray(parsedArray) && parsedArray.every(n => typeof n === 'number')) {
          input = new Uint8Array(parsedArray)
        } else {
          throw new Error('Invalid byte array format')
        }
      } else {
        input = value
      }

      const parsed = parseTLV(input)
      setRecords(parsed)
      setIsError(false)
    } catch {
      setRecords([])
      setIsError(true)
    }
  }

  return (
    <div className="p-4 flex gap-4 h-screen mt-4" >
      <div className="flex-2 flex-col space-y-1 gap-4">
        <Textarea
          placeholder="Enter TLV hex string or byte array (e.g. [95,32,6,74,...])"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className={cn(isError ? "border-red-500" : "border-black", "h-[30vh]")}
        />
        {isError && <div className="text-sm text-red-600">Invalid TLV input. Please check the format.</div>}
      </div>

      <div className="flex-2 space-y-4">
        {records.map((r, idx) => (
          <div key={idx} className="text-sm border p-2 rounded-md space-y-1">
            <div><strong>Tag:</strong> {r.tag}</div>
            <div><strong>Length:</strong> {r.length}</div>
            <div><strong>Value:</strong> {r.valueHex}</div>
            <div className="flex items-center space-x-2">
              <strong>Format:</strong>
              <Select value={r.format} onValueChange={(val) => updateRecordFormat(idx, val as TLVRecord['format'])}>
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
            </div>
            <div><strong>Decoded:</strong> {r.decoded}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
