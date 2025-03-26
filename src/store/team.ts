import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
  id: string;
  name: string;
  budget: number;
  players: string[]; // Player IDs
  logo?: string;
  color: string;
  shortName: string;
}

interface TeamState {
  teams: Record<string, Team>;
  currentTeam: string | null;
}

interface TeamActions {
  setTeams: (teams: Record<string, Team>) => void;
  setCurrentTeam: (teamId: string | null) => void;
  addPlayerToTeam: (teamId: string, playerId: string, cost: number) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
  updateTeamBudget: (teamId: string, newBudget: number) => void;
  resetAllTeamBudgets: (newBudget?: number) => void; // Add new function
}

type TeamStore = TeamState & TeamActions;

// Centralized team data
const defaultTeams: Record<string, Team> = {
  'team1': { id: 'team1', name: 'Chennai Super Kings', shortName: 'CSK', budget: 1000000000, players: [], color: '#F9CD05' }, 
  'team2': { id: 'team2', name: 'Delhi Capitals', shortName: 'DC', budget: 1000000000, players: [], color: '#0078BC' },
  'team3': { id: 'team3', name: 'Punjab Kings', shortName: 'PBKS', budget: 1000000000, players: [], color: '#ED1B24' },
  'team4': { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', budget: 1000000000, players: [], color: '#3A225D' },
  'team5': { id: 'team5', name: 'Mumbai Indians', shortName: 'MI', budget: 1000000000, players: [], color: '#004BA0' },
  'team6': { id: 'team6', name: 'Rajasthan Royals', shortName: 'RR', budget: 1000000000, players: [], color: '#2D4D9D' },
  'team7': { id: 'team7', name: 'Royal Challengers Bangalore', shortName: 'RCB', budget: 1000000000, players: [], color: '#D1171C' },
  'team8': { id: 'team8', name: 'Sunrisers Hyderabad', shortName: 'SRH', budget: 1000000000, players: [], color: '#F26522' },
  'team9': { id: 'team9', name: 'Gujarat Titans', shortName: 'GT', budget: 1000000000, players: [], color: '#1c2660' },
  'team10': { id: 'team10', name: 'Lucknow Super Giants', shortName: 'LSG', budget: 1000000000, players: [], color: '#A7D5F6' },
  'team11': { id: 'team11', name: 'Deccan Chargers', shortName: 'DCH', budget: 1000000000, players: [], color: '#3268A5' },
  'team12': { id: 'team12', name: 'Pune Warriors India', shortName: 'PWI', budget: 1000000000, players: [], color: '#2F9BE3' },
  'team13': { id: 'team13', name: 'Kochi Tuskers Kerala', shortName: 'KTK', budget: 1000000000, players: [], color: '#FF6600' },
  'team14': { id: 'team14', name: 'SriCity Blasters', shortName: 'SCB', budget: 100000000, players: [], color: '#E74C3C' },
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      teams: defaultTeams,
      currentTeam: null,
      
      setTeams: (teams) => set({ teams }),
      setCurrentTeam: (teamId) => set({ currentTeam: teamId }),
      
      addPlayerToTeam: (teamId, playerId, cost) => set((state) => {
        const team = state.teams[teamId];
        if (!team) return state;
        
        return { 
          teams: {
            ...state.teams,
            [teamId]: {
              ...team,
              budget: team.budget - cost,
              players: [...team.players, playerId]
            }
          }
        };
      }),
      
      removePlayerFromTeam: (teamId, playerId) => set((state) => {
        const team = state.teams[teamId];
        if (!team) return state;
        
        return { 
          teams: {
            ...state.teams,
            [teamId]: {
              ...team,
              players: team.players.filter(id => id !== playerId)
            }
          }
        };
      }),
      
      updateTeamBudget: (teamId, newBudget) => set((state) => {
        const team = state.teams[teamId];
        if (!team) return state;
        
        return { 
          teams: {
            ...state.teams,
            [teamId]: {
              ...team,
              budget: newBudget
            }
          }
        };
      }),
      
      // Add resetAllTeamBudgets function
      resetAllTeamBudgets: (newBudget) => set((state) => {
        const updatedTeams: Record<string, Team> = {};
        
        // For each team, reset the budget
        Object.keys(state.teams).forEach(teamId => {
          updatedTeams[teamId] = {
            ...state.teams[teamId],
            budget: newBudget !== undefined ? newBudget : defaultTeams[teamId].budget
          };
        });
        
        return { teams: updatedTeams };
      }),
    }),
    {
      name: 'team-storage',
    }
  )
);