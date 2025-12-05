'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[LoginPage] Submitting form with email:', formData.email);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log('[LoginPage] Calling endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('[LoginPage] Response status:', response.status);

      const data = await response.json();
      console.log('[LoginPage] Response data:', data);

      if (response.ok) {
        console.log('[LoginPage] Login successful!');
        console.log('[LoginPage] Token:', data.token ? 'present' : 'MISSING');
        console.log('[LoginPage] User:', data.user);

        // Save token to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('[LoginPage] Saved to localStorage, redirecting to:', data.user.role === 'ADMIN' ? '/admin' : '/');

        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }

        // Force reload after a short delay to ensure redirect happens
        setTimeout(() => {
          window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/';
        }, 500);
      } else {
        console.log('[LoginPage] Login failed:', data.error);
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('[LoginPage] Auth error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">🌱 Berlin Cleanup</h1>
          <p className="text-gray-600">Volunteer Street Cleaning Events</p>
        </div>

        {/* Auth Card */}
        <div className="card">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-3 border-b-2 font-medium transition-colors ${
                isLogin
                  ? 'border-primary-600 text-primary-600'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-3 border-b-2 font-medium transition-colors ${
                !isLogin
                  ? 'border-primary-600 text-primary-600'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                minLength={6}
              />
              {!isLogin && (
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Welcome! 🎉</strong> By registering, you'll be able to:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>✓ Register for cleanup events</li>
                <li>✓ Earn points and climb the leaderboard</li>
                <li>✓ Track your volunteer history</li>
                <li>✓ Receive event notifications</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm">
            ← Back to Events
          </Link>
        </div>

        {/* Demo Credentials (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 card bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Demo Credentials (Development Only)
            </p>
            <p className="text-xs text-yellow-700">
              <strong>Volunteer:</strong> volunteer@test.com / password123<br />
              <strong>Admin:</strong> admin@test.com / admin123
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Note: You'll need to create these users in the database first
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
