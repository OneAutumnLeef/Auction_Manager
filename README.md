# 🏏 IPL Auction Manager - Documentation

## Table of Contents

1. Overview
2. Installation
3. Getting Started
4. User Roles
5. Auctioneer Dashboard
6. Player Management
7. Running an Auction
8. Team Dashboard
9. Data Persistence
10. Troubleshooting

---

## 1. Overview

The **IPL Auction Manager** is a comprehensive web application designed to facilitate Indian Premier League cricket player auctions. Built with modern web technologies, it offers a seamless interface for managing player data, conducting live auctions, and tracking team budgets and purchases.

### Key Features

- **Multi-user system** with auctioneer and team roles
- **Player database** with filtering and search capabilities
- **Live auction interface** with bidding controls
- **Budget management** for teams
- **CSV import/export** for player data
- **Data persistence** across sessions
- **Real-time statistics** and auction insights
- **Responsive design** for all devices

---

## 2. Installation

### Prerequisites

- Node.js (v14.0 or higher)
- npm or yarn package manager

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd ipl-auction-website
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

5. Preview production build:
   ```bash
   npm run preview
   # or
   yarn preview
   ```

---

## 3. Getting Started

### First Launch

1. Open your browser and navigate to `http://localhost:5173/` (default Vite development server)
2. You will be redirected to the login page
3. Log in with the appropriate credentials:
   - **Auctioneer**: Username: `admin`, Password: `admin123`
   - **Team Manager**: Username: `team1`, Password: `team123` (teams 1-8 available)

### Initial Setup

Before conducting an auction, you should:

1. Import player data using CSV (sample provided in Test_Cleaned_Updated.csv)
2. Verify team budgets and settings
3. Configure auction rules if needed

---

## 4. User Roles

### Auctioneer Role

The auctioneer has complete control over the auction process:

- Import and manage player database
- Start and control the auction flow
- Mark players as sold or unsold
- Export auction results
- View comprehensive statistics

### Team Manager Role

Team managers participate in the auction:

- View available players
- Place bids on players
- Track team budget and purchases
- View team roster

### Role-Based Access

The application automatically directs users to the appropriate dashboard based on their role. Access control ensures users can only view authorized content.

---

## 5. Auctioneer Dashboard

<div style="border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; background-color: rgba(59, 130, 246, 0.1); margin: 20px 0;">
<h3 style="margin-top: 0; color: #3b82f6;">Dashboard Overview</h3>
<p>The Auctioneer Dashboard is the command center for running the IPL auction. It provides comprehensive controls and visibility into the auction process.</p>
</div>

### Statistics Cards

At the top of the dashboard, four statistics cards provide key metrics:

- **Total Players**: Count of all players in the database
- **Players Sold**: Number of players successfully auctioned
- **Players Unsold**: Count of players marked as unsold
- **Total Auction Value**: Cumulative value of all player sales

### Top Buys Section

Displays the three most expensive player purchases in the auction, showing:

- Rank (1st, 2nd, 3rd)
- Player name
- Sale amount

### Control Buttons

The dashboard offers several action buttons:

- **Show/Hide Filters**: Toggle filtering options
- **Show Unsold**: View only unsold players
- **Grid/List View**: Switch between display modes
- **Import Players**: Upload player CSV data
- **Export Sold/Unsold**: Download auction results
- **Start Auction**: Begin the auction process
- **Clear Data**: Reset auction data (with confirmation)

### Player Grid/List

The main section displays player cards with:

- Player photo
- Category badge (A/B/C)
- Player name
- Role and base price
- Sold/Unsold status indicator
- Team assignment (if sold)

---

## 6. Player Management

### Importing Players

1. Click the **Import Players** button
2. In the import panel, click **Upload Players CSV**
3. Select a properly formatted CSV file (see template below)
4. The system will import and display the players

#### CSV Format

The player CSV must include these columns:

```
Player Name,Role,Rating,Base Price (in Cr),Category,Photo Link
```

Example:
```
Virat Kohli,Batter,9.8,2.0,A,https://example.com/photo.jpg
```

- **Player Name**: Full name
- **Role**: Batter, Bowler, All-Rounder, or Wicket-Keeper
- **Rating**: Numeric rating (0-10)
- **Base Price**: Starting bid in Crores (₹)
- **Category**: A, B, or C
- **Photo Link**: URL to player image (optional)

### Filtering Players

