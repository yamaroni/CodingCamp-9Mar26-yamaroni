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

/**
 * TimerController manages the 25-minute focus timer with start, stop, and reset functionality.
 * Handles countdown logic, time formatting, and completion indication.
 */
class TimerController {
  constructor(displayElement, startButton, stopButton, resetButton) {
    this.displayElement = displayElement;
    this.startButton = startButton;
    this.stopButton = stopButton;
    this.resetButton = resetButton;
    
    // Timer state
    this.remainingSeconds = 1500; // 25 minutes = 1500 seconds
    this.isRunning = false;
    this.intervalId = null;
    
    // Initialize display
    this.updateDisplay();
    
    // Bind event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.start());
    }
    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => this.stop());
    }
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
  }

  /**
   * Starts or resumes the timer countdown
   */
  start() {
    if (this.isRunning) {
      return; // Already running, prevent multiple intervals
    }
    
    this.isRunning = true;
    
    // Clear any existing interval to prevent multiple intervals
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    
    // Start countdown - tick every second
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
    
    // Update button states
    this.updateButtonStates();
  }

  /**
   * Pauses the timer, preserving remaining time
   */
  stop() {
    if (!this.isRunning) {
      return; // Already stopped
    }
    
    this.isRunning = false;
    
    // Clear the interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Update button states
    this.updateButtonStates();
  }

  /**
   * Resets timer to 25:00 and stops countdown
   */
  reset() {
    // Stop the timer if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Reset to 25 minutes
    this.remainingSeconds = 1500;
    this.isRunning = false;
    
    // Clear any visual completion indication
    if (this.displayElement) {
      this.displayElement.classList.remove('timer-complete');
    }
    
    // Update display
    this.updateDisplay();
    this.updateButtonStates();
  }

  /**
   * Formats seconds as MM:SS
   * @param {number} seconds - Total seconds to format
   * @returns {string} Formatted time string (MM:SS)
   * @private
   */
  formatTime(seconds) {
    // Clamp to minimum of 0 to prevent negative display
    const clampedSeconds = Math.max(0, seconds);
    
    const minutes = Math.floor(clampedSeconds / 60);
    const secs = clampedSeconds % 60;
    
    // Pad with zeros
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(secs).padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
  }

  /**
   * Updates the display element with current time
   * @private
   */
  updateDisplay() {
    if (this.displayElement) {
      this.displayElement.textContent = this.formatTime(this.remainingSeconds);
    }
  }

  /**
   * Updates button states based on timer state
   * @private
   */
  updateButtonStates() {
    if (this.startButton) {
      this.startButton.disabled = this.isRunning;
    }
    if (this.stopButton) {
      this.stopButton.disabled = !this.isRunning;
    }
  }

  /**
   * Timer tick handler - decrements time and checks for completion
   * @private
   */
  tick() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.updateDisplay();
      
      // Check if timer just reached 00:00
      if (this.remainingSeconds === 0) {
        this.onComplete();
      }
    }
  }

  /**
   * Handles timer completion when reaching 00:00
   * @private
   */
  onComplete() {
    // Stop the timer
    this.stop();
    
    // Add visual indication that timer is complete
    if (this.displayElement) {
      this.displayElement.classList.add('timer-complete');
    }
    
    // Update button states
    this.updateButtonStates();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.TimerController = TimerController;
}

/**
 * TaskManager handles task list operations including add, toggle, delete, and persistence.
 * Manages task CRUD operations and renders tasks to the DOM.
 */
