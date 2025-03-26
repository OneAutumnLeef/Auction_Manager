import { useState } from 'react';
import { Category, Role } from '../types';
import { useAuctionStore } from '../store/auction';
import { useTeamStore } from '../store/team';
import { PlayerCard } from '../components/PlayerCard';
import { FilterPanel } from '../components/FilterPanel';
import { Grid, List, DollarSign, Wallet, TrendingUp, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth';

export default function TeamDashboard() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { players, soldPlayers } = useAuctionStore();
  const user = useAuthStore((state) => state.user);
  const { teams } = useTeamStore();

  // Format currency to crores (1 crore = 10 million)
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  // Get team info and calculate budget
  const teamInfo = user?.teamId ? teams[user.teamId] : null;
  const teamPurchases = soldPlayers.filter(sale => sale.teamId === user?.teamId);
  const totalSpent = teamPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const remainingBudget = teamInfo ? teamInfo.budget - totalSpent : 0;
  const budgetPercentage = teamInfo ? (remainingBudget / teamInfo.budget) * 100 : 0;

  const filteredPlayers = players.filter((player) => {
    const matchesCategory = !selectedCategory || player.category === selectedCategory;
    const matchesRole = !selectedRole || player.role === selectedRole;
    const matchesSearch = !searchQuery || 
      player.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRole && matchesSearch;
  });

  const teamPlayers = filteredPlayers.filter((player) => player.soldTo === user?.teamId);
  const availablePlayers = filteredPlayers.filter((player) => !player.soldTo);
  
  // Calculate total player rating
  const totalPlayerRating = teamPlayers.reduce((sum, player) => sum + (player.rating || 0), 0);

  return (
    <div className="p-8 bg-gray-900">
      {/* Budget Dashboard Section */}
      {teamInfo && (
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/40 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Wallet className="mr-2 text-amber-400" size={20} />
            {teamInfo.name} Budget
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Budget */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-lg p-3 border border-blue-800/30">
              <div className="flex items-center mb-1">
                <div className="p-1.5 bg-blue-500/20 rounded-md mr-2">
                  <DollarSign className="text-blue-300" size={16} />
                </div>
                <p className="text-blue-300 text-sm font-medium">Total Budget</p>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(teamInfo.budget)}</p>
            </div>
            
            {/* Spent */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg p-3 border border-purple-800/30">
              <div className="flex items-center mb-1">
                <div className="p-1.5 bg-purple-500/20 rounded-md mr-2">
                  <TrendingUp className="text-purple-300" size={16} />
                </div>
                <p className="text-purple-300 text-sm font-medium">Total Spent</p>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(totalSpent)}</p>
            </div>
            
            {/* Remaining */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-lg p-3 border border-green-800/30">
              <div className="flex items-center mb-1">
                <div className="p-1.5 bg-green-500/20 rounded-md mr-2">
                  <Wallet className="text-green-300" size={16} />
                </div>
                <p className="text-green-300 text-sm font-medium">Remaining Budget</p>
              </div>
              <p className="text-xl font-bold text-white">{formatCurrency(remainingBudget)}</p>
            </div>
            
            {/* New: Total Player Rating */}
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-lg p-3 border border-amber-800/30">
              <div className="flex items-center mb-1">
                <div className="p-1.5 bg-amber-500/20 rounded-md mr-2">
                  <Star className="text-amber-300" size={16} />
                </div>
                <p className="text-amber-300 text-sm font-medium">Total Player Rating</p>
              </div>
              <p className="text-xl font-bold text-white">{totalPlayerRating.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Budget Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Budget Utilization</span>
              <span className={`font-medium ${
                budgetPercentage < 25 ? 'text-red-400' : 
                budgetPercentage < 50 ? 'text-amber-400' : 'text-green-400'
              }`}>
                {Math.round(100 - budgetPercentage)}% Used
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  budgetPercentage < 25 ? 'bg-red-500' : 
                  budgetPercentage < 50 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Header */}
      <h1 className="text-3xl font-bold mb-6 text-white"> {/* Add text-white */}
        Team Dashboard
      </h1>

      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? <List /> : <Grid />}
        </Button>
      </div>

      <FilterPanel
        selectedCategory={selectedCategory}
        selectedRole={selectedRole}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onRoleChange={setSelectedRole}
        onSearchChange={setSearchQuery}
      />

      {teamPlayers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white"> {/* Add text-white */}
            Your Players ({teamPlayers.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white"> {/* Add text-white */}
          Available Players ({availablePlayers.length})
        </h2>
        {availablePlayers.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/30">
            <p className="text-gray-400">No available players found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availablePlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}