/**
 * שירות הגדרות מערכת
 * Configuration service
 */
class ConfigService {
  constructor() {
    this.config = {
      appName: "E-Test System",
      apiVersion: "1.0.0",
      baseUrl: "http://localhost:3000/api", // דוגמה לכתובת API
    };
  }

  // קבלת הגדרה לפי מפתח
  get(key) {
    return this.config[key];
  }
}

export const configService = new ConfigService();
