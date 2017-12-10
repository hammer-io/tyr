import {
  format,
  loggers,
  transports
} from 'winston';

function isLoggerType(str) {
  return (str === 'info' || str === 'verbose' || str === 'debug');
}

/**
 * The initial active logger attempts to read from environment variables.
 * Otherwise, it defaults to 'info'.
 */
let activeLogger = process.env.TYR_LOG_LEVEL || 'info';
if (!isLoggerType(activeLogger)) {
  activeLogger = 'info';
}

// Info level is only appended to the message if it's out of the ordinary (not 'info')
const customFormatting = format.printf((info) => {
  const level = (info.level === 'info') ? '' : `[${info.level.toUpperCase()}] `;
  return `${level}${info.message}`;
});

// Formatting for writing to a log file includes the timestamp and level
const logfileFormatting = format.printf((info) => {
  const level = (`${info.level.toUpperCase()}       `).slice(0, 7);
  return `${info.timestamp} [${level}] ${info.message}`;
});

/**
 * The info logger
 */
loggers.add('info', {
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize({ message: true }),
        customFormatting
      ),
    })
  ]
});

/**
 * The verbose logger
 */
loggers.add('verbose', {
  transports: [
    new transports.Console({
      level: 'verbose',
      format: format.combine(
        format.colorize({ message: true }),
        customFormatting
      ),
    })
  ]
});

// Switches the order of debug and verbose so that verbose
// doesn't show during debug.
const customDebugLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  verbose: 5,
  silly: 6
};

/**
 * The debug logger
 */
loggers.add('debug', {
  levels: customDebugLevels,
  transports: [
    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize({ message: true }),
        customFormatting
      ),
    })
  ]
});

/**
 * Returns the active logger instance.
 */
export function getActiveLogger() {
  return loggers.get(activeLogger);
}

/**
 * Changes the active logger instance.
 *
 * @param loggerType can be 'info', 'verbose', or 'debug'
 */
export function setActiveLogger(loggerType) {
  if (!isLoggerType(loggerType)) {
    throw new Error('Active logger must be set to either \'info\', \'verbose\', or \'debug\'');
  }
  activeLogger = loggerType;
}

/**
 * Write to all logs with level `debug` and below to the given file with NO colors
 */
export function enableLogFile(logFilename) {
  getActiveLogger().add(new transports.File({
    level: 'debug',
    filename: logFilename,
    format: format.combine(
      format.timestamp(),
      logfileFormatting
    )
  }));
}