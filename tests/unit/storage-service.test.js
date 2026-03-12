import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock;

// Import StorageService after mocking localStorage
const { StorageService } = await import('../../js/app.js');

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(storageService.isAvailable()).toBe(true);
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      const result = storageService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should retrieve and deserialize stored data', () => {
      const data = { name: 'Test', value: 42 };
      localStorage.setItem('test-key', JSON.stringify(data));
      
      const result = storageService.get('test-key');
      expect(result).toEqual(data);
    });

    it('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('corrupted', 'invalid-json{');
      
      const result = storageService.get('corrupted');
      expect(result).toBeNull();
      // Corrupted data should be removed
      expect(localStorage.getItem('corrupted')).toBeNull();
    });

    it('should handle arrays correctly', () => {
      const data = [1, 2, 3, 4, 5];
      localStorage.setItem('array-key', JSON.stringify(data));
      
      const result = storageService.get('array-key');
      expect(result).toEqual(data);
    });
  });

  describe('set', () => {
    it('should serialize and store data', () => {
      const data = { name: 'Test', value: 42 };
      const success = storageService.set('test-key', data);
      
      expect(success).toBe(true);
      const stored = JSON.parse(localStorage.getItem('test-key'));
      expect(stored).toEqual(data);
    });

    it('should handle arrays correctly', () => {
      const data = [1, 2, 3, 4, 5];
      const success = storageService.set('array-key', data);
      
      expect(success).toBe(true);
      const stored = JSON.parse(localStorage.getItem('array-key'));
      expect(stored).toEqual(data);
    });

    it('should handle nested objects', () => {
      const data = {
        user: { name: 'John', age: 30 },
        tasks: [{ id: 1, text: 'Task 1' }]
      };
      const success = storageService.set('nested-key', data);
      
      expect(success).toBe(true);
      const stored = JSON.parse(localStorage.getItem('nested-key'));
      expect(stored).toEqual(data);
    });
  });

  describe('remove', () => {
    it('should remove data by key', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 42 }));
      
      storageService.remove('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should not throw error when removing non-existent key', () => {
      expect(() => storageService.remove('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      storageService.clear();
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });
  });

  describe('round trip', () => {
    it('should preserve data through set and get cycle', () => {
      const data = {
        id: '123',
        text: 'Test task',
        completed: false,
        createdAt: Date.now()
      };
      
      storageService.set('round-trip', data);
      const retrieved = storageService.get('round-trip');
      
      expect(retrieved).toEqual(data);
    });
  });
});
