import { useState, useRef } from 'react'
import './App.css'
import Tiptap from './editor'
import { Map as MapComponent } from './map'
import { ItineraryChunk, Location, Pin, Route } from './domain'
import { GeocodingApi, RoutingApi, RoutingResponseWaypointTypeEnum, CostingModel, RouteResponse } from '@stadiamaps/api';
import polyline from '@mapbox/polyline'
// Utility to extract locations
const extractLocationText = (text: string): string[] => {
  const regex = /@([^@]+)@/g;
  let match;
  const locations = [];

  while ((match = regex.exec(text)) !== null) {
    locations.push(match[1]);
  }

  return locations;
};

// Utility to extract ItineraryChunks
const extractItineraryChunkText = (text: string): string[] => {
  const regex = /~([^~]+)~/g;
  let match;
  const locations = [];

  while ((match = regex.exec(text)) !== null) {
    locations.push(match[1]);
  }

  if (locations.length == 0) {
    locations.push(text)
  }

  return locations;
};

async function getRoute(pin: Pin, prev_pin: Pin, api: RoutingApi): Promise<RouteResponse> {
  const req = {
    locations: [
      {
        lon: prev_pin.location.lon,
        lat: prev_pin.location.lat,
        type: RoutingResponseWaypointTypeEnum.Break,
      },
      {
        lon: pin.location.lon,
        lat: pin.location.lat,
        type: RoutingResponseWaypointTypeEnum.Break,
      },
    ],
    costing: CostingModel.Auto
  };
  console.log(req);
  console.log(JSON.stringify(req));
  const resp = api.route({ routeRequest: req }) as Promise<RouteResponse>;
  return resp




}

async function calcLocations(text: string, api: GeocodingApi, locationCache: Map<string, Location>, routeCache: Map<string, string>) {
  let itin_chunk_texts = extractItineraryChunkText(text);
  console.log(itin_chunk_texts);
  console.warn(locationCache);
  return await Promise.all(itin_chunk_texts.map(async (chunk_text: string): Promise<ItineraryChunk> => {
    const chunk_pins = await Promise.all(extractLocationText(chunk_text).map(async (location_text: string) => {
      let location: Location;
      if (locationCache.has(location_text)) {
        location = locationCache.get(location_text)!;
      } else {
        const res = await api.search({ text: location_text });
        console.warn(`Querying api for ${location_text}!`);
        const coord = res.features[0].geometry.coordinates;
        location = { text: location_text, lat: coord[1], lon: coord[0] }
        locationCache.set(location_text, location);
        console.log(locationCache);
        console.log(locationCache.size);
        console.error(locationCache);
      }
      return { location: location, datetime_utc: new Date() } as Pin
    }));

    console.warn(routeCache);
    const routeResponses = await Promise.all(
      chunk_pins.map(async (pin, pin_idx, chunk_pins) => {
        if (pin_idx == 0) return null;
        const prev_pin = chunk_pins[pin_idx - 1];
        const key: string = JSON.stringify([prev_pin.location.text, pin.location.text]);
        console.warn(key);
        console.warn(routeCache.has(key));
        if (routeCache.has(key)) {
          return routeCache.get(key);
        }
        const resp = await getRoute(pin, prev_pin, new RoutingApi());
        const route_geojson = polyline.toGeoJSON(resp.trip.legs[0].shape, 6) as unknown as string;
        console.warn(`Adding ${key}, ${route_geojson}`);
        routeCache.set(key, route_geojson);
        return route_geojson
      })
    );

    const routes = routeResponses.filter((r) => { return r != null }).map((route, idx) => {
      return { start_pin_idx: idx, end_pin_idx: idx + 1, route: route } as Route;
    });


    return { pins: chunk_pins, routes: routes } as ItineraryChunk
  }));
}

function App() {
  const [itinerary_chunks, setItineraryChunks] = useState<ItineraryChunk[]>([]);

  let locationCache = useRef<Map<string, Location>>(new Map<string, Location>());
  let routeCache = useRef<Map<string, string>>(new Map<string, string>());

  const f = (text: string) => { calcLocations(text, api, locationCache.current, routeCache.current).then((results) => { setItineraryChunks(results) }) };

  const api = new GeocodingApi();

  return (
    <>
      <div className='w-full h-full block grid grid-cols-2'>
        <div className='w-50% h-full block bg-white text-black'>
          <Tiptap onTextChange={f} />
        </div>
        <div className='w-50% h-full block bg-black'>
          <MapComponent itinerary_chunks={itinerary_chunks} />
        </div>
      </div>
    </>
  )
}

export default App
