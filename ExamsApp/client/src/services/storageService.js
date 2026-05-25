/**
 * שירות לניהול אחסון מקומי (localStorage)
 * Storage service for localStorage management
 */
class StorageService {
  // שמירת נתונים
  save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // טעינת נתונים
  load(key) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  // מחיקת נתונים
  remove(key) {
    localStorage.removeItem(key);
  }

  // ניקוי כל האחסון
  clear() {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
