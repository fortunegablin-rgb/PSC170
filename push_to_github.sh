#!/bin/bash
# GitHub Push Script for PSC170
# Replace YOUR_USERNAME with your actual GitHub username

echo "🚀 PSC170 GitHub Push Script"
echo "================================"
echo ""

# Check if username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo ""
    echo "Usage: ./push_to_github.sh YOUR_USERNAME"
    echo "Example: ./push_to_github.sh fortune"
    exit 1
fi

USERNAME=$1
REPO_NAME="PSC170"

echo "📝 GitHub Username: $USERNAME"
echo "📦 Repository Name: $REPO_NAME"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git not initialized"
    exit 1
fi

echo "🔗 Adding GitHub remote..."
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git" 2>/dev/null || {
    echo "⚠️  Remote already exists, updating..."
    git remote set-url origin "https://github.com/$USERNAME/$REPO_NAME.git"
}

echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo "🌐 Repository URL: https://github.com/$USERNAME/$REPO_NAME"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to https://render.com"
    echo "2. Sign up/Login with GitHub"
    echo "3. Create New Web Service"
    echo "4. Connect your PSC170 repository"
    echo ""
else
    echo ""
    echo "❌ Push failed. Possible reasons:"
    echo "1. Repository doesn't exist on GitHub yet"
    echo "2. Authentication failed"
    echo "3. Network issue"
    echo ""
    echo "To create the repository:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Make it PUBLIC"
    echo "4. Don't add README, .gitignore, or license"
    echo "5. Click 'Create repository'"
    echo "6. Run this script again"
fi
