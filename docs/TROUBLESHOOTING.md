# Troubleshooting Guide

Common issues and solutions for the Revolut API Integration.

## Quick Diagnostics

Run these commands to check your setup:

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Check if dependencies are installed
ls node_modules

# Check if environment file exists
cat .env

# Check if certificates exist
ls *.pem

# Check git status
git status
```

---

## Installation Issues

### Issue: `npm install` fails

**Symptoms**:
```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Solutions**:

1. **Check Node.js version**:
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```
   If older, install latest: https://nodejs.org

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check network**:
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

### Issue: Permission errors during install

**Symptoms**:
```
EACCES: permission denied
```

**Solutions**:

```bash
# Option 1: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 2: Use sudo (not recommended)
sudo npm install

# Option 3: Fix ownership
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Certificate Issues

### Issue: "Private key not found"

**Symptoms**:
```
Error: ENOENT: no such file or directory, open './private_key.pem'
```

**Solutions**:

1. **Generate certificates**:
   ```bash
   python3 scripts/generate_revolut_cert.py
   ```

2. **Check file exists**:
   ```bash
   ls -la *.pem
   # Should show private_key.pem and certificate.pem
   ```

3. **Check .env path**:
   ```bash
   cat .env | grep REVOLUT_PRIVATE_KEY_PATH
   # Should be: REVOLUT_PRIVATE_KEY_PATH=./private_key.pem
   ```

### Issue: "Could not read private key"

**Symptoms**:
```
Error: Could not read private key from ./private_key.pem
```

**Solutions**:

1. **Check file permissions**:
   ```bash
   ls -la private_key.pem
   # Should show: -rw------- (600)
   ```

2. **Fix permissions**:
   ```bash
   chmod 600 private_key.pem
   ```

3. **Verify file is not empty**:
   ```bash
   cat private_key.pem
   # Should start with: -----BEGIN RSA PRIVATE KEY-----
   ```

### Issue: Certificate expired

**Symptoms**:
```
Error: Certificate has expired
```

**Solutions**:

1. **Check expiry date**:
   ```bash
   openssl x509 -in certificate.pem -noout -enddate
   ```

2. **Generate new certificate**:
   ```bash
   python3 scripts/generate_revolut_cert.py
   ```

3. **Upload to Revolut**:
   - Go to: https://business.revolut.com/settings/api/keys
   - Upload new certificate.pem
   - Update REVOLUT_CLIENT_ID in .env

---

## Environment Configuration Issues

### Issue: "Environment variable not set"

**Symptoms**:
```
Error: JWT_SECRET is not defined
```

**Solutions**:

1. **Check .env exists**:
   ```bash
   ls -la .env
   ```

2. **Create from template**:
   ```bash
   cp .env.example .env
   ```

3. **Set required variables**:
   ```bash
   nano .env
   # Update: JWT_SECRET, REVOLUT_CLIENT_ID, etc.
   ```

4. **Generate secrets**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Issue: Port already in use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3005
```

**Solutions**:

1. **Find and kill process**:
   ```bash
   # Mac/Linux
   lsof -ti:3005 | xargs kill -9

   # Or
   sudo kill -9 $(lsof -t -i:3005)
   ```

2. **Use different port**:
   ```bash
   echo "PORT=3006" >> .env
   npm run dev
   ```

3. **Check what's using the port**:
   ```bash
   lsof -i :3005
   ```

---

## Runtime Errors

### Issue: Server starts but crashes immediately

**Symptoms**:
```
Server starts then exits with code 1
```

**Solutions**:

1. **Check logs**:
   ```bash
   npm run dev
   # Read error messages carefully
   ```

2. **Verify TypeScript compilation**:
   ```bash
   npm run build
   # Check for compilation errors
   ```

3. **Check module imports**:
   ```bash
   # Ensure all imports are correct
   grep -r "from '@nestjs" src/
   ```

### Issue: "Cannot find module"

**Symptoms**:
```
Error: Cannot find module '@nestjs/common'
```

**Solutions**:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or install missing package specifically
npm install @nestjs/common
```

