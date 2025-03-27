const { connectToDatabase, getDefaultData } = require('./db');

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
    
    // If we couldn't connect to the database, fall back to default teams
    if (!db) {
      const { defaultTeams } = getDefaultData();
      return res.json({ teams: defaultTeams });
    }
    
    const collection = db.collection('teams');

    if (req.method === 'GET') {
      // Check if teams collection is empty
      const count = await collection.countDocuments();
      
      if (count === 0) {
        // Collection is empty, initialize with default data
        const { defaultTeams } = getDefaultData();
        
        // Convert object to array for insertMany
        const teamsArray = Object.values(defaultTeams);
        await collection.insertMany(teamsArray);
        
        // Return as object with team IDs as keys
        return res.json({ teams: defaultTeams });
      }
      
      // Get all teams and format as object with team IDs as keys
      const teamsArray = await collection.find({}).toArray();
      const teams = teamsArray.reduce((acc, team) => {
        acc[team.id] = team;
        return acc;
      }, {});
      
      return res.json({ teams });
    }
    
    if (req.method === 'POST') {
      const { action, teamId, data } = req.body;
      
      if (action === 'updateTeam') {
        try {
          // Update a specific team
          const team = await collection.findOne({ id: teamId });
          if (!team) {
            return res.status(404).json({ error: 'Team not found' });
          }
          
          // Update team data
          await collection.updateOne({ id: teamId }, { $set: data });
          
          // Get all teams and format as object
          const teamsArray = await collection.find({}).toArray();
          const teams = teamsArray.reduce((acc, team) => {
            acc[team.id] = team;
            return acc;
          }, {});
          
          return res.json({ 
            success: true, 
            teams
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      if (action === 'resetTeams') {
        try {
          // Reset all teams to default state
          const { defaultTeams } = getDefaultData();
          
          // Delete existing teams
          await collection.deleteMany({});
          
          // Insert default teams
          const teamsArray = Object.values(defaultTeams);
          await collection.insertMany(teamsArray);
          
          return res.json({ 
            success: true, 
            teams: defaultTeams
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};