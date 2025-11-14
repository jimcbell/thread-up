type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}

const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

function formatLog(entry: LogEntry): string {
  const color = colors[entry.level];
  const icon = {
    debug: '🔍',
    info: 'ℹ️ ',
    warn: '⚠️ ',
    error: '❌',
  }[entry.level];

  const data = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
  return `${color}[${entry.timestamp}] ${icon} ${entry.level.toUpperCase()}: ${entry.message}${data}${colors.reset}`;
}

const logger = {
  debug: (message: string, data?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  info: (message: string, data?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  warn: (message: string, data?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    };
    console.warn(formatLog(entry));
  },

  error: (message: string, data?: Record<string, any> | Error) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      data:
        data instanceof Error
          ? {
              message: data.message,
              stack: data.stack,
            }
          : data,
    };
    console.error(formatLog(entry));
  },
};

export default logger;
