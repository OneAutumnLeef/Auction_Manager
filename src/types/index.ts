export type Role = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
export type Category = 'A' | 'B' | 'C';

export interface Player {
  id: string;
  name: string;
  role: Role;
  category: Category;
  basePrice: number;
  imageUrl?: string;
  soldTo?: string;
  soldAmount?: number;
  isUnsold?: boolean;
  rating?: number; // Add this line to include rating property
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  role: 'auctioneer' | 'team';
  teamId?: string;
  shortName?: string;
}