import { create } from 'zustand';
import { ref, onValue, set as firebaseSet } from 'firebase/database';
import { database } from '../lib/firebase';
import { Player } from '../types';

interface SoldPlayer {
  playerId: string;
  teamId: string;
  amount: number;
  soldAt: string; // Changed from Date to string for Firebase compatibility
}

interface UnsoldPlayer {
  playerId: string;
  reason: string;
  markedAt: string; // Changed from Date to string for Firebase compatibility
}

interface AuctionState {
  players: Player[];
  currentPlayer: Player | null;
  isAuctionMode: boolean;
  soldPlayers: SoldPlayer[];
  unsoldPlayers: UnsoldPlayer[];
}

interface AuctionActions {
  setPlayers: (players: Player[]) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setAuctionMode: (isActive: boolean) => void;
  markPlayerSold: (playerId: string, teamId: string, amount: number) => void;
  markPlayerUnsold: (playerId: string, reason: string) => void;
  setUnsoldPlayers: (unsoldPlayers: UnsoldPlayer[]) => void;
  resetAuctionData: () => void;
  hasPersistedData: () => boolean;
}

type AuctionStore = AuctionState & AuctionActions;

export const useAuctionStore = create<AuctionStore>()((set, get) => {
  // Set up Firebase listener
  const auctionRef = ref(database, 'auction');
  
  // Listen for changes in the database
  onValue(auctionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Update local state when Firebase changes, but avoid loops
      const currentState = get();
      // Simple comparison to prevent update loops
      if (JSON.stringify(data.players) !== JSON.stringify(currentState.players) ||
          JSON.stringify(data.soldPlayers) !== JSON.stringify(currentState.soldPlayers) ||
          JSON.stringify(data.unsoldPlayers) !== JSON.stringify(currentState.unsoldPlayers)) {
        
        set({
          players: data.players || [],
          soldPlayers: data.soldPlayers || [],
          unsoldPlayers: data.unsoldPlayers || [],
          currentPlayer: data.currentPlayer || null
        });
      }
    }
  });

  return {
    // Initial state
    players: [],
    currentPlayer: null,
    isAuctionMode: false,
    soldPlayers: [],
    unsoldPlayers: [],
    
    // Update methods to sync with Firebase
    setPlayers: (players) => {
      set({ players });
      // Update Firebase when local state changes
      firebaseSet(ref(database, 'auction/players'), players);
    },
    
    setCurrentPlayer: (player) => {
      set({ currentPlayer: player });
      firebaseSet(ref(database, 'auction/currentPlayer'), player);
    },
    
    setAuctionMode: (isActive) => set({ isAuctionMode: isActive }),
    
    markPlayerSold: (playerId, teamId, amount) => {
      set((state) => {
        // Create sold player object with string date for Firebase compatibility
        const soldPlayer: SoldPlayer = {
          playerId,
          teamId,
          amount,
          soldAt: new Date().toISOString()
        };
        
        const updatedPlayers = state.players.map(player => 
          player.id === playerId 
            ? { ...player, isSold: true, isUnsold: false, soldTo: teamId, soldAmount: amount } 
            : player
        );
        
        const updatedUnsoldPlayers = state.unsoldPlayers.filter(
          p => p.playerId !== playerId
        );
        
        const newSoldPlayers = [...state.soldPlayers, soldPlayer];
        
        // Update Firebase
        firebaseSet(ref(database, 'auction/soldPlayers'), newSoldPlayers);
        firebaseSet(ref(database, 'auction/players'), updatedPlayers);
        firebaseSet(ref(database, 'auction/unsoldPlayers'), updatedUnsoldPlayers);
        
        return { 
          soldPlayers: newSoldPlayers,
          players: updatedPlayers,
          unsoldPlayers: updatedUnsoldPlayers
        };
      });
    },
    
    markPlayerUnsold: (playerId, reason) => {
      set((state) => {
        // Create unsold player object with string date for Firebase compatibility
        const unsoldPlayer: UnsoldPlayer = { 
          playerId, 
          reason, 
          markedAt: new Date().toISOString() 
        };
        
        const newUnsoldPlayers = [...state.unsoldPlayers, unsoldPlayer];
        
        const updatedPlayers = state.players.map(player => 
          player.id === playerId 
            ? { ...player, isUnsold: true, isSold: false } 
            : player
        );
        
        // Update Firebase
        firebaseSet(ref(database, 'auction/unsoldPlayers'), newUnsoldPlayers);
        firebaseSet(ref(database, 'auction/players'), updatedPlayers);
        
        return {
          unsoldPlayers: newUnsoldPlayers,
          players: updatedPlayers
        };
      });
    },
    
    setUnsoldPlayers: (unsoldPlayers) => {
      set({ unsoldPlayers });
      firebaseSet(ref(database, 'auction/unsoldPlayers'), unsoldPlayers);
    },
    
    resetAuctionData: () => {
      set((state) => {
        // Reset sold/unsold flags on all players
        const resetPlayers = state.players.map(player => ({
          ...player,
          isSold: false,
          isUnsold: false,
          soldTo: undefined,
          soldAmount: undefined
        }));
        
        const emptyState = {
          soldPlayers: [],
          unsoldPlayers: [],
          players: resetPlayers
        };
        
        // Update Firebase
        firebaseSet(ref(database, 'auction/soldPlayers'), []);
        firebaseSet(ref(database, 'auction/unsoldPlayers'), []);
        firebaseSet(ref(database, 'auction/players'), resetPlayers);
        
        return emptyState;
      });
    },

    hasPersistedData: () => {
      return get().players.length > 0;
    }
  };
});