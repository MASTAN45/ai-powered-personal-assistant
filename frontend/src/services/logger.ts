// Simple client-side logger that sanitizes sensitive data
class Logger {
  private isDev = import.meta.env.DEV;

  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    });

    return sanitized;
  }

  error(message: string, data?: any) {
    const sanitized = data ? this.sanitize(data) : undefined;
    console.error(`[ERROR] ${message}`, sanitized);
    
    // In production, could send to error tracking service
    if (!this.isDev && typeof window !== 'undefined') {
      // Future: Send to Sentry, LogRocket, etc.
    }
  }

  warn(message: string, data?: any) {
    const sanitized = data ? this.sanitize(data) : undefined;
    console.warn(`[WARN] ${message}`, sanitized);
  }

  info(message: string, data?: any) {
    if (this.isDev) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.info(`[INFO] ${message}`, sanitized);
    }
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.debug(`[DEBUG] ${message}`, sanitized);
    }
  }
}

export const logger = new Logger();