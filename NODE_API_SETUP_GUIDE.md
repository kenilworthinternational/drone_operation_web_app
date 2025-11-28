# Node.js API Setup Guide for DSMS Web App
## Migration from PHP Laravel to Node.js Backend (Web App Only)

**Last Updated:** 2025-01-XX  
**Purpose:** Guide for setting up Node.js API layer on dedicated Windows server for DSMS web app only, while maintaining existing PHP Laravel backend for mobile apps

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Database Connection Setup](#database-connection-setup)
5. [Node.js Server Setup](#nodejs-server-setup)
6. [Environment Configuration](#environment-configuration)
7. [Subdomain Configuration](#subdomain-configuration)
8. [API Structure & Routing](#api-structure--routing)
9. [Frontend Configuration](#frontend-configuration)
10. [Testing & Deployment](#testing--deployment)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Current Setup
- **Frontend:** Hosted on GoDaddy cPanel (`dsms.kenilworth.international.com`)
- **Backend (Current):** PHP Laravel on GoDaddy
  - Test: `drone-admin-test.kenilworth.international.com`
  - Production: `drone-admin.kenilworth.international.com`
- **Database:** MySQL on GoDaddy cPanel
- **Mobile Apps:** All Flutter apps use PHP Laravel API (will continue to do so)

### Target Setup
- **Frontend:** Continue on GoDaddy cPanel (no changes)
- **Backend (New for Web App Only):** Node.js on dedicated Windows server
  - Test: `dsms-api-test.kenilworth.international.com` (Port 3001)
  - Production: `dsms-api.kenilworth.international.com` (Port 3000)
- **Backend (Existing for Mobile Apps):** PHP Laravel continues running
  - Test: `drone-admin-test.kenilworth.international.com`
  - Production: `drone-admin.kenilworth.international.com`
- **Database:** Continue using GoDaddy cPanel MySQL (remote connection from Node.js)

### Goals
- ✅ Keep existing PHP Laravel backend running (for mobile apps)
- ✅ Build new Node.js APIs for DSMS web app only
- ✅ Use same GoDaddy MySQL database
- ✅ Gradually migrate web app endpoints from PHP to Node.js
- ✅ No changes to frontend code initially (configuration only)
- ✅ Mobile apps continue using PHP Laravel API (no changes)

---

## Prerequisites

### On Dedicated Windows Server

1. **Node.js Installation**
   - Download and install Node.js LTS (v18.x or v20.x) from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

2. **PM2 Process Manager** (Recommended for production)
   ```powershell
   npm install -g pm2
   ```

3. **Windows Firewall Configuration**
   - Open ports 3000 (production) and 3001 (test)
   - PowerShell (Run as Administrator):
     ```powershell
     New-NetFirewallRule -DisplayName "Node.js API Production" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "Node.js API Test" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
     ```

4. **Database Access**
   - Obtain GoDaddy cPanel MySQL credentials:
     - Host: Remote MySQL hostname (provided by GoDaddy)
     - Database name
     - Username
     - Password
     - Port: Usually `3306`
   - **Important:** Ensure GoDaddy allows remote MySQL connections (may need to whitelist your Windows server IP)

### On GoDaddy cPanel

1. **Remote MySQL Access**
   - Log into cPanel
   - Navigate to **Remote MySQL**
   - Add your Windows server's public IP address to allowed hosts
   - Note: Some GoDaddy plans may restrict remote MySQL access

2. **Database Credentials**
   - cPanel → **MySQL Databases**
   - Note down:
     - Database name (e.g., `username_dbname`)
     - Username (e.g., `username_dbuser`)
     - Password
     - Host (for remote connection, use the hostname provided by GoDaddy, not `localhost`)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (GoDaddy cPanel)                │
│              dsms.kenilworth.international.com              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React App (DSMS Web App)                            │  │
│  │  - Uses RTK Query (baseApi)                          │  │
│  │  - API_BASE_URL configurable via environment         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────────┐            ┌──────────────────────┐
│  PHP Laravel Backend │            │  Node.js Backend     │
│  (Existing)          │            │  (New - Web App Only)│
│                      │            │                      │
│  Test:               │            │  Test:               │
│  drone-admin-test... │            │  dsms-api-test...    │
│                      │            │  Port: 3001          │
│  Prod:               │            │                      │
│  drone-admin...      │            │  Prod:               │
│                      │            │  dsms-api...         │
│  Used by:            │            │  Port: 3000          │
│  - All Mobile Apps   │            │                      │
│  - Web App (current) │            │  Used by:            │
│                      │            │  - Web App (future)  │
└──────────────────────┘            └──────────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  MySQL Database      │
                │  (GoDaddy cPanel)    │
                │                      │
                │  Shared by both APIs │
                └──────────────────────┘
```

---

## Database Connection Setup

### Step 1: Test Remote MySQL Connection

From your Windows server, test if you can connect to GoDaddy MySQL:

```powershell
# Install MySQL client (if not available)
# Download MySQL Workbench or use command line

# Test connection (replace with your credentials)
mysql -h [GODADDY_MYSQL_HOST] -u [USERNAME] -p [DATABASE_NAME]
```

**Note:** If connection fails, check:
- GoDaddy Remote MySQL whitelist includes your server IP
- Firewall allows outbound MySQL (port 3306)
- GoDaddy plan supports remote MySQL connections
- You're using the correct remote hostname (not `localhost`)

### Step 2: Get Connection String Format

For Node.js, you'll use a connection string like:
```
mysql://username:password@host:port/database
```

Example:
```
mysql://kenilworth_user:your_password@184.168.110.65:3306/kenilworth_db
```

**Important:** 
- Some GoDaddy shared hosting uses `localhost` for MySQL, which won't work for remote connections
- You may need the actual MySQL server hostname (provided by GoDaddy)
- Or use GoDaddy's remote MySQL hostname (if different from main domain)
- Check cPanel → Remote MySQL for the correct hostname

---

## Node.js Server Setup

### Step 1: Create Project Structure

On your Windows server, create a directory structure:

```
C:\dsms-api\
├── production\
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── routes\
│   ├── controllers\
│   ├── models\
│   └── middleware\
├── test\
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── routes\
│   ├── controllers\
│   ├── models\
│   └── middleware\
└── shared\
    ├── database\
    ├── utils\
    └── config\
```

### Step 2: Initialize Node.js Project

**For Production (Port 3000):**
```powershell
cd C:\dsms-api\production
npm init -y
npm install express mysql2 cors dotenv helmet morgan jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

**For Test (Port 3001):**
```powershell
cd C:\dsms-api\test
npm init -y
npm install express mysql2 cors dotenv helmet morgan jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

### Step 3: Basic Server Setup

**File: `production/server.js`**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://dsms.kenilworth.international.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'production', port: PORT });
});

// API Routes (to be added)
app.use('/api', require('./routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`DSMS API Server (Production) running on port ${PORT}`);
});
```

**File: `test/server.js`** (Same structure, but PORT = 3001)

### Step 4: Database Connection Module

**File: `shared/database/connection.js`**
```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
```

---

## Environment Configuration

### Production Environment (`.env` in `production/`)

**File: `production/.env`**
```env
# Server
NODE_ENV=production
PORT=3000

# Database (GoDaddy MySQL - Remote Connection)
DB_HOST=184.168.110.65
DB_PORT=3306
DB_USER=your_godaddy_db_user
DB_PASSWORD=your_godaddy_db_password
DB_NAME=your_godaddy_db_name

# API
API_BASE_URL=https://dsms-api.kenilworth.international.com
FRONTEND_URL=https://dsms.kenilworth.international.com

# JWT (must match PHP Laravel JWT secret for compatibility)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://dsms.kenilworth.international.com
```

### Test Environment (`.env` in `test/`)

**File: `test/.env`**
```env
# Server
NODE_ENV=test
PORT=3001

# Database (GoDaddy MySQL - can use same or separate test DB)
DB_HOST=184.168.110.65
DB_PORT=3306
DB_USER=your_godaddy_db_user
DB_PASSWORD=your_godaddy_db_password
DB_NAME=your_godaddy_db_name_test

# API
API_BASE_URL=https://dsms-api-test.kenilworth.international.com
FRONTEND_URL=https://dsms.kenilworth.international.com

# JWT (must match PHP Laravel JWT secret for compatibility)
JWT_SECRET=your_jwt_secret_key_here_test
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://dsms.kenilworth.international.com,http://localhost:3000
```

**⚠️ Security Note:** Never commit `.env` files to version control. Add to `.gitignore`.

**⚠️ JWT Secret:** For seamless migration, use the same JWT secret as your PHP Laravel backend so tokens work across both APIs.

---

## Subdomain Configuration

### Option 1: Using Reverse Proxy (Nginx on Windows - Recommended)

If you have Nginx installed on Windows:

**File: `nginx.conf` (Production)**
```nginx
server {
    listen 80;
    server_name dsms-api.kenilworth.international.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**File: `nginx.conf` (Test)**
```nginx
server {
    listen 80;
    server_name dsms-api-test.kenilworth.international.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Using IIS (Windows Server)

1. Install **IIS URL Rewrite** and **Application Request Routing (ARR)**
2. Create reverse proxy rules pointing to `localhost:3000` and `localhost:3001`

### Option 3: DNS Configuration

If your subdomains are managed by a DNS provider:
- Point `dsms-api.kenilworth.international.com` → Your Windows server IP
- Point `dsms-api-test.kenilworth.international.com` → Your Windows server IP
- Configure port forwarding/routing on your server

### SSL/HTTPS Setup

For production, set up SSL certificates (Let's Encrypt, or your provider's SSL):

```nginx
server {
    listen 443 ssl;
    server_name dsms-api.kenilworth.international.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        # ... same proxy settings as above
    }
}
```

---

## API Structure & Routing

### Recommended Folder Structure

```
production/
├── server.js
├── routes/
│   ├── index.js (main router)
│   ├── auth.js
│   ├── assets.js
│   ├── plans.js
│   ├── teams.js
│   └── ...
├── controllers/
│   ├── authController.js
│   ├── assetsController.js
│   └── ...
├── models/
│   ├── User.js
│   ├── Asset.js
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── ...
└── utils/
    ├── logger.js
    └── validators.js
```

### Example Route Structure

**File: `routes/index.js`**
```javascript
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const assetsRoutes = require('./assets');
const plansRoutes = require('./plans');

// Mount routes
router.use('/auth', authRoutes);
router.use('/assets', assetsRoutes);
router.use('/plans', plansRoutes);

module.exports = router;
```

**File: `routes/assets.js`**
```javascript
const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');
const { authenticateToken } = require('../middleware/auth');

// Example: View wings (matching existing PHP endpoint)
router.post('/view_wing', authenticateToken, assetsController.viewWing);

// Example: Create drone (new Node.js endpoint)
router.post('/create_drone', authenticateToken, assetsController.createDrone);

module.exports = router;
```

### Matching Existing PHP API Endpoints

Your existing PHP Laravel backend uses endpoints like:
- `/api/login`
- `/api/view_wing`
- `/api/create_drone`
- `/api/create_plan`
- etc.

**Strategy:** Create Node.js routes that match the same path structure:
- Node.js: `POST /api/view_wing` → Same as PHP: `POST /api/view_wing`
- This allows gradual migration without frontend code changes

### Authentication Middleware

**File: `middleware/auth.js`**
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

**Important:** Use the same JWT secret as PHP Laravel so tokens generated by PHP work with Node.js and vice versa.

---

## Frontend Configuration

### Current Frontend API Configuration

Your frontend uses RTK Query with base API URL configured in:
- `src/config/config.js` - Contains `API_BASE_URL`
- `src/api/baseApi.js` - Uses `API_BASE_URL` from config

### Option 1: Environment-Based Configuration (Recommended)

**No code changes needed initially.** The frontend already uses environment detection.

**To switch to Node.js API:**

1. **For Test Environment:**
   - Update `src/config/config.js`:
     ```javascript
     export const API_CONFIG = {
       development: 'https://dsms-api-test.kenilworth.international.com/api/',
       production: 'https://drone-admin.kenilworth.international.com/api/',
     };
     ```

2. **For Production:**
   - Update `src/config/config.js`:
     ```javascript
     export const API_CONFIG = {
       development: 'https://dsms-api-test.kenilworth.international.com/api/',
       production: 'https://dsms-api.kenilworth.international.com/api/',
     };
     ```

### Option 2: Gradual Migration Strategy

**Hybrid Approach:** Route specific endpoints to Node.js, keep others on PHP.

**File: `src/config/config.js` (Example)**
```javascript
// New endpoints on Node.js
export const NODE_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://dsms-api.kenilworth.international.com/api/'
  : 'https://dsms-api-test.kenilworth.international.com/api/';

// Legacy endpoints on PHP
export const PHP_API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://drone-admin.kenilworth.international.com/api/'
  : 'https://drone-admin-test.kenilworth.international.com/api/';
```

Then in your API services, use the appropriate base URL:
- New endpoints → `NODE_API_BASE_URL`
- Legacy endpoints → `PHP_API_BASE_URL`

### Option 3: Feature Flag Approach

Add a feature flag to gradually enable Node.js endpoints:

```javascript
// src/config/config.js
export const USE_NODE_API = process.env.REACT_APP_USE_NODE_API === 'true';

export const API_BASE_URL = USE_NODE_API
  ? (process.env.NODE_ENV === 'production'
      ? 'https://dsms-api.kenilworth.international.com/api/'
      : 'https://dsms-api-test.kenilworth.international.com/api/')
  : (process.env.NODE_ENV === 'production'
      ? 'https://drone-admin.kenilworth.international.com/api/'
      : 'https://drone-admin-test.kenilworth.international.com/api/');
```

Set environment variable in GoDaddy cPanel or build process:
```
REACT_APP_USE_NODE_API=true
```

---

## Testing & Deployment

### Step 1: Local Testing

1. **Start Test Server:**
   ```powershell
   cd C:\dsms-api\test
   npm start
   # Or with nodemon for auto-reload
   npm run dev
   ```

2. **Test Health Endpoint:**
   ```powershell
   curl http://localhost:3001/health
   # Should return: {"status":"ok","environment":"test","port":3001}
   ```

3. **Test Database Connection:**
   - Create a test endpoint that queries the database
   - Verify data retrieval works

### Step 2: PM2 Process Management (Production)

**Install PM2:**
```powershell
npm install -g pm2
```

**Start Production Server:**
```powershell
cd C:\dsms-api\production
pm2 start server.js --name dsms-api-prod --env production
```

**Start Test Server:**
```powershell
cd C:\dsms-api\test
pm2 start server.js --name dsms-api-test --env test
```

**PM2 Commands:**
```powershell
pm2 list                    # List all processes
pm2 logs dsms-api-prod      # View logs
pm2 restart dsms-api-prod   # Restart
pm2 stop dsms-api-prod      # Stop
pm2 delete dsms-api-prod    # Remove
pm2 save                    # Save current process list
pm2 startup                 # Configure startup on boot
```

### Step 3: Windows Service (Optional)

To run Node.js as a Windows service, use `node-windows` or `pm2-windows-startup`:

```powershell
npm install -g pm2-windows-startup
pm2-windows-startup install
pm2 save
```

### Step 4: Verify Subdomain Access

1. **Test from Browser:**
   - Visit: `https://dsms-api-test.kenilworth.international.com/health`
   - Should return JSON response

2. **Test from Frontend:**
   - Update frontend config to point to test API
   - Verify API calls work

### Step 5: Gradual Endpoint Migration

**Migration Checklist:**
1. ✅ Set up Node.js server
2. ✅ Configure database connection
3. ✅ Create authentication middleware (match PHP JWT)
4. ✅ Implement one endpoint (e.g., `/view_wing`)
5. ✅ Test endpoint from frontend
6. ✅ Verify data matches PHP backend
7. ✅ Migrate next endpoint
8. ✅ Repeat until all web app endpoints migrated

**Note:** Mobile apps continue using PHP Laravel API throughout this process.

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to GoDaddy MySQL

**Solutions:**
1. Verify GoDaddy Remote MySQL whitelist includes your server IP
2. Check firewall allows outbound port 3306
3. Verify database credentials (username, password, hostname)
4. Some GoDaddy plans don't allow remote MySQL - check with support
5. Try using GoDaddy's provided MySQL hostname (may differ from domain)
6. Ensure you're using the remote MySQL hostname, not `localhost`

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (replace PID with actual process ID)
taskkill /PID [PID] /F
```

### CORS Errors

**Problem:** Frontend gets CORS errors when calling Node.js API

**Solution:**
- Verify `cors` middleware includes frontend URL in `origin` array
- Check `Access-Control-Allow-Origin` header in response
- Ensure credentials are handled if using cookies

### Subdomain Not Resolving

**Problem:** `dsms-api-test.kenilworth.international.com` doesn't resolve

**Solutions:**
1. Check DNS records point to correct server IP
2. Verify reverse proxy (Nginx/IIS) is configured
3. Check firewall allows inbound connections
4. Test direct IP access: `http://[SERVER_IP]:3001/health`

### Authentication Token Mismatch

**Problem:** Frontend tokens not working with Node.js API

**Solutions:**
1. Ensure Node.js uses same JWT secret as PHP Laravel
2. Verify token format (Bearer token in Authorization header)
3. Check token expiration handling matches PHP backend
4. If using different JWT library, ensure algorithm matches (usually HS256)
5. Test with a token generated by PHP Laravel to ensure compatibility

### PM2 Not Starting on Boot

**Problem:** PM2 processes don't start after server reboot

**Solution:**
```powershell
pm2 startup
# Follow instructions to run the generated command as Administrator
pm2 save
```

---

## Important Notes

### Mobile Apps Continue Using PHP Laravel

- All Flutter mobile apps will continue using the PHP Laravel API
- No changes needed to mobile app configurations
- PHP Laravel backend must remain running
- Both APIs share the same database, so data consistency is maintained

### Gradual Migration Strategy

1. Start with read-only endpoints (GET operations)
2. Test thoroughly in test environment
3. Migrate write operations (POST, PUT, DELETE) after read operations are stable
4. Keep PHP Laravel running as fallback during migration
5. Monitor for any data inconsistencies

### Database Consistency

- Both APIs write to the same database
- Ensure transaction handling is consistent
- Be careful with concurrent writes from both APIs
- Consider using database-level constraints and validations

---

## Next Steps

1. **Set up basic Node.js server** (follow Step 1-3 in Node.js Server Setup)
2. **Configure database connection** (test with a simple query)
3. **Implement authentication** (match PHP Laravel JWT)
4. **Create first endpoint** (e.g., `/view_wing` - simple read operation)
5. **Test from frontend** (update config, verify it works)
6. **Gradually migrate endpoints** (one at a time, test thoroughly)
7. **Monitor and optimize** (use PM2 logs, add error tracking)

---

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [JWT Authentication](https://jwt.io/)

---

## Support & Notes

- **Keep PHP Laravel running** for mobile apps and as fallback
- **Test thoroughly** in test environment before production
- **Monitor logs** for errors and performance issues
- **Backup database** before making schema changes
- **Document API changes** as you migrate endpoints
- **Mobile apps are unaffected** - they continue using PHP Laravel API

**Remember:** This is a gradual migration for the web app only. Both backends can coexist during the transition period, with mobile apps continuing to use PHP Laravel.
