import React, { useEffect, useState } from 'react';
import { FaGlobeAmericas } from 'react-icons/fa';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_MAP_CENTER = [7.6140783, 80.6616211];
const SRI_LANKA_BOUNDS = [
  [5.7, 79.4],
  [10.1, 82.1],
];
const MAP_STREET_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const MAP_SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const MapLayoutFix = () => {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
};

const CoordinateMapPicker = ({ latitude, longitude, onPick }) => {
  const parsedLat = Number(latitude);
  const parsedLon = Number(longitude);
  const hasValidCoordinate = Number.isFinite(parsedLat) && Number.isFinite(parsedLon);
  const [satelliteEnabled, setSatelliteEnabled] = useState(false);

  const ClickHandler = () => {
    useMapEvents({
      click: (event) => {
        const { lat, lng } = event.latlng;
        onPick(lat, lng);
      },
    });
    return null;
  };

  return (
    <div className="geo-coord-modal__map-wrap">
      <div className="geo-coord-modal__map-toolbar">
        <button
          type="button"
          className={`geo-coord-modal__satellite-btn${satelliteEnabled ? ' is-active' : ''}`}
          onClick={() => setSatelliteEnabled((prev) => !prev)}
          title={satelliteEnabled ? 'Switch to street map' : 'Switch to satellite'}
        >
          <FaGlobeAmericas />
          {satelliteEnabled ? 'Satellite on' : 'Satellite off'}
        </button>
      </div>
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={18}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomControl
        className="geo-coord-modal__map"
      >
        {satelliteEnabled ? (
          <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url={MAP_SATELLITE_URL}
              maxZoom={18}
            />
            <TileLayer attribution="" url={MAP_SATELLITE_LABELS_URL} maxZoom={18} opacity={0.9} />
          </>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={MAP_STREET_URL}
          />
        )}
        <MapLayoutFix />
        <ClickHandler />
        {hasValidCoordinate ? (
          <CircleMarker
            center={[parsedLat, parsedLon]}
            radius={8}
            pathOptions={{ color: '#0d9488', fillColor: '#14b8a6', fillOpacity: 0.9, weight: 2 }}
          />
        ) : null}
      </MapContainer>
      <p className="geo-coord-modal__map-hint">
        {hasValidCoordinate
          ? 'Marker shows saved coordinates. Pan and zoom the map, then click to adjust the point.'
          : 'Click anywhere on the map to pick coordinates.'}
      </p>
    </div>
  );
};

export default CoordinateMapPicker;
