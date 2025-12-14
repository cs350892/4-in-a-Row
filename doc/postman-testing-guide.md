# Postman API Testing Guide

## Overview
This guide provides step-by-step instructions for testing the 4-in-a-Row game APIs using Postman. The backend server runs on port 5000.

## Prerequisites
- Postman installed
- Backend server running: `cd backend && node server.js`
- Database configured (MongoDB)

## Setup in Postman

### 1. Create Collection
- Open Postman
- Click "New" → "Collection"
- Name: "4-in-a-Row API Testing"
- Add description: "API tests for Connect Four game"

### 2. Set Environment Variables
- Click "Environments" → "Create Environment"
- Name: "4-in-a-Row Local"
- Add variables:
  - `base_url`: `http://localhost:5000`
  - `game_id`: (leave empty, will be set during testing)

## API Endpoints Testing

### 1. GET /api/leaderboard

**Description**: Retrieve top 10 players leaderboard

**Method**: GET
**URL**: `{{base_url}}/api/leaderboard`

**Expected Responses**:

#### Success (200 OK)
```json
[
  {
    "username": "Player1",
    "wins": 10,
    "losses": 5,
    "draws": 2
  },
  {
    "username": "Player2",
    "wins": 8,
    "losses": 3,
    "draws": 1
  }
]
```

#### Error (500 Internal Server Error)
```json
{
  "error": "Failed to fetch leaderboard"
}
```

**Test Cases**:
- ✅ Normal leaderboard retrieval
- ✅ Empty leaderboard (no games played)
- ✅ Database connection error

**Postman Tests** (Add to Tests tab):
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

pm.test("Leaderboard entries have required fields", function () {
    var jsonData = pm.response.json();
    if (jsonData.length > 0) {
        pm.expect(jsonData[0]).to.have.property('username');
        pm.expect(jsonData[0]).to.have.property('wins');
        pm.expect(jsonData[0]).to.have.property('losses');
        pm.expect(jsonData[0]).to.have.property('draws');
    }
});
```

## Socket.io Testing

Since Postman has limited Socket.io support, use the following Node.js script for comprehensive Socket.io testing:

```javascript
const io = require('socket.io-client');

// Test joinQueue
function testJoinQueue() {
  const socket = io('http://localhost:5000');

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinQueue', 'TestPlayer');
  });

  socket.on('waiting', () => {
    console.log('Player is waiting for match');
  });

  socket.on('gameStart', (data) => {
    console.log('Game started:', data);
    pm.environment.set('game_id', data.gameId);
    // Proceed to test makeMove
  });

  socket.on('error', (msg) => {
    console.error('Error:', msg);
  });
}

// Test makeMove
function testMakeMove(gameId) {
  const socket = io('http://localhost:5000');

  socket.emit('makeMove', { gameId: gameId, column: 3 });

  socket.on('gameUpdate', (data) => {
    console.log('Game updated:', data);
  });

  socket.on('gameOver', (data) => {
    console.log('Game over:', data);
  });
}

// Run tests
testJoinQueue();
// After game starts, call testMakeMove(pm.environment.get('game_id'));
```

## Running Tests

### Manual Testing Steps:
1. Start backend server
2. Import the collection JSON (see below)
3. Set environment to "4-in-a-Row Local"
4. Run individual requests or create a test runner

### Automated Testing:
- Use Postman Runner to execute collection
- Add pre-request scripts for setup
- Use Newman (Postman CLI) for CI/CD integration

## Postman Collection JSON

Copy this JSON and import into Postman:

```json
{
  "info": {
    "name": "4-in-a-Row API Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "description": "Complete API testing suite for 4-in-a-Row game"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    }
  ],
  "item": [
    {
      "name": "Leaderboard",
      "item": [
        {
          "name": "Get Leaderboard",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/leaderboard",
              "host": ["{{base_url}}"],
              "path": ["api", "leaderboard"]
            },
            "description": "Retrieve top 10 players leaderboard"
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response is an array\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData).to.be.an('array');",
                  "});",
                  "",
                  "pm.test(\"Leaderboard entries have required fields\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    if (jsonData.length > 0) {",
                  "        pm.expect(jsonData[0]).to.have.property('username');",
                  "        pm.expect(jsonData[0]).to.have.property('wins');",
                  "        pm.expect(jsonData[0]).to.have.property('losses');",
                  "        pm.expect(jsonData[0]).to.have.property('draws');",
                  "    }",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ],
      "description": "Leaderboard related API endpoints"
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Global pre-request script",
          "console.log('Starting API test...');"
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Global test script",
          "console.log('Test completed');"
        ]
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues:
- **Connection refused**: Ensure backend server is running on port 5000
- **Database errors**: Check MongoDB connection in `.env`
- **CORS errors**: Backend has CORS enabled for development

### Debug Tips:
- Check server console for error logs
- Use Postman Console to view request/response details
- Test with curl: `curl http://localhost:5000/api/leaderboard`

## Next Steps
- Add more test cases as API evolves
- Implement automated tests in CI/CD pipeline
- Create performance tests for high load scenarios

---

*Note: Socket.io events require Node.js testing scripts as Postman WebSocket support is limited.*