### Issue: TypeScript errors

**Symptoms**:
```
TS2307: Cannot find module or its corresponding type declarations
```

**Solutions**:

```bash
# Install type definitions
npm install --save-dev @types/node @types/express

# Rebuild
npm run build
```

---

## API Connection Issues

### Issue: 401 Unauthorized from Revolut API

**Symptoms**:
```
Error: Revolut API returned 401 Unauthorized
```

**Solutions**:

1. **Check Client ID**:
   ```bash
   cat .env | grep REVOLUT_CLIENT_ID
   # Should match ID from Revolut portal
   ```

2. **Verify certificate uploaded**:
   - Login to: https://business.revolut.com/settings/api/keys
   - Ensure certificate is active

3. **Check certificate matches key**:
   ```bash
   openssl x509 -noout -modulus -in certificate.pem | openssl md5
   openssl rsa -noout -modulus -in private_key.pem | openssl md5
   # Both should output the same hash
   ```

4. **Use correct API URL**:
   ```bash
   # Sandbox
   REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0

   # Production
   REVOLUT_API_URL=https://b2b.revolut.com/api/1.0
   ```

### Issue: 403 Forbidden

**Symptoms**:
```
Error: Revolut API returned 403 Forbidden
```

**Solutions**:

1. **Check API permissions** in Revolut portal
2. **Verify account access** rights
3. **Check if account is active**

### Issue: Connection timeout

**Symptoms**:
```
Error: timeout of 30000ms exceeded
```

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping revolut.com
   ```

2. **Check firewall**:
   ```bash
   # Ensure ports 80 and 443 are open
   ```

3. **Increase timeout** in `revolut.adapter.ts`:
   ```typescript
   timeout: 60000  // 60 seconds
   ```

---

## JWT Authentication Issues

### Issue: "Invalid token"

**Symptoms**:
```
401 Unauthorized: Invalid token
```

**Solutions**:

1. **Check token format**:
   ```bash
   # Token should be: Bearer <token>
   curl http://localhost:3005/api/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Get fresh token**:
   ```bash
   curl -X POST http://localhost:3005/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

3. **Check JWT_SECRET**:
   ```bash
   cat .env | grep JWT_SECRET
   # Must match between token generation and validation
   ```

### Issue: Token expired

**Symptoms**:
```
401 Unauthorized: Token expired
```

**Solutions**:

1. **Request new token** (see above)

2. **Increase expiration** in .env:
   ```bash
   JWT_EXPIRES_IN=48h  # 2 days instead of 24h
   ```

---

## Webhook Issues

### Issue: Webhook signature validation fails

**Symptoms**:
```
401 Unauthorized: Invalid webhook signature
```

**Solutions**:

1. **Check webhook secret**:
   ```bash
   cat .env | grep WEBHOOK_SECRET
   # Must match secret configured in Revolut
   ```

2. **Verify signature header**:
   ```bash
   # Header should be: X-Revolut-Signature
   ```

3. **Test webhook locally**:
   ```bash
   # Use ngrok to expose local server
   ngrok http 3005
   # Use ngrok URL in Revolut webhook settings
   ```

### Issue: Webhooks not received

**Symptoms**:
- No webhook events arriving

**Solutions**:

1. **Check webhook URL** in Revolut portal
2. **Ensure endpoint is accessible**:
   ```bash
   curl -X POST http://your-domain/api/webhooks/revolut \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Check firewall/security groups**
4. **View webhook logs** in Revolut portal

---

## Deployment Issues

### Issue: Vercel build fails

**Symptoms**:
```
Error: Build failed
```

**Solutions**:

1. **Check build locally**:
   ```bash
   npm run build
   # Fix any errors shown
   ```

2. **Check Vercel logs**:
   ```bash
   vercel logs <deployment-url>
   ```

