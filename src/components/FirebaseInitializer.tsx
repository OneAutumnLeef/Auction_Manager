import { useEffect } from 'react';
import { ref, get as firebaseGet, set as firebaseSet } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuctionStore } from '../store/auction';
import { useTeamStore } from '../store/team';

export const FirebaseInitializer = () => {
  const { players, soldPlayers, unsoldPlayers } = useAuctionStore(state => ({
    players: state.players,
    soldPlayers: state.soldPlayers,
    unsoldPlayers: state.unsoldPlayers
  }));
  
  const { teams } = useTeamStore(state => ({
    teams: state.teams
  }));

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Check if data exists in Firebase
        const auctionSnapshot = await firebaseGet(ref(database, 'auction'));
        
        // If Firebase is empty but we have local data, initialize Firebase
        if (!auctionSnapshot.exists() && Array.isArray(players) && players.length > 0) {
          // Initialize Firebase with current state
          await set(ref(database, 'auction'), {
            players,
            soldPlayers: soldPlayers || [],
            unsoldPlayers: unsoldPlayers || []
          });
          console.log('Initialized auction data in Firebase');
        }

        // Do the same for teams
        const teamsSnapshot = await firebaseGet(ref(database, 'teams'));
        if (!teamsSnapshot.exists() && Array.isArray(teams) && teams.length > 0) {
          await set(ref(database, 'teams'), teams);
          console.log('Initialized team data in Firebase');
        }
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
      }
    };

    initFirebase();
  }, [players, soldPlayers, unsoldPlayers, teams]);

  // Add this temporarily to FirebaseInitializer.tsx for testing
  useEffect(() => {
    console.log("Testing Firebase connection...");
    const testRef = ref(database, "test");
    firebaseSet(testRef, { timestamp: new Date().toISOString() })
      .then(() => console.log("Firebase write successful!"))
      .catch(error => console.error("Firebase write failed:", error));
  }, []);

  return null; // No UI needed for this component
};