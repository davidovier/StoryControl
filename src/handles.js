import fs from 'fs';
import { config } from './config.js';

/**
 * Reads handles from handles.txt
 * Ignores empty lines and lines starting with #
 * @returns {string[]} Array of Instagram handles
 */
export function loadHandles() {
  const content = fs.readFileSync(config.HANDLES_FILE, 'utf-8');
  const lines = content.split('\n');

  const handles = lines
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  return handles;
}
