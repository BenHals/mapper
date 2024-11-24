import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';


function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [139.753, 35.6833],
      zoom: 14,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
    });
  });

  return (
    <div className='map-wrap'>
      <div ref={mapContainer} className="map" />
    </div>
  )
}

export default Map