class TaskManager {
  constructor(taskListElement, taskInputElement, addButton, storageService) {
    this.taskListElement = taskListElement;
    this.taskInputElement = taskInputElement;
    this.addButton = addButton;
    this.storageService = storageService;
    
    // Task state
    this.tasks = [];
    
    // Load tasks from storage
    this.loadTasks();
    
    // Bind event listeners
    if (this.addButton) {
      this.addButton.addEventListener('click', () => {
        const text = this.taskInputElement ? this.taskInputElement.value : '';
        this.addTask(text);
      });
    }
    
    // Allow Enter key to add task
    if (this.taskInputElement) {
      this.taskInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = this.taskInputElement.value;
          this.addTask(text);
        }
      });
    }
  }

  /**
   * Adds a new task to the list
   * @param {string} text - Task description
   */
  addTask(text) {
    // Validate input - reject empty or whitespace-only strings
    if (!text || text.trim() === '') {
      return; // Prevent submission of empty tasks
    }
    
    // Create new task object
    const task = {
      id: Date.now().toString(), // Timestamp-based unique ID
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    // Add to tasks array
    this.tasks.push(task);
    
    // Save to storage
    this.saveTasks();
    
    // Update display
    this.render();
    
    // Clear input field
    if (this.taskInputElement) {
      this.taskInputElement.value = '';
    }
  }

  /**
   * Toggles task completion status
   * @param {string} taskId - ID of task to toggle
   */
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  /**
   * Removes a task from the list
   * @param {string} taskId - ID of task to delete
   */
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasks();
    this.render();
  }

  /**
   * Loads tasks from storage
   */
  loadTasks() {
    const storedTasks = this.storageService.get(STORAGE_KEYS.TASKS);
    
    // If valid data exists, use it; otherwise start with empty array
    if (Array.isArray(storedTasks)) {
      this.tasks = storedTasks;
    } else {
      this.tasks = [];
    }
    
    // Render loaded tasks
    this.render();
  }

  /**
   * Saves tasks to storage
   * @private
   */
  saveTasks() {
    this.storageService.set(STORAGE_KEYS.TASKS, this.tasks);
  }

  /**
   * Renders task list to DOM
   * @private
   */
  render() {
    if (!this.taskListElement) {
      return;
    }
    
    // Clear existing content
    this.taskListElement.innerHTML = '';
    
    // Render each task
    this.tasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.taskListElement.appendChild(taskElement);
    });
  }

  /**
   * Creates task DOM element
   * @param {Object} task - Task object
   * @returns {HTMLElement} Task list item element
   * @private
   */
  createTaskElement(task) {
    // Create list item
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
      li.classList.add('completed');
    }
    
    // Create task text span
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    // Apply strikethrough for completed tasks
    if (task.completed) {
      textSpan.style.textDecoration = 'line-through';
    }
    
    // Add click handler to toggle completion
    textSpan.addEventListener('click', () => {
      this.toggleTask(task.id);
    });
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    
    // Add click handler to delete task
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering toggle
      this.deleteTask(task.id);
    });
    
    // Assemble task element
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    
    return li;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.TaskManager = TaskManager;
}


/**
 * LinkManager - Manages quick links with CRUD operations and persistence
 * Handles adding, deleting, loading, and rendering quick access links
 */
class LinkManager {
  /**
   * @param {HTMLElement} linksContainer - Container element for link buttons
   * @param {HTMLInputElement} nameInput - Input element for link name
   * @param {HTMLInputElement} urlInput - Input element for link URL
   * @param {HTMLButtonElement} addButton - Button to add new link
   * @param {StorageService} storageService - Storage service instance
   */
  constructor(linksContainer, nameInput, urlInput, addButton, storageService) {
    this.linksContainer = linksContainer;
    this.nameInput = nameInput;
    this.urlInput = urlInput;
    this.addButton = addButton;
    this.storageService = storageService;
    this.links = [];
    this.STORAGE_KEY = 'browser-start-page-links';

    // Set up event listeners
    this.addButton.addEventListener('click', () => this.handleAdd());
    this.nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleAdd();
    });
    this.urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleAdd();
    });

    // Load existing links
    this.loadLinks();
  }

  /**
   * Handles the add link action
   * Validates inputs and adds link if valid
   */
  handleAdd() {
    const name = this.nameInput.value.trim();
    const url = this.urlInput.value.trim();
    
    if (name && url) {
      this.addLink(name, url);
      this.nameInput.value = '';
      this.urlInput.value = '';
    }
  }

  /**
   * Adds a new link to the list
   * @param {string} name - Display name for the link
   * @param {string} url - Target URL
   */
  addLink(name, url) {
    // Validate inputs
    if (!name || name.trim() === '') {
      console.warn('Link name cannot be empty');
      return;
    }
    
    if (!url || url.trim() === '') {
      console.warn('Link URL cannot be empty');
      return;
    }

    // Validate URL format
    if (!this.isValidUrl(url)) {
      console.warn('Invalid URL format');
      return;
    }

    // Create new link object
    const link = {
      id: Date.now().toString(),
      name: name.trim(),
      url: url.trim(),
      createdAt: Date.now()
    };

    // Add to links array
    this.links.push(link);

    // Save and render
    this.saveLinks();
    this.render();
  }

  /**
   * Deletes a link by ID
   * @param {string} linkId - ID of the link to delete
   */
  deleteLink(linkId) {
    const index = this.links.findIndex(link => link.id === linkId);
    
    if (index !== -1) {
      this.links.splice(index, 1);
      this.saveLinks();
      this.render();
    }
  }

  /**
   * Loads links from storage
   */
  loadLinks() {
    const stored = this.storageService.get(this.STORAGE_KEY);
    
    if (stored && Array.isArray(stored)) {
      this.links = stored;
    } else {
      this.links = [];
    }
    
    this.render();
  }

  /**
   * Saves links to storage
   * @private
   */
  saveLinks() {
    this.storageService.set(this.STORAGE_KEY, this.links);
  }

  /**
   * Renders all links to the DOM
   * @private
   */
  render() {
    // Clear container
    this.linksContainer.innerHTML = '';

    // Render each link
    this.links.forEach(link => {
      const linkElement = this.createLinkElement(link);
      this.linksContainer.appendChild(linkElement);
    });
  }

  /**
   * Creates a DOM element for a link
   * @param {Object} link - Link object with id, name, and url
   * @returns {HTMLElement} Link button element
   * @private
   */
  createLinkElement(link) {
    // Create link button container
    const linkWrapper = document.createElement('div');
    linkWrapper.className = 'link-item';
    linkWrapper.dataset.linkId = link.id;

    // Create link button
    const linkButton = document.createElement('button');
    linkButton.className = 'link-button';
    linkButton.textContent = link.name;
    linkButton.title = link.url;
    
    // Add click handler to open URL in current tab
    linkButton.addEventListener('click', () => {
      window.location.href = link.url;
    });

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'link-delete';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete link';
    deleteButton.setAttribute('aria-label', `Delete ${link.name}`);
    
    // Add delete handler
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteLink(link.id);
    });

    // Assemble elements
    linkWrapper.appendChild(linkButton);
    linkWrapper.appendChild(deleteButton);

    return linkWrapper;
  }

  /**
   * Validates URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is valid
   * @private
   */
  isValidUrl(url) {
    // Check for empty or whitespace-only
    if (!url || url.trim() === '') {
      return false;
    }

    // Basic URL validation - must start with http:// or https://
    const urlPattern = /^https?:\/\/.+/i;
    
    if (!urlPattern.test(url)) {
      return false;
    }

    // Try to create URL object for additional validation
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports.LinkManager = LinkManager;
}

