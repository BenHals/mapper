import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import Location from './domain';

type Props = {
  locations: Location[]
}

function Map({ locations }: Props) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [139.753, 35.6833],
      zoom: 14,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
    });
  });

  useEffect(() => {
    markers.current.forEach((marker) => { marker.remove() });
    markers.current = [];

    locations.forEach((location) => {
      const marker = new maplibregl.Marker()
        .setLngLat([location.lat, location.lon])
        .addTo(map.current);

      markers.current.push(marker);
    });

    if (locations.length > 0) {
      const avg_lat = locations.reduce((acc, v) => acc + v.lat, 0) / locations.length;
      const avg_lon = locations.reduce((acc, v) => acc + v.lon, 0) / locations.length;

      map.current.flyTo({
        center: [avg_lat, avg_lon],
        speed: 0.2
      });
    }
  }, [locations]);



  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className="map" />
    </div>
  )
}

export default Map
