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
 */
const KEY_NAME_OVERRIDES: Record<string, string> = {
  // Numbers
  '1 and !': 'N1',
  '2 and @': 'N2',
  '3 and #': 'N3',
  '4 and $': 'N4',
  '5 and %': 'N5',
  '6 and ^': 'N6',
  '7 and &': 'N7',
  '8 and *': 'N8',
  '9 and (': 'N9',
  '0 and )': 'N0',

  // Special characters
  'Spacebar': 'SPACE',
  'Keyboard Return (ENTER)': 'ENTER',
  'Keyboard Escape': 'ESC',
  'Keyboard Delete (Backspace)': 'BSPC',
  'Keyboard Tab': 'TAB',
  'Keyboard Caps Lock': 'CAPS',

  // Modifiers
  'Keyboard Left Control': 'LCTRL',
  'Keyboard Left Shift': 'LSHFT',
  'Keyboard Left Alt': 'LALT',
  'Keyboard Left GUI': 'LGUI',
  'Keyboard Right Control': 'RCTRL',
  'Keyboard Right Shift': 'RSHFT',
  'Keyboard Right Alt': 'RALT',
  'Keyboard Right GUI': 'RGUI',

  // Arrow keys
  'Keyboard Right Arrow': 'RIGHT',
  'Keyboard Left Arrow': 'LEFT',
  'Keyboard Down Arrow': 'DOWN',
  'Keyboard Up Arrow': 'UP',

  // Function keys
  'Keyboard F1': 'F1',
  'Keyboard F2': 'F2',
  'Keyboard F3': 'F3',
  'Keyboard F4': 'F4',
  'Keyboard F5': 'F5',
  'Keyboard F6': 'F6',
  'Keyboard F7': 'F7',
  'Keyboard F8': 'F8',
  'Keyboard F9': 'F9',
  'Keyboard F10': 'F10',
  'Keyboard F11': 'F11',
  'Keyboard F12': 'F12',

  // Special keys
  'Keyboard Home': 'HOME',
  'Keyboard End': 'END',
  'Keyboard Page Up': 'PG_UP',
  'Keyboard Page Down': 'PG_DN',
  'Keyboard Insert': 'INS',
  'Keyboard Delete Forward': 'DEL',

  // Punctuation
  '- and _': 'MINUS',
  '= and +': 'EQUAL',
  '[ and {': 'LBKT',
  '] and }': 'RBKT',
  '\\ and |': 'BSLH',
  '; and :': 'SEMI',
  '\' and "': 'SQT',
  '` and ~': 'GRAVE',
  ', and <': 'COMMA',
  '. and >': 'DOT',
  '/ and ?': 'FSLH',
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
