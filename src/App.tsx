import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import { useAuctionStore } from './store/auction';
import { parsePlayersCSV } from './lib/csvImport';
import Login from './pages/Login';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import { CSVUpload } from './components/CSVUpload';
import { Button } from './components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const user = useAuthStore((state) => state.user);
  const setPlayers = useAuctionStore((state) => state.setPlayers);
  const resetAuctionData = useAuctionStore((state) => state.resetAuctionData);
  const [csvImported, setCsvImported] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        // Check if we already have players from persisted storage
        const existingPlayers = useAuctionStore.getState().players;
        
        // Only load default data if no persisted players exist
        if (existingPlayers.length === 0) {
          try {
            // First try loading from public folder
            const response = await fetch('/Test_Cleaned_Updated.csv');
            
            if (!response.ok) {
              throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
            }
            
            const csvText = await response.text();
            
            // Debug the CSV content to see what we're getting
            console.log("CSV content length:", csvText.length);
            console.log("CSV first 100 chars:", csvText.substring(0, 100));
            
            // Create a file object from the CSV text
            const csvFile = new File([csvText], 'Test_Cleaned_Updated.csv', { type: 'text/csv' });
            
            try {
              // Add extra error handling around the parsing step
              const importedPlayers = await parsePlayersCSV(csvFile);
              
              if (importedPlayers && importedPlayers.length > 0) {
                setPlayers(importedPlayers);
                setCsvImported(true);
                console.log(`Loaded ${importedPlayers.length} players from default CSV file`);
              } else {
                console.error("parsePlayersCSV returned empty array or null");
                throw new Error('CSV file parsed but no players found');
              }
            } catch (parseError) {
              console.error('Error parsing CSV content:', parseError);
              throw parseError; // Re-throw to be caught by the outer catch
            }
          } catch (csvError) {
            console.error('Error loading from CSV file:', csvError);
            
            // Load hardcoded sample data for reliability
            // This ensures the app works even if CSV parsing completely fails
            const defaultPlayers = [
              {
                id: '1',
                name: 'Virat Kohli',
                role: 'Batsman',
                rating: 9.8,
                basePrice: 20000000,
                category: 'A',
                imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/164.png'
              },
              {
                id: '2',
                name: 'Rohit Sharma',
                role: 'Batsman',
                rating: 9.7,
                basePrice: 20000000,
                category: 'A',
                imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/107.png'
              },
              {
                id: '3',
                name: 'Jasprit Bumrah',
                role: 'Bowler',
                rating: 9.5,
                basePrice: 20000000,
                category: 'A',
                imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/1124.png'
              },
              {
                id: '4',
                name: 'MS Dhoni',
                role: 'Wicket-keeper',
                rating: 9.0,
                basePrice: 20000000,
                category: 'A',
                imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/28.png'
              },
              {
                id: '5',
                name: 'Ravindra Jadeja',
                role: 'All-rounder',
                rating: 8.9,
                basePrice: 20000000,
                category: 'A',
                imageUrl: 'https://resources.pulse.icc-cricket.com/players/284/9.png'
              }
            ];
            
            setPlayers(defaultPlayers);
            setCsvImported(true);
            console.log(`Loaded ${defaultPlayers.length} players from hardcoded data`);
          }
        } else {
          console.log(`Using ${existingPlayers.length} players from previous session`);
        }
      } catch (error) {
        console.error('Error loading player data:', error);
        // If all loading methods fail, initialize with empty array
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDefaultData();
  }, [setPlayers]);

  const handleClearData = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
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
                    <p className="text-white text-lg">Loading player data...</p>
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
                  {/* Important: Add a more specific redirect behavior */}
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
                  {/* Catch all other routes */}
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