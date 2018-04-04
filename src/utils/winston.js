import {
  format,
  loggers,
  transports,
  addColors
} from 'winston';

function isLoggerType(str) {
  return (str === 'info' || str === 'verbose' || str === 'debug');
}

/**
 * The initial active logger attempts to read from environment variables.
 * Otherwise, it defaults to 'info'.
 */
let activeLogger = process.env.TYR_LOG_LEVEL || 'debug';
if (!isLoggerType(activeLogger)) {
  activeLogger = 'info';
}

// Info level is only appended to the message if it's out of the ordinary (not 'info')
const customFormatting = format.printf((info) => {
  const level = `[${info.level.toUpperCase()}] `;
  return `${level}${info.message}`;
});

// Formatting for writing to a log file includes the timestamp and level
const logfileFormatting = format.printf((info) => {
  const level = (`${info.level.toUpperCase()}       `).slice(0, 7);
  return `${info.timestamp} [${level}] ${info.message}`;
});

// Switches the order of debug and verbose so that verbose
// doesn't show during debug.
const customDebugLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    verbose: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'grey',
    debug: 'grey',
  }
};

/**
 * The info logger
 */
loggers.add('info', {
  levels: customDebugLevels.levels,
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
  levels: customDebugLevels.levels,
  format: format.combine(
    format.colorize({ message: true }),
    customFormatting
  ),
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

/**
 * The debug logger
 */
loggers.add('debug', {
  levels: customDebugLevels.levels,
  format: format.combine(
    format.colorize({ message: true }),
    customFormatting
  ),
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

addColors(customDebugLevels);

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
