/**
 * Unit tests for HidMapper
 *
 * Tests HID usage code to ZMK key name conversion
 *
 * HID usage format: (page << 16) + id
 * Keyboard page: 0x07
 */

import { describe, it, expect } from 'vitest';
import { HidMapper } from './HidMapper';

// Helper to create HID usage code from page and ID
const hid = (page: number, id: number) => (page << 16) + id;

// Keyboard page constant
const KB = 0x07;

describe('HidMapper', () => {
  describe('getZmkKeyName', () => {
    it('should convert letter keys', () => {
      // HID 0x04 = A, 0x05 = B, 0x1A = W
      expect(HidMapper.getZmkKeyName(hid(KB, 0x04))).toBe('A');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x05))).toBe('B');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1A))).toBe('W');
    });

    it('should convert number keys with N prefix', () => {
      // HID 0x1E = 1, 0x1F = 2, 0x27 = 0
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1E))).toBe('N1');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1F))).toBe('N2');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x27))).toBe('N0');
    });

    it('should convert space to SPACE', () => {
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2C))).toBe('SPACE');
    });

    it('should convert modifiers correctly', () => {
      // HID 0xE0 = LCTRL, 0xE1 = LSHFT, 0xE2 = LALT, 0xE3 = LGUI
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE0))).toBe('LCTRL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE1))).toBe('LSHFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE2))).toBe('LALT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE3))).toBe('LGUI');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE4))).toBe('RCTRL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE5))).toBe('RSHFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE6))).toBe('RALT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE7))).toBe('RGUI');
    });

    it('should convert special keys', () => {
      // Tab, Enter, Escape, Backspace
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2B))).toBe('TAB');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x28))).toBe('ENTER');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x29))).toBe('ESC');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2A))).toBe('BSPC');
    });

    it('should convert arrow keys', () => {
      // Right, Left, Down, Up
      expect(HidMapper.getZmkKeyName(hid(KB, 0x4F))).toBe('RIGHT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x50))).toBe('LEFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x51))).toBe('DOWN');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x52))).toBe('UP');
    });

    it('should convert function keys', () => {
      // F1, F2, F12
      expect(HidMapper.getZmkKeyName(hid(KB, 0x3A))).toBe('F1');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x3B))).toBe('F2');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x45))).toBe('F12');
    });

    it('should convert punctuation keys', () => {
      // Minus, Equal, Left bracket
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2D))).toBe('MINUS');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2E))).toBe('EQUAL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2F))).toBe('LBKT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x30))).toBe('RBKT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x31))).toBe('BSLH');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x33))).toBe('SEMI');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x34))).toBe('SQT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x35))).toBe('GRAVE');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x36))).toBe('COMMA');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x37))).toBe('DOT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x38))).toBe('FSLH');
    });

    it('should return null for invalid HID codes', () => {
      // Invalid page or unknown code
      expect(HidMapper.getZmkKeyName(0xFFFF)).toBeNull();
    });

    it('should return null for non-keyboard pages', () => {
      // HID page 0x01 (Generic Desktop) instead of 0x07 (Keyboard)
      const genericDesktopUsage = hid(0x01, 0x01);
      expect(HidMapper.getZmkKeyName(genericDesktopUsage)).toBeNull();
    });
  });

  describe('getKeyCode', () => {
    it('should return full KeyCode object for valid keys', () => {
      const usage = hid(KB, 0x04); // A
      const keyCode = HidMapper.getKeyCode(usage);
      expect(keyCode).not.toBeNull();
      expect(keyCode?.hidUsage).toBe(usage);
      expect(keyCode?.zmkName).toBe('A');
      expect(keyCode?.category).toBe('letter');
      expect(keyCode?.label).toBeTruthy();
    });

    it('should categorize number keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x1E)); // 1
      expect(keyCode?.category).toBe('number');
    });

    it('should categorize function keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x3A)); // F1
      expect(keyCode?.category).toBe('function');
    });

    it('should categorize modifiers correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0xE0)); // LCTRL
      expect(keyCode?.category).toBe('modifier');
    });

    it('should categorize special keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x2C)); // SPACE
      expect(keyCode?.category).toBe('special');
    });

    it('should return null for invalid HID codes', () => {
      expect(HidMapper.getKeyCode(0xFFFF)).toBeNull();
    });
  });

  describe('isModifier', () => {
    it('should return true for left modifiers', () => {
      expect(HidMapper.isModifier(hid(KB, 0xE0))).toBe(true); // LCTRL
      expect(HidMapper.isModifier(hid(KB, 0xE1))).toBe(true); // LSHFT
      expect(HidMapper.isModifier(hid(KB, 0xE2))).toBe(true); // LALT
      expect(HidMapper.isModifier(hid(KB, 0xE3))).toBe(true); // LGUI
    });

    it('should return true for right modifiers', () => {
      expect(HidMapper.isModifier(hid(KB, 0xE4))).toBe(true); // RCTRL
      expect(HidMapper.isModifier(hid(KB, 0xE5))).toBe(true); // RSHFT
      expect(HidMapper.isModifier(hid(KB, 0xE6))).toBe(true); // RALT
      expect(HidMapper.isModifier(hid(KB, 0xE7))).toBe(true); // RGUI
    });

    it('should return false for non-modifier keys', () => {
      expect(HidMapper.isModifier(hid(KB, 0x04))).toBe(false); // A
      expect(HidMapper.isModifier(hid(KB, 0x2C))).toBe(false); // SPACE
      expect(HidMapper.isModifier(hid(KB, 0x3A))).toBe(false); // F1
    });

    it('should return false for invalid HID codes', () => {
      expect(HidMapper.isModifier(0xFFFF)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle keys with no label gracefully', () => {
      // Test with an ID that doesn't have a label
      const result = HidMapper.getZmkKeyName(hid(KB, 0xFF));
      // Should return null or a generated name
      expect(result).toBeDefined();
    });

    it('should handle keys without override labels', () => {
      // Keys that exist in HID tables but not in overrides
      // These should go through the fallback transformation logic
      const result = HidMapper.getZmkKeyName(hid(KB, 0x53)); // Num Lock
      expect(result).toBeTruthy();
    });

    it('should return label as-is for single letter keys', () => {
      // Testing the /^[A-Z]$/ regex path
      const letters = ['A', 'B', 'Z'];
      letters.forEach(letter => {
        const hidCode = hid(KB, 0x04 + (letter.charCodeAt(0) - 'A'.charCodeAt(0)));
        const result = HidMapper.getZmkKeyName(hidCode);
        expect(result).toBe(letter);
      });
    });

    it('should transform keyboard prefix labels', () => {
      // Keys that have "Keyboard " prefix should have it removed
      // This tests the fallback path for keys without overrides
      const result = HidMapper.getZmkKeyName(hid(KB, 0x65)); // Application key
      expect(result).toBeTruthy();
      if (result) {
        expect(result).not.toContain('Keyboard');
      }
    });
  });
});
