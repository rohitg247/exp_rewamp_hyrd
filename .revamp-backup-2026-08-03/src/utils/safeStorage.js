// src/utils/safeStorage.js

/**
 * Safe Storage Utility
 *
 * Provides localStorage and sessionStorage with fallback to in-memory storage
 * for Crestron panels that don't support Web Storage APIs.
 *
 * When Web Storage is not available (null), this utility provides an in-memory
 * Map-based storage that maintains the same API interface.
 */

// Check if Web Storage APIs are available
const hasLocalStorage = typeof localStorage !== 'undefined' && localStorage !== null;
const hasSessionStorage = typeof sessionStorage !== 'undefined' && sessionStorage !== null;

/**
 * In-memory fallback storage implementation
 * Mimics the Web Storage API but stores data in memory (doesn't persist across reloads)
 */
class MemoryStorage {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }

  getItem(key) {
    const value = this.store.get(key);
    return value !== undefined ? value : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

// Create safe storage instances
export const safeLocalStorage = hasLocalStorage
  ? localStorage
  : new MemoryStorage('localStorage');

export const safeSessionStorage = hasSessionStorage
  ? sessionStorage
  : new MemoryStorage('sessionStorage');

// Log warnings on startup (only once)
if (!hasLocalStorage) {
  console.warn('⚠️ localStorage not available on this Crestron panel - using in-memory fallback');
  console.warn('   Note: State will not persist across page reloads when using fallback');
}

if (!hasSessionStorage) {
  console.warn('⚠️ sessionStorage not available on this Crestron panel - using in-memory fallback');
  console.warn('   Note: State will not persist across page reloads when using fallback');
}

// Export for debugging/testing
export const storageInfo = {
  hasLocalStorage,
  hasSessionStorage,
  usingFallback: !hasLocalStorage || !hasSessionStorage,
};
