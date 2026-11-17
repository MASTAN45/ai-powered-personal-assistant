import { logger } from '../config/logger';
let monitoringInterval: NodeJS.Timeout | null = null;

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    rss: usage.rss,
    external: usage.external,
    heapUsedFormatted: formatBytes(usage.heapUsed),
    heapTotalFormatted: formatBytes(usage.heapTotal),
    rssFormatted: formatBytes(usage.rss),
    heapPercentage: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2),
  };
}

export function startMemoryMonitoring() {
  if (monitoringInterval) {
    logger.warn('Memory monitoring already started');
    return;
  }

  logger.info('Memory monitoring started (5-minute intervals)');

  monitoringInterval = setInterval(() => {
    const memory = getMemoryUsage();
    const heapPercentage = parseFloat(memory.heapPercentage);

    if (heapPercentage >= 80) {
      logger.warn('HIGH MEMORY USAGE WARNING:', {
        heapUsed: memory.heapUsedFormatted,
        heapTotal: memory.heapTotalFormatted,
        percentage: `${memory.heapPercentage}%`,
        rss: memory.rssFormatted,
        timestamp: new Date().toISOString(),
      });
    } else {
      logger.info('Memory usage:', {
        heapUsed: memory.heapUsedFormatted,
        heapTotal: memory.heapTotalFormatted,
        percentage: `${memory.heapPercentage}%`,
        rss: memory.rssFormatted,
      });
    }
  }, 5 * 60 * 1000);

  const initialMemory = getMemoryUsage();
  logger.info('Initial memory usage:', {
    heapUsed: initialMemory.heapUsedFormatted,
    heapTotal: initialMemory.heapTotalFormatted,
    rss: initialMemory.rssFormatted,
  });
}

export function stopMemoryMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    logger.info('Memory monitoring stopped');
  }
}

export function getMemoryStats() {
  return getMemoryUsage();
}
