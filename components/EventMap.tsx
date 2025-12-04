'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import Link from 'next/link';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

interface Event {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  startDateTime: string;
  _count: {
    registrations: number;
  };
}

interface EventMapProps {
  events: Event[];
}

// Custom marker icon
const eventIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function EventMap({ events }: EventMapProps) {
  // Default center: Berlin
  const center: [number, number] = events.length > 0
    ? [events[0].latitude, events[0].longitude]
    : [52.52, 13.405]; // Berlin coordinates

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={eventIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{event.location}</p>
              <p className="text-sm mb-2">
                {format(new Date(event.startDateTime), 'PPp')}
              </p>
              <p className="text-sm mb-3">
                👥 {event._count.registrations} registered
              </p>
              <Link href={`/events/${event.id}`}>
                <button className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 w-full">
                  View Details
                </button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
