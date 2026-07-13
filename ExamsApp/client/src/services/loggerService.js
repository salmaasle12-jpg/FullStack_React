/**
 * Logger service for system logs
 */
class LoggerService {
  constructor() {
    this.prefix = "[E-Test System]";
  }

  // Log information message
  info(message, data = "") {
    console.log(`${this.prefix} INFO: ${message}`, data);
  }

  // Log error message
  error(message, error = "") {
    console.error(`${this.prefix} ERROR: ${message}`, error);
  }

  // Log general message
  log(message) {
    console.log(`${this.prefix} LOG: ${message} at ${new Date().toLocaleTimeString()}`);
  }
}

export const loggerService = new LoggerService();