/**
 * Application Initialization
 * Runs when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize storage service
    const storageService = new StorageService();

    // Initialize time manager with error handling for missing elements
    try {
      const timeElement = document.getElementById('time-display');
      const dateElement = document.getElementById('date-display');
      const greetingElement = document.getElementById('greeting-text');
      
      if (!timeElement || !dateElement || !greetingElement) {
        console.error('TimeManager initialization failed: Missing required DOM elements');
        console.error('Missing elements:', {
          timeDisplay: !timeElement,
          dateDisplay: !dateElement,
          greetingText: !greetingElement
        });
      } else {
        const timeManager = new TimeManager(timeElement, dateElement, greetingElement);
        timeManager.start();
      }
    } catch (error) {
      console.error('Error initializing TimeManager:', error);
    }

    // Initialize timer controller with error handling for missing elements
    try {
      const timerDisplay = document.getElementById('timer-display');
      const timerStart = document.getElementById('timer-start');
      const timerStop = document.getElementById('timer-stop');
      const timerReset = document.getElementById('timer-reset');
      
      if (!timerDisplay || !timerStart || !timerStop || !timerReset) {
        console.error('TimerController initialization failed: Missing required DOM elements');
        console.error('Missing elements:', {
          timerDisplay: !timerDisplay,
          timerStart: !timerStart,
          timerStop: !timerStop,
          timerReset: !timerReset
        });
      } else {
        const timerController = new TimerController(timerDisplay, timerStart, timerStop, timerReset);
      }
    } catch (error) {
      console.error('Error initializing TimerController:', error);
    }

    // Initialize task manager with error handling for missing elements
    try {
      const taskList = document.getElementById('task-list');
      const taskInput = document.getElementById('task-input');
      const taskAdd = document.getElementById('task-add');
      
      if (!taskList || !taskInput || !taskAdd) {
        console.error('TaskManager initialization failed: Missing required DOM elements');
        console.error('Missing elements:', {
          taskList: !taskList,
          taskInput: !taskInput,
          taskAdd: !taskAdd
        });
      } else {
        const taskManager = new TaskManager(taskList, taskInput, taskAdd, storageService);
      }
    } catch (error) {
      console.error('Error initializing TaskManager:', error);
    }

    // Initialize link manager with error handling for missing elements
    try {
      const linksContainer = document.getElementById('links-container');
      const linkNameInput = document.getElementById('link-name-input');
      const linkUrlInput = document.getElementById('link-url-input');
      const linkAdd = document.getElementById('link-add');
      
      if (!linksContainer || !linkNameInput || !linkUrlInput || !linkAdd) {
        console.error('LinkManager initialization failed: Missing required DOM elements');
        console.error('Missing elements:', {
          linksContainer: !linksContainer,
          linkNameInput: !linkNameInput,
          linkUrlInput: !linkUrlInput,
          linkAdd: !linkAdd
        });
      } else {
        const linkManager = new LinkManager(linksContainer, linkNameInput, linkUrlInput, linkAdd, storageService);
      }
    } catch (error) {
      console.error('Error initializing LinkManager:', error);
    }
  } catch (error) {
    console.error('Critical error during application initialization:', error);
  }
});
