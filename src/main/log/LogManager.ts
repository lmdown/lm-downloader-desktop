import log from 'electron-log';
import path from 'path';
import ConfigPathUtil from '../util/ConfigPathUtil';

export default class LogManager {
  constructor() {
    log.initialize();
    log.transports.file.maxSize = 209715200; // log file max size 200MB
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
    const {rootDir} = ConfigPathUtil.getRootDir()
    const logsDir = path.join(rootDir, 'logs')
    const logFilePath = path.join(logsDir, 'lmd-main.log')
    log.transports.file.resolvePathFn = () => logFilePath;
    Object.assign(console, log.functions);
  }
}
