# GitHub & Render Deployment Instructions

## ✅ Step 1: Git Repository (COMPLETED)

Your code is ready with:
- Git initialized ✅
- All files committed ✅
- Main branch created ✅

---

## 📤 Step 2: Push to GitHub

### Option A: Using GitHub Website (Recommended)

1. **Go to GitHub.com** and sign in (or create account if needed)
   - Visit: https://github.com

2. **Create a new repository**
   - Click the **"+"** icon (top right) → **"New repository"**
   - Repository name: `PSC170` (or any name you prefer)
   - Description: `Bus Fare Payment Management System`
   - Visibility: **Public** (required for free Render hosting)
   - **DO NOT** check "Add README", ".gitignore", or "license"
   - Click **"Create repository"**

3. **Copy the repository URL** 
   - You'll see commands on the next page
   - Look for the HTTPS URL like: `https://github.com/YOUR_USERNAME/PSC170.git`
   - Copy this URL

4. **Run these commands** in your terminal:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/PSC170.git
   git push -u origin main
   ```
   - Replace `YOUR_USERNAME` with your actual GitHub username
   - You may be prompted for your GitHub username and password/token

### Option B: Using GitHub CLI (if installed)

If you want to install GitHub CLI first:
```bash
brew install gh
gh auth login
gh repo create PSC170 --public --source=. --push
```

---

## 🚀 Step 3: Deploy on Render.com

1. **Go to Render** and create an account
   - Visit: https://render.com
   - Click **"Get Started"**
   - Sign up with **GitHub** (recommended - easier connection)

2. **Create a new Web Service**
   - From your dashboard, click **"New +"** → **"Web Service"**
   - Click **"Connect account"** if prompted (authorize Render to access GitHub)
   - Find and select your **PSC170** repository
   - Click **"Connect"**

3. **Configure your Web Service**
   
   Fill in these settings:
   
   - **Name:** `psc170-bus-system` (or your preferred name)
   - **Region:** Choose closest to you (e.g., Frankfurt, Singapore, Ohio)
   - **Branch:** `main`
   - **Runtime:** **Node** (should auto-detect)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**

4. **Add Persistent Disk (IMPORTANT!)**
   
   - Scroll down to **"Advanced"** section
   - Click **"Add Disk"**
   - **Name:** `psc170-database`
   - **Mount Path:** `/data`
   - **Size:** `1` GB (free tier)
   - Click **"Save"**

5. **Add Environment Variables**
   
   - In the **"Advanced"** section, find **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Add these:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_PATH` | `/data/bus_system.db` |
   | `NODE_ENV` | `production` |

6. **Create Web Service**
   
   - Scroll to bottom
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for deployment

7. **Monitor Deployment**
   
   - You'll see build logs in real-time
   - Wait for "Deploy live" message
   - Your URL will be shown at top: `https://psc170-bus-system.onrender.com`

---

## 🎉 Step 4: Test Your Live App

Once deployed:

1. **Visit your URL** (shown in Render dashboard)
2. **Test all features:**
   - ✅ Add a member
   - ✅ Recharge balance
   - ✅ Deduct trip fare
   - ✅ View logs
   - ✅ Dashboard stats

3. **Important:** Change admin password immediately
   - Go to Settings page
   - Default password is `admin123`
   - Change it to something secure

---

## 📝 Important Notes

### Free Tier Limitations
- ⚠️ App **sleeps after 15 minutes** of inactivity
- ⏱️ First request after sleep takes **30-60 seconds** to wake up
- ✅ Database **persists** between sleeps (thanks to persistent disk)
- ✅ **750 hours/month** free (enough for continuous operation)

### Keeping App Awake (Optional)
Use free uptime monitors to ping your app every 10 minutes:
- **UptimeRobot**: https://uptimerobot.com (free)
- **Cron-Job.org**: https://cron-job.org (free)

Set them to ping: `https://your-app.onrender.com/api/stats`

### Database Backups
Your database persists, but it's good practice to backup:
1. Add a backup endpoint (optional)
2. Download database file periodically
3. Or use Render's snapshot feature (paid)

---

## 🔧 Troubleshooting

### Build Failed
- Check that `package.json` has `"start": "node server.js"`
- Verify all dependencies are listed in `package.json`
- Check build logs for specific errors

### Database Empty After Deploy
- Verify you added **Persistent Disk** with mount path `/data`
- Check environment variable `DATABASE_PATH=/data/bus_system.db`
- Database starts empty on first deploy (this is normal)

### App Not Loading
- Check logs in Render dashboard
- Verify port is using `process.env.PORT || 8000`
- Wait full 10 minutes for initial deployment

### 502 Bad Gateway
- App crashed - check logs
- Usually a code error or missing dependency

---

## ✅ Checklist Before Going Live

- [ ] Pushed code to GitHub
- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Configured persistent disk
- [ ] Set DATABASE_PATH variable
- [ ] Deployment successful
- [ ] Tested all features
- [ ] Changed admin password
- [ ] Bookmarked live URL

---

## 🎯 Need Help?

If you run into issues:
1. Check Render logs (Dashboard → Logs tab)
2. Verify environment variables are set correctly
3. Ensure persistent disk is mounted at `/data`
4. Check GitHub repository is public

**Your local terminal is ready!** Just need to push to GitHub and configure Render.

Commands ready to run:
```bash
# After creating GitHub repo, run:
git remote add origin https://github.com/YOUR_USERNAME/PSC170.git
git push -u origin main
```

Then follow the Render steps above! 🚀
