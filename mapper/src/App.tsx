import { useState } from 'react'
import './App.css'
import Tiptap from './editor'
import Map from './map'
import Location from './domain'


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

function calcLocations(text: string) {
  const text_for_locations = extractLocationText(text);
  const locations = text_for_locations.map((location_text): Location => {
    return { text: location_text, lat: 40.7128, lon: -74.0060 }
  });
  console.log(locations);
  return locations;
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);

  return (
    <>
      <div className='w-full h-full block grid grid-cols-2'>
        <div className='w-50% h-full block bg-white text-black'>
          <Tiptap onTextChange={(text) => { setLocations(calcLocations(text)) }} />
        </div>
        <div className='w-50% h-full block bg-black'>
          <div>
            <ul>
              {locations.map((location, index) => (
                <li key={index}>{location.text}</li>
              ))}
            </ul>
          </div>
          <Map />
        </div>
      </div>
    </>
  )
}

export default { App }
