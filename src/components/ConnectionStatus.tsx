import React, { useState, useEffect } from 'react';
import { socket, getServerUrl } from '../lib/socket';

export const ConnectionStatus: React.FC = () => {
  const [connected, setConnected] = useState(socket.connected);
  const [lastUpdate, setLastUpdate] = useState<string>('No updates yet');
  const [expanded, setExpanded] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>(getServerUrl());

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      // Update server URL when connected to show actual connection URL
      setServerUrl(getServerUrl());
    };
    
    const onDisconnect = () => setConnected(false);
    
    const onAuctionUpdate = (data: any) => {
      const time = new Date().toLocaleTimeString();
      let updateType = 'Unknown';
      
      if (data.action === 'MARK_SOLD') {
        updateType = `Player ${data.playerId} sold to ${data.teamId}`;
      } else if (data.action === 'MARK_UNSOLD') {
        updateType = `Player ${data.playerId} marked unsold`;
      } else if (data.players) {
        updateType = `${data.players.length} players updated`;
      }
      
      setLastUpdate(`${updateType} at ${time}`);
    };
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('auction_update', onAuctionUpdate);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('auction_update', onAuctionUpdate);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-2 rounded-md text-xs max-w-xs"
      onClick={() => setExpanded(!expanded)}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div>{connected ? 'Connected' : 'Disconnected'}</div>
      </div>
      
      {expanded && (
        <div className="mt-2 text-xs">
          <div className="text-gray-300 mb-1">Socket ID: {socket.id || 'None'}</div>
          <div className="text-gray-300 mb-1">Last update: {lastUpdate}</div>
          <div className="text-gray-300">Server: {serverUrl}</div>
          
          <button 
            className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (connected) socket.disconnect();
              else socket.connect();
            }}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      )}
    </div>
  );
};