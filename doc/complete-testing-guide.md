# Complete Testing Guide for 4-in-a-Row Game

## Overview
This guide provides complete instructions for testing the entire 4-in-a-Row application, including backend APIs, frontend UI, Socket.io real-time features, and end-to-end game flows.

## Prerequisites
- Node.js installed (v16+)
- MongoDB Atlas account (or local MongoDB)
- Postman installed
- Two browser windows/tabs for multiplayer testing
- Git (optional, for version control)

## 1. Environment Setup

### Database Setup
- Ensure MongoDB Atlas connection is working (check `.env` file)
- Database URL: `mongodb+srv://cs350892_db_user:ZHCXklTB56e02La6@cluster0.3xj3sxn.mongodb.net/?appName=Cluster0`

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Return to root
cd ..
```

## 2. Starting the Application

### Start Backend Server
```bash
cd backend
npm run dev  # or npm start
```
- Server will run on `http://localhost:5000`
- You should see: "Server running on port 5000"

### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```
- Frontend will run on `http://localhost:5173` (Vite default)
- Proxy configured to backend on port 5000

## 3. API Testing with Postman

### Import Postman Collection
1. Open Postman
2. Click "Import" → "Raw text"
3. Copy the JSON from `doc/postman-testing-guide.md` and paste
4. Set environment variable: `base_url = http://localhost:5000`

### Test Leaderboard API
1. Select "Get Leaderboard" request
2. Click "Send"
3. Expected: 200 OK with player array (may be empty initially)

## 4. Socket.io Testing with Node.js Scripts

### Create Test Scripts
Create these files in a `test/` directory:

#### test/socket-test.js
```javascript
const io = require('socket.io-client');

function testJoinQueue(username) {
  return new Promise((resolve) => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log(`${username}: Connected`);
      socket.emit('joinQueue', username);
    });

    socket.on('waiting', () => {
      console.log(`${username}: Waiting for match`);
      resolve({ socket, status: 'waiting' });
    });

    socket.on('gameStart', (data) => {
      console.log(`${username}: Game started - ID: ${data.gameId}`);
      resolve({ socket, gameData: data, status: 'playing' });
    });

    socket.on('error', (msg) => {
      console.error(`${username}: Error - ${msg}`);
      resolve({ socket, error: msg });
    });
  });
}

function testMakeMove(socket, gameId, column) {
  return new Promise((resolve) => {
    socket.emit('makeMove', { gameId, column });

    socket.on('gameUpdate', (data) => {
      console.log(`Move made, turn: ${data.currentTurn}`);
      resolve(data);
    });

    socket.on('gameOver', (data) => {
      console.log('Game Over:', data);
      resolve(data);
    });

    socket.on('error', (msg) => {
      console.error('Move error:', msg);
      resolve({ error: msg });
    });
  });
}

// Export for use in other tests
module.exports = { testJoinQueue, testMakeMove };
```

#### test/bot-test.js
```javascript
const { testJoinQueue, testMakeMove } = require('./socket-test');

async function testBotGame() {
  console.log('Testing Player vs Bot...');

  const player = await testJoinQueue('TestPlayer');

  if (player.status === 'playing') {
    const { socket, gameData } = player;

    // Make some moves
    for (let i = 0; i < 3; i++) {
      await testMakeMove(socket, gameData.gameId, i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for bot
    }

    socket.disconnect();
    console.log('Bot test completed');
  }
}

testBotGame();
```

#### test/multiplayer-test.js
```javascript
const { testJoinQueue, testMakeMove } = require('./socket-test');

async function testMultiplayerGame() {
  console.log('Testing Multiplayer Game...');

  const player1 = await testJoinQueue('Player1');
  const player2 = await testJoinQueue('Player2');

  if (player1.status === 'playing' && player2.status === 'playing') {
    const gameId = player1.gameData.gameId;

    // Alternate moves
    await testMakeMove(player1.socket, gameId, 0);
    await testMakeMove(player2.socket, gameId, 1);
    await testMakeMove(player1.socket, gameId, 0);
    await testMakeMove(player2.socket, gameId, 1);

    player1.socket.disconnect();
    player2.socket.disconnect();
    console.log('Multiplayer test completed');
  }
}

testMultiplayerTest();
```

### Run Socket Tests
```bash
cd test
npm run test-bot
npm run test-multiplayer
```

**Note**: Test scripts are already created in the `test/` directory with all dependencies installed.

## 5. Frontend Manual Testing

### Open Application
- Go to `http://localhost:5173` in browser
- You should see the login screen

### Test Login Flow
1. Enter username (e.g., "TestUser")
2. Click "Join Game"
3. Should show waiting screen or start game

