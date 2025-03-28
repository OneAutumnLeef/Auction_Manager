# 🏏 IPL Auction Manager - Documentation

## Table of Contents

1. Overview
2. Installation & Setup
3. Running the Application
4. Network Configuration
5. Authentication & User Roles
6. Auctioneer Dashboard
7. Team Dashboard
8. Real-time Synchronization
9. Data Management
10. Troubleshooting

---

## 1. Overview

The **IPL Auction Manager** is a real-time web application designed to facilitate cricket player auctions. It enables an auctioneer to manage the auction process while multiple team representatives can participate simultaneously, all synchronized in real-time across devices.

### Key Features

- Real-time synchronization across multiple devices
- User authentication with role-based access (Auctioneer/Team)
- Player database with filtering and search
- Live auction controls with bidding interface
- Team budget tracking and roster management
- CSV import/export functionality
- Data persistence across sessions

---

## 2. Installation & Setup

### Prerequisites

- Node.js (v14.0 or higher)
- npm (v7.0 or higher)

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ipl-auction-manager.git
   cd ipl-auction-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

---

## 3. Running the Application

### Development Mode

To run the application in development mode (with hot reloading):

1. Start the Socket.IO server (for real-time communication):
   ```bash
   npm run server
   ```

2. In a separate terminal, start the development server:
   ```bash
   npm run dev
   ```

3. To make the development server accessible from other devices on your network:
   ```bash
   npm run dev:host
   ```

### Production Mode

For production deployment (recommended for actual auctions):

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the server (which will serve both the static files and handle WebSocket connections):
   ```bash
   npm run server
   ```

### Access URLs

- **Development Mode**:
  - Local access: `http://localhost:5174`
  - Network access: `http://YOUR_IP_ADDRESS:5174`
  - Socket.IO server: `http://YOUR_IP_ADDRESS:5173`

- **Production Mode**:
  - Single server URL: `http://YOUR_IP_ADDRESS:5173`

---

## 4. Network Configuration

### For Local Network (LAN) Access

To make the application accessible to multiple devices on your local network:

1. Find your computer's IP address:
   - Windows: Open Command Prompt and type `ipconfig`
   - Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`

2. Ensure your firewall allows connections on ports 5173 and 5174:
   - Windows: Check Windows Defender Firewall settings
   - Mac: Check System Preferences → Security & Privacy → Firewall

3. Share the appropriate URL with other users:
   ```
   http://YOUR_IP_ADDRESS:5173  (for production)
   ```

### For Hostel/Public Wi-Fi Networks

Some Wi-Fi networks (especially in institutions) may have client isolation enabled, which prevents direct device-to-device communication. In such cases:

1. Ensure all devices are connected to the same network
2. Try using the `--host` flag when running the server:
   ```bash
   npm run dev:host
   ```
3. If issues persist, you may need to:
   - Request network administrator to disable client isolation
   - Use a personal hotspot instead
   - Set up a VPN to bypass network restrictions

---

## 5. Authentication & User Roles

### Available User Accounts

The system has predefined user accounts with different roles:

#### Auctioneer
- Username: `auctioneer`
- Password: `auc123!@#`

#### Team Accounts
| Team | Username | Password | Team ID |
|------|----------|----------|---------|
| Chennai Super Kings | `csk` | `csk1!@#` | team1 |
| Delhi Capitals | `dc` | `dc2!@#` | team2 |
| Punjab Kings | `pbks` | `pbk3!@#` | team3 |
| Kolkata Knight Riders | `kkr` | `kkr4!@#` | team4 |
| Mumbai Indians | `mi` | `mi5!@#` | team5 |
| Rajasthan Royals | `rr` | `rr6!@#` | team6 |
| Royal Challengers Bangalore | `rcb` | `rcb7!@#` | team7 |
| Sunrisers Hyderabad | `srh` | `srh8!@#` | team8 |
| Gujarat Titans | `gt` | `gt9!@#` | team9 |
| Lucknow Super Giants | `lsg` | `lsg10!@#` | team10 |
| Deccan Chargers | `dch` | `dch11!@#` | team11 |
| Pune Warriors India | `pwi` | `pwi12!@#` | team12 |
| Kochi Tuskers Kerala | `ktk` | `ktk13!@#` | team13 |
| SriCity Blasters | `scb` | `scb14!@#` | team14 |

### Role-Based Access

- **Auctioneer**: Has full control over the auction process, can mark players as sold/unsold, and manage the player database
- **Team**: Can view available players, track team budget, and see their purchased players

---

## 6. Auctioneer Dashboard

The Auctioneer Dashboard is accessible after logging in with auctioneer credentials.

### Features

- **Player Management**:
  - Import players via CSV
  - Filter players by name, role, category
  - View player details
  - Mark players as sold or unsold

