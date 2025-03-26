import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/Button';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(username.toLowerCase() === 'auctioneer' ? '/auctioneer' : '/team');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="flex-grow flex flex-col md:flex-row items-stretch">
        {/* Left side - Image */}
        <div className="hidden md:flex md:w-1/2 p-8 items-center justify-center">
          <div className="relative max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg blur-lg opacity-30"></div>
            <div className="relative">
              <img 
                src="https://images.prismic.io/derajportfolio/Z-R2_HdAxsiBv8tz_ipl2.png?auto=format,compress" 
                alt="IPL Auction" 
                className="rounded-lg shadow-2xl border border-gray-700/40"
              />
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent"></div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-3xl opacity-20"></div>
              <div className="relative bg-gray-800 p-8 rounded-lg shadow-xl">
                <div className="flex items-center justify-center mb-8">
                  <Trophy className="w-12 h-12 text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold text-center mb-2 text-white">
                  Blitz IPL Auction 2025
                </h1>
                <p className="text-gray-400 text-center mb-8">Sign in to continue</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Enter your password"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
                    Sign In
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}