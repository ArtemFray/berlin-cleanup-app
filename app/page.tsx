'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

// Dynamically import map component (client-side only)
const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />,
});

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  maxParticipants?: number;
  _count: {
    registrations: number;
  };
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?upcoming=true');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Berlin Cleanup</h1>
              <p className="text-primary-100 mt-1">Volunteer Street Cleaning Events</p>
            </div>
            <div className="flex gap-4">
              <Link href="/leaderboard" className="btn bg-white text-primary-600 hover:bg-primary-50">
                Leaderboard
              </Link>
              <Link href="/profile" className="btn bg-primary-700 hover:bg-primary-800">
                Profile
              </Link>
              <Link href="/admin" className="btn bg-primary-700 hover:bg-primary-800">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Map View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-600 text-lg">No upcoming events yet.</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📅</span>
                          <span>{format(new Date(event.startDateTime), 'PPp')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">👥</span>
                          <span>
                            {event._count.registrations}
                            {event.maxParticipants && ` / ${event.maxParticipants}`} registered
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="btn-primary w-full">View Details</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
                <EventMap events={events} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>Berlin Cleanup - Making Berlin cleaner, one event at a time</p>
          <p className="text-gray-400 text-sm mt-2">Join us in keeping our city beautiful</p>
        </div>
      </footer>
    </div>
  );
}
