/**
 * Reverse HID Mapper
 *
 * Converts ZMK key names to HID usage codes
 * This is the reverse of HidMapper in export
 */

export class ReverseHidMapper {
  /**
   * Keyboard page constant
   */
  private static readonly HID_PAGE_KEYBOARD = 0x07;

  /**
   * Map of ZMK key names to HID IDs (within keyboard page)
   */
  private static readonly KEY_MAP: Map<string, number> = new Map([
    // Letters A-Z (0x04-0x1D)
    ['A', 0x04],
    ['B', 0x05],
    ['C', 0x06],
    ['D', 0x07],
    ['E', 0x08],
    ['F', 0x09],
    ['G', 0x0A],
    ['H', 0x0B],
    ['I', 0x0C],
    ['J', 0x0D],
    ['K', 0x0E],
    ['L', 0x0F],
    ['M', 0x10],
    ['N', 0x11],
    ['O', 0x12],
    ['P', 0x13],
    ['Q', 0x14],
    ['R', 0x15],
    ['S', 0x16],
    ['T', 0x17],
    ['U', 0x18],
    ['V', 0x19],
    ['W', 0x1A],
    ['X', 0x1B],
    ['Y', 0x1C],
    ['Z', 0x1D],

    // Numbers 1-9, 0 (0x1E-0x27)
    ['N1', 0x1E],
    ['N2', 0x1F],
    ['N3', 0x20],
    ['N4', 0x21],
    ['N5', 0x22],
    ['N6', 0x23],
    ['N7', 0x24],
    ['N8', 0x25],
    ['N9', 0x26],
    ['N0', 0x27],

    // Special keys
    ['ENTER', 0x28],
    ['ESC', 0x29],
    ['BSPC', 0x2A],
    ['TAB', 0x2B],
    ['SPACE', 0x2C],

    // Punctuation
    ['MINUS', 0x2D],
    ['EQUAL', 0x2E],
    ['LBKT', 0x2F],
    ['RBKT', 0x30],
    ['BSLH', 0x31],
    ['SEMI', 0x33],
    ['SQT', 0x34],
    ['GRAVE', 0x35],
    ['COMMA', 0x36],
    ['DOT', 0x37],
    ['FSLH', 0x38],

    // Function keys
    ['F1', 0x3A],
    ['F2', 0x3B],
    ['F3', 0x3C],
    ['F4', 0x3D],
    ['F5', 0x3E],
    ['F6', 0x3F],
    ['F7', 0x40],
    ['F8', 0x41],
    ['F9', 0x42],
    ['F10', 0x43],
    ['F11', 0x44],
    ['F12', 0x45],

    // Navigation
    ['RIGHT', 0x4F],
    ['LEFT', 0x50],
    ['DOWN', 0x51],
    ['UP', 0x52],
    ['HOME', 0x4A],
    ['END', 0x4D],
    ['PG_UP', 0x4B],
    ['PG_DN', 0x4E],
    ['DEL', 0x4C],
    ['INS', 0x49],

    // Modifiers - Left
    ['LCTRL', 0xE0],
    ['LSHFT', 0xE1],
    ['LALT', 0xE2],
    ['LGUI', 0xE3],

    // Modifiers - Right
    ['RCTRL', 0xE4],
    ['RSHFT', 0xE5],
    ['RALT', 0xE6],
    ['RGUI', 0xE7],
  ]);

  /**
   * Get HID usage code from ZMK key name
   * Returns full HID usage code (page + id)
   */
  static getHidCode(keyName: string): number | null {
    const id = this.KEY_MAP.get(keyName);
    if (id === undefined) {
      return null;
    }

    // Combine page and id into full HID usage code
    return (this.HID_PAGE_KEYBOARD << 16) | id;
  }

  /**
   * Check if a key name is a modifier
   */
  static isModifier(keyName: string): boolean {
    return [
      'LCTRL',
      'LSHFT',
      'LALT',
      'LGUI',
      'RCTRL',
      'RSHFT',
      'RALT',
      'RGUI',
    ].includes(keyName);
  }

  /**
   * Get all known key names
   */
  static getAllKeyNames(): string[] {
    return Array.from(this.KEY_MAP.keys());
  }
}
