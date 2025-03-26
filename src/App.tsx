import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth';
import { useAuctionStore } from './store/auction';
import { samplePlayers } from './data/players';
import Login from './pages/Login';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import { CSVUpload } from './components/CSVUpload';
import { Button } from './components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

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

  useEffect(() => {
    // Check if we already have players from persisted storage
    const existingPlayers = useAuctionStore.getState().players;
    
    // Only initialize with sample data if no persisted players AND no CSV imported
    if (existingPlayers.length === 0 && !csvImported) {
      setPlayers(samplePlayers);
    }
  }, [setPlayers, csvImported]);

  const handleClearData = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    resetAuctionData();
    setShowConfirmReset(false);
  };

  // Add a useEffect to clear any existing user data for testing
  // Comment this out or remove it once you're done testing
  useEffect(() => {
    // Uncomment the line below to force logout when testing
    // useAuthStore.getState().logout();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-900">
          <Header />
          <main className="flex-grow">
            <div className="flex-grow">
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
            </div>
          </main>
          {/* Footer will always be at the bottom */}
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;