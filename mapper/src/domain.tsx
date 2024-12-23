interface Location {
  text: string
  lat: number
  lon: number
}

interface Pin {
  location: Location,
  datetime_utc: Date,
}

interface ItineraryChunk {
  pins: Array<Pin>
}

export type { Location, Pin, ItineraryChunk }
