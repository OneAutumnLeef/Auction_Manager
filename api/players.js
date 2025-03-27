const { connectToDatabase, models, getDefaultData, parseCSV } = require('./db');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to the database
    const db = await connectToDatabase().catch(err => {
      console.error("Database connection failed:", err);
      return null;
    });
    
    // If we couldn't connect to the database, fall back to local default data
    if (!db) {
      const { defaultPlayers } = getDefaultData();
      return res.json({ players: defaultPlayers });
    }
    
    const collection = db.collection('players');

    if (req.method === 'GET') {
      // Check if players collection is empty
      const count = await collection.countDocuments();
      
      if (count === 0) {
        // Collection is empty, initialize with default data
        const { defaultPlayers } = getDefaultData();
        await collection.insertMany(defaultPlayers);
        return res.json({ players: defaultPlayers });
      }
      
      // Return all players
      const players = await collection.find({}).toArray();
      return res.json({ players });
    }
    
    if (req.method === 'POST') {
      if (req.body.action === 'importCSV') {
        try {
          // Import players from CSV text
          const csvText = req.body.csvText;
          if (!csvText) {
            return res.status(400).json({ error: 'No CSV text provided' });
          }
          
          const importedPlayers = await parseCSV(csvText);
          
          // Clear existing players and insert new ones
          await collection.deleteMany({});
          await collection.insertMany(importedPlayers);
          
          return res.json({ 
            success: true, 
            players: importedPlayers,
            message: `Imported ${importedPlayers.length} players`
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      } else {
        // For importing players directly
        try {
          const newPlayers = req.body;
          
          // Clear existing players and insert new ones
          await collection.deleteMany({});
          await collection.insertMany(newPlayers);
          
          return res.json({ 
            success: true, 
            players: newPlayers
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};