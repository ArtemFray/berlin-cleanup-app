'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'VOLUNTEER';
  points: number;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer">
              <h1 className="text-3xl font-bold">Berlin Cleanup</h1>
              <p className="text-primary-100 mt-1">Volunteer Street Cleaning Events</p>
            </div>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/leaderboard" className="btn bg-white text-primary-600 hover:bg-primary-50">
              Leaderboard
            </Link>

            {loading ? (
              <div className="w-20 h-10 bg-primary-700 rounded animate-pulse" />
            ) : user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="btn bg-yellow-500 hover:bg-yellow-600 text-white">
                    Admin
                  </Link>
                )}
                <Link href="/profile" className="btn bg-primary-700 hover:bg-primary-800">
                  {user.name} ({user.points} pts)
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn bg-primary-700 hover:bg-primary-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn bg-primary-700 hover:bg-primary-800">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
