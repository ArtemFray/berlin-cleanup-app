'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  registrations: Array<{
    id: string;
    attended: boolean;
    hoursWorked?: number;
    trashCollected?: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function AdminEventManagePage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: any }>({});

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
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (userId: string) => {
    const data = attendanceData[userId] || {};

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${params.id}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          attended: true,
          hoursWorked: data.hoursWorked || null,
          trashCollected: data.trashCollected || null,
        }),
      });

      if (response.ok) {
        alert('Attendance marked successfully!');
        fetchEvent();
      } else {
        alert('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Mark attendance error:', error);
      alert('Failed to mark attendance');
    }
  };

  const handleUpdateEventStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Event status updated to ${status}!`);
        fetchEvent();
      } else {
        alert('Failed to update event status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update event status');
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Event deleted successfully!');
        router.push('/admin');
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete event error:', error);
      alert('Failed to delete event');
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
          <Link href="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin" className="text-gray-300 hover:text-white mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Event: {event.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Event Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{event.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{event.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start</p>
                    <p className="font-medium">{format(new Date(event.startDateTime), 'PPp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End</p>
                    <p className="font-medium">{format(new Date(event.endDateTime), 'PPp')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants & Attendance */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">
                Participants ({event.registrations.length})
              </h2>
              {event.registrations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No participants yet</p>
              ) : (
                <div className="space-y-4">
                  {event.registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className={`border rounded-lg p-4 ${
                        registration.attended ? 'bg-green-50 border-green-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{registration.user.name}</p>
                          <p className="text-sm text-gray-600">{registration.user.email}</p>
                          {registration.attended && (
                            <p className="text-sm text-green-600 font-medium mt-1">✓ Attended</p>
                          )}
                        </div>
                      </div>

                      {!registration.attended && event.status !== 'UPCOMING' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Hours Worked</label>
                              <input
                                type="number"
                                step="0.5"
                                className="input text-sm"
                                placeholder="e.g., 2.5"
                                onChange={(e) =>
                                  setAttendanceData({
                                    ...attendanceData,
                                    [registration.user.id]: {
                                      ...attendanceData[registration.user.id],
                                      hoursWorked: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Trash Collected (kg)</label>
                              <input
                                type="number"
                                className="input text-sm"
                                placeholder="e.g., 15"
                                onChange={(e) =>
                                  setAttendanceData({
                                    ...attendanceData,
                                    [registration.user.id]: {
                                      ...attendanceData[registration.user.id],
                                      trashCollected: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleMarkAttendance(registration.user.id)}
                            className="btn-primary text-sm w-full"
                          >
                            Mark as Attended
                          </button>
                        </div>
                      )}

                      {registration.attended && (
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          {registration.hoursWorked && (
                            <div>
                              <p className="text-gray-600">Hours Worked</p>
                              <p className="font-medium">{registration.hoursWorked}h</p>
                            </div>
                          )}
                          {registration.trashCollected && (
                            <div>
                              <p className="text-gray-600">Trash Collected</p>
                              <p className="font-medium">{registration.trashCollected}kg</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/events/${event.id}`}>
                  <button className="btn-secondary w-full">View Public Page</button>
                </Link>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Update Status</p>
                  <select
                    className="input text-sm"
                    value={event.status}
                    onChange={(e) => handleUpdateEventStatus(e.target.value)}
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <button className="btn-danger w-full" onClick={handleDeleteEvent}>
                  Delete Event
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total Registered</p>
                  <p className="text-2xl font-bold">{event.registrations.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attended</p>
                  <p className="text-2xl font-bold text-green-600">
                    {event.registrations.filter((r) => r.attended).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Trash Collected</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {event.registrations.reduce((sum, r) => sum + (r.trashCollected || 0), 0)}kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
