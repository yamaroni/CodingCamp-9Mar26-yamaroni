// Browser Start Page Application

// Storage keys for Local Storage
const STORAGE_KEYS = {
  TASKS: 'browser-start-page-tasks',
  LINKS: 'browser-start-page-links'
};

/**
 * StorageService provides abstraction over Local Storage with error handling
 * and JSON serialization/deserialization.
 */
class StorageService {
  constructor() {
    this._available = this._checkAvailability();
    this._memoryStorage = {}; // Fallback for when localStorage is unavailable
  }

  /**
   * Checks if Local Storage is available
   * @returns {boolean} True if localStorage is available and working
   */
  _checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('Local Storage is not available. Data will not persist across sessions.', e);
      return false;
    }
  }

  /**
   * Checks if storage is available
   * @returns {boolean} True if localStorage is available
   */
  isAvailable() {
    return this._available;
  }

  /**
   * Retrieves and deserializes data from storage
   * @param {string} key - Storage key
   * @returns {any|null} Deserialized data or null if not found/error
   */
  get(key) {
    try {
      if (this._available) {
        const item = localStorage.getItem(key);
        if (item === null) {
          return null;
        }
        // Parse JSON and handle corrupted data
        try {
          return JSON.parse(item);
        } catch (parseError) {
          console.warn(`Corrupted data found for key "${key}". Returning null.`, parseError);
          // Remove corrupted data
          localStorage.removeItem(key);
          return null;
        }
      } else {
        // Use in-memory storage as fallback
        return this._memoryStorage[key] !== undefined ? this._memoryStorage[key] : null;
      }
    } catch (e) {
      console.error(`Error retrieving data for key "${key}":`, e);
      return null;
    }
  }

  /**
   * Serializes and stores data
   * @param {string} key - Storage key
   * @param {any} value - Data to store
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      
      if (this._available) {
        try {
          localStorage.setItem(key, serialized);
          return true;
        } catch (e) {
          // Handle quota exceeded error
          if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.error('Local Storage quota exceeded. Unable to save data.', e);
            // Store in memory as fallback
            this._memoryStorage[key] = value;
            return false;
          }
          throw e;
        }
      } else {
        // Use in-memory storage as fallback
        this._memoryStorage[key] = value;
        return true;
      }
    } catch (e) {
      console.error(`Error storing data for key "${key}":`, e);
      return false;
    }
  }

  /**
   * Removes data by key
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    try {
      if (this._available) {
        localStorage.removeItem(key);
      } else {
        delete this._memoryStorage[key];
      }
    } catch (e) {
      console.error(`Error removing data for key "${key}":`, e);
    }
  }

  /**
   * Clears all storage
   */
  clear() {
    try {
      if (this._available) {
        localStorage.clear();
      } else {
        this._memoryStorage = {};
      }
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageService, STORAGE_KEYS };
}

/**
 * TimeManager handles the display of current time, date, and time-based greeting.
 * Updates the display every second to keep time current.
 */
class TimeManager {
  constructor(timeElement, dateElement, greetingElement) {
    this.timeElement = timeElement;
    this.dateElement = dateElement;
    this.greetingElement = greetingElement;
    this.intervalId = null;
  }

  /**
   * Starts the time update interval (updates every second)
   */
  start() {
    // Update immediately on start
    this.updateDisplay();
    
    // Then update every second
    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  /**
   * Stops the time update interval
   */
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Returns greeting based on current hour
   * @returns {string} Time-based greeting
   * @private
   */
  getGreeting() {
    const hour = new Date().getHours();
    
    // 5 AM - 11 AM: Good morning
    if (hour >= 5 && hour <= 11) {
      return "Good morning";
    }
    // 12 PM - 4 PM: Good afternoon
    if (hour >= 12 && hour <= 16) {
      return "Good afternoon";
    }
    // 5 PM - 8 PM: Good evening
    if (hour >= 17 && hour <= 20) {
      return "Good evening";
    }
    // 9 PM - 4 AM: Good night
    return "Good night";
  }

  /**
   * Formats time in 12-hour format with AM/PM
   * @param {Date} date - Date object to format
   * @returns {string} Formatted time string (HH:MM:SS AM/PM)
   * @private
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0 should be 12
    
    // Pad with zeros
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return `${hoursStr}:${minutesStr}:${secondsStr} ${period}`;
  }

  /**
   * Formats date in readable format
   * @param {Date} date - Date object to format
   * @returns {string} Formatted date string (Month Day, Year)
   * @private
   */
  formatDate(date) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  }

  /**
   * Updates all display elements with current time, date, and greeting
   * @private
   */
  updateDisplay() {
    const now = new Date();
    
    if (this.timeElement) {
      this.timeElement.textContent = this.formatTime(now);
    }
    
    if (this.dateElement) {
      this.dateElement.textContent = this.formatDate(now);
    }
    
    if (this.greetingElement) {
      this.greetingElement.textContent = this.getGreeting();
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.TimeManager = TimeManager;
}
