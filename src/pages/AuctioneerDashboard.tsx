import { useState, useEffect } from 'react';
import { Category, Role, Player } from '../types';
import { useAuctionStore } from '../store/auction';
import { PlayerCard } from '../components/PlayerCard';
import { FilterPanel } from '../components/FilterPanel';
import { AuctionControls } from '../components/AuctionControls';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Grid, List, Upload, Download, XCircle, 
  ArrowLeft, ChevronLeft, ChevronRight,
  DollarSign, Users, Award, TrendingUp, Filter, Gavel,
  RefreshCw, Check, X
} from 'lucide-react';
import { CSVUpload } from '../components/CSVUpload';
// import { UnsoldPlayersUpload } from '../components/UnsoldPlayersUpload';
import { convertSoldPlayersToCSV, convertUnsoldPlayersToCSV, downloadCSV } from '../lib/csvExport';
import { parsePlayersCSV } from '../lib/csvImport';

export default function AuctioneerDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnsold, setShowUnsold] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showingRestoreNotification, setShowingRestoreNotification] = useState(false);
  const [showingDefaultDataNotification, setShowingDefaultDataNotification] = useState(false);

  const {
    players,
    currentPlayer,
    isAuctionMode,
    setCurrentPlayer,
    setAuctionMode,
    markPlayerSold,
    markPlayerUnsold,
    soldPlayers,
    unsoldPlayers,
    resetAuctionData,
    setPlayers
  } = useAuctionStore();

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        // Only load default data if no players exist yet
        if (players.length === 0) {
          // Load directly from the local file in the project root
          const response = await fetch('/Test_Cleaned_Updated.csv');
          
          if (!response.ok) {
            console.error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
            throw new Error('Failed to load player data');
          }
          
          const csvText = await response.text();
          const csvFile = new File([csvText], 'Test_Cleaned_Updated.csv', { type: 'text/csv' });
          const importedPlayers = await parsePlayersCSV(csvFile);
          setPlayers(importedPlayers);
          
          // Show notification
          setShowingDefaultDataNotification(true);
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setShowingDefaultDataNotification(false);
          }, 5000);
        } else {
          // If players exist, show restore notification
          setShowingRestoreNotification(true);
          // Hide notification after 5 seconds
          setTimeout(() => {
            setShowingRestoreNotification(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Failed to load default player data:', error);
      } finally {
        // Finish loading regardless of outcome
        setPageLoaded(true);
        setIsLoading(false);
      }
    };

    // Delay for better user experience
    const timer = setTimeout(() => {
      loadDefaultData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [players.length, setPlayers]);

  const handleClearData = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = () => {
    resetAuctionData();
    setShowConfirmReset(false);
  };

  const filteredPlayers = players.filter((player) => {
    // Filter by sold/unsold status first
    if (showUnsold) {
      const isMarkedUnsold = unsoldPlayers.some(p => p.playerId === player.id);
      if (!isMarkedUnsold) return false;
    } else {
      // For normal view, exclude unsold players
      const isMarkedUnsold = unsoldPlayers.some(p => p.playerId === player.id);
      if (isMarkedUnsold) return false;
    }
    
    // Then apply other filters
    const matchesCategory = !selectedCategory || player.category === selectedCategory;
    const matchesRole = !selectedRole || player.role === selectedRole;
    const matchesSearch = !searchQuery || 
      player.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesRole && matchesSearch;
  });

  const handleStartAuction = () => {
    if (filteredPlayers.length > 0) {
      setCurrentPlayer(filteredPlayers[0]);
      setAuctionMode(true);
    }
  };

  const handleNextPlayer = () => {
    const currentIndex = filteredPlayers.findIndex(p => p.id === currentPlayer?.id);
    if (currentIndex < filteredPlayers.length - 1) {
      setCurrentPlayer(filteredPlayers[currentIndex + 1]);
    }
  };

  const handlePreviousPlayer = () => {
    const currentIndex = filteredPlayers.findIndex(p => p.id === currentPlayer?.id);
    if (currentIndex > 0) {
      setCurrentPlayer(filteredPlayers[currentIndex - 1]);
    }
  };

  const handlePlayerSold = (teamId: string, amount: number) => {
    if (currentPlayer) {
      markPlayerSold(currentPlayer.id, teamId, amount);
      handleNextPlayer();
    }
  };
  
  const handlePlayerUnsold = (reason: string) => {
    if (currentPlayer) {
      markPlayerUnsold(currentPlayer.id, reason);
      handleNextPlayer();
    }
  };

  const handleExportSoldPlayers = () => {
    // Get detailed sold player information
    const soldPlayersData = soldPlayers
      .map(({ playerId, teamId, amount, soldAt }) => {
        const player = players.find(p => p.id === playerId);
        if (!player) {
          console.error(`Player with ID ${playerId} not found`);
          return null;
        }
        return { player, teamId, amount, soldAt };
      })
      .filter((item): item is { player: Player; teamId: string; amount: number; soldAt: Date } => 
        item !== null
      );

    // Convert to CSV format
    const csvContent = convertSoldPlayersToCSV(soldPlayersData);
    
    // Generate filename with date/time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `sold_players_${dateStr}.csv`;
    
    // Download the CSV
    downloadCSV(csvContent, filename);
  };
  
  const handleExportUnsoldPlayers = () => {
    // Get detailed unsold player information
    const unsoldPlayersData = unsoldPlayers
      .map(({ playerId, reason, markedAt }) => {
        const player = players.find(p => p.id === playerId);
        if (!player) {
          console.error(`Player with ID ${playerId} not found`);
          return null;
        }
        return { player, reason, markedAt };
      })
      .filter((item): item is { player: Player; reason: string; markedAt: Date } => 
        item !== null
      );

    // Convert to CSV format
    const csvContent = convertUnsoldPlayersToCSV(unsoldPlayersData);
    
    // Generate filename with date/time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `unsold_players_${dateStr}.csv`;
    
    // Download the CSV
    downloadCSV(csvContent, filename);
  };

  const handleBackToList = () => {
    setAuctionMode(false);
  };

  // Calculate total auction value
  const totalAuctionValue = soldPlayers.reduce((sum, player) => sum + player.amount, 0);
  
  // Get top 3 most expensive players
  const topPlayers = [...soldPlayers]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(sold => {
      const player = players.find(p => p.id === sold.playerId);
      return player ? { ...sold, name: player.name } : null;
    })
    .filter(Boolean);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    // Format in crores (1 crore = 10 million)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-ipl-blue-900 to-gray-900">
      {/* Background cricket pattern overlay */}
      <div className="absolute inset-0 bg-cricket-pattern opacity-5 bg-cover bg-fixed pointer-events-none"></div>
      
      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block p-4 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Loading auction data...</p>
          </div>
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8 py-6 max-w-8xl mx-auto">
          {showingRestoreNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-green-900/50 text-green-300 p-3 rounded-lg border border-green-700/50 flex items-center"
            >
              <div className="p-1 bg-green-800/50 rounded-full mr-2">
                <Check size={16} />
              </div>
              <p>Restored auction data from your last session</p>
              <button 
                className="ml-auto text-green-400 hover:text-white"
                onClick={() => setShowingRestoreNotification(false)}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
          
          {showingDefaultDataNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-blue-900/50 text-blue-300 p-3 rounded-lg border border-blue-700/50 flex items-center"
            >
              <div className="p-1 bg-blue-800/50 rounded-full mr-2">
                <Check size={16} />
              </div>
              <p>Loaded {players.length} players from Test_Cleaned_Updated.csv</p>
              <button 
                className="ml-auto text-blue-400 hover:text-white"
                onClick={() => setShowingDefaultDataNotification(false)}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
          
          {!isAuctionMode && (
            <>
              {/* Dashboard Header with Stats */}
              <div className="mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-10"
                >
                  <div className="inline-block p-2 px-4 rounded-xl bg-gradient-to-r from-indigo-800/50 to-purple-900/50 backdrop-blur shadow-lg border border-indigo-600/30 mb-4">
                    <Gavel className="inline-block mr-2 text-ipl-gold-400" size={28} />
                    <h1 className="text-3xl sm:text-4xl font-bold text-white inline-block">
                      IPL Auction Dashboard
                    </h1>
                  </div>
                  <p className="text-blue-300/80 max-w-2xl mx-auto">
                    Manage player auctions, track bids, and export results for the Indian Premier League
                  </p>
                </motion.div>

                {/* Auction Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-xl shadow-lg border border-blue-700/30 backdrop-blur"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                        <Users className="text-blue-300" size={20} />
                      </div>
                      <p className="text-blue-300 font-medium">Total Players</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{players.length}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-xl shadow-lg border border-green-700/30 backdrop-blur"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                        <DollarSign className="text-green-300" size={20} />
                      </div>
                      <p className="text-green-300 font-medium">Players Sold</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{soldPlayers.length}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-gradient-to-br from-red-900/50 to-red-800/30 p-4 rounded-xl shadow-lg border border-red-700/30 backdrop-blur"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                        <XCircle className="text-red-300" size={20} />
                      </div>
                      <p className="text-red-300 font-medium">Players Unsold</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{unsoldPlayers.length}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-gradient-to-br from-amber-900/50 to-amber-800/30 p-4 rounded-xl shadow-lg border border-amber-700/30 backdrop-blur"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-amber-500/20 rounded-lg mr-3">
                        <TrendingUp className="text-amber-300" size={20} />
                      </div>
                      <p className="text-amber-300 font-medium">Total Auction Value</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalAuctionValue)}</p>
                  </motion.div>
                </div>

                {/* Top Buys Section */}
                {topPlayers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-8 bg-gradient-to-br from-ipl-purple-900/40 to-ipl-blue-900/30 rounded-xl p-4 border border-ipl-purple-700/30 backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-ipl-gold-300 mb-3 flex items-center">
                      <Award className="mr-2" size={20} />
                      Top Buys
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topPlayers.map((player, index) => (
                        <div 
                          key={player?.playerId} 
                          className="flex items-center bg-gradient-to-r from-gray-900/70 to-gray-800/50 p-3 rounded-lg border border-gray-700/50"
                        >
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                            index === 0 ? 'bg-gold-gradient' : 
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' : 
                            'bg-gradient-to-r from-amber-700 to-amber-800'
                          } text-white font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold text-white">{player?.name}</p>
                            <p className="text-sm text-blue-300">{formatCurrency(player?.amount || 0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`transition-all duration-300 ${
                      showFilters 
                        ? 'bg-ipl-blue-700/50 text-white border-ipl-blue-500' 
                        : 'bg-ipl-blue-900/30 hover:bg-ipl-blue-800/50 text-ipl-blue-300'
                    }`}
                  >
                    <Filter className="mr-1" size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnsold(!showUnsold)}
                    className={`transition-all duration-300 ${
                      showUnsold 
                        ? 'bg-red-700/50 text-white border-red-500' 
                        : 'bg-red-900/30 hover:bg-red-800/50 text-red-300'
                    }`}
                  >
                    <XCircle className="mr-1" size={16} />
                    {showUnsold ? 'Showing Unsold' : 'Show Unsold'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="bg-ipl-blue-900/30 hover:bg-ipl-blue-800/50 text-ipl-blue-300"
                  >
                    {viewMode === 'grid' ? <List className="mr-1" size={16} /> : <Grid className="mr-1" size={16} />}
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpload(!showUpload)}
                    className="bg-ipl-purple-900/30 hover:bg-ipl-purple-800/50 text-ipl-purple-300"
                  >
                    <Upload className="mr-1" size={16} />
                    {showUpload ? 'Hide Import' : 'Import Players'}
                  </Button>

                  {/* New Clear Auction Data button */}
                  {showConfirmReset ? (
                    <div className="bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                      <span className="text-white text-xs">Confirm reset?</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 h-auto"
                        onClick={() => setShowConfirmReset(false)}
                      >
                        No
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-red-700 hover:bg-red-600 text-white px-2 py-1 h-auto"
                        onClick={confirmReset}
                      >
                        Yes
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearData}
                      className="bg-red-900/30 hover:bg-red-800/50 text-red-300"
                    >
                      <RefreshCw className="mr-1" size={16} />
                      Clear Data
                    </Button>
                  )}
                  
                  {soldPlayers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportSoldPlayers}
                      className="bg-green-900/30 hover:bg-green-800/50 text-green-300"
                    >
                      <Download className="mr-1" size={16} />
                      Export Sold
                    </Button>
                  )}
                  
                  {unsoldPlayers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportUnsoldPlayers}
                      className="bg-red-900/30 hover:bg-red-800/50 text-red-300"
                    >
                      <Download className="mr-1" size={16} />
                      Export Unsold
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleStartAuction}
                    disabled={filteredPlayers.length === 0}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg transition-all duration-200"
                  >
                    <Play className="mr-2" size={16} />
                    Start Auction
                  </Button>
                </div>
              </div>

              {/* Import Players Panel */}
              <AnimatePresence>
                {showUpload && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-4 border border-gray-700/50 backdrop-blur">
                      <CSVUpload />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-4 border border-gray-700/50 backdrop-blur">
                      <FilterPanel
                        selectedCategory={selectedCategory}
                        selectedRole={selectedRole}
                        searchQuery={searchQuery}
                        onCategoryChange={setSelectedCategory}
                        onRoleChange={setSelectedRole}
                        onSearchChange={setSearchQuery}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Players Grid/List */}
              <motion.div
                initial={pageLoaded ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">
                  {showUnsold 
                    ? `Unsold Players (${filteredPlayers.length})` 
                    : `Available Players (${filteredPlayers.length})`
                  }
                </h2>

                {filteredPlayers.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/30">
                    <p className="text-gray-400 text-lg mb-2">No players found</p>
                    <p className="text-gray-500">Try adjusting your filters or importing players.</p>
                  </div>
                ) : (
                  // Add a key to this container to force re-render when filters change
                  <div 
                    className={`grid gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                        : 'grid-cols-1'
                    }`}
                    key={`${showUnsold}-${selectedCategory || 'all'}-${selectedRole || 'all'}-${searchQuery || 'none'}`}
                  >
                    {/* Remove AnimatePresence wrapper that's causing problems */}
                    {filteredPlayers.map((player) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // Remove delay in animation to make cards appear immediately
                        transition={{ duration: 0.2 }}
                      >
                        <PlayerCard 
                          player={player} 
                          onClick={() => {
                            setCurrentPlayer(player);
                            setAuctionMode(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* Auction Mode */}
          {isAuctionMode && currentPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mb-6">
                <Button 
                  variant="outline" 
                  onClick={handleBackToList}
                  className="bg-ipl-blue-900/30 hover:bg-ipl-blue-800/50 text-ipl-blue-300 border-ipl-blue-700/50"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Players
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPlayer}
                    disabled={filteredPlayers.findIndex(p => p.id === currentPlayer?.id) <= 0}
                    className="bg-ipl-blue-900/30 hover:bg-ipl-blue-800/50 text-ipl-blue-300 border-ipl-blue-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleNextPlayer}
                    disabled={filteredPlayers.findIndex(p => p.id === currentPlayer?.id) >= filteredPlayers.length - 1}
                    className="bg-ipl-blue-900/30 hover:bg-ipl-blue-800/50 text-ipl-blue-300 border-ipl-blue-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="ml-1" size={16} />
                  </Button>
                </div>
              </div>
            
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Player Card */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PlayerCard 
                      player={currentPlayer} 
                      highlight={true}
                    />
                  </motion.div>
                </div>
                
                {/* Right Column - Auction Controls */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AuctionControls 
                      onPlayerSold={handlePlayerSold} 
                      onPlayerUnsold={handlePlayerUnsold}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}