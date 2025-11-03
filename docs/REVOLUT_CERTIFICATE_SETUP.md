# Revolut Certificate Setup Guide

Complete guide to generating and configuring X.509 certificates for Revolut API authentication.

## Why Certificates?

Revolut Business API uses X.509 certificate-based authentication for enhanced security. You need:
- Private key (kept secret on your server)
- Public certificate (uploaded to Revolut portal)

## Quick Setup (Automated)

### Using Python Script (Recommended)

```bash
cd RevolutAPI
python3 scripts/generate_revolut_cert.py
```

This generates:
- `private_key.pem` - Keep this secret!
- `certificate.pem` - Upload to Revolut
- `public_key.pem` - Optional, for verification

**Next:** Upload `certificate.pem` to Revolut portal (see Step 3 below)

## Manual Setup

### Option 1: OpenSSL (Linux/Mac)

```bash
# Generate private key (2048-bit RSA)
openssl genrsa -out private_key.pem 2048

# Generate self-signed certificate (valid 1 year)
openssl req -new -x509 -key private_key.pem -out certificate.pem -days 365

# You'll be prompted for:
# Country Name: PT
# State: Your State
# Locality: Your City
# Organization: AreLuna
# Organizational Unit: Development
# Common Name: revolut-api.areluna.com
# Email: your-email@areluna.com
```

### Option 2: OpenSSL (Windows)

Download OpenSSL for Windows:
https://slproweb.com/products/Win32OpenSSL.html

Then run the same commands in PowerShell or CMD.

### Option 3: Node.js Script

```javascript
// generate-cert.js
const crypto = require('crypto');
const fs = require('fs');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

fs.writeFileSync('private_key.pem', privateKey);
fs.writeFileSync('public_key.pem', publicKey);

console.log('Keys generated successfully!');
```

Run:
```bash
node generate-cert.js
```

## Upload to Revolut Portal

### Step 1: Access Revolut Business Dashboard

1. Go to: https://business.revolut.com
2. Log in to your account
3. Navigate to: **Settings** → **API** → **API Certificates**

### Step 2: Add New Certificate

1. Click **"Add Certificate"** or **"Upload Certificate"**
2. Choose `certificate.pem` file
3. Give it a name: "Production API Certificate"
4. Click **"Upload"**

### Step 3: Get Client ID

After uploading:
1. Revolut generates a **Client ID**
2. Copy this Client ID
3. Add to your `.env` file:
   ```env
   REVOLUT_CLIENT_ID=your_client_id_here
   ```

### Step 4: Configure Environment

Update `.env`:

```env
# Revolut API Configuration
REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
REVOLUT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
REVOLUT_PRIVATE_KEY_PATH=./private_key.pem
REVOLUT_CERTIFICATE_PATH=./certificate.pem
```

**For Production:**
```env
REVOLUT_API_URL=https://b2b.revolut.com/api/1.0
```

## Certificate Details

### File Structure

```
RevolutAPI/
├── private_key.pem     ← Keep SECRET! Never commit to Git
├── certificate.pem     ← Upload to Revolut, safe to backup
└── public_key.pem      ← Optional, for local verification
```

### Certificate Information

View certificate details:
```bash
openssl x509 -in certificate.pem -text -noout
```

Check certificate validity:
```bash
openssl x509 -in certificate.pem -noout -dates
```

Extract public key from certificate:
```bash
openssl x509 -in certificate.pem -pubkey -noout > public_key.pem
```

## Security Best Practices

### 1. Protect Private Key

```bash
# Set restrictive permissions (Linux/Mac)
chmod 600 private_key.pem

# Verify permissions
ls -la private_key.pem
# Should show: -rw------- (only owner can read/write)
```

### 2. Never Commit to Git

Ensure `.gitignore` includes:
```
*.pem
*.key
*.crt
private_key.pem
certificate.pem
```

Verify:
```bash
git status
# Should NOT show .pem files
```

### 3. Backup Securely

```bash
# Encrypt before backup
openssl enc -aes-256-cbc -salt \
  -in private_key.pem \
  -out private_key.pem.enc

# Decrypt when needed
openssl enc -aes-256-cbc -d \
  -in private_key.pem.enc \
  -out private_key.pem
```

### 4. Rotate Certificates

Certificates expire! Set reminders:

```bash
# Check expiry
openssl x509 -in certificate.pem -noout -enddate

# Generate alert 30 days before expiry
# Add to cron or calendar
```

## Testing Certificate Authentication

### Test 1: Verify Files Exist

```bash
ls -la *.pem
# Should see:
# -rw------- private_key.pem
# -rw-r--r-- certificate.pem
```

### Test 2: Verify Certificate is Valid

```bash
# Check certificate validity
openssl x509 -in certificate.pem -noout -dates

# Verify key matches certificate
openssl x509 -noout -modulus -in certificate.pem | openssl md5
openssl rsa -noout -modulus -in private_key.pem | openssl md5
# Both outputs should match!
```

