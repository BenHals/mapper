import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import Location from './domain';


function Map(locations: Location[]) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        center: [139.753, 35.6833],
        zoom: 14,
        style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
      });
    }

    locations.map((l) => {
      new maplibregl.Marker({ color: "#FF0000" })
        .setLngLat([l.lat, l.lon])
        .addTo(map.current)
    });
  });

  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className="map" />
    </div>
  )
}

export default Map
