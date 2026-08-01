import { mockDb } from './mockDb';
import { storageService } from '../services/storageService';
import { loggerService } from '../services/loggerService';

/**
 * User service for authentication and user management
 */
class UserService {
  constructor() {
    this.delayTime = 800;
    this.STORAGE_KEY_USERS = 'users_db';
    this._initUsers();
  }

  // Initialize users if they don't exist in local storage
  _initUsers() {
    let users = storageService.load(this.STORAGE_KEY_USERS);
    if (!users) {
      storageService.save(this.STORAGE_KEY_USERS, mockDb.users);
    }
  }

  // Private function to simulate delay
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || this.delayTime));
  }

  // Login to the system
  async login(email, password) {
    loggerService.log(`Attempting login for: ${email}`);
    await this._delay();

    const users = storageService.load(this.STORAGE_KEY_USERS) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      storageService.save('loggedinUser', userWithoutPassword);
      loggerService.info('Login successful', userWithoutPassword);
      return userWithoutPassword;
    } else {
      loggerService.error('Login failed: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  }

  // Register to the system
  async register(userData) {
    loggerService.log(`Attempting registration for: ${userData.email}`);
    await this._delay();

    const users = storageService.load(this.STORAGE_KEY_USERS) || [];
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      loggerService.error('Registration failed: User already exists');
      throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      id: 'u' + Date.now()
    };

    users.push(newUser);
    storageService.save(this.STORAGE_KEY_USERS, users);
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    storageService.save('loggedinUser', userWithoutPassword);
    loggerService.info('Registration successful', userWithoutPassword);
    return userWithoutPassword;
  }

  // Logout from the system
  logout() {
    loggerService.log('User logged out');
    storageService.remove('loggedinUser');
  }

  // Get currently logged-in user
  getLoggedinUser() {
    return storageService.load('loggedinUser');
  }

  // Fetch all users
  async getUsers() {
    loggerService.log("Fetching all users");
    await this._delay();
    return storageService.load(this.STORAGE_KEY_USERS) || [];
  }
}

export const userService = new UserService();
