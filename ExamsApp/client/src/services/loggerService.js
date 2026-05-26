/**
 * שירות לניהול לוגים במערכת
 * Logger service for system logs
 */
class LoggerService {
  constructor() {
    this.prefix = "[E-Test System]";
  }

  // הדפסת הודעת מידע
  info(message, data = "") {
    console.log(`${this.prefix} INFO: ${message}`, data);
  }

  // הדפסת הודעת שגיאה
  error(message, error = "") {
    console.error(`${this.prefix} ERROR: ${message}`, error);
  }

  // הדפסת הודעת לוג כללית
  log(message) {
    console.log(`${this.prefix} LOG: ${message} at ${new Date().toLocaleTimeString()}`);
  }
}

export const loggerService = new LoggerService();
