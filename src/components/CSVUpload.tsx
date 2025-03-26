import React, { useRef, useState } from 'react';
import { parsePlayersCSV } from '../lib/csvImport';
import { useAuctionStore } from '../store/auction';
import { Button } from './ui/Button';
import { Upload } from 'lucide-react';

interface CSVUploadProps {
  onImportSuccess?: () => void;
}

export function CSVUpload({ onImportSuccess }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setPlayers = useAuctionStore((state) => state.setPlayers);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const players = await parsePlayersCSV(file);
      setPlayers(players);
      setSuccess(`Imported ${players.length} players`);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError('CSV format error');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <Button 
        onClick={handleClick} 
        disabled={isUploading}
        variant="outline"
        size="sm"
        className="bg-ipl-purple-900/30 hover:bg-ipl-purple-800/50 text-ipl-purple-300"
      >
        <Upload className="mr-1" size={16} />
        {isUploading ? 'Importing...' : 'Import Players'}
      </Button>
      
      {error && (
        <span className="text-red-400 ml-2 text-xs">{error}</span>
      )}
      {success && (
        <span className="text-green-400 ml-2 text-xs">{success}</span>
      )}
    </div>
  );
}