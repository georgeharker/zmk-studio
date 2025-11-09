/**
 * Unit tests for ReverseHidMapper
 *
 * TRUE TDD: Tests FIRST, then implementation
 */

import { describe, it, expect } from 'vitest';
import { ReverseHidMapper } from './ReverseHidMapper';

describe('ReverseHidMapper', () => {
  describe('getHidCode', () => {
    // Letter keys
    it('should convert letter A to HID code', () => {
      expect(ReverseHidMapper.getHidCode('A')).toBe(0x070004);
    });

    it('should convert letter Z to HID code', () => {
      expect(ReverseHidMapper.getHidCode('Z')).toBe(0x07001D);
    });

    // Number keys (with N prefix)
    it('should convert N1 to HID code', () => {
      expect(ReverseHidMapper.getHidCode('N1')).toBe(0x07001E);
    });

    it('should convert N9 to HID code', () => {
      expect(ReverseHidMapper.getHidCode('N9')).toBe(0x070026);
    });

    it('should convert N0 to HID code', () => {
      expect(ReverseHidMapper.getHidCode('N0')).toBe(0x070027);
    });

    // Modifiers - Left
    it('should convert LCTRL to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LCTRL')).toBe(0x0700E0);
    });

    it('should convert LSHFT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LSHFT')).toBe(0x0700E1);
    });

    it('should convert LALT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LALT')).toBe(0x0700E2);
    });

    it('should convert LGUI to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LGUI')).toBe(0x0700E3);
    });

    // Modifiers - Right
    it('should convert RCTRL to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RCTRL')).toBe(0x0700E4);
    });

    it('should convert RSHFT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RSHFT')).toBe(0x0700E5);
    });

    it('should convert RALT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RALT')).toBe(0x0700E6);
    });

    it('should convert RGUI to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RGUI')).toBe(0x0700E7);
    });

    // Special keys
    it('should convert SPACE to HID code', () => {
      expect(ReverseHidMapper.getHidCode('SPACE')).toBe(0x07002C);
    });

    it('should convert ENTER to HID code', () => {
      expect(ReverseHidMapper.getHidCode('ENTER')).toBe(0x070028);
    });

    it('should convert TAB to HID code', () => {
      expect(ReverseHidMapper.getHidCode('TAB')).toBe(0x07002B);
    });

    it('should convert BSPC to HID code', () => {
      expect(ReverseHidMapper.getHidCode('BSPC')).toBe(0x07002A);
    });

    it('should convert ESC to HID code', () => {
      expect(ReverseHidMapper.getHidCode('ESC')).toBe(0x070029);
    });

    // Arrow keys
    it('should convert RIGHT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RIGHT')).toBe(0x07004F);
    });

    it('should convert LEFT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LEFT')).toBe(0x070050);
    });

    it('should convert DOWN to HID code', () => {
      expect(ReverseHidMapper.getHidCode('DOWN')).toBe(0x070051);
    });

    it('should convert UP to HID code', () => {
      expect(ReverseHidMapper.getHidCode('UP')).toBe(0x070052);
    });

    // Brackets
    it('should convert LBKT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('LBKT')).toBe(0x07002F);
    });

    it('should convert RBKT to HID code', () => {
      expect(ReverseHidMapper.getHidCode('RBKT')).toBe(0x070030);
    });

    // Edge cases
    it('should return null for unknown key name', () => {
      expect(ReverseHidMapper.getHidCode('UNKNOWN_KEY')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(ReverseHidMapper.getHidCode('')).toBeNull();
    });

    it('should handle case sensitivity', () => {
      // ZMK key names are uppercase
      expect(ReverseHidMapper.getHidCode('a')).toBeNull();
      expect(ReverseHidMapper.getHidCode('A')).toBe(0x070004);
    });
  });

  describe('isModifier', () => {
    it('should return true for LCTRL', () => {
      expect(ReverseHidMapper.isModifier('LCTRL')).toBe(true);
    });

    it('should return true for RCTRL', () => {
      expect(ReverseHidMapper.isModifier('RCTRL')).toBe(true);
    });

    it('should return true for all left modifiers', () => {
      expect(ReverseHidMapper.isModifier('LSHFT')).toBe(true);
      expect(ReverseHidMapper.isModifier('LALT')).toBe(true);
      expect(ReverseHidMapper.isModifier('LGUI')).toBe(true);
    });

    it('should return true for all right modifiers', () => {
      expect(ReverseHidMapper.isModifier('RSHFT')).toBe(true);
      expect(ReverseHidMapper.isModifier('RALT')).toBe(true);
      expect(ReverseHidMapper.isModifier('RGUI')).toBe(true);
    });

    it('should return false for non-modifiers', () => {
      expect(ReverseHidMapper.isModifier('A')).toBe(false);
      expect(ReverseHidMapper.isModifier('SPACE')).toBe(false);
      expect(ReverseHidMapper.isModifier('N1')).toBe(false);
    });
  });

  describe('getAllKeyNames', () => {
    it('should return array of all known key names', () => {
      const keyNames = ReverseHidMapper.getAllKeyNames();

      expect(Array.isArray(keyNames)).toBe(true);
      expect(keyNames.length).toBeGreaterThan(0);
      expect(keyNames).toContain('A');
      expect(keyNames).toContain('LCTRL');
      expect(keyNames).toContain('SPACE');
    });

    it('should include all letters', () => {
      const keyNames = ReverseHidMapper.getAllKeyNames();

      for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i); // A-Z
        expect(keyNames).toContain(letter);
      }
    });

    it('should include all numbers', () => {
      const keyNames = ReverseHidMapper.getAllKeyNames();

      expect(keyNames).toContain('N1');
      expect(keyNames).toContain('N2');
      expect(keyNames).toContain('N9');
      expect(keyNames).toContain('N0');
    });

    it('should include all modifiers', () => {
      const keyNames = ReverseHidMapper.getAllKeyNames();

      expect(keyNames).toContain('LCTRL');
      expect(keyNames).toContain('RCTRL');
      expect(keyNames).toContain('LSHFT');
      expect(keyNames).toContain('RSHFT');
      expect(keyNames).toContain('LALT');
      expect(keyNames).toContain('RALT');
      expect(keyNames).toContain('LGUI');
      expect(keyNames).toContain('RGUI');
    });
  });
});
