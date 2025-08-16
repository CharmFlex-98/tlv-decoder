export type InputType = string | Uint8Array
export type OutputFormat = "ascii" | "numeric" | "binary" | "raw"


export type TLVRecord = {
  tag: string
  length: number
  valueHex: string
  format: OutputFormat
  decoded: string
  children?: TLVRecord[]
}