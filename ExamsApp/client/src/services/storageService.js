/**
 * Storage service for localStorage management
 */
class StorageService {
  // Save data
  save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // Load data
  load(key) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  // Remove data
  remove(key) {
    localStorage.removeItem(key);
  }

  // Clear all storage
  clear() {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
