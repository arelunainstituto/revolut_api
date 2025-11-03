# Revolut API Integration

Complete NestJS application for integrating Revolut Business API with AreLuna.

## Features

- Full TypeScript NestJS implementation
- Revolut Business API adapter
- JWT authentication
- Webhook support for real-time events
- Swagger/OpenAPI documentation
- Production-ready with security best practices
- Easy deployment to Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Revolut credentials

# Generate certificates (required)
python3 scripts/generate_revolut_cert.py

# Run in development
npm run dev

# Visit API documentation
open http://localhost:3005/api/docs
```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status
- `GET /api` - Welcome message

### Authentication
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/profile` - Get current user profile

### Revolut Operations
- `GET /api/revolut/accounts` - List all accounts
- `GET /api/revolut/accounts/:id` - Get account details
- `GET /api/revolut/accounts/:id/balance` - Get account balance
- `GET /api/revolut/transactions` - List transactions
- `GET /api/revolut/transactions/:id` - Get transaction details
- `POST /api/revolut/payments` - Create payment
- `GET /api/revolut/counterparties` - List counterparties
- `POST /api/revolut/counterparties` - Create counterparty
- `GET /api/revolut/exchange-rate` - Get exchange rate

### Webhooks
- `POST /api/webhooks/revolut` - Receive Revolut webhook events
- `GET /api/webhooks/info` - Webhook configuration info

## Environment Variables

```env
# Server
PORT=3005
NODE_ENV=development

# Revolut API
REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
REVOLUT_CLIENT_ID=your_client_id
REVOLUT_PRIVATE_KEY_PATH=./private_key.pem

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Webhooks
WEBHOOK_SECRET=your_webhook_secret
```

## Authentication

All Revolut API endpoints require JWT authentication. To get a token:

```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

Use the returned token in subsequent requests:

```bash
curl http://localhost:3005/api/revolut/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Certificate Setup

Revolut API requires X.509 certificates for authentication:

1. **Automated (Recommended)**:
   ```bash
   python3 scripts/generate_revolut_cert.py
   ```

2. **Manual**:
   ```bash
   openssl genrsa -out private_key.pem 2048
   openssl req -new -x509 -key private_key.pem -out certificate.pem -days 365
   ```

3. Upload `certificate.pem` to Revolut Business portal:
   https://business.revolut.com/settings/api/keys

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [DEPLOYMENT_VERCEL.md](docs/DEPLOYMENT_VERCEL.md) for detailed instructions.

## Project Structure

```
RevolutAPI/
├── src/
│   ├── auth/                 # JWT authentication
│   ├── revolut/              # Revolut API integration
│   │   └── adapters/         # API adapter
│   ├── webhooks/             # Webhook handlers
│   ├── app.module.ts         # Main application module
│   └── main.ts               # Application entry point
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── package.json              # Dependencies
└── .env.example              # Environment template
```

## Development

```bash
# Development with watch mode
npm run dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm test

# Lint
npm run lint
```

## Documentation

- [QUICK_START.md](docs/QUICK_START.md) - 15-minute setup guide
- [GITHUB_SETUP_GUIDE.md](docs/GITHUB_SETUP_GUIDE.md) - Publishing to GitHub
- [DEPLOYMENT_VERCEL.md](docs/DEPLOYMENT_VERCEL.md) - Vercel deployment
- [REVOLUT_CERTIFICATE_SETUP.md](docs/REVOLUT_CERTIFICATE_SETUP.md) - Certificate guide
- [REVOLUT_NESTJS_IMPLEMENTATION.md](docs/REVOLUT_NESTJS_IMPLEMENTATION.md) - Implementation details
- [INDEX.md](docs/INDEX.md) - Complete file index

## Technologies

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Authentication**: Passport JWT
- **Documentation**: Swagger/OpenAPI
- **HTTP Client**: Axios
- **Runtime**: Node.js 18+

## Security

- JWT tokens for authentication
- X.509 certificates for Revolut API
- Webhook signature verification
- CORS configuration
- Environment variable protection
- Input validation with class-validator

## Support

- Documentation: See [docs/](docs/) folder
- Revolut API Docs: https://developer.revolut.com
- NestJS Docs: https://docs.nestjs.com

## License

MIT

## Credits

Developed by **Grupo AreLuna**
Version: 1.0.0
Date: November 3, 2024
