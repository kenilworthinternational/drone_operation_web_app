# Drone Services Management System

A React-based web application for managing drone operations and services.

## Quick Start

### Available Scripts

#### Environment-Specific Commands

```bash
npm run start:dev    # Development mode
npm run start:prod   # Production mode
npm run build:dev    # Development build
npm run build:prod   # Production build
```

#### Standard Commands

```bash
npm start            # Start development server (defaults to development mode)
npm test             # Run tests
npm run build        # Build for production (defaults to production mode)
npm run eject        # Eject from Create React App (one-way operation)
```

## Environment Configuration

The application automatically detects and configures itself based on the environment:

### Development Mode
- **API URL**: `https://drone-admin-test.kenilworthinternational.com/api/`
- **Logging**: Enabled (all console logs visible)
- **Auto-detected when**: Running on `localhost` or `127.0.0.1`

### Production Mode
- **API URL**: `https://drone-admin.kenilworthinternational.com/api/`
- **Logging**: Disabled (console logs removed in production build)
- **Auto-detected when**: `NODE_ENV=production` or `REACT_APP_ENV=production`

### Environment Detection

The app automatically detects the environment based on:
1. `NODE_ENV` environment variable
2. `REACT_APP_ENV` environment variable
3. Hostname (localhost/127.0.0.1 = development)
4. Defaults to **development** if not set

## Logger Utility

All console logs have been replaced with a logger utility that automatically:
- **Development**: Shows all logs
- **Production**: Removes all logs (tree-shaking optimization)

### Usage in Code

```javascript
import { logger } from '../utils/logger';

// Instead of console.log
logger.log('Debug message');        // Only shows in development
logger.error('Error message');      // Only shows in development
logger.warn('Warning message');     // Only shows in development
logger.info('Info message');        // Only shows in development
logger.debug('Debug message');      // Only shows in development

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

## Project Structure

```
src/
├── api/
│   └── api.js              # API calls with environment-aware configuration
├── config/
│   └── config.js           # Environment configuration
├── utils/
│   └── logger.js           # Conditional logging utility
├── pages/
│   └── Login.jsx          # Login page with OTP verification
└── ...
```

## Configuration Files

- **Config**: `src/config/config.js` - API URLs and environment detection
- **Logger**: `src/utils/logger.js` - Conditional logging utility
- **Environment Setup**: See `ENVIRONMENT_SETUP.md` for detailed configuration guide

## Features

- ✅ Environment-based API configuration
- ✅ Automatic logging control (dev vs production)
- ✅ OTP-based authentication
- ✅ Cross-platform script support (Windows/Linux/Mac)
- ✅ Production-ready build optimization

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development mode (with logging)
npm run start:dev

# Production mode (no logging)
npm run start:prod
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Development build (with logging)
npm run build:dev

# Production build (optimized, no logging)
npm run build:prod
```

## Environment Variables

You can set environment variables using a `.env` file:

```env
# For development
REACT_APP_ENV=development

# For production
REACT_APP_ENV=production
```

**Note**: The `.env` file is already in `.gitignore` to prevent committing sensitive configuration.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Additional Resources

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
