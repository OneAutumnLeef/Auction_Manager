import Papa from 'papaparse';
import { Player } from '../types';

export const convertSoldPlayersToCSV = (
  soldPlayers: { 
    player: Player; 
    teamId: string; 
    amount: number;
    soldAt: Date;
  }[]
): string => {
  // Define CSV headers
  const headers = [
    'Player ID', 
    'Player Name', 
    'Role', 
    'Category',
    'Base Price', 
    'Sold Price', 
    'Team ID',
    'Sold At'
  ].join(',');
  
  // Map each sold player to a CSV row
  const rows = soldPlayers.map(({ player, teamId, amount, soldAt }) => {
    return [
      player.id,
      `"${player.name}"`, // Wrap name in quotes to handle commas in names
      player.role,
      player.category,
      player.basePrice,
      amount,
      teamId,
      soldAt.toISOString()
    ].join(',');
  });
  
  // Combine headers and rows
  return [headers, ...rows].join('\n');
};

export const convertUnsoldPlayersToCSV = (
  unsoldPlayers: { 
    player: Player;
    markedAt: Date;
  }[]
): string => {
  // Define CSV headers - match the original format
  const headers = [
    'Player Name',
    'Role',
    'Rating', // We'll use base price / 1,000,000 as a proxy for rating
    'Base Price (in Cr)',
    'Category',
    'Photo Link'
  ].join(',');
  
  // Map each unsold player to a CSV row
  const rows = unsoldPlayers.map(({ player }) => {
    // Convert base price from rupees to crores for export
    const basePriceInCr = (player.basePrice / 10000000).toFixed(1);
    
    return [
      `"${player.name}"`, // Wrap name in quotes to handle commas in names
      player.role,
      (player.basePrice / 1000000).toFixed(1), // Simple rating based on base price
      basePriceInCr,
      player.category,
      player.imageUrl || ''
    ].join(',');
  });
  
  // Combine headers and rows
  return [headers, ...rows].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to parse CSV for unsold players
export const parseUnsoldPlayersCSV = (file: File): Promise<{ playerId: string; reason: string; }[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Find column indices
        const playerIdIndex = headers.findIndex(h => h.trim().toLowerCase() === 'player id');
        const reasonIndex = headers.findIndex(h => h.trim().toLowerCase() === 'reason');
        
        if (playerIdIndex === -1 || reasonIndex === -1) {
          throw new Error('CSV must contain "Player ID" and "Reason" columns');
        }
        
        const unsoldPlayers = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            return {
              playerId: values[playerIdIndex].trim(),
              reason: values[reasonIndex].replace(/^"|"$/g, '').trim() // Remove quotes
            };
          });
          
        resolve(unsoldPlayers);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
};

// Add this function for parsing unsold players from original format CSV
export const parseUnsoldPlayersFromCSV = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          // Extract player names (we'll use these to find matching players)
          const playerNames = results.data
            .filter((row: any) => row['Player Name']) // Skip empty rows
            .map((row: any) => row['Player Name']);
          
          resolve(playerNames);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};