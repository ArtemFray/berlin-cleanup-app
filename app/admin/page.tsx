'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  location: string;
  startDateTime: string;
  status: string;
  _count: {
    registrations: number;
  };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-300 mt-1">Manage events and volunteers</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="btn bg-gray-700 hover:bg-gray-600">
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-3xl font-bold text-primary-600">{events.length}</p>
            <p className="text-gray-600">Total Events</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl mb-2">🎯</p>
            <p className="text-3xl font-bold text-blue-600">
              {events.filter(e => e.status === 'UPCOMING').length}
            </p>
            <p className="text-gray-600">Upcoming</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl mb-2">👥</p>
            <p className="text-3xl font-bold text-green-600">
              {events.reduce((sum, e) => sum + e._count.registrations, 0)}
            </p>
            <p className="text-gray-600">Total Registrations</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-3xl font-bold text-gray-600">
              {events.filter(e => e.status === 'COMPLETED').length}
            </p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Events Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              {showCreateForm ? 'Cancel' : '+ Create New Event'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold mb-4">Create New Event</h3>
              <CreateEventForm onSuccess={() => {
                setShowCreateForm(false);
                fetchEvents();
              }} />
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <p className="text-sm text-gray-600 mb-1">📍 {event.location}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        📅 {format(new Date(event.startDateTime), 'PPp')}
                      </p>
                      <p className="text-sm text-gray-600">
                        👥 {event._count.registrations} registered
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}`}>
                        <button className="btn-secondary text-sm">
                          Manage
                        </button>
                      </Link>
                      <Link href={`/events/${event.id}`}>
                        <button className="btn-secondary text-sm">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Notification Section */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Send Notification</h2>
          <SendNotificationForm />
        </div>
      </main>
    </div>
  );
}

// Create Event Form Component
function CreateEventForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: '52.52',
    longitude: '13.405',
    startDateTime: '',
    endDateTime: '',
    meetingPoint: '',
    maxParticipants: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Event created successfully!');
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      alert('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Event Title</label>
          <input
            type="text"
            className="input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Location Name</label>
          <input
            type="text"
            className="input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Latitude</label>
          <input
            type="number"
            step="0.000001"
            className="input"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Longitude</label>
          <input
            type="number"
            step="0.000001"
            className="input"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date & Time</label>
          <input
            type="datetime-local"
            className="input"
            value={formData.startDateTime}
            onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">End Date & Time</label>
          <input
            type="datetime-local"
            className="input"
            value={formData.endDateTime}
            onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Meeting Point</label>
          <input
            type="text"
            className="input"
            value={formData.meetingPoint}
            onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Max Participants (optional)</label>
          <input
            type="number"
            className="input"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
          />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

// Send Notification Form Component
function SendNotificationForm() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'GENERAL_ANNOUNCEMENT',
    eventId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Notification sent to ${data.recipientCount} users!`);
        setFormData({ title: '', message: '', type: 'GENERAL_ANNOUNCEMENT', eventId: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Send notification error:', error);
      alert('Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Notification Type</label>
        <select
          className="input"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="GENERAL_ANNOUNCEMENT">General Announcement (All Users)</option>
          <option value="EVENT_SPECIFIC">Event Specific (Event Participants)</option>
        </select>
      </div>

      {formData.type === 'EVENT_SPECIFIC' && (
        <div>
          <label className="label">Event ID</label>
          <input
            type="text"
            className="input"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            required
            placeholder="Enter event ID"
          />
        </div>
      )}

      <div>
        <label className="label">Title</label>
        <input
          type="text"
          className="input"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="label">Message</label>
        <textarea
          className="input"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Sending...' : 'Send Notification'}
      </button>
    </form>
  );
}
