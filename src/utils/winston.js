import {
  format,
  loggers,
  transports
} from 'winston';

const { printf } = format;

const winstonUtil = exports;

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
winstonUtil.standardLogger = loggers.get('standard');


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
winstonUtil.verboseLogger = loggers.get('verbose');


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
winstonUtil.debugLogger = loggers.get('debug');


/**
 * Write to all logs with level `debug` and below to `combined.log` with NO colors
 */
winstonUtil.debugLogger.enableLogFile = () => {
  winstonUtil.debugLogger.add(new transports.File({
    level: 'debug',
    filename: 'tyr.log',
    format: normalFormatting
  }));
};
