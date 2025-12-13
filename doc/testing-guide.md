# Testing Guide

## UI Testing
- Ensure the Login and GameBoard components render and interact as expected.
- Test joining the queue, waiting, and playing a game (vs player and vs bot).
- Check for correct turn display, win/draw messages, and move validation.

## Backend Testing
- Test `/api/leaderboard` endpoint for correct data.
- Simulate multiple players joining and playing via Socket.io (can use tools like socket.io-client in Node.js for scripts).

## Manual Test Checklist
- [ ] Can join queue and get matched
- [ ] Can play a full game (win, lose, draw)
- [ ] Leaderboard updates after game
- [ ] Bot plays valid moves
- [ ] Rejoin and forfeit logic works

---

# Notes
- This file is for local documentation and will not be pushed to GitHub.
