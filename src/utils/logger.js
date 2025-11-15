// Logger utility that only logs in development mode
import { IS_DEVELOPMENT } from '../config/config';

/**
 * Conditional logger that only logs in development mode
 * This prevents console logs from appearing in production builds
 */
class Logger {
  log(...args) {
    if (IS_DEVELOPMENT) {
      console.log(...args);
    }
  }

  error(...args) {
    if (IS_DEVELOPMENT) {
      console.error(...args);
    }
  }

  warn(...args) {
    if (IS_DEVELOPMENT) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (IS_DEVELOPMENT) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (IS_DEVELOPMENT) {
      console.debug(...args);
    }
  }

  table(...args) {
    if (IS_DEVELOPMENT) {
      console.table(...args);
    }
  }

  group(...args) {
    if (IS_DEVELOPMENT) {
      console.group(...args);
    }
  }

  groupEnd() {
    if (IS_DEVELOPMENT) {
      console.groupEnd();
    }
  }

  // Always log errors in production (for critical errors)
  criticalError(...args) {
    console.error('[CRITICAL]', ...args);
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const log = (...args) => logger.log(...args);
export const logError = (...args) => logger.error(...args);
export const logWarn = (...args) => logger.warn(...args);
export const logInfo = (...args) => logger.info(...args);
export const logDebug = (...args) => logger.debug(...args);
export const logTable = (...args) => logger.table(...args);
export const logGroup = (...args) => logger.group(...args);
export const logGroupEnd = () => logger.groupEnd();
export const logCriticalError = (...args) => logger.criticalError(...args);

// Default export
export default logger;

