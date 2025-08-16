import { ValueOf } from "next/dist/shared/lib/constants"

export type Value<T> = T[keyof T]

export interface AppRouteNames {
    "tlvDecoder": "/tlv-decoder", 
    "jsonFormatter": "/json-formatter", 
    "byteConverter": "/byte-converter"
}
    