- **Auction Controls**:
  - Start auction for a selected player
  - Set bid amounts and increments
  - Assign players to teams
  - Track bidding history

- **Data Management**:
  - Reset auction data
  - Export sold/unsold player lists
  - View team budgets and purchases

### Usage Guide

1. **Import Players** (if starting a new auction):
   - Click "Import Players" button
   - Upload a properly formatted CSV file
   - Review imported players

2. **Start an Auction**:
   - Select a player from the list
   - Click "Start Auction" button
   - Use the bidding interface to manage bids
   - Mark player as "Sold" to a team or "Unsold"

3. **Track Progress**:
   - View sold players by team
   - Monitor team budgets
   - Check unsold player list

---

## 7. Team Dashboard

Team representatives access this dashboard after logging in with team credentials.

### Features

- **Team Overview**:
  - Remaining budget
  - Purchased players
  - Team statistics

- **Player Viewing**:
  - Available players
  - Current auction status
  - Other teams' purchases

- **Real-time Updates**:
  - See auction results as they happen
  - Track which player is currently being auctioned
  - View bid history

### Usage Guide

1. **Viewing Available Players**:
   - Browse the player list
   - Use filters to find specific players
   - View detailed player information

2. **Tracking Team Status**:
   - Monitor remaining budget
   - Review purchased players
   - Compare with other teams

3. **During Active Auctions**:
   - Watch as the auctioneer updates player status
   - See which team purchased each player
   - Track auction progress in real-time

---

## 8. Real-time Synchronization

The application uses Socket.IO for real-time communication between devices.

### How It Works

1. **Connection Status**:
   - A connection indicator appears in the bottom-right corner
   - Green dot = Connected
   - Red dot = Disconnected
   - Click the indicator for detailed connection information

2. **Automatic Synchronization**:
   - When the auctioneer marks a player as sold, all team dashboards update automatically
   - Changes to player data are broadcast to all connected clients
   - If a device temporarily loses connection, updates are queued and applied when reconnected

3. **Testing Connection**:
   - Expand the connection indicator
   - Click "Test Connection" to verify real-time functionality
   - Check for the connection ID to confirm proper setup

---

## 9. Data Management

### CSV Import Format

Import players using a CSV file with the following columns:

```
Name,Role,Cost,Base Price,Player Type
Virat Kohli,Batsman,17.5,2.0,A
```

Required columns:
- **Name**: Player's full name
- **Role**: One of [Batsman, Bowler, All-rounder, Wicket-keeper]
- **Cost**: Rating/value (used for sorting)
- **Base Price**: Starting bid amount in crores (₹)
- **Player Type**: Category (A, B, or C)

### Data Persistence

The application persists data across sessions using the browser's localStorage:

- Player database
- Sold/unsold status
- Team purchases
- Budget information

To reset all data, use the "Clear Auction Data" button in the Auctioneer Dashboard.

---

## 10. Troubleshooting

### Connection Issues

If devices cannot connect to each other:

1. **Check Socket Connection**:
   - Look at the connection indicator (green/red dot)
   - Expand to see connection details
   - Verify the Socket ID is displayed

2. **Network Configuration**:
   - Ensure all devices are on the same network
   - Check firewall settings for ports 5173 and 5174
   - Try using a different network (mobile hotspot)

3. **Server Issues**:
   - Verify the server is running (`npm run server`)
   - Check server logs for connection errors
   - Restart the server if needed

### Common Problems and Solutions

| Problem | Solution |
|---------|----------|
| Client shows "Socket not connected" | Check that server is running. Try refreshing the page. |
| Changes not syncing between devices | Check connection indicators on both devices. Restart the server. |
| CSV import fails | Verify CSV format matches the required columns and format. |
| Cannot access from other devices | Check IP address and firewall settings. Use `npm run dev:host` in development. |
| Application feels sluggish | Reduce the number of connected clients or restart the server. |

### Quick Fixes

- **Refresh the page**: Solves many temporary issues
- **Reconnect**: Use the connection indicator to disconnect/reconnect
- **Restart server**: Stop and restart the Socket.IO server
- **Check console**: Open browser developer tools (F12) to view error messages

---

## Running a Successful Auction

For the best experience when conducting a live auction:

1. **Setup ahead of time**:
   - Build the application (`npm run build`)
   - Import player data
   - Test connections from all devices

2. **Use production mode**:
   - Run with `npm run server` after building
   - Access via `http://YOUR_IP_ADDRESS:5173`

3. **Assign roles clearly**:
   - One person as Auctioneer
   - One person per team

4. **Monitor connection status**:
   - Watch for disconnections
   - Help teams reconnect if needed

5. **Backup regularly**:
   - Consider exporting data periodically

---

<div style="text-align: center; margin-top: 30px;">
  <p>Made with ❤️ for IPL Auction<br>
  © 2024 E-Cell SriCity</p>
</div>