# Vercel Deployment Guide

Deploy your Revolut API integration to Vercel for production use.

## Why Vercel?

- Free tier available
- Automatic HTTPS
- Easy GitHub integration
- Environment variable management
- Global CDN
- Automatic deployments on push

## Prerequisites

- GitHub account with your code pushed
- Vercel account (sign up at https://vercel.com)
- Code repository: https://github.com/arelunainstituto/RevolutAPI

## Quick Deploy (5 Minutes)

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose GitHub
   - Authorize Vercel to access GitHub
   - Select `arelunainstituto/RevolutAPI`

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3005
   REVOLUT_API_URL=https://b2b.revolut.com/api/1.0
   REVOLUT_CLIENT_ID=your_production_client_id
   REVOLUT_PRIVATE_KEY_PATH=/tmp/private_key.pem
   JWT_SECRET=your_production_jwt_secret
   JWT_EXPIRES_IN=24h
   WEBHOOK_SECRET=your_production_webhook_secret
   CORS_ORIGIN=https://yourdomain.com
   ```

5. **Deploy**: Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd RevolutAPI
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? revolut-api
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json

Already created at root of project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Environment Variables Setup

### Production Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

**Required:**
```bash
NODE_ENV=production
REVOLUT_API_URL=https://b2b.revolut.com/api/1.0
REVOLUT_CLIENT_ID=your_revolut_client_id
JWT_SECRET=use_output_from_command_below
WEBHOOK_SECRET=use_output_from_command_below
```

**Generate Secrets:**
```bash
# Generate production JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate production webhook secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Optional:**
```bash
PORT=3005
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Certificate Management on Vercel

Since Vercel uses serverless functions, handle certificates differently:

**Option 1: Environment Variable (Recommended)**

1. Convert certificate to base64:
```bash
cat private_key.pem | base64
```

2. Add to Vercel environment variables:
```
REVOLUT_PRIVATE_KEY_BASE64=<paste_base64_here>
```

3. Update code to decode:
```typescript
// In revolut.adapter.ts
const privateKey = process.env.REVOLUT_PRIVATE_KEY_BASE64
  ? Buffer.from(process.env.REVOLUT_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
  : fs.readFileSync(privateKeyPath, 'utf8');
```

**Option 2: Vercel Secrets**

```bash
# Using Vercel CLI
vercel secrets add revolut-private-key "$(cat private_key.pem)"
```

## Build Configuration

### package.json Scripts

Verify these scripts exist:

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

### Build Settings in Vercel

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Deployment Process

### Automatic Deployments

Every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Update API endpoints"
git push origin main

# Vercel automatically deploys
```

### Manual Deployment

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Preview Deployments

Each pull request gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

## Post-Deployment

### 1. Test Deployment

```bash
# Get your Vercel URL (e.g., revolut-api.vercel.app)
VERCEL_URL="your-project.vercel.app"

# Test health endpoint
curl https://$VERCEL_URL/api/health

# Test authentication
curl -X POST https://$VERCEL_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

### 3. Update Revolut Webhook URL

1. Go to Revolut Business: https://business.revolut.com/settings/api
2. Update webhook URL: `https://your-project.vercel.app/api/webhooks/revolut`
3. Save changes

### 4. Monitor Logs

View logs in Vercel Dashboard:
- Real-time function logs
- Error tracking
- Performance metrics

## Vercel CLI Commands

```bash
# List deployments
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Remove deployment
vercel rm <deployment-name>

# List environment variables
vercel env ls

# Add environment variable
vercel env add

# Pull environment variables locally
vercel env pull
```

## Domains & SSL

### Add Custom Domain

```bash
# Via CLI
vercel domains add api.yourdomain.com

# Via Dashboard
# Settings → Domains → Add
```

### SSL Certificates

- Automatic SSL via Let's Encrypt
- Certificates auto-renew
- HTTPS enforced by default

## Performance Optimization

### Enable Caching

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/revolut/exchange-rate",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### Function Configuration

```json
{
  "functions": {
    "dist/main.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## Monitoring & Analytics

### Vercel Analytics

1. Enable in Dashboard: Settings → Analytics
2. View metrics:
   - Request volume
   - Response times
   - Error rates
   - Geographic distribution

### Error Tracking

Integrate Sentry:

```bash
npm install @sentry/node
```

```typescript
// In main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs <deployment-url>

# Test build locally
npm run build

# Clear cache and rebuild
vercel --force
```

### Environment Variables Not Working

```bash
# Verify variables are set
vercel env ls

# Pull and check locally
vercel env pull .env.production

# Redeploy after adding variables
vercel --prod --force
```

### Certificate Issues

```bash
# Ensure base64 encoding is correct
cat private_key.pem | base64 | tr -d '\n'

# Test certificate locally first
npm run dev
```

### CORS Errors

Update `main.ts`:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
});
```

Set in Vercel:
```
CORS_ORIGIN=https://app1.com,https://app2.com
```

## Cost & Limits

### Free Tier Includes:
- 100 GB bandwidth
- 100 GB-Hours serverless function execution
- Unlimited deployments
- Automatic SSL
- 1 commercial project

### Upgrade Reasons:
- Need more bandwidth
- Team collaboration
- Advanced analytics
- Dedicated support

## Security Best Practices

1. **Use Environment Variables**: Never commit secrets
2. **Enable Vercel Authentication**: Protect preview deployments
3. **Rotate Secrets Regularly**: Update JWT_SECRET periodically
4. **Monitor Logs**: Check for suspicious activity
5. **Rate Limiting**: Implement API rate limits
6. **HTTPS Only**: Enforced automatically

## CI/CD Integration

### GitHub Actions + Vercel

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote <previous-deployment-url>
```

## Alternative Hosting Options

If Vercel doesn't fit your needs:

- **Heroku**: Traditional PaaS
- **Railway**: Similar to Vercel
- **Render**: Good free tier
- **DigitalOcean App Platform**: More control
- **AWS Lambda**: Serverless
- **Google Cloud Run**: Container-based

## Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI**: https://vercel.com/docs/cli
- **Node.js on Vercel**: https://vercel.com/docs/runtimes#official-runtimes/node-js
- **Environment Variables**: https://vercel.com/docs/environment-variables

## Support

- **Vercel Discord**: https://vercel.com/discord
- **Vercel Support**: support@vercel.com
- **GitHub Issues**: Report bugs in your repo

---

Your API is now live in production! 🚀

**Next Steps:**
1. Set up monitoring
2. Configure custom domain
3. Update Revolut webhook URL
4. Test all endpoints in production
5. Monitor logs and performance
