import { create } from 'zustand';
import { Player } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';
import { socket, broadcastAuctionUpdate } from '../lib/socket';

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
  _fromNetwork?: boolean; // Add this property to fix TypeScript errors
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
    (set, get) => {
      // Initialize socket listener for incoming updates
      socket.on('auction_update', (data) => {
        // Apply received updates to store, but prevent infinite loops
        // by setting a flag to indicate this update came from the network
        set({ ...data, _fromNetwork: true });
      });

      return {
        players: [],
        currentPlayer: null,
        isAuctionMode: false,
        soldPlayers: [],
        unsoldPlayers: [],
        _fromNetwork: false, // Flag to prevent broadcast loops
        
        setPlayers: (players) => {
          const newState = { players };
          set(newState);
          // Only broadcast if this wasn't triggered by a network update
          if (!get()._fromNetwork) {
            broadcastAuctionUpdate(newState);
          }
          // Reset the flag
          if (get()._fromNetwork) set({ _fromNetwork: false });
        },
        
        setCurrentPlayer: (player) => {
          const newState = { currentPlayer: player };
          set(newState);
          // Don't sync currentPlayer - it's UI state
        },
        
        setAuctionMode: (isActive) => {
          const newState = { isAuctionMode: isActive };
          set(newState);
          // Don't sync isAuctionMode - it's UI state
        },
        
        markPlayerSold: (playerId, teamId, amount) => {
          const state = get();
          
          // Don't do anything if this player is already marked as sold
          const existingSold = state.soldPlayers.find(p => p.playerId === playerId);
          if (existingSold) {
            return;
          }
          
          // Create sold player record
          const soldPlayer = {
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
          
          const newState = { 
            soldPlayers: [...state.soldPlayers, soldPlayer],
            unsoldPlayers: updatedUnsoldPlayers,
            players: updatedPlayers
          };
          
          set(newState);
          
          // Only broadcast if this wasn't triggered by a network update
          if (!get()._fromNetwork) {
            broadcastAuctionUpdate({
              action: 'MARK_SOLD',
              playerId,
              teamId,
              amount,
              soldAt: new Date()
            });
          }
          // Reset the flag
          if (get()._fromNetwork) set({ _fromNetwork: false });
        },
        
        markPlayerUnsold: (playerId, reason) => {
          const state = get();
          // Check if player is already in unsoldPlayers to prevent duplicates
          const playerAlreadyUnsold = state.unsoldPlayers.some(p => p.playerId === playerId);
          
          // Create unsold player record
          const unsoldPlayer = {
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
          
          const newState = { 
            unsoldPlayers: playerAlreadyUnsold 
              ? state.unsoldPlayers
              : [...state.unsoldPlayers, unsoldPlayer],
            soldPlayers: updatedSoldPlayers,
            players: updatedPlayers
          };
          
          set(newState);
          
          // Only broadcast if this wasn't triggered by a network update
          if (!get()._fromNetwork) {
            broadcastAuctionUpdate(newState);
          }
          // Reset the flag
          if (get()._fromNetwork) set({ _fromNetwork: false });
        },
        
        // Add the missing setUnsoldPlayers implementation
        setUnsoldPlayers: (unsoldPlayers) => {
          const newState = { unsoldPlayers };
          set(newState);
          
          // Only broadcast if this wasn't triggered by a network update
          if (!get()._fromNetwork) {
            broadcastAuctionUpdate(newState);
          }
          // Reset the flag
          if (get()._fromNetwork) set({ _fromNetwork: false });
        },
        
        resetAuctionData: () => {
          const state = get();
          // Reset sold/unsold flags on all players
          const resetPlayers = state.players.map(player => ({
            ...player,
            isSold: false,
            isUnsold: false,
            soldTo: undefined,
            soldAmount: undefined
          }));
          
          const newState = {
            soldPlayers: [],
            unsoldPlayers: [],
            players: resetPlayers
          };
          
          set(newState);
          
          // Only broadcast if this wasn't triggered by a network update
          if (!get()._fromNetwork) {
            broadcastAuctionUpdate(newState);
          }
          // Reset the flag
          if (get()._fromNetwork) set({ _fromNetwork: false });
        },
      };
    },
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

// Make sure to place this code outside of your store creation
// Add a socket event listener that updates the store
socket.on('auction_update', (data) => {
  console.log('Received auction update from server:', data);
  
  // Get current state
  const state = useAuctionStore.getState();
  
  // Flag to prevent broadcast loops
  state._fromNetwork = true;
  
  // Apply updates based on what's in the data
  if (data.players) {
    state.setPlayers(data.players);
  }
  
  if (data.soldPlayers || data.unsoldPlayers) {
    // Handle sold/unsold player updates
    if (data.soldPlayers) {
      data.soldPlayers.forEach((soldPlayer: any) => {
        // Find the corresponding player and mark as sold
        state.markPlayerSold(soldPlayer.playerId, soldPlayer.teamId, soldPlayer.amount);
      });
    }
    
    if (data.unsoldPlayers) {
      data.unsoldPlayers.forEach((unsoldPlayer: any) => {
        // Mark each player as unsold
        state.markPlayerUnsold(unsoldPlayer.playerId, unsoldPlayer.reason || 'No bids');
      });
    }
  }
  
  // If this is a single player action (sold/unsold)
  if (data.action === 'MARK_SOLD' && data.playerId) {
    state.markPlayerSold(data.playerId, data.teamId, data.amount);
  }
  
  if (data.action === 'MARK_UNSOLD' && data.playerId) {
    state.markPlayerUnsold(data.playerId, data.reason || 'No bids');
  }
  
  // Reset network flag after processing
  state._fromNetwork = false;
});