1. Click **Show Filters** to display filtering options
2. Filter by:
   - **Category**: A, B, or C
   - **Role**: Batsman, Bowler, All-rounder, Wicket-keeper
   - **Search**: Type player name in the search field
3. Active filters are displayed as tags
4. Click **Clear All** to reset filters

### Exporting Results

After completing auctions:

1. Click **Export Sold** to download a CSV of sold players
2. Click **Export Unsold** to download a CSV of unsold players

Exports include complete auction data with timestamps and sale details.

---

## 7. Running an Auction

### Starting an Auction

1. Select a player or use filters to find specific players
2. Click **Start Auction** or click directly on a player card
3. The system enters auction mode with the selected player

### Auction Controls

In auction mode, you'll see:

#### Player Information
- Player card with details
- Base price display
- Category and role indicators

#### Bidding Controls
- **Team Selection**: Click a team to record their bid
- **Bid Amount**: Adjust using + and - buttons or type directly
- **Bid Increment**: Select increment amount (1L, 5L, 10L, 50L)
- **Timer**: Control auction countdown (Start, Pause, Reset)

#### Auction Actions
- **Sold Button**: Mark player as sold to selected team at current bid
- **Unsold Button**: Mark player as unsold (requires confirmation)
- **Previous/Next**: Navigate between players without leaving auction mode
- **Back to Players**: Return to the player grid

### Bid History

During an active auction, the system records and displays each bid with:
- Team name and color
- Bid amount
- Chronological order

### Team Budget Management

The system automatically:
- Tracks remaining budget for each team
- Prevents teams from bidding above their budget
- Updates budget when players are sold
- Provides visual indicators of budget status

---

## 8. Team Dashboard

<div style="border: 1px solid #8b5cf6; border-radius: 8px; padding: 20px; background-color: rgba(139, 92, 246, 0.1); margin: 20px 0;">
<h3 style="margin-top: 0; color: #8b5cf6;">Team Manager View</h3>
<p>The Team Dashboard provides team owners and managers with a view of their purchases, remaining budget, and available players.</p>
</div>

### Team Statistics

View key team metrics:
- **Total Budget**: Initial allocation
- **Remaining Budget**: Current available funds
- **Players Acquired**: Count of purchased players
- **Average Player Cost**: Mean value of acquisitions

### Team Roster

The roster section displays:
- All players purchased by the team
- Player details and purchase prices
- Sorting options by price, category, or role
- Filter options to find specific players

### Available Players

Teams can view all available players that haven't been sold yet, with:
- Filtering and search functionality
- Display of player details
- Base price information

### Auction History

Review completed auctions with a chronological display of:
- All players sold in the auction
- Purchase prices and buying teams
- Time of sale

---

## 9. Data Persistence

### How Data is Stored

The IPL Auction Manager uses browser localStorage to persist data between sessions:

- **Player Database**: All player information
- **Sold/Unsold Records**: Auction results
- **Team Budgets**: Current financial status
- **User Login**: Authentication status

### Auto-Recovery

The system features automatic data recovery:

1. When reloading the page, previously stored data is automatically loaded
2. A notification appears confirming data restoration
3. If no stored data exists, sample data is loaded instead

### Data Reset

To clear all data and start fresh:

1. Click the **Clear Data** button in the Auctioneer Dashboard
2. Confirm the action in the dialog
3. All auction data will be reset (this cannot be undone)

---

## 10. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **CSV Import Fails** | Ensure CSV format matches the template exactly. Check for extra commas or special characters. |
| **Images Not Loading** | Verify image URLs are correct and publicly accessible. The system will fall back to placeholder images. |
| **Data Not Saving** | Check that localStorage is enabled in your browser. Try clearing browser cache if issues persist. |
| **UI Elements Misaligned** | Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge). Try resizing or refreshing. |
| **Auction Controls Unresponsive** | Reload the page to restore functionality. Ensure JavaScript is enabled. |

### Browser Compatibility

The application is optimized for:
- Chrome 89+
- Firefox 87+
- Safari 14+
- Edge 89+

### Performance Optimization

For best performance:
- Limit player database to under 500 players
- Use compressed image URLs
- Clear browser cache periodically
- Use a modern browser with good JavaScript performance

---

<div style="text-align: center; margin-top: 50px; color: #6b7280; font-size: 14px;">
  <p>Made with ❤️ by Deraj Yojith<br>
  Organized by E-Cell SriCity<br>
  © 2025 IPL Auction Manager. All rights reserved.</p>
</div>
