import { Player } from '../types';

export const samplePlayers: Player[] = [
  {
    id: '1',
    name: 'Virat Kohli',
    role: 'Batsman',
    category: 'A',
    basePrice: 20000000,
    rating: 9.7,
    imageUrl: 'https://source.unsplash.com/300x400/?cricket,batsman&1'
  },
  {
    id: '2',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    category: 'A',
    basePrice: 15000000,
    rating: 9.8,
    imageUrl: 'https://source.unsplash.com/300x400/?cricket,bowler&2'
  },
  {
    id: '3',
    name: 'Hardik Pandya',
    role: 'All-rounder',
    category: 'B',
    basePrice: 12000000,
    rating: 9.2,
    imageUrl: 'https://source.unsplash.com/300x400/?cricket,allrounder&3'
  },
  // Add more sample players
];