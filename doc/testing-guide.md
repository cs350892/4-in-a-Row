# Testing Guide

## Overview
This guide covers testing strategies for the 4-in-a-Row game application, including manual and automated testing approaches.

## UI Testing
- Ensure the Login and GameBoard components render and interact as expected.
- Test joining the queue, waiting, and playing a game (vs player and vs bot).
- Check for correct turn display, win/draw messages, and move validation.
- Verify responsive design on different screen sizes.
- Test error handling for invalid inputs.

## Backend Testing
### REST API Endpoints
- **GET /api/leaderboard**
  - Test successful retrieval of top 10 players.
  - Test response format: array of objects with username, wins, losses, draws.
  - Test error handling: 500 status on database failure.
  - Test empty leaderboard scenario.

### Socket.io Events
Test all client-to-server and server-to-client events using socket.io-client.

#### Client Events:
- **joinQueue** (username: string)
  - Test joining queue with valid username.
  - Test matchmaking: should emit 'gameStart' or 'waiting'.
  - Test invalid username handling.
  - Test queue with bot when no other players.

- **makeMove** (gameId: string, column: number)
  - Test valid move: column 0-6, player's turn.
  - Test invalid move: full column, wrong turn, invalid column.
  - Test bot response when playing vs bot.
  - Test game completion: win, lose, draw scenarios.
  - Test gameUpdate emission to all players.

- **rejoin** (gameId: string)
  - Test rejoining within 30 seconds of disconnection.
  - Test rejoin after 30 seconds: should fail.
  - Test invalid gameId.

#### Server Events (to test emission):
- **waiting**: Emitted when player joins queue and waits.
- **gameStart**: Emitted with game details when match found.
- **gameUpdate**: Emitted after each move with board state.
- **gameOver**: Emitted when game ends with winner info.
- **gameRejoined**: Emitted on successful rejoin.
- **error**: Emitted for various error conditions.

#### Additional Scenarios:
- Test disconnection and forfeit logic (30-second timer).
- Test multiple concurrent games.
- Test bot gameplay: ensure bot makes valid moves.
- Test leaderboard updates after game completion.
- Test CORS settings for Socket.io.

### Testing Tools
- **REST**: Use tools like Postman, curl, or axios for endpoint testing.
- **Socket.io**: Use socket.io-client in Node.js scripts or tools like Socket.io testing libraries.
- **Automated**: Write unit tests for controllers, integration tests for full flows.

### Sample Test Script (Node.js)
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('joinQueue', 'TestPlayer');
});

socket.on('gameStart', (data) => {
  console.log('Game started:', data);
  // Test makeMove here
});

socket.on('error', (msg) => {
  console.error('Error:', msg);
});
```

## Automated Testing
### Unit Tests
- **Bot Logic**: Test minimax algorithm with various board states.
- **Game Logic**: Test win conditions, valid moves, and board updates.
- **Socket Events**: Test connection, disconnection, and message handling.

### Integration Tests
- End-to-end game flow from login to game completion.
- Database operations for leaderboard and game history.

### Tools
- Frontend: Jest + React Testing Library
- Backend: Mocha + Chai or Jest
- E2E: Cypress or Playwright

## Manual Test Checklist
- [ ] Can join queue and get matched
- [ ] Can play a full game (win, lose, draw)
- [ ] Leaderboard updates after game
- [ ] Bot plays valid moves
- [ ] Rejoin and forfeit logic works
- [ ] UI updates correctly on turn changes
- [ ] Error messages display for invalid actions
- [ ] Game resets properly after completion
- [ ] GET /api/leaderboard returns correct data
- [ ] Socket events (joinQueue, makeMove, rejoin) work as expected
- [ ] Disconnection handling and forfeit after 30 seconds
- [ ] Multiple concurrent games don't interfere
- [ ] Bot vs bot games complete successfully

## Running Tests
1. Install dependencies: `npm install` in both frontend and backend directories.
2. For backend: `npm test` (if configured).
3. For frontend: `npm run test`.
4. For manual testing: Start servers and use browser.

## Debugging Tips
- Check browser console for frontend errors.
- Check server logs for backend issues.
- Use network tab to inspect Socket.io messages.
- Test with different network conditions.

---

# Notes
- This file is for local documentation and will not be pushed to GitHub.
