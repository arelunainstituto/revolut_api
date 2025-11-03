# API Reference

Complete reference for all Revolut API Integration endpoints.

## Base URL

- **Development**: `http://localhost:3005`
- **Production**: `https://your-project.vercel.app`

## API Prefix

All endpoints are prefixed with `/api`

Example: `http://localhost:3005/api/health`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Get a token from the `/api/auth/login` endpoint.

## Interactive Documentation

Visit `/api/docs` for interactive Swagger documentation:

```
http://localhost:3005/api/docs
```

---

## Health & Status Endpoints

### GET /api/health

Health check endpoint.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-11-03T12:00:00.000Z",
  "service": "Revolut API Integration",
  "version": "1.0.0",
  "environment": "development"
}
```

### GET /api

Welcome message and API information.

**Authentication**: Not required

**Response**:
```json
{
  "message": "Welcome to AreLuna Revolut API Integration",
  "documentation": "/api/docs",
  "health": "/api/health",
  "version": "1.0.0"
}
```

---

## Authentication Endpoints

### POST /api/auth/login

Get JWT authentication token.

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h"
}
```

**Example**:
```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### GET /api/auth/profile

Get current user profile from JWT token.

**Authentication**: Required

**Headers**:
```http
Authorization: Bearer <your_token>
```

**Response**:
```json
{
  "userId": "user_id",
  "username": "test"
}
```

**Example**:
```bash
curl http://localhost:3005/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Revolut API Endpoints

All Revolut endpoints require authentication.

### GET /api/revolut/accounts

Get all Revolut business accounts.

**Authentication**: Required

**Response**:
```json
[
  {
    "id": "account_id",
    "name": "Main Account",
    "balance": 10000.50,
    "currency": "EUR",
    "state": "active"
  }
]
```

