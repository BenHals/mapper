import { useEffect, useState } from 'react'
import './App.css'
import Tiptap from './editor'
import Map from './map'
import Location from './domain'
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

async function calcLocations(text: string, api: GeocodingApi) {
  const text_for_locations = extractLocationText(text);
  console.log(text_for_locations);
  return await Promise.all(text_for_locations.map(async (location_text): Promise<Location> => {
    const res = await api.search({ text: location_text });
    const coord = res.features[0].geometry.coordinates;
    console.error(res);
    return { text: location_text, lat: coord[0], lon: coord[1] }
  }));
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);

  const f = (text: string) => { calcLocations(text, api).then((results) => { setLocations(results) }) };

  const api = new GeocodingApi();

  return (
    <>
      <div className='w-full h-full block grid grid-cols-2'>
        <div className='w-50% h-full block bg-white text-black'>
          <Tiptap onTextChange={f} />
        </div>
        <div className='w-50% h-full block bg-black'>
          <div>
            <ul>
              {locations.map((location, index) => (
                <li key={index}>{location.text}</li>
              ))}
            </ul>
          </div>
          <Map locations={locations} />
        </div>
      </div>
    </>
  )
}

export default App
