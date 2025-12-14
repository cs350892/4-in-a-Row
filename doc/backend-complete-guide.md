# Backend Complete Guide for 4-in-a-Row Game

## Overview
This backend is built with Node.js, Express, MongoDB, and Socket.io for a real-time 4-in-a-Row (Connect Four) game. It supports player vs player and player vs bot matchmaking, game logic, leaderboard, and database persistence.

## Architecture
- **Express Server**: Handles HTTP requests and serves API endpoints.
- **Socket.io**: Manages real-time communication for matchmaking and gameplay.
- **MongoDB**: Stores completed games and leaderboard data.
- **In-Memory Queue**: Handles matchmaking with automatic bot pairing.
- **Game Logic**: Custom classes for Player, Game, and Bot AI.

## Folder Structure
```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── Leaderboard.js     # User wins schema
│   └── CompletedGame.js   # Game history schema
├── game/
│   ├── Game.js            # Core game logic (Player, Game classes)
│   ├── bot.js             # AI bot with minimax algorithm
│   └── matchmaking.js     # Queue class for player matching
├── controllers/
│   └── gameController.js  # DB operations for games and leaderboard
├── routes/
│   └── gameRoutes.js      # API routes (/api/leaderboard)
├── sockets/
│   └── gameSocket.js      # Socket.io event handlers
├── .env                   # Environment variables
├── server.js              # Main server entry point
└── package.json           # Dependencies and scripts
```

## Setup Instructions

### Prerequisites
- Node.js v16+ (tested on v18)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation Steps
1. **Clone/Navigate to Project**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   This installs: express, mongoose, cors, socket.io, uuid, dotenv, nodemon

3. **Environment Setup**:
   Create `.env` file in backend root:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/connectfour
   PORT=5000  # optional, defaults to 5000
   ```

4. **Start MongoDB**:
   - Local: `mongod` (ensure MongoDB is running on port 27017)
   - Atlas: Update MONGODB_URI with your connection string

5. **Run the Server**:
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```
   Server starts on http://localhost:5000

## API Endpoints

### GET /api/leaderboard
- **Description**: Retrieves top 10 players by wins
- **Response**: JSON array of leaderboard entries
- **Example**:
  ```json
  [
    { "username": "player1", "wins": 15 },
    { "username": "player2", "wins": 12 }
  ]
  ```

## Socket.io Events

### Client to Server Events

#### joinQueue
- **Payload**: `{ username: string }`
- **Description**: Join matchmaking queue
- **Response**: 'waiting' or 'gameStart'

#### makeMove
- **Payload**: `{ gameId: string, column: number }`
- **Description**: Make a move in the game
- **Validation**: Must be player's turn, valid column
- **Response**: 'gameUpdate' or 'error'

#### rejoin
- **Payload**: `{ gameId: string }`
- **Description**: Rejoin a game after disconnection (within 30s)
- **Response**: 'gameRejoined' or 'error'

### Server to Client Events

#### waiting
- **Description**: Player is in queue waiting for match

#### gameStart
- **Payload**: `{ gameId, board, players, currentTurn, yourIndex }`
- **Description**: Game has started

#### gameUpdate
- **Payload**: `{ board, currentTurn, lastMove }`
- **Description**: Board state after a move

#### gameOver
- **Payload**: `{ winner, board, reason? }`
- **Description**: Game ended (win, draw, or forfeit)

#### gameRejoined
- **Payload**: `{ gameId, board, players, currentTurn, yourIndex }`
- **Description**: Successfully rejoined game

#### error
- **Payload**: `{ message }`
- **Description**: Error occurred

## Database Schemas

### Leaderboard Collection
```javascript
{
  username: { type: String, required: true, unique: true },
  wins: { type: Number, default: 0 }
}
```

### CompletedGame Collection
```javascript
{
  gameId: String,
  player1: String,
  player2: String, // or "Bot"
  winner: String, // or null for draw
  duration: Number, // seconds
  createdAt: Date
}
```

## Game Logic Details

### Board Representation
- 6 rows × 7 columns
- 0: empty, 1: player1, 2: player2
- Gravity: pieces fall to bottom

### Win Conditions
- 4 in a row: horizontal, vertical, diagonal (both directions)
- Checked after each move

### Bot AI
- Uses minimax with alpha-beta pruning
- Depth: 5 (beginner-friendly)
- Scoring: +100 win, -100 loss, 0 draw
- Prioritizes center columns on ties

### Matchmaking
- In-memory queue
- Immediate match if 2+ players
- Bot pairing after 10 seconds alone
- Games stored in Map<gameId, Game>

## Testing Guide

### Manual Testing Checklist
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] GET /api/leaderboard returns data
- [ ] Socket connection establishes
- [ ] Join queue works (waiting/gameStart)
- [ ] Make valid moves (gameUpdate)
- [ ] Invalid moves rejected (error)
- [ ] Win/draw detection works
- [ ] Bot makes moves in PvB games
- [ ] Leaderboard updates after games
- [ ] Rejoin works within 30s
- [ ] Forfeit after 30s disconnect
- [ ] Multiple concurrent games

### Testing with Postman
1. Start server
2. GET http://localhost:5000/api/leaderboard
3. Should return JSON array

### Socket Testing
Use browser console or socket.io-client:
```javascript
const socket = io('http://localhost:5000');
socket.emit('joinQueue', { username: 'test' });
socket.on('gameStart', (data) => console.log(data));
```

### Common Issues
- **MongoDB Connection Failed**: Check URI and MongoDB service
- **Socket Connection Failed**: Check CORS settings
- **Moves Not Working**: Verify gameId and player turn
- **Bot Not Moving**: Check if bot is player2 and it's bot's turn

## Code Flow Explanation

### Server Startup
1. Load env vars
2. Connect to MongoDB
3. Create Express app and HTTP server
4. Setup middleware (CORS, JSON)
5. Mount API routes
6. Start listening on port 5000
7. Initialize Socket.io

### Matchmaking Flow
1. Player emits 'joinQueue' with username
2. Server adds to Queue
3. If 2 players: create Game, emit 'gameStart' to both
4. If alone: set 10s timeout for bot match
5. Bot match: create Game with bot, emit 'gameStart'

### Gameplay Flow
1. Player emits 'makeMove' with gameId and column
2. Server validates: game exists, player's turn, valid move
3. Apply move to Game.board
4. Check win/draw
5. If bot's turn: call botMove(), apply bot move
6. Emit 'gameUpdate' to room
7. If game finished: save to DB, update leaderboard, emit 'gameOver'

### Disconnection Handling
1. On disconnect: start 30s timer
2. If not rejoined: forfeit game, award win to opponent
3. Save game, update leaderboard
4. Clean up game from memory

## Security Considerations
- Input validation on all socket events
- Rate limiting (not implemented, add if needed)
- CORS configured for development
- No authentication (add JWT if required)
- MongoDB injection protection via Mongoose

## Performance Notes
- In-memory queue: scales to ~100 concurrent players
- Minimax depth 5: ~10k operations per move
- MongoDB: efficient for leaderboard queries
- Socket.io: handles real-time updates well

## Extension Ideas
- Add user authentication
- Implement chat system
- Add game spectators
- Create tournaments
- Add more bot difficulties
- Implement game replays

## Troubleshooting
- **Port 5000 in use**: Change PORT in .env
- **MongoDB timeout**: Check connection string
- **Socket errors**: Verify client and server versions match
- **Bot not responding**: Check game state and player indices

This guide provides complete reverse engineering capability for the backend system.