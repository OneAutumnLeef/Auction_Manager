import Papa from 'papaparse';
import { Player, Role, Category } from '../types';

export const parsePlayersCSV = (file: File): Promise<Player[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const players = results.data
            .filter((row: any) => row['Player Name']) // Skip empty rows
            .map((row: any, index: number) => {
              // Map roles from CSV format to app format
              const roleMapping: Record<string, Role> = {
                'Batter': 'Batsman',
                'Bowler': 'Bowler',
                'All-Rounder': 'All-rounder',
                'Wicket-Keeper': 'Wicket-keeper'
              };
              
              // Convert base price from crores to actual value (assuming in crores)
              const basePriceInCr = parseFloat(row['Base Price (in Cr)']) || 0;
              const basePriceInRupees = basePriceInCr * 10000000; // Convert Cr to actual value
              
              return {
                id: String(index + 1),
                name: row['Player Name'],
                role: roleMapping[row['Role']] || 'Batsman',
                category: row['Category'] as Category,
                basePrice: basePriceInRupees,
                imageUrl: (row['Photo Link']) ,
                  // ? row['Photo Link'] 
                  // : `https://source.unsplash.com/300x400/?cricket,player&${index + 1}`,
                rating: parseFloat(row['Rating']) || undefined 
              };
            });
          resolve(players);
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

// Simple validation for image URLs
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  // The URLs in your CSV are not valid for direct use, they're relative paths
  // We'll consider external URLs starting with http/https as valid
  return url.startsWith('http://') || url.startsWith('https://');
};