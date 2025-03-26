import React from 'react';
import { useAuthStore } from '../store/auth';
import { LogoutButton } from './LogoutButton';
import { Gavel } from 'lucide-react';

export function Header() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Gavel className="text-amber-400 mr-2" size={24} />
        <h1 className="text-xl font-bold">IPL Auction</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm">
              <span className="text-gray-400 mr-1">Logged in as:</span>
              <span className="font-semibold text-amber-400">{user.username}</span>
            </div>
            <LogoutButton />
          </>
        )}
      </div>
    </header>
  );
}