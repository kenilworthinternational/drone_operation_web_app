# Environment Configuration Guide

This project supports automatic environment-based configuration for API URLs and logging.

## Environment Detection

The application automatically detects the environment based on:
1. `NODE_ENV` environment variable
2. `REACT_APP_ENV` environment variable
3. Hostname (localhost/127.0.0.1 = development)
4. Defaults to **development** if none are set

## API Configuration

### Development
- **API URL**: `https://drone-admin-test.kenilworthinternational.com/api/`
- **Logging**: Enabled (all console logs visible)

### Production
- **API URL**: `https://drone-admin.kenilworthinternational.com/api/`
- **Logging**: Disabled (console logs removed in production build)

## Usage

### Running in Development Mode

```bash
# Default (development)
npm start

# Explicitly set development
npm run start:dev
```

### Running in Production Mode

```bash
# Start with production config
npm run start:prod

# Build for production
npm run build:prod
```

### Building

```bash
# Development build (with logging)
npm run build:dev

# Production build (no logging)
npm run build:prod
```

## Environment Variables

You can also set environment variables:

### Using .env file

Create a `.env` file in the root directory:

```env
# For development
REACT_APP_ENV=development

# For production
REACT_APP_ENV=production
```

### Using Command Line

```bash
# Windows (PowerShell)
$env:REACT_APP_ENV="production"; npm start

# Windows (CMD)
set REACT_APP_ENV=production && npm start

# Linux/Mac
REACT_APP_ENV=production npm start
```

## Logger Utility

All console logs have been replaced with a logger utility that automatically:
- **Development**: Shows all logs
- **Production**: Removes all logs (except critical errors)

### Usage in Code

```javascript
import { logger } from '../utils/logger';

// Instead of console.log
logger.log('Debug message');

// Instead of console.error
logger.error('Error message');

// Critical errors always log (even in production)
logger.criticalError('Critical error');
```

### Available Logger Methods

- `logger.log()` - General logging
- `logger.error()` - Error logging
- `logger.warn()` - Warning logging
- `logger.info()` - Info logging
- `logger.debug()` - Debug logging
- `logger.table()` - Table logging
- `logger.criticalError()` - Always logs (even in production)

## Configuration Files

- **Config**: `src/config/config.js` - API URLs and environment detection
- **Logger**: `src/utils/logger.js` - Conditional logging utility

## Notes

- The environment is detected at build/start time
- Production builds automatically remove all logger calls (tree-shaking)
- API URL switches automatically based on environment
- No manual code changes needed to switch environments

