# Quick Start Guide - 15 Minutes to Running

Get the Revolut API integration running in 15 minutes.

## Prerequisites Check

Before starting, verify you have:

```bash
# Node.js 18 or higher
node --version

# npm
npm --version

# Python 3 (for certificate generation)
python3 --version

# Git
git --version
```

## Step 1: Install Dependencies (2 minutes)

```bash
cd RevolutAPI
npm install
```

## Step 2: Configure Environment (3 minutes)

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

Update these required values:
```env
REVOLUT_CLIENT_ID=your_client_id_from_revolut_portal
JWT_SECRET=generate_a_random_secret_key
WEBHOOK_SECRET=generate_a_random_webhook_secret
```

**Generate secrets:**
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Generate Certificates (5 minutes)

### Option A: Automated (Recommended)

```bash
python3 scripts/generate_revolut_cert.py
```

### Option B: Manual

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Generate certificate
openssl req -new -x509 -key private_key.pem -out certificate.pem -days 365
```

**Important**: Upload `certificate.pem` to Revolut Business portal:
1. Go to https://business.revolut.com/settings/api/keys
2. Click "Add API Certificate"
3. Upload your `certificate.pem` file
4. Copy your Client ID to `.env`

## Step 4: Start the Server (1 minute)

```bash
# Development mode with hot reload
npm run dev
```

You should see:
```
================================================================================
🚀 Revolut API Server Running
================================================================================
Server:      http://localhost:3005
API Docs:    http://localhost:3005/api/docs
Health:      http://localhost:3005/api/health
Environment: development
================================================================================
```

## Step 5: Test the API (4 minutes)

### Test 1: Health Check

```bash
curl http://localhost:3005/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-03T...",
  "service": "Revolut API Integration",
  "version": "1.0.0"
}
```

### Test 2: Get JWT Token

```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h"
}
```

**Copy the access_token for next steps!**

### Test 3: Access Protected Endpoint

```bash
# Replace YOUR_TOKEN with the token from previous step
curl http://localhost:3005/api/revolut/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: View API Documentation

Open in browser:
```
http://localhost:3005/api/docs
```

You'll see the complete Swagger documentation with all endpoints.

## Common Issues & Solutions

### Issue: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3005 already in use"
```bash
# Solution: Change port in .env
echo "PORT=3006" >> .env
```

### Issue: "Private key not found"
```bash
# Solution: Generate certificates
python3 scripts/generate_revolut_cert.py
```

### Issue: "Invalid JWT secret"
```bash
# Solution: Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env as JWT_SECRET
```

## Next Steps

Now that your API is running:

1. **Explore API Documentation**: http://localhost:3005/api/docs
2. **Test Revolut Endpoints**: Try different API calls
3. **Set up Webhooks**: Configure webhook URL in Revolut portal
4. **Deploy to Production**: See [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)
5. **Integrate with Your App**: Use the API in your frontend

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm test

# Check health
curl http://localhost:3005/api/health

# Get API token
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## Development Workflow

```bash
# 1. Start dev server (terminal 1)
npm run dev

# 2. Make code changes
# Files auto-reload on save

# 3. Test changes
curl http://localhost:3005/api/health

# 4. View logs in terminal
```

## Environment Modes

### Development (Default)
```bash
npm run dev
# Hot reload enabled
# Detailed logging
# CORS: *
```

### Production
```bash
npm run build
npm run start:prod
# Optimized build
# Minimal logging
# CORS: configured domains
```

## Useful Links

- **API Docs**: http://localhost:3005/api/docs
- **Health Check**: http://localhost:3005/api/health
- **Revolut Portal**: https://business.revolut.com
- **Revolut API Docs**: https://developer.revolut.com

## Troubleshooting

If something doesn't work:

1. Check Node.js version: `node --version` (need 18+)
2. Check environment: `cat .env`
3. Check certificates exist: `ls *.pem`
4. Check logs in terminal
5. Check API docs: http://localhost:3005/api/docs

## Support

- Check [README.md](../README.md) for detailed documentation
- See [REVOLUT_CERTIFICATE_SETUP.md](REVOLUT_CERTIFICATE_SETUP.md) for certificate help
- Review [REVOLUT_NESTJS_IMPLEMENTATION.md](REVOLUT_NESTJS_IMPLEMENTATION.md) for code details

---

**Congratulations!** Your Revolut API integration is now running. 🚀
