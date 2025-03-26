import { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/auction';
import { useTeamStore } from '../store/team'; // Import the actual team store
import { Gavel, XCircle, AlertCircle, ChevronUp, ChevronDown, DollarSign, Clock, Check, Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// Remove the Team interface and mock useTeamStore

interface AuctionControlsProps {
  onPlayerSold: (teamId: string, amount: number) => void;
  onPlayerUnsold?: (reason: string) => void;
}

export function AuctionControls({ onPlayerSold, onPlayerUnsold }: AuctionControlsProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidIncrement, setBidIncrement] = useState<number>(500000); // 5 lakhs default
  const [confirmUnsold, setConfirmUnsold] = useState<boolean>(false);
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [bidHistory, setBidHistory] = useState<{teamId: string, amount: number}[]>([]);
  
  const currentPlayer = useAuctionStore((state) => state.currentPlayer);
  const soldPlayers = useAuctionStore((state) => state.soldPlayers);
  const { teams } = useTeamStore(); // Use the actual team store
  const teamsArray = Object.values(teams); // Convert record to array for mapping

  useEffect(() => {
    // Reset bid amount and selected team when player changes
    if (currentPlayer) {
      setBidAmount(currentPlayer.basePrice.toString());
      setSelectedTeam('');
      setBidHistory([]);
      setConfirmUnsold(false);
    }
  }, [currentPlayer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning && countdownTimer !== null && countdownTimer > 0) {
      interval = setInterval(() => {
        setCountdownTimer(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (countdownTimer === 0) {
      setTimerRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [timerRunning, countdownTimer]);

  // Calculate remaining budget for a team
  const getRemainingBudget = (teamId: string) => {
    const team = teams[teamId]; // Access directly from the record
    if (!team) return 0;
    
    // Calculate spent budget (sum of all sold players to this team)
    const spentBudget = soldPlayers
      .filter(sold => sold.teamId === teamId)
      .reduce((total, sold) => total + sold.amount, 0);
    
    return team.budget - spentBudget;
  };

  const handleTeamSelect = (teamId: string) => {
    // Check if team can afford the bid
    const remainingBudget = getRemainingBudget(teamId);
    const bidValue = parseInt(bidAmount, 10);
    
    if (isNaN(bidValue) || remainingBudget < bidValue) {
      // Don't allow selection if team can't afford the bid
      return;
    }
    
    setSelectedTeam(teamId);
    
    // Record bid in history
    const amount = parseInt(bidAmount, 10);
    if (!isNaN(amount)) {
      setBidHistory([...bidHistory, { teamId, amount }]);
    }
    
    // Auto-increment bid
    const currentBid = parseInt(bidAmount, 10) || getBasePrice();
    setBidAmount(String(currentBid + bidIncrement));
  };

  const handleSold = () => {
    const amount = parseInt(bidAmount, 10);
    if (selectedTeam && !isNaN(amount) && amount > 0) {
      onPlayerSold(selectedTeam, amount);
      setSelectedTeam('');
      setBidAmount('');
      setCountdownTimer(null);
      setTimerRunning(false);
      setBidHistory([]);
    }
  };

  const handleUnsold = () => {
    if (confirmUnsold && onPlayerUnsold) {
      onPlayerUnsold("No bids received");
      setConfirmUnsold(false);
    } else {
      setConfirmUnsold(true);
    }
  };

  // Safe getter for base price
  const getBasePrice = (): number => {
    return currentPlayer?.basePrice || 0;
  };

  const handleIncrementBid = () => {
    const currentBid = parseInt(bidAmount, 10) || getBasePrice();
    setBidAmount(String(currentBid + bidIncrement));
  };

  const handleDecrementBid = () => {
    const currentBid = parseInt(bidAmount, 10) || getBasePrice();
    const newBid = Math.max(getBasePrice(), currentBid - bidIncrement);
    setBidAmount(String(newBid));
  };

  const startTimer = () => {
    setCountdownTimer(10); // 10 seconds countdown
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setCountdownTimer(10);
    setTimerRunning(false);
  };

  // Format amount to crores
  const formatAmountToCrores = (amount: number) => {
    return (amount / 10000000).toFixed(2);
  };

  // Get team by ID
  const getTeam = (teamId: string) => {
    return teams[teamId]; // Access directly from the record
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur">
      <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Gavel className="mr-2" size={24} />
          Player Auction
        </h2>
      </div>
      
      {currentPlayer && (
        <div className="p-5 space-y-5">
          {/* Player info summary */}
          <div className="flex flex-wrap justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div>
              <span className="text-gray-400 text-sm">Base Price:</span>
              <span className="text-ipl-gold-300 font-bold ml-2">
                {formatAmountToCrores(currentPlayer.basePrice)} Cr
              </span>
            </div>
            
            {selectedTeam && (
              <div>
                <span className="text-gray-400 text-sm">Current Bid:</span>
                <span className="text-green-400 font-bold ml-2">
                  ₹{formatAmountToCrores(parseInt(bidAmount, 10) || 0)} Cr
                </span>
              </div>
            )}
          </div>
          
          {/* Timer */}
          <div className="flex justify-center">
            <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800 w-full max-w-xs text-center">
              <div className="text-gray-400 text-sm mb-2">Going once, going twice...</div>
              
              <div className="relative">
                <div className={`text-4xl font-bold ${
                  countdownTimer !== null && countdownTimer <= 3 
                    ? 'text-red-500' 
                    : countdownTimer !== null && countdownTimer <= 5
                      ? 'text-amber-500'
                      : 'text-white'
                }`}>
                  {countdownTimer !== null ? countdownTimer : "10"}
                </div>
                
                <div className="mt-3 flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startTimer}
                    disabled={timerRunning}
                    className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-700/50"
                  >
                    <Clock size={14} className="mr-1" />
                    Start
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopTimer}
                    disabled={!timerRunning}
                    className="bg-amber-900/30 hover:bg-amber-800/50 text-amber-300 border-amber-700/50"
                  >
                    Pause
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTimer}
                    className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border-gray-700/50"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bidding Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Team Selection with Budget Display */}
            <div className="space-y-2">
              <label className=" text-sm font-medium text-gray-300 flex items-center">
                <Wallet size={16} className="mr-2 text-blue-300" />
                Select Team (with Remaining Budget)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teamsArray.map((team) => {
                  const remainingBudget = getRemainingBudget(team.id);
                  const currentBidAmount = parseInt(bidAmount, 10) || 0;
                  const canAfford = remainingBudget >= currentBidAmount;
                  
                  return (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      disabled={!canAfford}
                      className={`p-2 rounded-lg text-sm font-semibold border transition-all hover:scale-105 ${
                        selectedTeam === team.id 
                          ? 'border-2 border-white shadow-lg' 
                          : 'border-gray-700/50 opacity-70 hover:opacity-100'
                      } ${!canAfford ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ 
                        backgroundColor: `${team.color}20`,
                        borderColor: selectedTeam === team.id ? team.color : undefined
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <div style={{ color: team.color }} className="font-bold">
                        {team.shortName || team.name.split(' ')[0]}
                      </div>
                      
                      {/* Budget Display */}
                      <div className={`text-xs mt-1 ${
                        remainingBudget < currentBidAmount 
                          ? 'text-red-400' 
                          : remainingBudget < team.budget * 0.2 
                            ? 'text-amber-400' 
                            : 'text-green-400'
                      }`}>
                        ₹{formatAmountToCrores(remainingBudget)} Cr
                      </div>

                      {/* Budget Progress Bar */}
                      <div className="w-full bg-gray-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            remainingBudget < team.budget * 0.2 
                              ? 'bg-amber-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(remainingBudget / team.budget) * 100}%` }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Bid Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Bid Amount
              </label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecrementBid}
                  className="bg-gray-800 text-gray-300"
                >
                  <ChevronDown size={20} />
                </Button>
                
                <div className="flex-grow mx-2 relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ipl-gold-500" size={16} />
                  <Input 
                    type="text" 
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-10 pr-16 bg-gray-800 border-gray-700 text-white"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    Cr {bidAmount ? formatAmountToCrores(parseInt(bidAmount, 10) || 0) : '0.00'}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIncrementBid}
                  className="bg-gray-800 text-gray-300"
                >
                  <ChevronUp size={20} />
                </Button>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setBidIncrement(100000)} // 1 Lakh
                  className={`px-2 py-1 text-xs rounded ${
                    bidIncrement === 100000 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  +1L
                </button>
                <button
                  onClick={() => setBidIncrement(500000)} // 5 Lakhs
                  className={`px-2 py-1 text-xs rounded ${
                    bidIncrement === 500000 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  +5L
                </button>
                <button
                  onClick={() => setBidIncrement(1000000)} // 10 Lakhs
                  className={`px-2 py-1 text-xs rounded ${
                    bidIncrement === 1000000 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  +10L
                </button>
                <button
                  onClick={() => setBidIncrement(5000000)} // 50 Lakhs
                  className={`px-2 py-1 text-xs rounded ${
                    bidIncrement === 5000000 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  +50L
                </button>
              </div>
            </div>
          </div>
          
          {/* Bid History */}
          {bidHistory.length > 0 && (
            <div className="bg-gray-900/60 rounded-lg border border-gray-800/60 p-3">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Bid History</h4>
              <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                {bidHistory.map((bid, index) => {
                  const team = getTeam(bid.teamId);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-1 px-2 rounded text-sm"
                      style={{ backgroundColor: `${team?.color}15` }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: team?.color }}
                        ></div>
                        <span 
                          className="font-medium"
                          style={{ color: team?.color }}
                        >
                          {team?.name}
                        </span>
                      </div>
                      <span className="text-ipl-gold-300">
                        ₹{formatAmountToCrores(bid.amount)} Cr
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-700/50 flex gap-3 justify-end">
            {confirmUnsold ? (
              <div className="bg-red-900/20 p-3 rounded-lg flex flex-col sm:flex-row items-center gap-3 border border-red-800/50">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-300 text-sm">Mark this player as unsold?</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setConfirmUnsold(false)}
                    className="border-gray-700 text-gray-300 bg-gray-800/50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-red-700 hover:bg-red-800 text-white"
                    onClick={() => onPlayerUnsold && onPlayerUnsold("No bids received")}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleUnsold}
                  className="border-red-700/50 text-red-400 hover:text-red-300 hover:border-red-600/60 bg-red-950/20"
                >
                  <XCircle className="mr-2" size={16} />
                  Mark Unsold
                </Button>
                
                <Button
                  onClick={handleSold}
                  disabled={!selectedTeam || !bidAmount}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="mr-2" size={16} />
                  Sold!
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}