/**
 * HidMapper: Converts HID usage codes to ZMK key names
 *
 * Maps USB HID keyboard page usage IDs to ZMK key name constants
 * (e.g., HID 0x04 → "A", HID 0x2C → "SPACE", HID 0x1E → "N1")
 */

import {
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from '../hid-usages';
import { KeyCode } from './types';

// USB HID Keyboard/Keypad Page (0x07)
const HID_PAGE_KEYBOARD = 0x07;

// USB HID Consumer Page (0x0C)
const HID_PAGE_CONSUMER = 0x0C;

/**
 * Common key name transformations for ZMK compatibility
 *
 * ZMK uses specific naming conventions that differ from HID usage names.
 * This map handles the most common transformations.
 *
 * NOTE: Keys are the ACTUAL labels returned by hid_usage_get_label() from
 * hid-usage-name-overrides.json and keyboard-and-consumer-usage-tables.json
 */
const KEY_NAME_OVERRIDES: Record<string, string> = {
  // Numbers (from hid-usage-name-overrides.json)
  '1': 'N1',
  '2': 'N2',
  '3': 'N3',
  '4': 'N4',
  '5': 'N5',
  '6': 'N6',
  '7': 'N7',
  '8': 'N8',
  '9': 'N9',
  '0': 'N0',

  // Special characters (using actual override labels from JSON)
  '␣': 'SPACE',  // U+2423 Open Box (spacebar)
  'Ret': 'ENTER',  // Return
  'ESC': 'ESC',  // Escape
  'BkSp': 'BSPC',  // Backspace
  'TAB': 'TAB',  // Tab
  'CAPS': 'CAPS',  // Caps Lock

  // Modifiers (using actual override labels from JSON)
  'Ctrl': 'LCTRL',  // Left Control (and Right Control - same label!)
  'Shft': 'LSHFT',  // Left Shift (and Right Shift - same label!)
  'Alt': 'LALT',  // Left Alt
  'GUI': 'LGUI',  // Left GUI (and Right GUI - same label!)
  'AltG': 'RALT',  // Right Alt (AltGr)

  // Arrow keys (using actual override labels from JSON)
  '→': 'RIGHT',  // U+2192 Rightwards Arrow
  '←': 'LEFT',   // U+2190 Leftwards Arrow
  '↓': 'DOWN',   // U+2193 Downwards Arrow
  '↑': 'UP',     // U+2191 Upwards Arrow

  // Function keys (already correct in overrides)
  'F1': 'F1',
  'F2': 'F2',
  'F3': 'F3',
  'F4': 'F4',
  'F5': 'F5',
  'F6': 'F6',
  'F7': 'F7',
  'F8': 'F8',
  'F9': 'F9',
  'F10': 'F10',
  'F11': 'F11',
  'F12': 'F12',

  // Special keys
  'HOME': 'HOME',
  'END': 'END',
  'PGUP': 'PG_UP',
  'PGDN': 'PG_DN',
  'INS': 'INS',
  'DEL': 'DEL',

  // Punctuation (using actual override labels from JSON)
  '-': 'MINUS',
  '=': 'EQUAL',
  '{': 'LBKT',  // Left bracket override is '{'
  '}': 'RBKT',  // Right bracket override is '}'
  '\\': 'BSLH',
  ';': 'SEMI',
  '\'': 'SQT',
  '`': 'GRAVE',
  ',': 'COMMA',
  '.': 'DOT',
  '/': 'FSLH',
};

export class HidMapper {
  /**
   * Get ZMK key name from HID usage code
   *
   * @param hidUsage - HID usage code (16-bit page + 16-bit ID)
   * @returns ZMK key name or null if unknown
   */
  static getZmkKeyName(hidUsage: number): string | null {
    const [page, id] = hid_usage_page_and_id_from_usage(hidUsage);

    // Only handle keyboard and consumer pages
    if (page !== HID_PAGE_KEYBOARD && page !== HID_PAGE_CONSUMER) {
      return null;
    }

    // Special handling for modifiers (0xE0-0xE7) since left and right have same labels
    if (page === HID_PAGE_KEYBOARD && id >= 0xE0 && id <= 0xE7) {
      const modifierMap: Record<number, string> = {
        0xE0: 'LCTRL',
        0xE1: 'LSHFT',
        0xE2: 'LALT',
        0xE3: 'LGUI',
        0xE4: 'RCTRL',
        0xE5: 'RSHFT',
        0xE6: 'RALT',
        0xE7: 'RGUI',
      };
      return modifierMap[id] || null;
    }

    // Get the HID usage label
    const label = hid_usage_get_label(page, id);
    if (!label) {
      return null;
    }

    // Check for overrides first
    if (KEY_NAME_OVERRIDES[label]) {
      return KEY_NAME_OVERRIDES[label];
    }

    // For simple letter keys (A-Z), return as-is
    if (/^[A-Z]$/.test(label)) {
      return label;
    }

    // Remove "Keyboard " prefix if present
    const cleanLabel = label.replace(/^Keyboard /, '');

    // Convert spaces and special chars to underscores, uppercase
    return cleanLabel
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toUpperCase();
  }

  /**
   * Get full KeyCode information
   *
   * @param hidUsage - HID usage code
   * @returns KeyCode object with metadata or null if unknown
   */
  static getKeyCode(hidUsage: number): KeyCode | null {
    const zmkName = this.getZmkKeyName(hidUsage);
    if (!zmkName) {
      return null;
    }

    const [page, id] = hid_usage_page_and_id_from_usage(hidUsage);
    const label = hid_usage_get_label(page, id) || '';

    return {
      hidUsage,
      zmkName,
      label,
      category: this.categorizeKey(zmkName),
    };
  }

  /**
   * Check if a HID usage code is a modifier key
   *
   * @param hidUsage - HID usage code
   * @returns True if the key is a modifier (Ctrl, Shift, Alt, GUI)
   */
  static isModifier(hidUsage: number): boolean {
    const keyName = this.getZmkKeyName(hidUsage);
    if (!keyName) {
      return false;
    }

    const modifiers = ['LCTRL', 'LSHFT', 'LALT', 'LGUI', 'RCTRL', 'RSHFT', 'RALT', 'RGUI'];
    return modifiers.includes(keyName);
  }

  /**
   * Categorize a key by its ZMK name
   *
   * @param zmkName - ZMK key name
   * @returns Key category
   */
  private static categorizeKey(zmkName: string): 'letter' | 'number' | 'modifier' | 'function' | 'special' {
    if (/^[A-Z]$/.test(zmkName)) {
      return 'letter';
    }
    if (/^N[0-9]$/.test(zmkName) || /^F[0-9]+$/.test(zmkName)) {
      return zmkName.startsWith('F') ? 'function' : 'number';
    }
    if (['LCTRL', 'LSHFT', 'LALT', 'LGUI', 'RCTRL', 'RSHFT', 'RALT', 'RGUI'].includes(zmkName)) {
      return 'modifier';
    }
    return 'special';
  }
}