### Test 3: Test API Connection

```bash
# Start your server
npm run dev

# Test health check
curl http://localhost:3005/api/health

# Check logs for certificate loading
# Should see: "Private key loaded successfully"
```

## Troubleshooting

### Error: "Private key not found"

```bash
# Check file exists
ls -la private_key.pem

# Check path in .env
cat .env | grep REVOLUT_PRIVATE_KEY_PATH

# Verify path is correct relative to project root
pwd
```

### Error: "Could not read private key"

```bash
# Check file permissions
ls -la private_key.pem

# Fix permissions
chmod 600 private_key.pem

# Check file is not empty
cat private_key.pem
```

### Error: "Invalid certificate format"

```bash
# Verify certificate is PEM format
head -n 1 certificate.pem
# Should show: -----BEGIN CERTIFICATE-----

# Convert DER to PEM if needed
openssl x509 -inform der -in certificate.der -out certificate.pem
```

### Error: "Certificate expired"

```bash
# Check expiry date
openssl x509 -in certificate.pem -noout -enddate

# Generate new certificate
python3 scripts/generate_revolut_cert.py

# Upload new certificate to Revolut
# Update REVOLUT_CLIENT_ID in .env
```

### Error: "Modulus does not match"

Private key doesn't match certificate:

```bash
# Regenerate both
rm private_key.pem certificate.pem
python3 scripts/generate_revolut_cert.py

# Upload new certificate to Revolut
```

## Development vs Production

### Development (Sandbox)

```env
REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
REVOLUT_CLIENT_ID=sandbox_client_id
REVOLUT_PRIVATE_KEY_PATH=./private_key_dev.pem
```

### Production

```env
REVOLUT_API_URL=https://b2b.revolut.com/api/1.0
REVOLUT_CLIENT_ID=production_client_id
REVOLUT_PRIVATE_KEY_PATH=./private_key_prod.pem
```

**Use different certificates for each environment!**

## Certificate Rotation Process

When certificates expire (or for security):

1. **Generate New Certificate**:
   ```bash
   python3 scripts/generate_revolut_cert.py
   # Rename files to avoid overwriting
   mv private_key.pem private_key_new.pem
   mv certificate.pem certificate_new.pem
   ```

2. **Upload to Revolut**:
   - Upload `certificate_new.pem` to Revolut portal
   - Get new Client ID
   - Keep old certificate active during transition

3. **Update Environment**:
   ```env
   REVOLUT_CLIENT_ID=new_client_id
   REVOLUT_PRIVATE_KEY_PATH=./private_key_new.pem
   ```

4. **Test New Certificate**:
   ```bash
   npm run dev
   # Test API calls
   ```

5. **Deploy to Production**:
   ```bash
   git add .env.example  # Don't add .env!
   git commit -m "Update certificate configuration"
   vercel --prod
   ```

6. **Remove Old Certificate**:
   - After confirming new cert works
   - Delete old certificate from Revolut portal
   - Remove old `.pem` files

## Production Deployment

### Vercel / Serverless

Convert to environment variable:

```bash
# Convert private key to base64
cat private_key.pem | base64 | tr -d '\n' > private_key.base64

# Add to Vercel environment variables
# Name: REVOLUT_PRIVATE_KEY_BASE64
# Value: <paste base64 content>
```

Update `revolut.adapter.ts`:
```typescript
const privateKey = process.env.REVOLUT_PRIVATE_KEY_BASE64
  ? Buffer.from(process.env.REVOLUT_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
  : fs.readFileSync(privateKeyPath, 'utf8');
```

### Traditional Server

```bash
# Copy to server
scp private_key.pem user@server:/opt/revolut-api/

# Set permissions
ssh user@server 'chmod 600 /opt/revolut-api/private_key.pem'

# Update .env on server
REVOLUT_PRIVATE_KEY_PATH=/opt/revolut-api/private_key.pem
```

## FAQs

**Q: Do I need a different certificate for sandbox and production?**
A: Yes! Use separate certificates for each environment.

**Q: How long are certificates valid?**
A: Typically 1 year. Set reminders to rotate before expiry.

**Q: Can I reuse the same certificate for multiple apps?**
A: Not recommended. Use one certificate per application for security.

**Q: What if I lose my private key?**
A: Generate a new certificate pair and upload to Revolut. You cannot recover a lost private key.

**Q: Is the certificate encrypted?**
A: The certificate (public key) is not encrypted. The private key should be protected and can be encrypted for storage.

## Resources

- **Revolut API Docs**: https://developer.revolut.com/docs/business/authentication
- **OpenSSL Documentation**: https://www.openssl.org/docs/
- **X.509 Certificate Standard**: https://en.wikipedia.org/wiki/X.509

---

Your certificates are now configured! Test the API connection to verify.