3. **Verify Node.js version**:
   ```json
   // In package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

4. **Check environment variables** in Vercel dashboard

### Issue: Environment variables not working on Vercel

**Symptoms**:
- App works locally but not on Vercel
- "Environment variable not defined" errors

**Solutions**:

1. **Add variables in Vercel dashboard**:
   - Settings → Environment Variables
   - Add all variables from .env

2. **Redeploy after adding variables**:
   ```bash
   vercel --prod --force
   ```

3. **Check variable scopes**:
   - Production, Preview, Development

---

## Git Issues

### Issue: Accidentally committed secrets

**Symptoms**:
- .env or .pem files in Git history

**Solutions**:

1. **Remove from history** (⚠️ DANGEROUS):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env private_key.pem" \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

2. **Rotate all secrets immediately**:
   - Generate new JWT_SECRET
   - Generate new certificates
   - Update Revolut configuration

3. **Update .gitignore**:
   ```bash
   echo ".env" >> .gitignore
   echo "*.pem" >> .gitignore
   git add .gitignore
   git commit -m "Update gitignore"
   ```

### Issue: Large files rejected by GitHub

**Symptoms**:
```
Error: File exceeds GitHub's file size limit
```

**Solutions**:

1. **Check file sizes**:
   ```bash
   find . -type f -size +50M
   ```

2. **Remove large files**:
   ```bash
   git rm --cached large_file
   echo "large_file" >> .gitignore
   ```

3. **Use Git LFS** for necessary large files:
   ```bash
   git lfs install
   git lfs track "*.large"
   ```

---

## Testing Issues

### Issue: Cannot test API endpoints

**Symptoms**:
- Endpoints return errors in Swagger docs

**Solutions**:

1. **Check server is running**:
   ```bash
   curl http://localhost:3005/api/health
   ```

2. **Get valid token first**:
   - Use /api/auth/login endpoint
   - Copy access_token
   - Click "Authorize" in Swagger
   - Enter: `Bearer YOUR_TOKEN`

3. **Check request body format**:
   - Must be valid JSON
   - Required fields must be present

---

## Performance Issues

### Issue: Slow response times

**Solutions**:

1. **Check Revolut API status**:
   - Visit: https://status.revolut.com

2. **Increase timeout**:
   ```typescript
   // In revolut.adapter.ts
   timeout: 60000  // 60 seconds
   ```

3. **Add logging**:
   ```typescript
   console.time('api-call');
   const result = await api.call();
   console.timeEnd('api-call');
   ```

4. **Check network latency**:
   ```bash
   ping b2b.revolut.com
   ```

---

## Getting Help

If you can't resolve your issue:

1. **Check logs**:
   ```bash
   npm run dev
   # Read full error messages
   ```

2. **Search documentation**:
   - README.md
   - API_REFERENCE.md
   - Revolut API docs

3. **Check examples**:
   - Swagger docs: `/api/docs`
   - Code examples in docs/

4. **Community resources**:
   - NestJS Discord
   - Revolut Developer Forum
   - Stack Overflow

5. **Contact support**:
   - Revolut: https://developer.revolut.com/support
   - GitHub Issues: (your repo)/issues

---

## Diagnostic Commands

Run these to gather information for support:

```bash
# System info
node --version
npm --version
cat package.json | grep version

# Environment
cat .env.example  # Never share actual .env!
ls -la *.pem

# Dependencies
npm list --depth=0

# Build check
npm run build 2>&1 | tee build.log

# Test endpoint
curl -v http://localhost:3005/api/health 2>&1 | tee api-test.log
```

---

## Prevention Tips

1. **Always test locally** before deploying
2. **Use .env.example** as template
3. **Never commit secrets** to Git
4. **Backup certificates** securely
5. **Set certificate expiry reminders**
6. **Monitor API logs** regularly
7. **Keep dependencies updated**
8. **Test with sandbox** before production

---

**Still having issues?** Check the README.md or create an issue in your repository.
