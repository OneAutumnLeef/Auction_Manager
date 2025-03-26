import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Button } from './ui/Button';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LogoutButton({ 
  variant = 'outline',
  size = 'sm',
  className = '' 
}: LogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`flex items-center ${className}`}
    >
      <LogOut className="mr-2" size={16} />
      Logout
    </Button>
  );
}