const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const Papa = require('papaparse');

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://deraj7msd:ecelliplauctionderaj@iplauction.8cngus3.mongodb.net/ipl-auction";

// MongoDB connection cache
let cachedDb = null;

// Add retry logic and better error handling
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    const db = client.db('ipl-auction');
    cachedDb = db;
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Return null instead of throwing to allow graceful fallback
    return null;
  }
}

// Define schemas
const PlayerSchema = new mongoose.Schema({
  id: String,
  name: String,
  role: String,
  rating: Number,
  basePrice: Number,
  category: String,
  imageUrl: String
});

const SoldPlayerSchema = new mongoose.Schema({
  playerId: String,
  teamId: String,
  amount: Number,
  soldAt: { type: Date, default: Date.now }
});

const UnsoldPlayerSchema = new mongoose.Schema({
  playerId: String,
  reason: String,
  markedAt: { type: Date, default: Date.now }
});

const TeamSchema = new mongoose.Schema({
  id: String,
  name: String,
  shortName: String,
  budget: Number,
  players: [String],
  color: String
});

// Get default data
const getDefaultData = () => {
  const defaultPlayers = [
    {
      id: '1',
      name: 'Virat Kohli',
      role: 'Batsman',
      rating: 9.8,
      basePrice: 20000000,
      category: 'A',
    },
    {
      id: '2',
      name: 'Rohit Sharma',
      role: 'Batsman',
      rating: 9.7,
      basePrice: 20000000,
      category: 'A',
    },
    {
      id: '3',
      name: 'Jasprit Bumrah',
      role: 'Bowler',
      rating: 9.5,
      basePrice: 20000000,
      category: 'A',
    },
    {
      id: '4',
      name: 'MS Dhoni',
      role: 'Wicket-keeper',
      rating: 9.0,
      basePrice: 20000000,
      category: 'A',
    },
    {
      id: '5',
      name: 'Ravindra Jadeja',
      role: 'All-rounder',
      rating: 8.9,
      basePrice: 20000000,
      category: 'A',
    }
  ];

  const defaultTeams = {
    'team1': { id: 'team1', name: 'Chennai Super Kings', shortName: 'CSK', budget: 1000000000, players: [], color: '#F9CD05' },
    'team2': { id: 'team2', name: 'Delhi Capitals', shortName: 'DC', budget: 1000000000, players: [], color: '#0078BC' },
    'team3': { id: 'team3', name: 'Punjab Kings', shortName: 'PBKS', budget: 1000000000, players: [], color: '#ED1B24' },
    'team4': { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', budget: 1000000000, players: [], color: '#3A225D' },
    'team5': { id: 'team5', name: 'Mumbai Indians', shortName: 'MI', budget: 1000000000, players: [], color: '#004BA0' },
    'team6': { id: 'team6', name: 'Rajasthan Royals', shortName: 'RR', budget: 1000000000, players: [], color: '#2D4D9D' },
    'team7': { id: 'team7', name: 'Royal Challengers Bangalore', shortName: 'RCB', budget: 1000000000, players: [], color: '#D1171C' },
    'team8': { id: 'team8', name: 'Sunrisers Hyderabad', shortName: 'SRH', budget: 1000000000, players: [], color: '#F26522' }
  };

  return {
    defaultPlayers,
    defaultTeams
  };
};

// Create model objects
const models = {
  Player: mongoose.models.Player || mongoose.model('Player', PlayerSchema),
  SoldPlayer: mongoose.models.SoldPlayer || mongoose.model('SoldPlayer', SoldPlayerSchema),
  UnsoldPlayer: mongoose.models.UnsoldPlayer || mongoose.model('UnsoldPlayer', UnsoldPlayerSchema),
  Team: mongoose.models.Team || mongoose.model('Team', TeamSchema)
};

// Parse CSV function
const parseCSV = async (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        try {
          const players = results.data
            .filter((row) => row['Player Name']) // Skip empty rows
            .map((row, index) => {
              // Map roles from CSV format to app format
              const roleMapping = {
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
                category: row['Category'],
                basePrice: basePriceInRupees,
                imageUrl: row['Photo Link'],
                rating: parseFloat(row['Rating']) || 0
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

module.exports = {
  connectToDatabase,
  models,
  getDefaultData,
  parseCSV
};