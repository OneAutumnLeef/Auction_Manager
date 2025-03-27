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
      console.log(`Processing CSV file: ${file.name} (${file.size} bytes)`);
      // Read file content
      const text = await file.text();
      console.log(`CSV content length: ${text.length} bytes`);
      
      if (text.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      // Parse the CSV file
      const players = await parsePlayersCSV(file);
      
      if (!players || players.length === 0) {
        throw new Error('No players found in CSV file');
      }
      
      console.log(`Successfully parsed ${players.length} players from CSV`);
      setPlayers(players);
      setSuccess(`Imported ${players.length} players`);
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error('CSV import error:', err);
      setError(err instanceof Error ? err.message : 'CSV format error');
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