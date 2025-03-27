import * as React from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import { useAuctionStore } from './store/auction';
import { useTeamStore } from './store/team';
import { parsePlayersCSV } from './lib/csvImport';
import Login from './pages/Login';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import { CSVUpload } from './components/CSVUpload';
import { Button } from './components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Analytics } from "@vercel/analytics/react";
import { fetchPlayers, fetchAuctionData, resetAuctionData as apiResetAuction, fetchTeams } from './services/api';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const user = useAuthStore((state) => state.user);
  const setPlayers = useAuctionStore((state) => state.setPlayers);
  const setSoldPlayers = useAuctionStore((state) => state.setSoldPlayers);
  const setUnsoldPlayers = useAuctionStore((state) => state.setUnsoldPlayers);
  const resetAuctionData = useAuctionStore((state) => state.resetAuctionData);
  const setTeams = useTeamStore(state => state.setTeams);
  const [csvImported, setCsvImported] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // First check if we already have players from persisted storage
        const existingPlayers = useAuctionStore.getState().players;
        let loadedSuccessfully = false;
        
        // Try to fetch data from API first
        try {
          console.log("Trying to load players from API...");
          const apiPlayers = await fetchPlayers();
          
          if (apiPlayers && apiPlayers.length > 0) {
            setPlayers(apiPlayers);
            loadedSuccessfully = true;
            console.log(`Loaded ${apiPlayers.length} players from API`);
          
            // Only load auction data and teams if players loaded successfully
            try {
              console.log("Loading auction data...");
              const auctionData = await fetchAuctionData();
              if (auctionData) {
                setSoldPlayers(auctionData.soldPlayers || []);
                setUnsoldPlayers(auctionData.unsoldPlayers || []);
              }
            } catch (auctionError) {
              console.error("Failed to load auction data:", auctionError);
            }
            
            try {
              console.log("Loading teams data...");
              const teamsData = await fetchTeams();
              if (teamsData && Object.keys(teamsData).length > 0) {
                setTeams(teamsData);
              }
            } catch (teamsError) {
              console.error("Failed to load teams data:", teamsError);
            }
          } else if (existingPlayers.length > 0) {
            console.log(`Using ${existingPlayers.length} players from previous session`);
            loadedSuccessfully = true;
          }
        } catch (apiError) {
          console.warn('Could not load from API:', apiError);
        }
        
        // If API failed and no existing players, try CSV or default data
        if (!loadedSuccessfully && existingPlayers.length === 0) {
          try {
            console.log("Trying to load players from CSV file...");
            // Important: Use absolute path for CSV in production
            const csvPath = '/Test_Cleaned_Updated.csv';
            console.log(`Fetching CSV from ${csvPath}`);
            
            const response = await fetch(csvPath, {
              cache: 'no-store', // Prevent caching
              headers: { 'Accept': 'text/csv,text/plain' }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
            }
            
            const csvText = await response.text();
            console.log("CSV content length:", csvText.length);
            console.log("CSV first 100 chars:", csvText.substring(0, 100));
            
            if (csvText.includes('<!doctype html>') || csvText.includes('<html')) {
              throw new Error('Received HTML instead of CSV data');
            }
            
            const csvFile = new File([csvText], 'Test_Cleaned_Updated.csv', { type: 'text/csv' });
            const importedPlayers = await parsePlayersCSV(csvFile);
            
            if (importedPlayers && importedPlayers.length > 0) {
              setPlayers(importedPlayers);
              loadedSuccessfully = true;
              console.log(`Loaded ${importedPlayers.length} players from CSV file`);
            } else {
              throw new Error('CSV parsing produced no players');
            }
          } catch (csvError) {
            console.error('Error loading from CSV:', csvError);
            
            // Last resort: load hardcoded sample data
            console.log("Loading hardcoded sample data...");
            const defaultPlayers = [
              {
                id: '1',
                name: 'Virat Kohli',
                role: 'Batsman',
                rating: 9.8,
                basePrice: 20000000,
                category: 'A',
              },
              {
                id: '2',
                name: 'Rohit Sharma',
                role: 'Batsman',
                rating: 9.7,
                basePrice: 20000000,
                category: 'A',
              },
              {
                id: '3',
                name: 'Jasprit Bumrah',
                role: 'Bowler',
                rating: 9.5,
                basePrice: 20000000,
                category: 'A',
              },
              {
                id: '4',
                name: 'MS Dhoni',
                role: 'Wicket-keeper',
                rating: 9.0,
                basePrice: 20000000,
                category: 'A',
              },
              {
                id: '5',
                name: 'Ravindra Jadeja',
                role: 'All-rounder',
                rating: 8.9,
                basePrice: 20000000,
                category: 'A',
              }
            ];
            
            setPlayers(defaultPlayers);
            setCsvImported(true);
            console.log(`Loaded ${defaultPlayers.length} players from hardcoded data`);
          }
        }
      } catch (error) {
        console.error('Error in data loading process:', error);
        // Don't set empty array, keep whatever might be in the store
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [setPlayers, setSoldPlayers, setUnsoldPlayers, setTeams]);

  const handleClearData = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = async () => {
    try {
      // First try to reset data on the API server
      await apiResetAuction();
      console.log("Reset auction data on API server");
    } catch (error) {
      console.warn("Failed to reset data on API server, falling back to local reset", error);
    }
    
    // Always reset local data
    resetAuctionData();
    setShowConfirmReset(false);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-900">
          <Header />
          <main className="flex-grow">
            <div className="flex-grow">
              {isLoading ? (
                <div className="h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block p-4 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-lg">Loading auction data...</p>
                  </div>
                </div>
              ) : (
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/auctioneer"
                    element={
                      <ProtectedRoute>
                        <>
                          <div className="container mx-auto pt-4">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                              <div className="flex-grow">
                                <CSVUpload onImportSuccess={() => setCsvImported(true)} />
                              </div>
                              <div className="flex justify-end">
                                {showConfirmReset ? (
                                  <div className="bg-gray-800 p-4 rounded-lg flex flex-col gap-2">
                                    <p className="text-white text-sm">This will clear all sold and unsold player data. Continue?</p>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setShowConfirmReset(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="bg-red-700 hover:bg-red-800"
                                        onClick={confirmReset}
                                      >
                                        Confirm Reset
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={handleClearData}
                                    className="text-red-400 hover:text-red-300 hover:border-red-500"
                                  >
                                    <RefreshCw className="mr-2" size={16} />
                                    Clear Auction Data
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <AuctioneerDashboard />
                        </>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <ProtectedRoute>
                        <TeamDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/" 
                    element={user ? (
                      user.role === 'auctioneer' ? (
                        <Navigate to="/auctioneer" replace />
                      ) : (
                        <Navigate to="/team" replace />
                      )
                    ) : (
                      <Navigate to="/login" replace />
                    )} 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </div>
          </main>
          <Footer />
          <Analytics />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;