### Test Game Board
1. **Visual Check**:
   - 6x7 grid visible
   - Player colors (red/blue) shown
   - Turn indicator displays correctly

2. **Move Testing**:
   - Click on columns to drop pieces
   - Pieces should fall to bottom
   - Turn should switch after move
   - Invalid moves should be rejected

3. **Win Conditions**:
   - Test horizontal, vertical, diagonal wins
   - Win message should appear
   - Game should end, return to menu

### Test Bot Gameplay
1. Join queue alone (should match with bot)
2. Make moves, bot should respond
3. Test bot difficulty (should make reasonable moves)

### Test Multiplayer (requires 2 browsers)
1. Open two browser windows
2. Both join with different usernames
3. Should match automatically
4. Test real-time move synchronization
5. Test disconnection/rejoin

## 6. End-to-End Testing Scenarios

### Scenario 1: Complete Game Flow
1. Start servers
2. Open browser → Login → Join queue
3. Play vs bot or wait for player
4. Make moves until win/lose/draw
5. Check leaderboard updates
6. Verify database persistence

### Scenario 2: Error Handling
1. Test invalid moves (full column, wrong turn)
2. Test network disconnection
3. Test server restart during game
4. Test invalid usernames

### Scenario 3: Load Testing
1. Open multiple browser tabs
2. Join queue simultaneously
3. Test matchmaking with multiple players
4. Verify no crashes under load

## 7. Database Testing

### Check MongoDB Collections
Connect to MongoDB Atlas and verify:
- `completedgames` collection for game history
- `leaderboards` collection for player stats

### Manual Database Queries
```javascript
// Check leaderboard
db.leaderboards.find().sort({wins: -1}).limit(10)

// Check completed games
db.completedgames.find().limit(5)
```

## 8. Automated Testing Setup (Optional)

### Add Testing Frameworks
```bash
# Backend
cd backend
npm install --save-dev jest supertest socket.io-client

# Frontend
cd ../frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Sample Backend Test
Create `backend/test/api.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  test('GET /api/leaderboard', async () => {
    const response = await request(app).get('/api/leaderboard');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### Sample Frontend Test
Create `frontend/src/App.test.js`:
```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  expect(screen.getByText('Join Game')).toBeInTheDocument();
});
```

## 9. Debugging Tips

### Backend Issues
- Check server console for errors
- Verify MongoDB connection
- Test with Postman first

### Frontend Issues
- Check browser console (F12)
- Verify Socket.io connection
- Test network tab for API calls

### Socket.io Issues
- Check CORS settings
- Verify client/server versions match
- Test with simple connection first

### Common Problems
- **Port conflicts**: Kill processes on ports 5000, 5173
- **Database errors**: Check `.env` file and network
- **Build errors**: Clear node_modules and reinstall

## 10. Testing Checklist

### Setup
- [ ] Dependencies installed
- [ ] Servers starting without errors
- [ ] Database connection working
- [ ] Frontend loading correctly

### API Testing
- [ ] GET /api/leaderboard returns data
- [ ] Socket.io connection established
- [ ] joinQueue event works
- [ ] makeMove event works
- [ ] Game state synchronization

### UI Testing
- [ ] Login form functional
- [ ] Game board renders
- [ ] Moves are validated
- [ ] Win conditions detected
- [ ] Real-time updates work

### Game Logic
- [ ] Bot makes valid moves
- [ ] Multiplayer synchronization
- [ ] Disconnection handling
- [ ] Leaderboard updates

### Edge Cases
- [ ] Full board (draw)
- [ ] Invalid moves rejected
- [ ] Network interruptions handled
- [ ] Multiple concurrent games

## 11. Performance Testing

### Basic Load Test
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script
echo 'config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Join queue and play"
    flow:
      - emit:
          channel: "joinQueue"
          data: "LoadTestUser"' > load-test.yml

# Run load test
artillery run load-test.yml
```

## 12. Deployment Testing

### Local Production Build
```bash
# Build frontend
cd frontend
npm run build

# Serve built files
npm install -g serve
serve -s dist -l 3000

# Test production build
# Backend should proxy to built frontend
```

## Summary

This comprehensive testing guide covers:
- ✅ Environment setup and server startup
- ✅ API testing with Postman
- ✅ Socket.io testing with Node.js scripts
- ✅ Frontend manual testing
- ✅ End-to-end game scenarios
- ✅ Database verification
- ✅ Error handling and edge cases
- ✅ Optional automated testing setup
- ✅ Debugging and troubleshooting

Run through each section systematically to ensure your 4-in-a-Row application is fully tested and working correctly.