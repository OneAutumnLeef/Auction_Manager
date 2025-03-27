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
    
    // If we couldn't connect to the database, fall back to empty data
    if (!db) {
      return res.json({ 
        soldPlayers: [], 
        unsoldPlayers: []
      });
    }
    
    const soldCollection = db.collection('soldPlayers');
    const unsoldCollection = db.collection('unsoldPlayers');
    const teamsCollection = db.collection('teams');

    if (req.method === 'GET') {
      // Get sold and unsold players
      const soldPlayers = await soldCollection.find({}).toArray();
      const unsoldPlayers = await unsoldCollection.find({}).toArray();
      
      return res.json({ 
        soldPlayers, 
        unsoldPlayers 
      });
    }
    
    if (req.method === 'POST') {
      const { action, data } = req.body;
      
      if (action === 'markSold') {
        try {
          // Create new sold player record
          const soldData = {
            playerId: data.playerId,
            teamId: data.teamId,
            amount: data.amount,
            soldAt: new Date()
          };
          
          // Remove from unsold if it exists
          await unsoldCollection.deleteOne({ playerId: data.playerId });
          
          // Add to sold players
          await soldCollection.insertOne(soldData);
          
          // Update team budget and add player to team
          const team = await teamsCollection.findOne({ id: data.teamId });
          if (team) {
            await teamsCollection.updateOne(
              { id: data.teamId },
              { 
                $set: { budget: team.budget - data.amount },
                $push: { players: data.playerId }
              }
            );
          }
          
          // Get updated sold and unsold lists
          const soldPlayers = await soldCollection.find({}).toArray();
          const unsoldPlayers = await unsoldCollection.find({}).toArray();
          
          return res.json({ 
            success: true, 
            soldPlayers,
            unsoldPlayers
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      if (action === 'markUnsold') {
        try {
          // Create new unsold player record
          const unsoldData = {
            playerId: data.playerId,
            reason: data.reason,
            markedAt: new Date()
          };
          
          // Remove from sold if it exists
          const soldPlayer = await soldCollection.findOne({ playerId: data.playerId });
          if (soldPlayer) {
            // Return amount to team if was previously sold
            const team = await teamsCollection.findOne({ id: soldPlayer.teamId });
            if (team) {
              await teamsCollection.updateOne(
                { id: soldPlayer.teamId },
                { 
                  $set: { budget: team.budget + soldPlayer.amount },
                  $pull: { players: data.playerId }
                }
              );
            }
            
            await soldCollection.deleteOne({ playerId: data.playerId });
          }
          
          // Add to unsold players
          await unsoldCollection.insertOne(unsoldData);
          
          // Get updated sold and unsold lists
          const soldPlayers = await soldCollection.find({}).toArray();
          const unsoldPlayers = await unsoldCollection.find({}).toArray();
          
          return res.json({ 
            success: true, 
            soldPlayers,
            unsoldPlayers
          });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      if (action === 'reset') {
        try {
          // Clear sold and unsold collections
          await soldCollection.deleteMany({});
          await unsoldCollection.deleteMany({});
          
          // Reset team budgets and players
          const { defaultTeams } = getDefaultData();
          
          // Update each team in the database
          for (const teamId in defaultTeams) {
            await teamsCollection.updateOne(
              { id: teamId },
              { $set: { budget: defaultTeams[teamId].budget, players: [] } },
              { upsert: true }
            );
          }
          
          return res.json({ 
            success: true, 
            soldPlayers: [],
            unsoldPlayers: []
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