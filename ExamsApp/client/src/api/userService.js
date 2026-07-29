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

  // Simulate API delay
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || this.delayTime));
  }

  // Login
  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    loggerService.log(`Attempting login for: ${normalizedEmail}`);
    await this._delay();

    const users = storageService.load(this.STORAGE_KEY_USERS) || [];

    const user = users.find(
      u =>
        String(u.email).trim().toLowerCase() === normalizedEmail &&
        String(u.password) === String(password)
    );

    if (!user) {
      loggerService.error('Login failed: Invalid credentials');
      throw new Error('Invalid email or password');
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    storageService.save('loggedinUser', userWithoutPassword);
    loggerService.info('Login successful', userWithoutPassword);

    return userWithoutPassword;
  }

  // Register
  async register(userData) {
    const normalizedEmail = userData.email.trim().toLowerCase();

    loggerService.log(`Attempting registration for: ${normalizedEmail}`);
    await this._delay();

    const users = storageService.load(this.STORAGE_KEY_USERS) || [];

    const existingUser = users.some(
      u => String(u.email).trim().toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      loggerService.error('Registration failed: User already exists');
      throw new Error('User already exists');
    }

    const newUser = {
      id: 'u' + Date.now(),
      ...userData,
      email: normalizedEmail,
      password: String(userData.password)
    };

    users.push(newUser);
    storageService.save(this.STORAGE_KEY_USERS, users);

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    storageService.save('loggedinUser', userWithoutPassword);
    loggerService.info('Registration successful', userWithoutPassword);

    return userWithoutPassword;
  }

  // Logout
  logout() {
    loggerService.log('User logged out');
    storageService.remove('loggedinUser');
  }

  // Get logged-in user
  getLoggedinUser() {
    return storageService.load('loggedinUser');
  }

  // Get all users
  async getUsers() {
    loggerService.log('Fetching all users');
    await this._delay();
    return storageService.load(this.STORAGE_KEY_USERS) || [];
  }
}

export const userService = new UserService();