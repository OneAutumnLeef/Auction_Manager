
import { Category, Role } from '../types';
import { Button } from './ui/Button';
import { Filter, X, Search, User, Award, Shield, Users } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: Category | null;
  selectedRole: Role | null;
  searchQuery: string;
  onCategoryChange: (category: Category | null) => void;
  onRoleChange: (role: Role | null) => void;
  onSearchChange: (query: string) => void;
}

export function FilterPanel({
  selectedCategory,
  selectedRole,
  searchQuery,
  onCategoryChange,
  onRoleChange,
  onSearchChange,
}: FilterPanelProps) {
  const categories: Category[] = ['A', 'B', 'C'];
  const roles: Role[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];

  const handleClearFilters = () => {
    onCategoryChange(null);
    onRoleChange(null);
    onSearchChange('');
  };

  const hasActiveFilters = selectedCategory !== null || selectedRole !== null || searchQuery !== '';

  // Get role icon
  const getRoleIcon = (role: Role) => {
    switch(role) {
      case 'Batsman':
        return <Award className="w-4 h-4" />;
      case 'Bowler':
        return <Shield className="w-4 h-4" />;
      case 'All-rounder':
        return <Users className="w-4 h-4" />;
      case 'Wicket-keeper':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get category color styles
  const getCategoryStyles = (category: Category, isSelected: boolean) => {
    if (isSelected) {
      switch(category) {
        case 'A': return 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500';
        case 'B': return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500';
        case 'C': return 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500';
      }
    } else {
      switch(category) {
        case 'A': return 'bg-amber-900/30 hover:bg-amber-800/50 text-amber-300 border-amber-700/50';
        case 'B': return 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-700/50';
        case 'C': return 'bg-purple-900/30 hover:bg-purple-800/50 text-purple-300 border-purple-700/50';
      }
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-blue-800/30">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Filter className="mr-2 text-amber-400" size={20} />
          Player Filters
        </h3>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="bg-blue-800/30 hover:bg-blue-700/50 border-blue-700/50 text-white"
          >
            <X className="mr-1" size={14} />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Player Category
          </label>
          <div className="flex gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => onCategoryChange(isSelected ? null : category)}
                  className={`py-1.5 px-4 rounded-full border text-sm font-semibold transition-all duration-200 ${
                    getCategoryStyles(category, isSelected)
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Role Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Player Role
          </label>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => onRoleChange(isSelected ? null : role)}
                  className={`py-1.5 px-3 rounded-lg border text-sm font-semibold transition-all duration-200 flex items-center ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                      : 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border-blue-700/50'
                  }`}
                >
                  {getRoleIcon(role)}
                  <span className="ml-1.5">{role}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Search Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-blue-200 uppercase tracking-wider">
            Search Players
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2.5 pl-10 bg-blue-900/40 border border-blue-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white placeholder-blue-300/70 transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300/70" size={18} />
            
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/70 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-blue-400">
            {searchQuery ? 'Press X to clear search' : 'Type to search by player name'}
          </p>
        </div>
      </div>
      
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-800/30 flex flex-wrap items-center gap-2">
          <span className="text-sm text-blue-300 mr-1">Active filters:</span>
          
          {selectedCategory && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center ${
              selectedCategory === 'A' ? 'bg-amber-900/70 text-amber-300' :
              selectedCategory === 'B' ? 'bg-blue-900/70 text-blue-300' :
              'bg-purple-900/70 text-purple-300'
            }`}>
              Category {selectedCategory}
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={() => onCategoryChange(null)}
              />
            </span>
          )}
          
          {selectedRole && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-900/70 text-indigo-300 flex items-center">
              {selectedRole}
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={() => onRoleChange(null)}
              />
            </span>
          )}
          
          {searchQuery && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/70 text-blue-300 flex items-center">
              "{searchQuery}"
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}