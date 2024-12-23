import { useRef, useEffect } from 'react';
import maplibregl, { Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { Location, Pin, ItineraryChunk } from './domain';

type Props = {
  itinerary_chunks: ItineraryChunk[]
}

function Map({ itinerary_chunks: itinerary_chunks }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Array<Marker>>([]);

  const chunkColors: string[] = ["#FF0000", "#00FF00", "#0000FF"];

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      center: [139.753, 35.6833],
      zoom: 14,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
    });
  }, []);

  useEffect(() => {
    markers.current.forEach((marker) => { marker.remove() });
    markers.current = [];

    itinerary_chunks.forEach((i_chunk, idx) => {
      i_chunk.pins.map((pin) => {
        const marker = new maplibregl.Marker({ "color": chunkColors[idx % chunkColors.length] })
          .setLngLat([pin.location.lat, pin.location.lon])
          .setPopup(new Popup().setText(`I Chunk ${idx}`))
          .addTo(map.current!);

        markers.current.push(marker);
      });
    });

    if (markers.current.length > 0) {
      const avg_lat = markers.current.reduce((acc, v) => acc + v.getLngLat().lat, 0) / markers.current.length;
      const avg_lon = markers.current.reduce((acc, v) => acc + v.getLngLat().lng, 0) / markers.current.length;
      console.log(avg_lat, avg_lon);

      map.current!.flyTo({
        center: [avg_lon, avg_lat],
        speed: 0.6
      });
    }
  }, [itinerary_chunks]);



  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className="map" />
    </div>
  )
}

export { Map }
