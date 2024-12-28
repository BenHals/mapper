import { useRef, useEffect } from 'react';
import maplibregl, { Marker, Popup, SourceSpecification, AddLayerObject } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { ItineraryChunk } from './domain';


interface RoutePainter {
  sourceId: string,
  layerId: string,
  source: SourceSpecification,
  layer: AddLayerObject
}

function removeRoute(map: maplibregl.Map, routePainter: RoutePainter) {
  if (map.getLayer(routePainter.layerId)) {
    map.removeLayer(routePainter.layerId); // Remove the layer
  }

  if (map.getSource(routePainter.sourceId)) {
    map.removeSource(routePainter.sourceId); // Remove the source
  }
}

type Props = {
  itinerary_chunks: ItineraryChunk[]
}

function Map({ itinerary_chunks: itinerary_chunks }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Array<Marker>>([]);
  const routeLines = useRef<Array<RoutePainter>>([]);

  const chunkColors: string[] = ["#FF0000", "#00FF00", "#0000FF"];

  const getChunkColor = (i: number) => { return chunkColors[i % chunkColors.length] };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      center: [-0.127, 51.507],
      zoom: 7,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
    });
  }, []);

  useEffect(() => {
    markers.current.forEach((marker) => { marker.remove() });
    markers.current = [];

    routeLines.current.forEach((source) => { removeRoute(map.current!, source) });
    routeLines.current = [];


    itinerary_chunks.forEach((i_chunk, idx) => {
      i_chunk.pins.map((pin) => {
        const marker = new maplibregl.Marker({ "color": getChunkColor(idx) })
          .setLngLat([pin.location.lon, pin.location.lat])
          .setPopup(new Popup().setText(`I Chunk ${idx}`))
          .addTo(map.current!);

        markers.current.push(marker);
      });

      i_chunk.routes.map((route, routeIdx) => {
        const id = `${idx}-${routeIdx}`;
        const source: SourceSpecification = {
          type: "geojson",
          data: route.route
        };

        const layer: AddLayerObject = {
          id: id,
          type: 'line',
          source: id,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": getChunkColor(idx),
            "line-width": 6,
          }
        };

        const routePainer = {
          sourceId: id,
          layerId: id,
          source: source,
          layer: layer
        } as RoutePainter;

        map.current!.addSource(id, source);
        map.current!.addLayer(layer);
        routeLines.current.push(routePainer);

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
