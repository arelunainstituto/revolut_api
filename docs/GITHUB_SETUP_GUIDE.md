# GitHub Setup Guide

Complete guide to publishing your Revolut API integration to GitHub.

## Prerequisites

- GitHub account (create at https://github.com)
- Git installed locally
- Repository created: https://github.com/arelunainstituto/RevolutAPI

## Step 1: Verify Git Configuration

```bash
# Check Git is installed
git --version

# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

## Step 2: Initialize Local Repository

Your repository is already initialized, but let's verify:

```bash
cd RevolutAPI

# Check git status
git status

# View current remote
git remote -v
```

Expected output:
```
origin  https://github.com/arelunainstituto/RevolutAPI (fetch)
origin  https://github.com/arelunainstituto/RevolutAPI (push)
```

## Step 3: Review Files to Commit

Check what will be committed:

```bash
# See all files
git status

# Check .gitignore is working
cat .gitignore
```

**Important**: Verify these files are NOT staged:
- `.env` (environment variables)
- `*.pem` (certificates and keys)
- `node_modules/` (dependencies)

## Step 4: Stage Files

```bash
# Add all files (respecting .gitignore)
git add .

# Review what's staged
git status
```

You should see files like:
```
src/
docs/
scripts/
package.json
tsconfig.json
README.md
.env.example
.gitignore
```

## Step 5: Create First Commit

```bash
git commit -m "Initial commit: Revolut API Integration

- Complete NestJS application structure
- Revolut API adapter with TypeScript
- JWT authentication system
- Webhook management
- Swagger documentation
- 10+ comprehensive guides
- Python certificate generation script
- Vercel deployment configuration

Ready for production use.

Generated with Claude Code
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Step 6: Push to GitHub

```bash
# Push to main branch
git push -u origin main
```

If this is your first push, you might need to authenticate:

### Option A: Personal Access Token (Recommended)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Generate token and copy it
5. Use token as password when prompted

### Option B: SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:arelunainstituto/RevolutAPI.git

# Push
git push -u origin main
```

## Step 7: Verify on GitHub

Visit: https://github.com/arelunainstituto/RevolutAPI

You should see:
- All your files and folders
- README.md displayed on the main page
- Commit history
- Branches

## Step 8: Set Up Repository Settings

### Add Description

1. Go to repository page
2. Click gear icon next to "About"
3. Add description: "Revolut Business API Integration for AreLuna - NestJS TypeScript"
4. Add topics: `revolut`, `nestjs`, `typescript`, `api`, `payment`, `fintech`

### Configure Branch Protection (Optional)

For production repositories:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks
   - Require branches to be up to date

### Set Up Secrets (for CI/CD)

If using GitHub Actions:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `REVOLUT_CLIENT_ID`
   - `JWT_SECRET`
   - `WEBHOOK_SECRET`

## Common Git Workflows

### Make Changes and Push

```bash
# Make your code changes

# Check what changed
git status
git diff

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

### Create a New Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
```

### Pull Latest Changes

```bash
# Get latest from remote
git pull origin main

# Or fetch and merge separately
git fetch origin
git merge origin/main
```

### View Commit History

```bash
# View commit log
git log --oneline --graph

# View specific file history
git log --follow -- src/revolut/revolut.service.ts
```

## Repository Structure on GitHub

After pushing, your repo will look like:

```
RevolutAPI/
├── .github/              # GitHub configs (workflows, etc.)
├── docs/                 # Documentation
│   ├── QUICK_START.md
│   ├── GITHUB_SETUP_GUIDE.md
│   ├── DEPLOYMENT_VERCEL.md
│   └── ...
├── scripts/              # Utility scripts
│   └── generate_revolut_cert.py
├── src/                  # Source code
│   ├── auth/
│   ├── revolut/
│   ├── webhooks/
│   └── ...
├── .gitignore           # Git ignore rules
├── .env.example         # Environment template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── README.md            # Main documentation
└── LICENSE              # License file
```

## Recommended: Add LICENSE

```bash
# Create MIT License
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 Grupo AreLuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Commit and push
git add LICENSE
git commit -m "Add MIT License"
git push
```

## GitHub Features to Enable

### 1. GitHub Pages (for Documentation)

Settings → Pages → Source: Deploy from a branch → Select `main` / `docs`

### 2. Issues

Enable for bug tracking and feature requests

### 3. Projects

Use for project management and task tracking

### 4. Actions

Set up CI/CD workflows (see below)

## Optional: GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Run tests
      run: npm test
```

## Troubleshooting

### Authentication Failed

```bash
# Use personal access token instead of password
# Generate at: https://github.com/settings/tokens
```

### Remote Already Exists

```bash
# Remove and re-add
git remote remove origin
git remote add origin https://github.com/arelunainstituto/RevolutAPI.git
```

### Accidentally Committed Secrets

```bash
# Remove from history (DANGEROUS)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all

# Rotate all secrets immediately!
```

### Large Files

GitHub has a 100MB file limit. Use Git LFS for large files:

```bash
git lfs install
git lfs track "*.pem"
git add .gitattributes
```

## Best Practices

1. **Never commit secrets** - Use `.env` and `.gitignore`
2. **Write clear commit messages** - Explain why, not what
3. **Use branches** - Keep `main` stable
4. **Review before pushing** - Check `git status` and `git diff`
5. **Pull before push** - Stay up to date with remote
6. **Small commits** - Easier to review and revert
7. **Test before commit** - Run `npm test` and `npm run build`

## Next Steps

Now that your code is on GitHub:

1. **Deploy to Vercel**: See [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)
2. **Set up CI/CD**: Add GitHub Actions workflows
3. **Invite collaborators**: Settings → Collaborators
4. **Write contributing guide**: Add CONTRIBUTING.md
5. **Set up issue templates**: .github/ISSUE_TEMPLATE/

## Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Docs**: https://docs.github.com
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

Your code is now on GitHub! 🎉 Next: Deploy to production.
