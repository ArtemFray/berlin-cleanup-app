'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  points: number;
  createdAt: string;
  registrations: Array<{
    event: {
      id: string;
      title: string;
      startDateTime: string;
      location: string;
    };
    hoursWorked?: number;
    trashCollected?: number;
  }>;
  pointHistory: Array<{
    id: string;
    points: number;
    reason: string;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Fetch full profile with history
        const profileResponse = await fetch(`/api/users/${data.user.id}`);
        const profileData = await profileResponse.json();
        setProfile(profileData.user);
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-primary-100 hover:text-white mb-2 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center sticky top-4">
              <div className="w-32 h-32 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center text-6xl">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>

              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-4xl font-bold text-primary-600 mb-1">{profile.points}</p>
                <p className="text-gray-600">Total Points</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{profile.registrations.length}</p>
                  <p className="text-sm text-gray-600">Events Attended</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.registrations.reduce((sum, r) => sum + (r.trashCollected || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Trash (kg)</p>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/leaderboard" className="btn-primary w-full">
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event History */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Event History</h2>
              {profile.registrations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  You haven't attended any events yet. Check out upcoming events!
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.registrations.map((registration) => (
                    <Link
                      key={registration.event.id}
                      href={`/events/${registration.event.id}`}
                    >
                      <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {registration.event.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              📍 {registration.event.location}
                            </p>
                            <p className="text-sm text-gray-600">
                              📅 {format(new Date(registration.event.startDateTime), 'PPP')}
                            </p>
                          </div>
                          <div className="text-right">
                            {registration.hoursWorked && (
                              <p className="text-sm text-gray-600">
                                ⏱️ {registration.hoursWorked}h
                              </p>
                            )}
                            {registration.trashCollected && (
                              <p className="text-sm text-gray-600">
                                🗑️ {registration.trashCollected}kg
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Points History */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Points History</h2>
              {profile.pointHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No points earned yet. Register for events to start earning!
                </p>
              ) : (
                <div className="space-y-2">
                  {profile.pointHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{entry.reason}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.createdAt), 'PPp')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          +{entry.points}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements (Future Feature) */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`text-center p-4 rounded-lg ${profile.registrations.length >= 1 ? 'bg-primary-50' : 'bg-gray-100 opacity-50'}`}>
                  <p className="text-4xl mb-2">🌱</p>
                  <p className="text-sm font-medium">First Event</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${profile.registrations.length >= 5 ? 'bg-primary-50' : 'bg-gray-100 opacity-50'}`}>
                  <p className="text-4xl mb-2">🌿</p>
                  <p className="text-sm font-medium">5 Events</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${profile.registrations.length >= 10 ? 'bg-primary-50' : 'bg-gray-100 opacity-50'}`}>
                  <p className="text-4xl mb-2">🌳</p>
                  <p className="text-sm font-medium">10 Events</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${profile.points >= 500 ? 'bg-primary-50' : 'bg-gray-100 opacity-50'}`}>
                  <p className="text-4xl mb-2">⭐</p>
                  <p className="text-sm font-medium">500 Points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
