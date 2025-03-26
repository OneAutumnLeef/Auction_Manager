import { create } from 'zustand';
import { Player } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SoldPlayer {
  playerId: string;
  teamId: string;
  amount: number;
  soldAt: Date;
}

interface UnsoldPlayer {
  playerId: string;
  reason: string; // Reason why player remained unsold
  markedAt: Date;
}

interface AuctionState {
  players: Player[];
  currentPlayer: Player | null;
  isAuctionMode: boolean;
  soldPlayers: SoldPlayer[];
  unsoldPlayers: UnsoldPlayer[]; // New array for unsold players
}

interface AuctionActions {
  setPlayers: (players: Player[]) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setAuctionMode: (isActive: boolean) => void;
  markPlayerSold: (playerId: string, teamId: string, amount: number) => void;
  markPlayerUnsold: (playerId: string, reason: string) => void; // New action
  setUnsoldPlayers: (unsoldPlayers: UnsoldPlayer[]) => void; // For CSV import
  resetAuctionData: () => void; // New action to clear sold/unsold data
}

type AuctionStore = AuctionState & AuctionActions;

// If date objects are lost during serialization, you may need a custom storage handler
const dateReviver = (key: string, value: any) => {
  const dateKeys = ['soldAt', 'markedAt'];
  if (dateKeys.includes(key) && typeof value === 'string') {
    return new Date(value);
  }
  return value;
};

// Improve the persistence configuration in your auction store

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      players: [],
      currentPlayer: null,
      isAuctionMode: false,
      soldPlayers: [],
      unsoldPlayers: [],
      
      setPlayers: (players) => set({ players }),
      setCurrentPlayer: (player) => set({ currentPlayer: player }),
      setAuctionMode: (isActive) => set({ isAuctionMode: isActive }),
      
      markPlayerSold: (playerId, teamId, amount) => set((state) => {
        // Create sold player record
        const soldPlayer: SoldPlayer = {
          playerId,
          teamId,
          amount,
          soldAt: new Date()
        };
        
        // Remove from unsold if it was there before
        const updatedUnsoldPlayers = state.unsoldPlayers.filter(
          p => p.playerId !== playerId
        );
        
        // Update players array to mark as sold
        const updatedPlayers = state.players.map(player => 
          player.id === playerId 
            ? { ...player, isSold: true, isUnsold: false, soldTo: teamId, soldAmount: amount } 
            : player
        );
        
        return { 
          soldPlayers: [...state.soldPlayers, soldPlayer],
          unsoldPlayers: updatedUnsoldPlayers,
          players: updatedPlayers
        };
      }),
      
      markPlayerUnsold: (playerId, reason) => set((state) => {
        // Check if player is already in unsoldPlayers to prevent duplicates
        const playerAlreadyUnsold = state.unsoldPlayers.some(p => p.playerId === playerId);
        
        // Create unsold player record
        const unsoldPlayer: UnsoldPlayer = {
          playerId,
          reason,
          markedAt: new Date()
        };
        
        // Remove from sold if it was there before
        const updatedSoldPlayers = state.soldPlayers.filter(
          p => p.playerId !== playerId
        );
        
        // Update players array to mark as unsold
        const updatedPlayers = state.players.map(player => 
          player.id === playerId 
            ? { ...player, isUnsold: true, isSold: false, soldTo: undefined, soldAmount: undefined } 
            : player
        );
        
        return { 
          // Only add to unsoldPlayers if not already there
          unsoldPlayers: playerAlreadyUnsold 
            ? state.unsoldPlayers
            : [...state.unsoldPlayers, unsoldPlayer],
          soldPlayers: updatedSoldPlayers,
          players: updatedPlayers
        };
      }),
      
      setUnsoldPlayers: (unsoldPlayers) => set({ unsoldPlayers }),
      
      // New function to reset auction data
      resetAuctionData: () => set((state) => {
        // Reset sold/unsold flags on all players
        const resetPlayers = state.players.map(player => ({
          ...player,
          isSold: false,
          isUnsold: false,
          soldTo: undefined,
          soldAmount: undefined
        }));
        
        return {
          soldPlayers: [],
          unsoldPlayers: [],
          players: resetPlayers
        };
      }),

      // Add a function to check if store has been initialized from storage
      hasPersistedData: () => {
        return get().players.length > 0;
      }
    }),
    {
      name: 'auction-storage',
      // Store everything except the currentPlayer and isAuctionMode
      partialize: (state) => ({
        players: state.players,
        soldPlayers: state.soldPlayers,
        unsoldPlayers: state.unsoldPlayers
      }),
      // Custom serialization to handle Date objects
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => {
        try {
          return JSON.parse(str, dateReviver);
        } catch (e) {
          console.error("Failed to parse persisted state:", e);
          return {} as any;
        }
      },
      // Add storage event handlers for debugging
      onRehydrateStorage: () => {
        return (_newState, error) => {  // Use underscore prefix to indicate intentionally unused parameter
          if (error) {
            console.error('Error rehydrating auction store:', error);
          } else {
            console.log('Auction store successfully rehydrated');
          }
        };
      },
      // Use createJSONStorage to fix type issues
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            if (value === null) return null;
            return JSON.parse(value, dateReviver);
          } catch (e) {
            console.error('Failed to get from localStorage:', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error('Failed to write to localStorage:', e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error('Failed to remove from localStorage:', e);
          }
        }
      }))
    }
  )
);