**Example**:
```bash
curl http://localhost:3005/api/revolut/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/revolut/accounts/:accountId

Get specific account details.

**Authentication**: Required

**Path Parameters**:
- `accountId` (string, required): Account ID

**Response**:
```json
{
  "id": "account_id",
  "name": "Main Account",
  "balance": 10000.50,
  "currency": "EUR",
  "state": "active",
  "public": false,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3005/api/revolut/accounts/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/revolut/accounts/:accountId/balance

Get account balance.

**Authentication**: Required

**Path Parameters**:
- `accountId` (string, required): Account ID

**Response**:
```json
{
  "account_id": "account_id",
  "balance": 10000.50,
  "currency": "EUR",
  "updated_at": "2024-11-03T12:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3005/api/revolut/accounts/abc123/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/revolut/transactions

Get transactions with optional filters.

**Authentication**: Required

**Query Parameters**:
- `from` (string, optional): Start date (ISO 8601)
- `to` (string, optional): End date (ISO 8601)
- `accountId` (string, optional): Filter by account
- `limit` (number, optional): Maximum results

**Response**:
```json
[
  {
    "id": "transaction_id",
    "type": "transfer",
    "state": "completed",
    "created_at": "2024-11-03T12:00:00.000Z",
    "completed_at": "2024-11-03T12:01:00.000Z",
    "legs": [
      {
        "account_id": "account_id",
        "amount": -100.00,
        "currency": "EUR"
      }
    ]
  }
]
```

**Example**:
```bash
# All transactions
curl http://localhost:3005/api/revolut/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# With filters
curl "http://localhost:3005/api/revolut/transactions?from=2024-01-01&to=2024-12-31&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/revolut/transactions/:transactionId

Get specific transaction details.

**Authentication**: Required

**Path Parameters**:
- `transactionId` (string, required): Transaction ID

**Response**:
```json
{
  "id": "transaction_id",
  "type": "transfer",
  "state": "completed",
  "created_at": "2024-11-03T12:00:00.000Z",
  "completed_at": "2024-11-03T12:01:00.000Z",
  "legs": [
    {
      "account_id": "from_account",
      "amount": -100.00,
      "currency": "EUR"
    },
    {
      "account_id": "to_account",
      "amount": 100.00,
      "currency": "EUR"
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:3005/api/revolut/transactions/txn123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/revolut/payments

Create a new payment.

**Authentication**: Required

**Request Body**:
```json
{
  "account_id": "your_account_id",
  "receiver": {
    "counterparty_id": "counterparty_id",
    "account_id": "receiver_account_id"
  },
  "amount": 100.00,
  "currency": "EUR",
  "reference": "Payment reference"
}
```

**Response**:
```json
{
  "id": "payment_id",
  "state": "pending",
  "created_at": "2024-11-03T12:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST http://localhost:3005/api/revolut/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "acc123",
    "receiver": {
      "counterparty_id": "cp123"
    },
    "amount": 100.00,
    "currency": "EUR",
    "reference": "Invoice payment"
  }'
```

### GET /api/revolut/counterparties

Get all counterparties.

**Authentication**: Required

**Response**:
```json
[
  {
    "id": "counterparty_id",
    "name": "John Doe",
    "email": "john@example.com",
    "state": "created",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Example**:
```bash
curl http://localhost:3005/api/revolut/counterparties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/revolut/counterparties

Create a new counterparty.

**Authentication**: Required

**Request Body**:
```json
{
  "company_name": "Acme Corp",
  "email": "finance@acme.com",
  "phone": "+351912345678",
  "country": "PT",
  "bank_country": "PT",
  "currency": "EUR",
  "iban": "PT50000000000000000000000"
}
```

**Response**:
```json
{
  "id": "counterparty_id",
  "name": "Acme Corp",
  "state": "created",
  "created_at": "2024-11-03T12:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST http://localhost:3005/api/revolut/counterparties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Acme Corp",
    "email": "finance@acme.com",
    "country": "PT",
    "currency": "EUR",
    "iban": "PT50000000000000000000000"
  }'
```

### GET /api/revolut/exchange-rate

Get exchange rate between currencies.

**Authentication**: Required

**Query Parameters**:
- `from` (string, required): Source currency code (e.g., EUR)
- `to` (string, required): Target currency code (e.g., USD)
- `amount` (number, optional): Amount to convert

**Response**:
```json
{
  "from": "EUR",
  "to": "USD",
  "rate": 1.0850,
  "amount": 100.00,
  "result": 108.50,
  "timestamp": "2024-11-03T12:00:00.000Z"
}
```

**Example**:
```bash
# Get rate
curl "http://localhost:3005/api/revolut/exchange-rate?from=EUR&to=USD" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Convert amount
curl "http://localhost:3005/api/revolut/exchange-rate?from=EUR&to=USD&amount=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Webhook Endpoints

### POST /api/webhooks/revolut

Receive webhook events from Revolut.

**Authentication**: Webhook signature verification

**Headers**:
```http
X-Revolut-Signature: <webhook_signature>
```

**Request Body** (varies by event type):
```json
{
  "event": "TransactionCreated",
  "timestamp": "2024-11-03T12:00:00.000Z",
  "data": {
    "id": "transaction_id",
    "type": "transfer",
    "state": "completed"
  }
}
```

**Response**:
```json
{
  "status": "processed",
  "event": "TransactionCreated",
  "transactionId": "transaction_id"
}
```

**Supported Events**:
- `TransactionCreated`
- `TransactionStateChanged`
- `PaymentCreated`
- `PaymentStateChanged`

### GET /api/webhooks/info

Get webhook configuration information.

**Authentication**: Not required

**Response**:
```json
{
  "configured": true,
  "supportedEvents": [
    "TransactionCreated",
    "TransactionStateChanged",
    "PaymentCreated",
    "PaymentStateChanged"
  ]
}
```

**Example**:
```bash
curl http://localhost:3005/api/webhooks/info
```

---

## Error Responses

All endpoints follow consistent error formatting:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limits

- Revolut API has rate limits (check Revolut documentation)
- This wrapper doesn't implement additional rate limiting
- Consider implementing rate limiting for production use

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (never in localStorage for web apps)
3. **Refresh tokens** before expiry
4. **Handle errors** gracefully
5. **Validate webhook signatures** always
6. **Log all API calls** for debugging
7. **Use environment-specific** credentials (sandbox vs production)

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data } = await api.post('/auth/login', {
  username: 'test',
  password: 'test123'
});

// Set token for subsequent requests
api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

// Get accounts
const accounts = await api.get('/revolut/accounts');
```

### Python

```python
import requests

base_url = 'https://your-api.vercel.app/api'

# Login
response = requests.post(f'{base_url}/auth/login', json={
    'username': 'test',
    'password': 'test123'
})
token = response.json()['access_token']

# Get accounts
headers = {'Authorization': f'Bearer {token}'}
accounts = requests.get(f'{base_url}/revolut/accounts', headers=headers)
print(accounts.json())
```

### cURL

```bash
# Save token to variable
TOKEN=$(curl -s -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  | jq -r '.access_token')

# Use token
curl http://localhost:3005/api/revolut/accounts \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing

### With Postman

1. Import the API into Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3005/api`
   - `token`: Retrieved from login
3. Use `{{token}}` in Authorization header

### With Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create collection
3. Add requests with `{{baseUrl}}` and `{{token}}`

---

## Resources

- **Interactive Docs**: `/api/docs`
- **Revolut API Docs**: https://developer.revolut.com
- **Source Code**: `src/revolut/revolut.controller.ts`

---

For implementation examples, see the Swagger documentation at `/api/docs`.
