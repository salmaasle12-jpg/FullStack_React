import { mockDb } from './mockDb';
import { storageService } from '../services/storageService';
import { loggerService } from '../services/loggerService';

/**
 * שירות לניהול משתמשים ואימות
 * User service for authentication and user management
 */
class UserService {
  constructor() {
    this.delayTime = 800;
    this.STORAGE_KEY_USERS = 'users_db';
    this._initUsers();
  }

  // אתחול המשתמשים במידה ולא קיימים באחסון המקומי
  _initUsers() {
    let users = storageService.load(this.STORAGE_KEY_USERS);
    if (!users) {
      storageService.save(this.STORAGE_KEY_USERS, mockDb.users);
    }
  }

  // פונקציה פרטית להדמיית השהיה
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || this.delayTime));
  }

  // התחברות למערכת
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

  // הרשמה למערכת
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

  // התנתקות מהמערכת
  logout() {
    loggerService.log('User logged out');
    storageService.remove('loggedinUser');
  }

  // קבלת המשתמש המחובר כרגע
  getLoggedinUser() {
    return storageService.load('loggedinUser');
  }
}

export const userService = new UserService();
