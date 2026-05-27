import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Map({ buildings }) {
  const validBuildings = buildings.filter(b => b.lat && b.lng)
  const center = validBuildings.length > 0
    ? [validBuildings[0].lat, validBuildings[0].lng]
    : [41.3851, 2.1734]

  return (
    <MapContainer center={center} zoom={15} style={{ height: '400px', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validBuildings.map(b => (
        <Marker key={b.reference} position={[b.lat, b.lng]}>
          <Popup>
            <strong>{b.name}</strong><br />
            Referencia: {b.reference}<br />
            Área media: {b.value ?? 'N/A'} m²
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}