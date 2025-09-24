# 🚀 Vercel Deployment Guide

## ✅ What I've Prepared for Deployment:

### 📂 Files Added/Modified:
- `vercel.json` - Vercel configuration for serverless deployment
- `dataStore.js` - Persistent file storage system
- `api/` folder - Serverless API routes for Vercel
- `.gitignore` - Added data/ and .vercel directories

### 🔄 Storage Upgrade:
- ❌ Before: In-memory storage (data lost on restart)
- ✅ After: File-based persistent storage + Vercel API routes

## 🚀 **After Creating New Project on Vercel:**

### **Step 1: Import Your GitHub Repository**
1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your repository: **`utkarshrajputt/prompt-battle`**
3. Click **"Import"**

### **Step 2: Configure Build Settings**
Vercel should auto-detect your settings:

- **Framework Preset**: `Other`
- **Build Command**: Leave empty (or `npm install`)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (recommended)

### **Step 3: Environment Variables**
- No environment variables needed for basic setup
- Click **"Add"** if you need any custom settings later

### **Step 4: Deploy**
1. Click **"Deploy"**
2. Wait for build completion (1-2 minutes)
3. Get your live URL: `https://prompt-battle-[random].vercel.app`

### **Step 5: Test Your Deployment**
✅ **Test these features:**
- Submit a new prompt
- Vote on prompts
- Check Top 3 updates automatically
- Download CSV export
- Data persists after refresh

## 🔧 **Troubleshooting:**

### **If API Routes Don't Work:**
- Check Vercel Function Logs in dashboard
- Ensure all files are pushed to GitHub
- Redeploy from Vercel dashboard

### **If Storage Issues:**
- Vercel serverless has limitations with file storage
- Consider upgrading to Vercel KV for production use

## 🌐 **Your Workshop URL:**
After deployment: `https://your-project-name.vercel.app`

## 🎯 **Ready for Your Workshop!**
✅ Persistent data storage
✅ Real-time voting system  
✅ Global accessibility
✅ Professional URL
✅ CSV export functionality