# Backend Setup Guide

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

## Installation
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file:
   ```sh
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   ```
4. Start the backend server:
   ```sh
   npm run dev
   # or
   npm start
   ```

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `PORT`: (optional) Server port, default 5000

## Useful Scripts
- `npm run dev`: Start with nodemon (auto-restart)
- `npm start`: Start normally

## Socket.io
- The backend uses Socket.io for real-time game events.

---

# Testing

## Manual Testing
- Use Postman or browser to test `/api/leaderboard` endpoint.
- Use the frontend UI to test matchmaking and gameplay.

## Automated Testing (Optional)
- Add your test scripts in a `tests/` folder.
- Use Jest, Mocha, or your preferred framework.

---

# Notes
- This file is for local documentation and will not be pushed to GitHub.
