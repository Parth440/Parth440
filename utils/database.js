/**
 * Database Manager
 * JSON-based database system for storing all bot data
 * No SQL required - uses simple JSON files
 */

const fs = require('fs');
const path = require('path');

class Database {
  constructor(basePath = './database') {
    this.basePath = basePath;
    this.data = {};
    this.ensureDirectoryExists();
    this.loadAll();
  }

  /**
   * Ensure database directory exists
   */
  ensureDirectoryExists() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Get file path for a collection
   */
  getFilePath(collection) {
    return path.join(this.basePath, `${collection}.json`);
  }

  /**
   * Load all database files
   */
  loadAll() {
    const collections = [
      'players',
      'roles',
      'economy',
      'tracking',
      'emotes',
      'outfits',
      'settings',
      'invites',
      'dm_memory',
      'giveaways',
      'birthdays',
      'messages',
      'moderation',
      'home_position',
      'vips'
    ];

    collections.forEach(collection => {
      this.load(collection);
    });
  }

  /**
   * Load a specific collection
   */
  load(collection) {
    const filePath = this.getFilePath(collection);
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        this.data[collection] = JSON.parse(data);
      } else {
        this.data[collection] = {};
        this.save(collection);
      }
    } catch (error) {
      console.error(`Error loading ${collection}:`, error);
      this.data[collection] = {};
    }
  }

  /**
   * Save a specific collection
   */
  save(collection) {
    const filePath = this.getFilePath(collection);
    
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify(this.data[collection], null, 2),
        'utf8'
      );
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
    }
  }

  /**
   * Save all collections
   */
  saveAll() {
    Object.keys(this.data).forEach(collection => {
      this.save(collection);
    });
  }

  /**
   * Get data from a collection
   */
  get(collection, key = null) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }

    if (key === null) {
      return this.data[collection];
    }

    return this.data[collection][key];
  }

  /**
   * Set data in a collection
   */
  set(collection, key, value) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }

    this.data[collection][key] = value;
    this.save(collection);
  }

  /**
   * Update data in a collection (merge with existing)
   */
  update(collection, key, updates) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }

    if (!this.data[collection][key]) {
      this.data[collection][key] = {};
    }

    this.data[collection][key] = {
      ...this.data[collection][key],
      ...updates
    };

    this.save(collection);
  }

  /**
   * Delete data from a collection
   */
  delete(collection, key) {
    if (this.data[collection] && this.data[collection][key]) {
      delete this.data[collection][key];
      this.save(collection);
      return true;
    }
    return false;
  }

  /**
   * Check if key exists in collection
   */
  has(collection, key) {
    return this.data[collection] && this.data[collection][key] !== undefined;
  }

  /**
   * Get all keys from a collection
   */
  keys(collection) {
    if (!this.data[collection]) {
      return [];
    }
    return Object.keys(this.data[collection]);
  }

  /**
   * Get all values from a collection
   */
  values(collection) {
    if (!this.data[collection]) {
      return [];
    }
    return Object.values(this.data[collection]);
  }

  /**
   * Get all entries from a collection
   */
  entries(collection) {
    if (!this.data[collection]) {
      return [];
    }
    return Object.entries(this.data[collection]);
  }

  /**
   * Filter collection by condition
   */
  filter(collection, callback) {
    if (!this.data[collection]) {
      return [];
    }

    return Object.entries(this.data[collection])
      .filter(([key, value]) => callback(key, value))
      .map(([key, value]) => ({ key, ...value }));
  }

  /**
   * Find first item matching condition
   */
  find(collection, callback) {
    if (!this.data[collection]) {
      return null;
    }

    const entry = Object.entries(this.data[collection])
      .find(([key, value]) => callback(key, value));

    return entry ? { key: entry[0], ...entry[1] } : null;
  }

  /**
   * Count items in collection
   */
  count(collection) {
    if (!this.data[collection]) {
      return 0;
    }
    return Object.keys(this.data[collection]).length;
  }

  /**
   * Clear entire collection
   */
  clear(collection) {
    this.data[collection] = {};
    this.save(collection);
  }

  /**
   * Increment a numeric value
   */
  increment(collection, key, field, amount = 1) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }

    if (!this.data[collection][key]) {
      this.data[collection][key] = {};
    }

    if (!this.data[collection][key][field]) {
      this.data[collection][key][field] = 0;
    }

    this.data[collection][key][field] += amount;
    this.save(collection);

    return this.data[collection][key][field];
  }

  /**
   * Decrement a numeric value
   */
  decrement(collection, key, field, amount = 1) {
    return this.increment(collection, key, field, -amount);
  }

  /**
   * Push item to array field
   */
  push(collection, key, field, item) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }

    if (!this.data[collection][key]) {
      this.data[collection][key] = {};
    }

    if (!Array.isArray(this.data[collection][key][field])) {
      this.data[collection][key][field] = [];
    }

    this.data[collection][key][field].push(item);
    this.save(collection);
  }

  /**
   * Remove item from array field
   */
  pull(collection, key, field, item) {
    if (!this.data[collection] || !this.data[collection][key]) {
      return;
    }

    if (Array.isArray(this.data[collection][key][field])) {
      this.data[collection][key][field] = this.data[collection][key][field]
        .filter(i => i !== item);
      this.save(collection);
    }
  }

  /**
   * Get sorted entries
   */
  sort(collection, field, order = 'desc') {
    if (!this.data[collection]) {
      return [];
    }

    const entries = Object.entries(this.data[collection])
      .map(([key, value]) => ({ key, ...value }));

    return entries.sort((a, b) => {
      const aVal = a[field] || 0;
      const bVal = b[field] || 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }

  /**
   * Get top N entries
   */
  top(collection, field, limit = 10, order = 'desc') {
    return this.sort(collection, field, order).slice(0, limit);
  }

  /**
   * Backup database
   */
  backup() {
    const backupPath = path.join(this.basePath, 'backups');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(backupPath, `backup-${timestamp}.json`);

    try {
      fs.writeFileSync(
        backupFile,
        JSON.stringify(this.data, null, 2),
        'utf8'
      );
      return backupFile;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }
}

module.exports = Database;
