'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  name: string;
  profilePicture?: string;
  points: number;
  _count: {
    registrations: number;
  };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=100');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-primary-100 hover:text-white mb-2 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-primary-100 mt-1">Top volunteers making Berlin cleaner</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-12">
                <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex-1 text-center">
                    <div className="card bg-gradient-to-b from-gray-300 to-gray-400 text-white p-6 h-48 flex flex-col justify-end">
                      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-4xl">
                        {leaderboard[1].profilePicture ? (
                          <img
                            src={leaderboard[1].profilePicture}
                            alt={leaderboard[1].name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <p className="text-3xl font-bold mb-1">🥈</p>
                      <p className="font-bold text-lg">{leaderboard[1].name}</p>
                      <p className="text-2xl font-bold">{leaderboard[1].points} pts</p>
                      <p className="text-sm">{leaderboard[1]._count.registrations} events</p>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex-1 text-center">
                    <div className="card bg-gradient-to-b from-yellow-300 to-yellow-500 text-white p-6 h-64 flex flex-col justify-end">
                      <div className="w-24 h-24 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-5xl border-4 border-yellow-200">
                        {leaderboard[0].profilePicture ? (
                          <img
                            src={leaderboard[0].profilePicture}
                            alt={leaderboard[0].name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <p className="text-4xl font-bold mb-1">🥇</p>
                      <p className="font-bold text-xl">{leaderboard[0].name}</p>
                      <p className="text-3xl font-bold">{leaderboard[0].points} pts</p>
                      <p className="text-sm">{leaderboard[0]._count.registrations} events</p>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex-1 text-center">
                    <div className="card bg-gradient-to-b from-orange-400 to-orange-600 text-white p-6 h-40 flex flex-col justify-end">
                      <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                        {leaderboard[2].profilePicture ? (
                          <img
                            src={leaderboard[2].profilePicture}
                            alt={leaderboard[2].name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <p className="text-2xl font-bold mb-1">🥉</p>
                      <p className="font-bold">{leaderboard[2].name}</p>
                      <p className="text-xl font-bold">{leaderboard[2].points} pts</p>
                      <p className="text-sm">{leaderboard[2]._count.registrations} events</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div className="card max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">All Volunteers</h2>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <Link key={entry.id} href={`/profile/${entry.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                      <div className="text-2xl font-bold w-12 text-center text-gray-600">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                        {entry.profilePicture ? (
                          <img
                            src={entry.profilePicture}
                            alt={entry.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{entry.name}</p>
                        <p className="text-sm text-gray-600">
                          {entry._count.registrations} events attended
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{entry.points}</p>
                        <p className="text-sm text-gray-600">points</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Points Info */}
            <div className="card max-w-4xl mx-auto mt-8">
              <h3 className="text-xl font-bold mb-4">How to Earn Points</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <p className="font-semibold">Register for Event</p>
                    <p className="text-sm text-gray-600">+10 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-semibold">Attend Event</p>
                    <p className="text-sm text-gray-600">+50 points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗑️</span>
                  <div>
                    <p className="font-semibold">Collect Trash</p>
                    <p className="text-sm text-gray-600">+5 points per kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  <div>
                    <p className="font-semibold">Work Hours</p>
                    <p className="text-sm text-gray-600">+20 points per hour</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
