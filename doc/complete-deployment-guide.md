# Complete Deployment Guide - 4 in a Row Game

## Overview
This guide covers deploying both the backend (Node.js/Express/Socket.io) and frontend (React/Vite) of the Connect-4 game to production.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB database (local or cloud)
- Git repository access

---

## 🚀 Backend Deployment

### 1. Environment Setup
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your_jwt_secret_key
```

### 2. Local Development
```bash
cd backend
npm install
npm run dev  # Development with auto-reload
```

### 3. Production Build
```bash
cd backend
npm install --production
npm start
```

### 4. Deployment Options

#### Option A: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard:
   - `MONGODB_URI`
   - `PORT=5000`
   - `FRONTEND_URL`
   - `JWT_SECRET`
3. Deploy automatically on push

#### Option B: Render
1. Create a new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### Option C: Heroku
1. Create a new app
2. Connect GitHub repository
3. Add buildpacks if needed
4. Set environment variables in Config Vars
5. Deploy

#### Option D: VPS/Server
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/cs350892/4-in-a-Row.git
cd 4-in-a-Row/backend
npm install --production

# Create .env file
nano .env

# Start with PM2
npm install -g pm2
pm2 start server.js --name "4-in-a-row-backend"
pm2 startup
pm2 save
```

---

## 🎨 Frontend Deployment

### 1. Local Development
```bash
cd frontend
npm install
npm run dev  # Starts on localhost:5173
```

### 2. Production Build
```bash
cd frontend
npm run build  # Creates dist/ folder
npm run preview  # Test production build locally
```

### 3. Deployment Options

#### Option A: Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** frontend
   - **Build Command:** npm run build
   - **Output Directory:** dist
3. Add environment variable:
   - `VITE_BACKEND_URL=https://your-backend-url.com`

#### Option B: Netlify
1. Connect GitHub repository
2. Set build settings:
   - **Base directory:** frontend
   - **Build command:** npm run build
   - **Publish directory:** dist
3. Add environment variable:
   - `VITE_BACKEND_URL=https://your-backend-url.com`

#### Option C: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

#### Option D: VPS/Server
```bash
# Build the frontend
cd frontend
npm run build

# Serve with nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/4-in-a-row

# Add nginx config:
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/4-in-a-row/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

sudo ln -s /etc/nginx/sites-available/4-in-a-row /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your_super_secret_jwt_key_here
```

### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-backend-domain.com
```

---

## 🌐 Domain & SSL

### Using Cloudflare (Free)
1. Add your domain to Cloudflare
2. Point nameservers to Cloudflare
3. Enable SSL/TLS encryption
4. Set up CDN if needed

### Using Let's Encrypt (Free SSL)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Database Setup

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create a cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string and add to environment variables

### Local MongoDB
```bash
# Install MongoDB locally
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## 🔍 Testing Deployment

### Backend Tests
```bash
# Test API endpoints
curl https://your-backend-url.com/api/leaderboard

# Test Socket.io connection
# Use browser console or tools like Socket.io Client Tool
```

### Frontend Tests
- Visit your deployed frontend URL
- Test game creation and joining
- Test real-time gameplay
- Check responsive design on mobile

---

## 🚨 Troubleshooting

### Common Issues

**Backend not connecting to database:**
- Check MongoDB URI format
- Verify network access/whitelist
- Check credentials

**Frontend can't connect to backend:**
- Verify VITE_BACKEND_URL environment variable
- Check CORS settings in backend
- Ensure backend is running and accessible

**Socket.io connection issues:**
- Check if backend supports WebSocket connections
- Verify CORS origin settings
- Check firewall settings

**Build failures:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables are set

---

## 📈 Performance Optimization

### Backend
- Use PM2 for process management
- Enable gzip compression
- Set up database indexing
- Implement rate limiting

### Frontend
- Enable Vite's build optimizations
- Use CDN for static assets
- Implement lazy loading for components
- Optimize images and assets

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: echo "Deploy backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: echo "Deploy frontend"
```

---

## 📞 Support

For issues or questions:
- Check the logs in your deployment platform
- Test locally first
- Verify environment variables
- Check network connectivity

---

**Happy Deploying! 🎉**