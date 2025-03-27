// Update your API_BASE_URL to be more robust
let API_BASE_URL = '/api';

// For development vs production
if (process.env.NODE_ENV === 'production') {
  // In production, use relative path that works on Vercel
  API_BASE_URL = '/api';
} else {
  // For local development
  API_BASE_URL = '/api';
}

// Player API
export async function fetchPlayers() {
  try {
    const response = await fetch(`${API_BASE_URL}/players`);
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return []; // Return empty array instead of throwing
    }
    const data = await response.json();
    return data.players || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return []; // Return empty array on error
  }
}

export async function importCSV(csvText: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'importCSV',
        csvText
      }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error importing CSV:', error);
    return null;
  }
}

export async function uploadCSVFile() {
  try {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'uploadCSV' }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return null;
  }
}

// Auction API
export async function fetchAuctionData() {
  try {
    const response = await fetch(`${API_BASE_URL}/auction`);
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return { soldPlayers: [], unsoldPlayers: [] };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching auction data:', error);
    return { soldPlayers: [], unsoldPlayers: [] };
  }
}

export async function markPlayerSold(playerId: string, teamId: string, amount: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/auction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'markSold',
        data: { playerId, teamId, amount }
      }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking player as sold:', error);
    return null;
  }
}

export async function markPlayerUnsold(playerId: string, reason: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'markUnsold',
        data: { playerId, reason }
      }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking player as unsold:', error);
    return null;
  }
}

export async function resetAuctionData() {
  try {
    const response = await fetch(`${API_BASE_URL}/auction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting auction data:', error);
    return null;
  }
}

// Teams API
export async function fetchTeams() {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`);
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return {};
    }
    const data = await response.json();
    return data.teams || {};
  } catch (error) {
    console.error('Error fetching teams:', error);
    return {};
  }
}

export async function updateTeam(teamId: string, teamData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateTeam',
        teamId,
        data: teamData
      }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating team:', error);
    return null;
  }
}

export async function resetTeams() {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resetTeams' }),
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resetting teams:', error);
    return null;
  }
}