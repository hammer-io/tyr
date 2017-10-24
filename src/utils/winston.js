import {
  format,
  loggers,
  transports
} from 'winston';

const { printf } = format;

let activeLogger = 'standard';

// Info level is only appended to the message if it's out of the ordinary (not 'info')
function formatLog(info) {
  const level = (info.level === 'info') ? '' : `[${info.level.toUpperCase()}] `;
  return `${level}${info.message}`;
}
const normalFormatting = printf(formatLog);

// The logging format for debug erases all verbose output.
const debugFormatting = printf((info) => {
  if (info.level === 'verbose') {
    return '';
  }
  return formatLog(info);
});


/**
 * The standard logger
 */
loggers.add('standard', {
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize({ message: true }),
        normalFormatting
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
        normalFormatting
      ),
    })
  ]
});

/**
 * The debug logger
 */
loggers.add('debug', {
  transports: [
    new transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize({ message: true }),
        debugFormatting
      ),
    })
  ]
});

function isLoggerType(str) {
  return (str === 'standard' || str === 'verbose' || str === 'debug');
}

/**
 * Returns the active logger instance.
 */
export function getActiveLogger() {
  return loggers.get(activeLogger);
}

/**
 * Changes the active logger instance.
 *
 * @param loggerType can be 'standard', 'verbose', or 'debug'
 */
export function setActiveLogger(loggerType) {
  if (!isLoggerType(loggerType)) {
    throw new Error('Active logger must be set to either \'standard\', \'verbose\', or \'debug\'');
  }
  activeLogger = loggerType;
}

/**
 * Write to all logs with level `debug` and below to `combined.log` with NO colors
 */
export function enableLogFile() {
  getActiveLogger().add(new transports.File({
    level: 'debug',
    filename: 'tyr.log',
    format: normalFormatting
  }));
}
