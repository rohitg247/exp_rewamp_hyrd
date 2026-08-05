// src/utils/crestronInitManager.js

/**
 * Initialization State Manager for WebXPanel
 *
 * Singleton class that tracks WebXPanel initialization state and notifies
 * components when the state changes using a pub/sub pattern.
 */
class CrestronInitManager {
  constructor() {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = null;
    this.listeners = [];
  }

  /**
   * Subscribe to initialization state changes
   * @param {Function} callback - Called when state changes with {isInitialized, isInitializing, initError}
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(callback => {
      callback(state);
    });
  }

  /**
   * Set initialization in progress
   */
  setInitializing() {
    this.isInitializing = true;
    this.isInitialized = false;
    this.initError = null;
    console.log('🔄 CrestronInitManager: Initialization started');
    this.notifyListeners();
  }

  /**
   * Set initialization complete successfully
   */
  setInitialized() {
    this.isInitialized = true;
    this.isInitializing = false;
    this.initError = null;
    console.log('✅ CrestronInitManager: Initialization complete');
    this.notifyListeners();
  }

  /**
   * Set initialization error
   * @param {Error} error - The error that occurred
   */
  setError(error) {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = error;
    console.error('❌ CrestronInitManager: Initialization failed:', error);
    this.notifyListeners();
  }

  /**
   * Get current initialization state
   * @returns {{isInitialized: boolean, isInitializing: boolean, initError: Error|null}}
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      initError: this.initError
    };
  }

  /**
   * Reset to initial state (for testing/debugging)
   */
  reset() {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initError = null;
    console.log('🔄 CrestronInitManager: State reset');
    this.notifyListeners();
  }
}

// Export singleton instance
export const crestronInitManager = new CrestronInitManager();
