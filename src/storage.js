import fs from 'fs';
import path from 'path';
import { config } from './config.js';

/**
 * Sanitize a string to be safe for use in filenames
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str) {
  return str
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Get today's date string in YYYY-MM-DD format
 * @returns {string}
 */
export function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get timestamp string for filenames
 * @returns {string}
 */
export function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}${minutes}${seconds}_${ms}`;
}

/**
 * Create the day directory for a handle
 * @param {string} handle
 * @returns {string} Path to the day directory
 */
export function createDayDir(handle) {
  const dateStr = getDateString();
  const dayDir = path.join(config.CAPTURES_DIR, handle, dateStr);
  fs.mkdirSync(dayDir, { recursive: true });
  return dayDir;
}

/**
 * Create a session directory within the day directory
 * @param {string} dayDir
 * @param {number} sessionIndex
 * @param {string} label - The posted time label (e.g., "1h", "3h", "Yesterday")
 * @returns {string} Path to the session directory
 */
export function createSessionDir(dayDir, sessionIndex, label) {
  const paddedIndex = String(sessionIndex).padStart(3, '0');
  const sanitizedLabel = sanitize(label || 'unknown');
  const sessionDirName = `session_${paddedIndex}_${sanitizedLabel}`;
  const sessionDir = path.join(dayDir, sessionDirName);
  fs.mkdirSync(sessionDir, { recursive: true });
  return sessionDir;
}

/**
 * Generate a screenshot filename
 * @param {number} shotIndex
 * @param {string} label - The detected time label (e.g., "1h", "3h")
 * @returns {string}
 */
export function getScreenshotFilename(shotIndex, label = 'unknown') {
  const timestamp = getTimestamp();
  const paddedShot = String(shotIndex).padStart(4, '0');
  const sanitizedLabel = sanitize(label || 'unknown');
  return `${timestamp}_${sanitizedLabel}_shot_${paddedShot}.png`;
}
