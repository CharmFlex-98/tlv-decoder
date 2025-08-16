import { InputType, OutputFormat, TLVRecord } from "../../parser/models"

function normalizeHexString(s: string) {
    return s.replace(/[^0-9A-Fa-f]/g, '').toUpperCase()
}

function hexToBytes(hex: string): Uint8Array {
    const clean = normalizeHexString(hex)

    if (clean.length % 2 !== 0) {
        throw new Error('Hex string length must be even')
    }

    return Uint8Array.from(Buffer.from(clean, 'hex'))

    // const out = new Uint8Array(clean.length / 2)
    // for (let i = 0; i < out.length; i++) {
    //   out[i] = parseInt(clean.substr(i * 2, 2), 16)
    // }
    // return out
}

function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}


function decodeValue(valueHex: string, format: OutputFormat): string {
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
        // if bit1 - bit5 is 11111, means it is multi-tags
        if ((tagBytes[0] & 0x1F) === 0x1F) {
            while (i < end) {
                const b = buf[i++]
                tagBytes.push(b)
                // if subsequent byte's bit8 is 0, then it is the last byte representing tag
                if ((b & 0x80) === 0) break
            }
        }
        const tag = tagBytes.map(tagByte => tagByte.toString(16).padStart(2, '0')).join('').toUpperCase()

        const firstLenByte = buf[i++]
        let length = 0
        // If MSB (most significant byte) is not 0, then the remaining bits indicate how many subsequent bytes are used to specify the length.
        if ((firstLenByte & 0x80) !== 0) {
            // Keep only the lower 7 bits 
            const numLenBytes = firstLenByte & 0x7F
            if (numLenBytes === 0) {
                throw new Error('Indefinite lengths not supported')
            }

            // Calculate length. Essentially the same as length*256 + buf[i++]
            for (let k = 0; k < numLenBytes; k++) {
                length = (length << 8) | buf[i++]
            }
        } else {
            length = firstLenByte
        }

        // Malformed without value
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
            try {
                rec.children = parseBuffer(valueBytes, 0, valueBytes.length)
            }
            catch {
                rec.children = []
            }
        }
        records.push(rec)
    }
    return records
}


function parseTLV(hexOrBytes: InputType): TLVRecord[] {
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
    } else {
        throw new Error('Invalid byte array')
    }

    return parseBuffer(buf, 0, buf.length)
}


export { decodeValue, parseTLV }