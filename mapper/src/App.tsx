import { useEffect, useState, useRef } from 'react'
import './App.css'
import Tiptap from './editor'
import { Map as MapComponent } from './map'
import { ItineraryChunk, Location, Pin } from './domain'
import { GeocodingApi, Configuration } from '@stadiamaps/api';

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

async function calcLocations(text: string, api: GeocodingApi, locationCache: Map<string, Location>) {
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
        location = { text: location_text, lat: coord[0], lon: coord[1] }
        locationCache.set(location_text, location);
        console.log(locationCache);
        console.log(locationCache.size);
        console.error(locationCache);
      }

      return { location: location, datetime_utc: new Date() } as Pin
    }));
    return { pins: chunk_pins } as ItineraryChunk
  }));
}

function App() {
  const [itinerary_chunks, setItineraryChunks] = useState<ItineraryChunk[]>([]);

  let locationCache = useRef<Map<string, Location>>(new Map<string, Location>());

  const f = (text: string) => { calcLocations(text, api, locationCache.current).then((results) => { setItineraryChunks(results) }) };

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
