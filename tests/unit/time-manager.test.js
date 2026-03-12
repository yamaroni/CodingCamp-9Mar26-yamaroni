import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Import TimeManager after setting up DOM
const { TimeManager } = await import('../../js/app.js');

describe('TimeManager', () => {
  let timeElement, dateElement, greetingElement, timeManager;

  beforeEach(() => {
    // Create mock DOM elements
    timeElement = document.createElement('div');
    dateElement = document.createElement('div');
    greetingElement = document.createElement('div');
    
    timeManager = new TimeManager(timeElement, dateElement, greetingElement);
  });

  afterEach(() => {
    // Clean up any running intervals
    if (timeManager) {
      timeManager.stop();
    }
  });

  describe('formatTime', () => {
    it('should format midnight as 12:00:00 AM', () => {
      const date = new Date('2024-01-01T00:00:00');
      const result = timeManager.formatTime(date);
      expect(result).toBe('12:00:00 AM');
    });

    it('should format noon as 12:00:00 PM', () => {
      const date = new Date('2024-01-01T12:00:00');
      const result = timeManager.formatTime(date);
      expect(result).toBe('12:00:00 PM');
    });

    it('should format morning time correctly', () => {
      const date = new Date('2024-01-01T09:30:45');
      const result = timeManager.formatTime(date);
      expect(result).toBe('09:30:45 AM');
    });

    it('should format afternoon time correctly', () => {
      const date = new Date('2024-01-01T15:30:45');
      const result = timeManager.formatTime(date);
      expect(result).toBe('03:30:45 PM');
    });

    it('should pad single digit hours, minutes, and seconds with zeros', () => {
      const date = new Date('2024-01-01T01:05:09');
      const result = timeManager.formatTime(date);
      expect(result).toBe('01:05:09 AM');
    });
  });

  describe('formatDate', () => {
    it('should format date in readable format', () => {
      const date = new Date('2024-01-15');
      const result = timeManager.formatDate(date);
      expect(result).toBe('January 15, 2024');
    });

    it('should handle different months correctly', () => {
      const date = new Date('2024-12-25');
      const result = timeManager.formatDate(date);
      expect(result).toBe('December 25, 2024');
    });

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29');
      const result = timeManager.formatDate(date);
      expect(result).toBe('February 29, 2024');
    });
  });

  describe('getGreeting', () => {
    it('should return "Good morning" for 5 AM', () => {
      vi.setSystemTime(new Date('2024-01-01T05:00:00'));
      expect(timeManager.getGreeting()).toBe('Good morning');
    });

    it('should return "Good morning" for 11 AM', () => {
      vi.setSystemTime(new Date('2024-01-01T11:00:00'));
      expect(timeManager.getGreeting()).toBe('Good morning');
    });

    it('should return "Good afternoon" for 12 PM', () => {
      vi.setSystemTime(new Date('2024-01-01T12:00:00'));
      expect(timeManager.getGreeting()).toBe('Good afternoon');
    });

    it('should return "Good afternoon" for 4 PM', () => {
      vi.setSystemTime(new Date('2024-01-01T16:00:00'));
      expect(timeManager.getGreeting()).toBe('Good afternoon');
    });

    it('should return "Good evening" for 5 PM', () => {
      vi.setSystemTime(new Date('2024-01-01T17:00:00'));
      expect(timeManager.getGreeting()).toBe('Good evening');
    });

    it('should return "Good evening" for 8 PM', () => {
      vi.setSystemTime(new Date('2024-01-01T20:00:00'));
      expect(timeManager.getGreeting()).toBe('Good evening');
    });

    it('should return "Good night" for 9 PM', () => {
      vi.setSystemTime(new Date('2024-01-01T21:00:00'));
      expect(timeManager.getGreeting()).toBe('Good night');
    });

    it('should return "Good night" for 4 AM', () => {
      vi.setSystemTime(new Date('2024-01-01T04:00:00'));
      expect(timeManager.getGreeting()).toBe('Good night');
    });

    it('should return "Good night" for midnight', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      expect(timeManager.getGreeting()).toBe('Good night');
    });
  });

  describe('updateDisplay', () => {
    it('should update all display elements', () => {
      vi.setSystemTime(new Date('2024-01-15T14:30:45'));
      
      timeManager.updateDisplay();
      
      expect(timeElement.textContent).toBe('02:30:45 PM');
      expect(dateElement.textContent).toBe('January 15, 2024');
      expect(greetingElement.textContent).toBe('Good afternoon');
    });

    it('should handle null elements gracefully', () => {
      const manager = new TimeManager(null, null, null);
      expect(() => manager.updateDisplay()).not.toThrow();
    });
  });

  describe('start and stop', () => {
    it('should update display immediately on start', () => {
      vi.setSystemTime(new Date('2024-01-15T14:30:45'));
      
      timeManager.start();
      
      expect(timeElement.textContent).toBe('02:30:45 PM');
      expect(dateElement.textContent).toBe('January 15, 2024');
      expect(greetingElement.textContent).toBe('Good afternoon');
    });

    it('should set up interval on start', () => {
      timeManager.start();
      expect(timeManager.intervalId).not.toBeNull();
    });

    it('should clear interval on stop', () => {
      timeManager.start();
      const intervalId = timeManager.intervalId;
      
      timeManager.stop();
      
      expect(timeManager.intervalId).toBeNull();
    });

    it('should handle stop when not started', () => {
      expect(() => timeManager.stop()).not.toThrow();
    });

    it('should handle multiple stop calls', () => {
      timeManager.start();
      timeManager.stop();
      expect(() => timeManager.stop()).not.toThrow();
    });
  });
});
