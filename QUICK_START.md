# 🚀 Quick Deployment Guide

I've prepared everything for you! Since the browser automation encountered a connectivity issue, here's the simplified manual process:

---

## Step 1: Create GitHub Repository (2 minutes)

You already have GitHub open in your browser! Here's what to do:

1. **Go to this URL in your browser:** https://github.com/new

2. **Fill in the form:**
   - **Repository name:** `PSC170`
   - **Description:** `Bus Fare Payment Management System`
   - **Visibility:** ✅ **PUBLIC** (required for free Render)
   - **❌ DO NOT check these boxes:**
     - Add a README file
     - Add .gitignore
     - Choose a license
   
3. **Click "Create repository"** (green button at bottom)

4. **Copy your GitHub username** (you'll need it for next step)

---

## Step 2: Push Code to GitHub (30 seconds)

I've created a script to make this super easy!

**In your terminal, run:**

```bash
cd /Users/fortune/Desktop/PSC170
./push_to_github.sh YOUR_USERNAME
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Example:**
```bash
./push_to_github.sh fortune
```

The script will:
- ✅ Add GitHub as remote
- ✅ Push all your code
- ✅ Show you the repository URL

---

## Step 3: Deploy on Render.com (5 minutes)

1. **Go to:** https://render.com

2. **Sign up/Login:**
   - Click "Get Started" or "Sign In"
   - Choose "Continue with GitHub" (easiest option)
   - Authorize Render to access your repositories

3. **Create Web Service:**
   - Click **"New +"** (top right)
   - Select **"Web Service"**
   - Find and click **"PSC170"** repository
   - Click **"Connect"**

4. **Configure Settings:**
   ```
   Name: psc170-bus-system
   Region: (Choose closest to you)
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Persistent Disk (IMPORTANT!):**
   - Scroll to "Advanced" section
   - Click "Add Disk"
   - **Name:** `psc170-database`
   - **Mount Path:** `/data`
   - **Size:** `1` GB
   
6. **Add Environment Variables:**
   - In "Advanced" section
   - Click "Add Environment Variable"
   - Add:
     - Key: `DATABASE_PATH` → Value: `/data/bus_system.db`
     - Key: `NODE_ENV` → Value: `production`

7. **Deploy:**
   - Click "Create Web Service" (bottom)
   - Wait 5-10 minutes for deployment
   - Your app will be live! 🎉

---

## ✅ Your URL Will Be:

`https://psc170-bus-system.onrender.com`

(Or whatever name you chose)

---

## 📋 Quick Checklist

- [ ] Create GitHub repo at github.com/new
- [ ] Run `./push_to_github.sh YOUR_USERNAME`
- [ ] Sign up at render.com with GitHub
- [ ] Create new Web Service
- [ ] Connect PSC170 repository
- [ ] Add persistent disk at `/data`
- [ ] Set environment variable `DATABASE_PATH=/data/bus_system.db`
- [ ] Deploy and wait
- [ ] Test your live app!
- [ ] Change admin password from default (`admin123`)

---

## 🆘 Need Help?

If anything doesn't work:
1. Check the detailed guide: `RENDER_SETUP_GUIDE.md`
2. Let me know which step you're stuck on
3. I can help troubleshoot!

**You're almost there! Just 3 simple steps to go live! 🚀**
