# Complete Your Render Setup

## ✅ What's Already Done
- ✅ GitHub repository created: `https://github.com/fortunegablin-rgb/PSC170`
- ✅ Code pushed successfully
- ✅ Render account created
- ✅ PSC170 repository connected to Render

---

## 📋 Complete These Steps (5 minutes)

You should already be on the Render configuration page. If not, go to:
**https://dashboard.render.com/web/new** and select your PSC170 repository.

### Fill in These Exact Values:

| Field | Value |
|-------|-------|
| **Name** | `psc170-bus-system` |
| **Region** | (Choose any - e.g., Frankfurt, Oregon, Singapore) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** ⚠️ Important! |

---

### Expand "Advanced" Section

Scroll down and click **"Advanced"** to expand it.

#### 1. Add Environment Variables

Click **"Add Environment Variable"** and add these TWO variables:

**Variable 1:**
- Key: `DATABASE_PATH`
- Value: `/data/bus_system.db`

**Variable 2:**
- Key: `NODE_ENV`
- Value: `production`

#### 2. Add Persistent Disk ⚠️ CRITICAL!

Click **"Add Disk"** and fill in:

- **Name:** `psc170-database`
- **Mount Path:** `/data`
- **Size:** `1` GB

> ⚠️ **IMPORTANT:** Without the persistent disk, your database will be erased every time the app restarts!

---

### Deploy!

1. Scroll to the bottom
2. Click **"Create Web Service"** (green button)
3. Wait 5-10 minutes for deployment

You'll see build logs. When it shows **"Your service is live"**, you're done! 🎉

---

## 🌐 Your App URL

After deployment, your app will be at:

**`https://psc170-bus-system.onrender.com`**

(Or similar, Render will show you the exact URL)

---

## ✅ After Deployment Checklist

1. Visit your app URL
2. Test adding a member
3. Test deducting a fare
4. **Change admin password** (default is `admin123`)
   - Go to Settings page
   - Enter current password: `admin123`
   - Set a new secure password

---

## 🆘 Troubleshooting

**Build Failed?**
- Check logs for errors
- Verify `npm install` and `npm start` are correct

**503 Service Unavailable?**
- First deployment takes 5-10 minutes
- Free tier sleeps after 15 min - first request takes 30-60 sec to wake

**Database Empty?**
- This is normal on first deployment
- Add test members to verify it's working

---

**Need help?** Let me know which step you're stuck on!
