# 🚀 Render Deployment Guide - 4 in a Row Game

## Prerequisites
- GitHub repository connected to your account
- MongoDB Atlas account (for database)
- Render account

---

## Step 1: Prepare Your Repository

### 1.1 Add Environment Files
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit with your actual values
nano .env
nano frontend/.env
```

### 1.2 Commit Changes
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses: `0.0.0.0/0`
5. Get your connection string
6. Update `.env` file with your MongoDB URI

---

## Step 3: Deploy Backend on Render

### 3.1 Create Backend Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:
   - **Name:** `4-in-a-row-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`

### 3.2 Set Environment Variables
Add these environment variables in Render:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 3.3 Deploy
- Click **"Create Web Service"**
- Wait for deployment to complete
- Note the backend URL (e.g., `https://your-app-name.onrender.com`)

---

## Step 4: Deploy Frontend on Render

### 4.1 Create Frontend Service
1. Go back to Render Dashboard
2. Click **"New"** → **"Static Site"**
3. Connect your GitHub repository (same repo)
4. Configure service:
   - **Name:** `4-in-a-row-frontend`
   - **Runtime:** `Static Site`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Root Directory:** `frontend`

### 4.2 Set Environment Variables
Add this environment variable:
```
VITE_BACKEND_URL=https://your-backend-app.onrender.com
```

### 4.3 Configure Redirects
In the **"Redirects/Rewrites"** section, add:
- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** `Rewrite`

### 4.4 Deploy
- Click **"Create Static Site"**
- Wait for deployment to complete
- Your frontend will be available at the generated URL

---

## Step 5: Update Backend CORS

### 5.1 Update Environment Variables
In your backend service on Render, update the `FRONTEND_URL`:
```
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### 5.2 Redeploy Backend
- Go to your backend service
- Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Step 6: Test Your Deployment

### 6.1 Test Backend
Visit: `https://your-backend-app.onrender.com/api/leaderboard`

### 6.2 Test Frontend
Visit your frontend URL and test:
- Game setup
- Local multiplayer
- Online multiplayer (vs Bot)
- Real-time gameplay

### 6.3 Test Socket Connection
- Open browser developer tools
- Check Network tab for WebSocket connections
- Verify no CORS errors

---

## Troubleshooting

### Backend Issues
- **Port Error:** Render assigns random ports, but our code uses `process.env.PORT`
- **MongoDB Connection:** Check your Atlas IP whitelist and connection string
- **CORS Issues:** Verify `FRONTEND_URL` matches your frontend URL exactly

### Frontend Issues
- **API Calls Failing:** Check `VITE_BACKEND_URL` is correct
- **Build Errors:** Ensure all dependencies are in `package.json`
- **Routing Issues:** Make sure the rewrite rule is configured

### Common Fixes
```bash
# Clear build cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
echo $MONGODB_URI
echo $VITE_BACKEND_URL
```

---

## Performance Optimization

### Enable Auto-Deploy
- In both services, enable **"Auto-Deploy"** for automatic deployments on git push

### Free Tier Limitations
- Free services sleep after 15 minutes of inactivity
- First request after sleep may be slow
- Consider upgrading to paid plans for production use

---

## Custom Domain (Optional)

### Add Custom Domain
1. Go to your frontend service settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update backend `FRONTEND_URL` with your custom domain

---

## 🎉 Deployment Complete!

Your 4 in a Row game is now live on Render!

**URLs:**
- Frontend: `https://your-frontend-app.onrender.com`
- Backend: `https://your-backend-app.onrender.com`

**Next Steps:**
- Share your game with friends!
- Monitor usage in Render dashboard
- Consider adding analytics or error tracking