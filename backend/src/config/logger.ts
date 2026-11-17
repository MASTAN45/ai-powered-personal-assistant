import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const sensitiveFields = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'apiKey', 'authorization', 'cookie'];

function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    sanitized[key] = isSensitive ? '*******' : (typeof value === 'object' && value !== null ? sanitizeData(value) : value);
  }
  return sanitized;
}

const sanitizeFormat = winston.format(info => sanitizeData(info));

const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isVercelServerless = process.env.VERCEL === '1';
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    sanitizeFormat(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
      let log = `[${timestamp}] [${level.toUpperCase()}]`;
      if (requestId) log += ` [${requestId}]`;
      if (userId) log += ` [User:${userId}]`;
      log += `: ${message}`;
      const metaKeys = Object.keys(meta);
      if (metaKeys.length > 0) log += ` ${JSON.stringify(meta)}`;
      return log;
    })
  );

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    })
  ];

  // Only use file transports in local development
  // Vercel filesystem is read-only - console logs are captured by Vercel
  if (isDevelopment && !isVercelServerless) {
    const logsDir = process.env.LOG_FILE ? path.dirname(process.env.LOG_FILE) : path.join(process.cwd(), 'logs');
    transports.push(
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '30d',
        format: logFormat,
      }),
      new DailyRotateFile({
        dirname: logsDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '10m',
        maxFiles: '30d',
        format: logFormat,
      })
    );
  }

  return winston.createLogger({ level: logLevel, transports, exitOnError: false });
};

export const logger = createLogger();

export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?._id,
      requestId: req.headers['x-request-id'],
    };
    if (res.statusCode >= 500) logger.error('Request failed', logData);
    else if (res.statusCode >= 400) logger.warn('Request error', logData);
    else logger.info('Request completed', logData);
  });
  next();
};
