import { useState } from 'react'
import './App.css'
import Tiptap from './editor'

function App() {
  const [count, setCount] = useState<Number>(0)
  const [locations, setLocations] = useState<string[]>([]);

  return (
    <>
      <div className='w-full h-full block grid grid-cols-2'>
        <div className='w-50% h-full block bg-white text-black'>
          <Tiptap locations={locations} setLocations={setLocations} />
        </div>
        <div className='w-50% h-full block bg-black'>
          <div>
            <ul>
              {locations.map((location, index) => (
                <li key={index}>{location}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
