export interface NftAttribute {
  trait_types: string
  value: number
}

export interface NftMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<NftAttribute>
} 