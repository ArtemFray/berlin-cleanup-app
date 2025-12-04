'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse" />,
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
  meetingPoint: string;
  maxParticipants?: number;
  eventResults?: string;
  photos: string[];
  status: string;
  _count: {
    registrations: number;
  };
  registrations: Array<{
    user: {
      id: string;
      name: string;
      profilePicture?: string;
    };
  }>;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();
      setEvent(data.event);
      // TODO: Check if user is registered
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsRegistered(true);
        fetchEvent(); // Refresh event data
        alert('Successfully registered for the event!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${params.id}/register`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsRegistered(false);
        fetchEvent();
        alert('Successfully unregistered from the event');
      } else {
        alert('Failed to unregister');
      }
    } catch (error) {
      console.error('Unregister error:', error);
      alert('Failed to unregister from event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Link href="/" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.maxParticipants && event._count.registrations >= event.maxParticipants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-primary-100 hover:text-white mb-2 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>

            {/* Map */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Location</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <EventMap events={[event]} />
              </div>
              <p className="mt-4 text-gray-700">
                <strong>Meeting Point:</strong> {event.meetingPoint}
              </p>
            </div>

            {/* Participants */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">
                Participants ({event._count.registrations}
                {event.maxParticipants && ` / ${event.maxParticipants}`})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.registrations.map((reg) => (
                  <div key={reg.user.id} className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                      {reg.user.profilePicture ? (
                        <img
                          src={reg.user.profilePicture}
                          alt={reg.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <p className="text-sm font-medium">{reg.user.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Results (if completed) */}
            {event.status === 'COMPLETED' && event.eventResults && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Event Results</h2>
                <p className="text-gray-700 whitespace-pre-line">{event.eventResults}</p>
              </div>
            )}

            {/* Photos */}
            {event.photos.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Event photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="card sticky top-4">
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{format(new Date(event.startDateTime), 'PPP')}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startDateTime), 'p')} -{' '}
                    {format(new Date(event.endDateTime), 'p')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Registration Button */}
              {event.status === 'UPCOMING' && (
                <div className="mt-6">
                  {isRegistered ? (
                    <button
                      onClick={handleUnregister}
                      className="btn-danger w-full"
                    >
                      Unregister
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering || isFull}
                      className="btn-primary w-full"
                    >
                      {registering
                        ? 'Registering...'
                        : isFull
                        ? 'Event Full'
                        : 'Register for Event (+10 pts)'}
                    </button>
                  )}
                  {isFull && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      This event has reached maximum capacity
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
