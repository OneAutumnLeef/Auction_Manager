import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Simple decryption function
const decrypt = (encoded: string, key: number): string => {
  try {
    const base64 = atob(encoded);
    return base64.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) - key)
    ).join('');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// Remove this console log in production
// console.log('Decoded auctioneer password:', decrypt("ZHhmNDU2QyQm", 3));

// IPL Teams configuration
const users: Record<string, { password: string; user: User }> = {
  auctioneer: {
    password: '*protected*',
    user: { id: 'auctioneer', username: 'Auctioneer', role: 'auctioneer' }
  },
  // Original 8 Teams
  csk: {
    password: 'csk1!@#',
    user: { id: 'csk', username: 'Chennai Super Kings', shortName: 'CSK', role: 'team', teamId: 'team1' }
  },
  dc: {
    password: 'dc2!@#',
    user: { id: 'dc', username: 'Delhi Capitals', shortName: 'DC', role: 'team', teamId: 'team2' }
  },
  pbks: {
    password: 'pbk3!@#',
    user: { id: 'pbks', username: 'Punjab Kings', shortName: 'PBKS', role: 'team', teamId: 'team3' }
  },
  kkr: {
    password: 'kkr4!@#',
    user: { id: 'kkr', username: 'Kolkata Knight Riders', shortName: 'KKR', role: 'team', teamId: 'team4' }
  },
  mi: {
    password: 'mi5!@#',
    user: { id: 'mi', username: 'Mumbai Indians', shortName: 'MI', role: 'team', teamId: 'team5' }
  },
  rr: {
    password: 'rr6!@#',
    user: { id: 'rr', username: 'Rajasthan Royals', shortName: 'RR', role: 'team', teamId: 'team6' }
  },
  rcb: {
    password: 'rcb7!@#',
    user: { id: 'rcb', username: 'Royal Challengers Bangalore', shortName: 'RCB', role: 'team', teamId: 'team7' }
  },
  srh: {
    password: 'srh8!@#',
    user: { id: 'srh', username: 'Sunrisers Hyderabad', shortName: 'SRH', role: 'team', teamId: 'team8' }
  },
  
  // New Teams (continuing teamId sequence)
  gt: {
    password: 'gt9!@#',
    user: { id: 'gt', username: 'Gujarat Titans', shortName: 'GT', role: 'team', teamId: 'team9' }
  },
  lsg: {
    password: 'lsg10!@#',
    user: { id: 'lsg', username: 'Lucknow Super Giants', shortName: 'LSG', role: 'team', teamId: 'team10' }
  },
  dch: {
    password: 'dch11!@#',
    user: { id: 'dch', username: 'Deccan Chargers', shortName: 'DCH', role: 'team', teamId: 'team11' }
  },
  pwi: {
    password: 'pwi12!@#',
    user: { id: 'pwi', username: 'Pune Warriors India', shortName: 'PWI', role: 'team', teamId: 'team12' }
  },
  ktk: {
    password: 'ktk13!@#',
    user: { id: 'ktk', username: 'Kochi Tuskers Kerala', shortName: 'KTK', role: 'team', teamId: 'team13' }
  },
  scb: {
    password: 'scb14!@#',
    user: { id: 'scb', username: 'SriCity Blasters', shortName: 'SCB', role: 'team', teamId: 'team14' }
  },
  test: {
    password: 'test',
    user: { id: 'test', username: 'Test User', shortName: 'TEST', role: 'team', teamId: 'team15' }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (username: string, password: string) => {
    const lowercaseUsername = username.toLowerCase();
    
    // Special case for auctioneer
    if (lowercaseUsername === 'auctioneer') {
      // Simply compare directly with the expected password
      // This is simpler and avoids encoding/decoding issues
      if (password !== 'auc123!@#') {
        throw new Error('Invalid credentials');
      }
      
      set({ user: users.auctioneer.user });
      return;
    }
    
    // Regular login flow for teams
    const userRecord = users[lowercaseUsername];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    set({ user: userRecord.user });
  },
  logout: () => set({ user: null })
}));