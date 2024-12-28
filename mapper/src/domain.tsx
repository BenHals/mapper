interface Location {
  text: string
  lat: number
  lon: number
}

interface Pin {
  location: Location,
  datetime_utc: Date,
}

interface Route {
  start_pin_idx: Number,
  end_pin_idx: Number,
  route: string

}

interface ItineraryChunk {
  pins: Array<Pin>,
  routes: Array<Route>,
}

export type { Location, Pin, ItineraryChunk, Route }
