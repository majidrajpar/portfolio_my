#!/bin/bash
# GitHub Push Commands
# After creating repository at https://github.com/new
# Replace YOUR_USERNAME with your actual GitHub username

echo "=========================================="
echo "Portfolio Website - GitHub Setup"
echo "=========================================="
echo ""

# Check if already configured
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote 'origin' already configured:"
    git remote -v
    echo ""
    echo "To push updates:"
    echo "  git push origin main"
else
    echo "⚠️  Remote not configured yet."
    echo ""
    echo "After creating your repository on GitHub, run:"
    echo ""
    echo "  git remote add origin https://github.com/YOUR_USERNAME/portfolio_my.git"
    echo "  git push -u origin main"
    echo ""
    echo "Replace YOUR_USERNAME with your GitHub username"
fi

echo ""
echo "=========================================="
echo "Next Steps After Push:"
echo "=========================================="
echo "1. Go to repository Settings → Pages"
echo "2. Source: Select 'GitHub Actions'"
echo "3. Wait 1-2 minutes for deployment"
echo "4. Visit: https://YOUR_USERNAME.github.io/portfolio_my/"
echo ""
