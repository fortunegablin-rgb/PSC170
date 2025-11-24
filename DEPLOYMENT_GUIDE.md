# Free Deployment Guide - PSC170 Bus Fare System

This guide shows you how to deploy your bus fare payment system for free on the internet.

---

## Quick Comparison

| Platform | Database Support | Ease of Use | Free Tier Limits |
|----------|-----------------|-------------|------------------|
| **Render** | ✅ SQLite (Persistent Disk) | ⭐⭐⭐⭐⭐ | 750 hrs/month, sleeps after inactivity |
| **Railway** | ✅ SQLite | ⭐⭐⭐⭐ | $5 credit/month |
| **Fly.io** | ✅ SQLite (Volumes) | ⭐⭐⭐ | 3 VMs, 3GB volume |
| **Glitch** | ⚠️ SQLite (not persistent) | ⭐⭐⭐⭐⭐ | Unlimited, sleeps after 5 min |

**Recommended: Render** (Best balance of ease and features)

---

## Option 1: Render (Recommended)

### Prerequisites
- GitHub account
- Your code on GitHub

### Step 1: Prepare Your App

Create a `.gitignore` file in your project root:

```
node_modules/
.DS_Store
*.db
```

> **Important:** We'll use environment variables for production database

### Step 2: Modify for Production

Update `database.js` to support environment variable:

```javascript
const path = require('path');
const dbPath = process.env.DATABASE_PATH || './bus_system.db';
const db = new sqlite3.Database(dbPath, (err) => {
    // ... rest of code
});
```

### Step 3: Add Start Script

Update `package.json`:

```json
{
  "name": "psc170",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6"
  }
}
```

### Step 4: Push to GitHub

```bash
cd /Users/fortune/Desktop/PSC170
git init
git add .
git commit -m "Initial commit - Bus Fare System"
gh repo create PSC170 --public --source=. --push
```

If you don't have `gh` CLI, create repo on GitHub.com and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/PSC170.git
git branch -M main
git push -u origin main
```

### Step 5: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `psc170-bus-system`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. Click **"Advanced"** and add:
   - **Persistent Disk:**
     - **Mount Path:** `/data`
     - **Size:** 1 GB (free)
   - **Environment Variable:**
     - **Key:** `DATABASE_PATH`
     - **Value:** `/data/bus_system.db`
   - **Environment Variable:**
     - **Key:** `PORT`
     - **Value:** `8000` (Render assigns automatically, but we keep consistent)

7. Click **"Create Web Service"**

8. Wait 5-10 minutes for deployment

9. Your app will be live at: `https://psc170-bus-system.onrender.com`

### Important Notes

- ⚠️ Free tier sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds to wake up
- ✅ Database persists across deploys
- ✅ SSL/HTTPS included automatically

---

## Option 2: Railway.app

### Step 1: Push to GitHub (same as Render)

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Add environment variable:
   - **Key:** `DATABASE_PATH`
   - **Value:** `/app/bus_system.db`

7. Your app will be at: `https://your-app.up.railway.app`

### Notes

- You get $5 free credit per month
- No sleep times
- More reliable than Render free tier

---

## Option 3: Fly.io

### Step 1: Install Fly CLI

```bash
brew install flyctl
```

### Step 2: Login and Launch

```bash
cd /Users/fortune/Desktop/PSC170
flyctl auth login
flyctl launch
```

Follow prompts:
- App name: `psc170-bus-system`
- Region: Choose closest to you
- Database: **No** (we're using SQLite)
- Deploy now: **Yes**

### Step 3: Add Volume for Database

```bash
flyctl volumes create psc170_data --size 1
```

### Step 4: Update fly.toml

Add mounts section:

```toml
[mounts]
  source = "psc170_data"
  destination = "/data"
```

### Step 5: Set Environment

```bash
flyctl secrets set DATABASE_PATH=/data/bus_system.db
```

### Step 6: Deploy

```bash
flyctl deploy
```

Your app: `https://psc170-bus-system.fly.dev`

---

## Option 4: Glitch (Easiest, but database doesn't persist)

1. Go to [glitch.com](https://glitch.com)
2. Click **"New Project"** → **"Import from GitHub"**
3. Enter your GitHub repo URL
4. Glitch automatically deploys

**URL:** `https://your-project-name.glitch.me`

⚠️ **Warning:** Glitch resets your database when the app sleeps. Not recommended for production.

---

## After Deployment Checklist

✅ Test all features:
- Add a member
- Recharge balance
- Deduct trip fare
- View logs
- Dashboard stats

✅ Test double deduction prevention

✅ Change default admin password via Settings page

✅ Bookmark the URL for easy access

---

## Troubleshooting

### Database resets on Render
- Make sure you added **Persistent Disk** in Advanced settings
- Verify `DATABASE_PATH` points to disk mount path

### App won't start
- Check logs in platform dashboard
- Verify `package.json` has all dependencies
- Ensure `start` script exists

### Port errors
- Make sure `server.js` uses `process.env.PORT` or default:
  ```javascript
  const PORT = process.env.PORT || 8000;
  ```

### SQLite errors
- Some platforms need: `npm install sqlite3 --build-from-source`
- Add to package.json scripts:
  ```json
  "postinstall": "npm rebuild sqlite3"
  ```

---

## Recommended Next Steps

1. **Set up custom domain** (free on most platforms)
2. **Enable backups** (export database periodically)
3. **Monitor uptime** using [UptimeRobot](https://uptimerobot.com) (free)
4. **Add authentication** for admin features

---

## Cost Summary

| Platform | Monthly Cost | Best For |
|----------|-------------|----------|
| Render | **FREE** | Most users, persistent data |
| Railway | **FREE** ($5 credit) | Better uptime, no sleep |
| Fly.io | **FREE** (3 VMs) | Advanced users |
| Glitch | **FREE** | Testing only |

**My Recommendation:** Start with **Render**. It's the easiest and has persistent storage for your SQLite database.

---

## Need Help?

Common issues and solutions:
- **502 Bad Gateway:** App crashed, check logs
- **Database empty:** Persistent disk not configured
- **Slow first load:** Free tier sleeping (normal)
- **Build failed:** Missing dependencies in package.json

Let me know if you hit any issues during deployment!
