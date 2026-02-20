# Portfolio Website Deployment Guide

## ✅ What's Already Done

- ✅ Portfolio website built with Astro.js + Tailwind CSS
- ✅ All 6 pages created and tested
- ✅ GitHub Actions workflow configured
- ✅ Initial commit created
- ✅ Contact information updated
- ✅ Build tested successfully

---

## 🚀 Next Steps: Deploy to GitHub Pages

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**: https://github.com/new
2. **Repository Settings**:
   - **Repository name**: `portfolio_my` (or `majidrajpar.github.io` for custom domain)
   - **Description**: "Professional portfolio showcasing internal audit automation and ML-powered fraud detection projects"
   - **Visibility**: ✅ **Public** (required for GitHub Pages)
   - **Initialize**: ❌ Do NOT initialize with README, .gitignore, or license
3. **Click**: "Create repository"

### **Step 2: Push Your Code to GitHub**

After creating the repository, run these commands in your terminal:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/portfolio_my.git

# Verify the remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example** (if your username is "majidrajpar"):
```bash
git remote add origin https://github.com/majidrajpar/portfolio_my.git
git push -u origin main
```

### **Step 3: Enable GitHub Pages**

1. **Go to your repository** on GitHub
2. **Click**: Settings (top right)
3. **Navigate to**: Pages (left sidebar)
4. **Configure**:
   - **Source**: ✅ **GitHub Actions** (recommended)
   - This will automatically use the workflow in `.github/workflows/deploy.yml`
5. **Wait**: GitHub Actions will automatically build and deploy
   - Check the "Actions" tab to see the deployment progress
   - First deployment takes 1-2 minutes

### **Step 4: Access Your Live Site**

Once deployment completes, your site will be available at:

**📍 Live URL**: `https://YOUR_USERNAME.github.io/portfolio_my/`

**Example**: If your username is "majidrajpar":
- **Live Site**: https://majidrajpar.github.io/portfolio_my/

---

## 🔧 Alternative: Custom Domain Setup (Optional)

If you want to use a custom domain (e.g., `majidmumtaz.com`):

### **Option A: GitHub Pages Custom Domain**

1. **Buy a domain** (Namecheap, GoDaddy, Cloudflare)
2. **Add DNS records** (at your domain registrar):
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
3. **Update repository**:
   - Go to Settings → Pages
   - Add custom domain
   - Enable "Enforce HTTPS"

4. **Update `astro.config.mjs`**:
   ```javascript
   export default defineConfig({
     site: 'https://majidmumtaz.com',
     base: '/',  // Remove /portfolio_my for custom domain
     // ... rest of config
   });
   ```

### **Option B: Use Main GitHub Pages URL**

If you want the site at `https://majidrajpar.github.io/` (without `/portfolio_my`):

1. **Rename repository** to: `majidrajpar.github.io`
   - Settings → General → Repository name
2. **Update `astro.config.mjs`**:
   ```javascript
   export default defineConfig({
     site: 'https://majidrajpar.github.io',
     base: '/',  // Change from /portfolio_my to /
     // ... rest of config
   });
   ```
3. **Commit and push** the change
4. **Site will be at**: https://majidrajpar.github.io/

---

## 📊 Monitoring Deployment

### **Check Build Status**

1. **Go to**: Repository → Actions tab
2. **View**: "Deploy to GitHub Pages" workflow
3. **Status indicators**:
   - 🟢 Green checkmark = Successfully deployed
   - 🟡 Yellow circle = Building/deploying
   - 🔴 Red X = Build failed (check logs)

### **View Deployment Logs**

1. Click on the workflow run
2. Click "build" or "deploy" job
3. Expand steps to see detailed logs

---

## 🎯 Current Configuration

**Repository Name**: `portfolio_my` (recommended)
**Live URL**: `https://YOUR_USERNAME.github.io/portfolio_my/`
**Deployment Method**: GitHub Actions (automatic)
**Branch**: `main`

**Files**:
- ✅ `.github/workflows/deploy.yml` - Auto-deployment workflow
- ✅ `astro.config.mjs` - Configured for GitHub Pages
- ✅ All pages and components ready

---

## 🔄 Updating Your Portfolio

After initial deployment, to make changes:

```bash
# 1. Make your changes to files

# 2. Stage changes
git add .

# 3. Commit
git commit -m "Update portfolio content"

# 4. Push to GitHub
git push origin main

# 5. GitHub Actions automatically rebuilds and deploys
```

**Deployment time**: 1-2 minutes after push

---

## ⚡ Quick Reference Commands

```bash
# Check git status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# View git remotes
git remote -v

# Check current branch
git branch

# View commit history
git log --oneline -5
```

---

## 🆘 Troubleshooting

### **Issue: Build fails in GitHub Actions**

**Solution**:
1. Check Actions tab for error logs
2. Verify `package.json` dependencies are correct
3. Ensure `npm run build` works locally
4. Check `astro.config.mjs` configuration

### **Issue: Site shows 404**

**Solution**:
1. Verify you're accessing the correct URL (with `/portfolio_my/`)
2. Check Pages settings in repository
3. Ensure deployment completed successfully
4. Wait 2-3 minutes after deployment

### **Issue: Styles not loading**

**Solution**:
1. Check browser console for errors
2. Verify `base` path in `astro.config.mjs` matches repository name
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### **Issue: Changes not appearing**

**Solution**:
1. Verify commit was pushed: `git log --oneline -1`
2. Check Actions tab for deployment status
3. Clear browser cache
4. Wait for deployment to complete (1-2 minutes)

---

## 📧 Need Help?

If you encounter issues:
1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review [Astro deployment guide](https://docs.astro.build/en/guides/deploy/github/)
3. Contact: majidrajpar@gmail.com

---

## ✨ Next Steps After Deployment

Once your site is live:

1. **Add Content**:
   - Upload your CV to `public/cv/Majid_Mumtaz_CV.pdf`
   - Add project screenshots to `public/images/projects/`
   - Create detailed project pages

2. **Set Up Formspree**:
   - Go to https://formspree.io
   - Create account and get form ID
   - Update `src/pages/contact.astro` line 21

3. **Share Your Portfolio**:
   - Add URL to LinkedIn profile
   - Update CV with portfolio link
   - Share on professional networks

4. **Monitor Analytics** (Optional):
   - Set up Google Analytics 4
   - Track visitor engagement
   - Monitor popular projects

---

**Current Status**: ✅ Ready to deploy!

**Your next command**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio_my.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.
