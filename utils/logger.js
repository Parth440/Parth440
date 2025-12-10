/**
 * Logger Utility
 * Handles all logging with colors and file output
 */

require('colors');
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logPath = './logs') {
    this.logPath = logPath;
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message) {
    return `[${this.getTimestamp()}] [${level}] ${message}`;
  }

  /**
   * Write to log file
   */
  writeToFile(message) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logPath, `${date}.log`);
    
    try {
      fs.appendFileSync(logFile, message + '\n', 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Log with specific level
   */
  log(level, message, color = 'white') {
    const formatted = this.formatMessage(level, message);
    console.log(formatted[color]);
    this.writeToFile(formatted);
  }

  /**
   * Info level log
   */
  info(message) {
    this.log('INFO', message, 'cyan');
  }

  /**
   * Success level log
   */
  success(message) {
    this.log('SUCCESS', message, 'green');
  }

  /**
   * Warning level log
   */
  warn(message) {
    this.log('WARN', message, 'yellow');
  }

  /**
   * Error level log
   */
  error(message, error = null) {
    const errorMsg = error ? `${message}: ${error.message || error}` : message;
    this.log('ERROR', errorMsg, 'red');
    
    if (error && error.stack) {
      this.writeToFile(error.stack);
    }
  }

  /**
   * Debug level log
   */
  debug(message) {
    this.log('DEBUG', message, 'gray');
  }

  /**
   * Chat message log
   */
  chat(message) {
    this.log('CHAT', message, 'white');
  }

  /**
   * DM message log
   */
  dm(message) {
    this.log('DM', message, 'magenta');
  }

  /**
   * Join event log
   */
  join(message) {
    this.log('JOIN', message, 'green');
  }

  /**
   * Leave event log
   */
  leave(message) {
    this.log('LEAVE', message, 'red');
  }

  /**
   * Command execution log
   */
  command(user, command) {
    this.log('COMMAND', `${user} executed: ${command}`, 'yellow');
  }

  /**
   * System event log
   */
  system(message) {
    this.log('SYSTEM', message, 'blue');
  }

  /**
   * Clear old log files (keep last 7 days)
   */
  clearOldLogs(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.logPath);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.logPath, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          this.info(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Error clearing old logs', error);
    }
  }

  /**
   * Get log file content
   */
  getLogFile(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logPath, `${targetDate}.log`);

    try {
      if (fs.existsSync(logFile)) {
        return fs.readFileSync(logFile, 'utf8');
      }
      return null;
    } catch (error) {
      this.error('Error reading log file', error);
      return null;
    }
  }

  /**
   * Log table data
   */
  table(data) {
    console.table(data);
    this.writeToFile(`TABLE: ${JSON.stringify(data, null, 2)}`);
  }

  /**
   * Log separator
   */
  separator() {
    const line = '='.repeat(80);
    console.log(line.gray);
    this.writeToFile(line);
  }

  /**
   * Log banner
   */
  banner(text) {
    this.separator();
    console.log(text.cyan.bold);
    this.writeToFile(text);
    this.separator();
  }
}

module.exports = Logger;
