import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { parseUnsoldPlayersFromCSV } from '../lib/csvExport';
import { useAuctionStore } from '../store/auction';
import { FileUp } from 'lucide-react';

export function UnsoldPlayersUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { players, markPlayerUnsold } = useAuctionStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const playerNames = await parseUnsoldPlayersFromCSV(file);
      
      // Mark each player as unsold
      let markedCount = 0;
      for (const playerName of playerNames) {
        // Find player by name
        const player = players.find(p => p.name === playerName);
        if (player) {
          // Use a default reason rather than requiring one
          markPlayerUnsold(player.id, "Marked as unsold via CSV import");
          markedCount++;
        }
      }
      
      setSuccess(`Successfully marked ${markedCount} players as unsold from ${file.name}`);
    } catch (err) {
      setError('Failed to parse unsold players CSV file. Please check the format.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h2 className="text-lg font-semibold mb-2">Import Unsold Players</h2>
      <p className="text-gray-400 text-sm mb-2">
        Upload a CSV with the same format as your player import. Any player in this list will be marked as unsold.
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <Button 
        onClick={handleClick} 
        disabled={isLoading}
        variant="secondary"
        className="w-full"
      >
        <FileUp className="mr-2" size={16} />
        {isLoading ? 'Importing...' : 'Upload Unsold Players CSV'}
      </Button>
      {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      {success && <p className="text-green-400 mt-2 text-sm">{success}</p>}
    </div>
  );
}