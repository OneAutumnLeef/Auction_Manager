import { Player } from '../types';
import { Gavel, XCircle, Star, Award, DollarSign, User, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

// Define the Team interface inline since we don't have access to the team store
interface Team {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
}

// Teams mapping
const teams: Record<string, Team> = {
  'team1': { id: 'team1', name: 'Chennai Super Kings', shortName: 'CSK', color: '#F9CD05' },
  'team2': { id: 'team2', name: 'Delhi Capitals', shortName: 'DC', color: '#0078BC' },
  'team3': { id: 'team3', name: 'Punjab Kings', shortName: 'PBKS', color: '#ED1B24' },
  'team4': { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D' },
  'team5': { id: 'team5', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0' },
  'team6': { id: 'team6', name: 'Rajasthan Royals', shortName: 'RR', color: '#2D4D9D' },
  'team7': { id: 'team7', name: 'Royal Challengers Bangalore', shortName: 'RCB', color: '#D1171C' },
  'team8': { id: 'team8', name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#F26522' },
  'team9': { id: 'team9', name: 'Gujarat Titans', shortName: 'GT', color: '#1c2660' },
  'team10': { id: 'team10', name: 'Lucknow Super Giants', shortName: 'LSG', color: '#A7D5F6' },
  'team11': { id: 'team11', name: 'Deccan Chargers', shortName: 'DCH', color: '#3268A5' },
  'team12': { id: 'team12', name: 'Pune Warriors India', shortName: 'PWI', color: '#2F9BE3' },
  'team13': { id: 'team13', name: 'Kochi Tuskers Kerala', shortName: 'KTK', color: '#FF6600' },
  'team14': { id: 'team14', name: 'SriCity Blasters', shortName: 'SCB', color: '#E74C3C' },
};

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  highlight?: boolean;
}

export function PlayerCard({ player, onClick, highlight = false }: PlayerCardProps) {
  const cardVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' },
    sold: { borderColor: '#22c55e', boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)' },
    unsold: { borderColor: '#ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)' }
  };

  const getRoleIcon = () => {
    switch (player.role) {
      case 'Batsman': return <Award className="text-ipl-gold-300" size={20} />;
      case 'Bowler': return <Shield className="text-ipl-blue-300" size={20} />;
      case 'All-rounder': return <Users className="text-ipl-purple-300" size={20} />;
      case 'Wicket-keeper': return <User className="text-green-300" size={20} />;
      default: return null;
    }
  };

  const formatCurrency = (amount: number) => {
    // Format in crores (1 crore = 10 million)
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  // Determine if player is sold
  const isSold = player.soldTo && player.soldAmount;
  const isUnsold = player.isUnsold;
  
  // Find team details if player is sold
  const team = isSold && player.soldTo ? teams[player.soldTo] : null;
  // console.log(player);
  

  return (
    <motion.div
      variants={cardVariants}
      initial="normal"
      whileHover={onClick ? "hover" : "normal"}
      animate={isSold ? "sold" : isUnsold ? "unsold" : highlight ? "hover" : "normal"}
      onClick={onClick}
      className={`relative card-glow rounded-2xl overflow-hidden bg-card-gradient shadow-player-card border-2 transition-all duration-300 ${
        isSold ? 'border-green-500/50' : isUnsold ? 'border-red-500/50' : 'border-transparent'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div 
          className={`clip-badge h-8 w-8 flex items-center justify-center font-bold text-lg ${
            player.category === 'A' ? 'bg-gold-gradient' : 
            player.category === 'B' ? 'bg-gradient-to-r from-blue-700 to-blue-500' : 
            'bg-gradient-to-r from-purple-700 to-purple-500'
          }`}
        >
          {player.category}
        </div>
      </div>

      {/* Sold/Unsold Indicator */}
      {isSold && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-800 to-green-600 text-green-50 text-center py-1 font-semibold text-sm z-10">
          SOLD
        </div>
      )}
      {isUnsold && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-800 to-red-600 text-red-50 text-center py-1 font-semibold text-sm z-10">
          UNSOLD
        </div>
      )}

      {/* Player Image with Gradient Overlay */}
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden">
          <img 
            src={player.imageUrl || `https://source.unsplash.com/300x400/?cricket,player&${player.id}`} 
            alt={player.name}
            className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>

        {/* Player Information Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              player.role === 'Batsman' ? 'bg-amber-950/90 text-amber-300 border border-amber-700/50' :
              player.role === 'Bowler' ? 'bg-blue-950/90 text-blue-300 border border-blue-700/50' :
              player.role === 'All-rounder' ? 'bg-purple-950/90 text-purple-300 border border-purple-700/50' :
              'bg-green-950/90 text-green-300 border border-green-700/50'
            }`}>
              {getRoleIcon()}
              <span className="ml-1">{player.role}</span>
            </span>
            
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-ipl-blue-950/90 text-ipl-blue-300 text-xs font-medium border border-ipl-blue-700/50">
              <DollarSign size={12} className="mr-0.5" />
              {formatCurrency(player.basePrice)}
            </span>
            
            {/* Player Rating Badge - Fixed implementation */}
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-amber-950/90 text-amber-300 text-xs font-medium border border-amber-700/50">
              <Star size={12} className="mr-0.5" />
              <span>{player.rating || 'N/A'}</span>
            </span>
          </div>
          
          <h3 className="text-lg md:text-xl font-bold leading-tight">{player.name}</h3>
        </div>
      </div>

      {/* Player Status Footer */}
      {isSold && team && (
        <div 
          className="p-3 text-center"
          style={{ backgroundColor: `${team.color}20` }} // Using hex color with transparency
        >
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold" style={{ color: team.color }}>{team.shortName}</span>
            <span className="text-white">•</span>
            <span className="text-white font-semibold">{formatCurrency(player.soldAmount || 0)}</span>
          </div>
        </div>
      )}
      
      {isUnsold && (
        <div className="bg-red-950/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle size={16} className="text-red-400" />
            <span className="text-red-300 font-medium">No bids received</span>
          </div>
        </div>
      )}
      
      {!isSold && !isUnsold && (
        <div className="bg-ipl-blue-900/30 p-3 text-center">
          <div className="text-ipl-blue-300 font-medium flex items-center justify-center">
            <Gavel size={16} className="mr-1" />
            <span>Available for auction</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}