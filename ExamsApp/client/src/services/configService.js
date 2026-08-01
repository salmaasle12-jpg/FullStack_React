/**
 * System configuration service
 */
class ConfigService {
  constructor() {
    this.config = {
      appName: "E-Test System",
      apiVersion: "1.0.0",
      baseUrl: "http://localhost:3000/api", // Example API URL
    };
  }

  // Get configuration by key
  get(key) {
    return this.config[key];
  }
}

export const configService = new ConfigService();
