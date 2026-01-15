/**
 * Unit tests for BehaviorMapper
 *
 * THESE ARE REAL TESTS with automated assertions
 */

import { describe, it, expect } from 'vitest';
import { BehaviorMapper } from './BehaviorMapper';

// Mock HID key name function
const mockGetKeyName = (hidUsage: number): string | null => {
  const keyMap: Record<number, string> = {
    0x04: 'Q',
    0x1A: 'W',
    0x08: 'E',
    0x2C: 'SPACE',
    0xE0: 'LCTRL',
    0x2B: 'TAB',
  };
  return keyMap[hidUsage] || null;
};

describe('BehaviorMapper', () => {
  describe('formatBinding', () => {
    it('should format transparent binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 0, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&trans');
    });

    it('should format key press binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 1, param1: 0x04, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&kp Q');
    });

    it('should format mod-tap binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 2, param1: 0xE0, param2: 0x04, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&mt LCTRL Q');
    });

    it('should format layer-tap binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 3, param1: 1, param2: 0x2B, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&lt 1 TAB');
    });

    it('should format momentary layer binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 4, param1: 1, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&mo 1');
    });

    it('should format toggle layer binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 5, param1: 2, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&tog 2');
    });

    it('should handle unknown behavior', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 999, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('/* Unknown behavior 999 */');
    });

    it('should handle unknown HID key code', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 1, param1: 0xFF, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&kp /* HID 0xff */');
    });
  });

  describe('getBehavior', () => {
    it('should return behavior for valid ID', () => {
      const behavior = BehaviorMapper.getBehavior(1);
      expect(behavior).not.toBeNull();
      expect(behavior?.code).toBe('kp');
      expect(behavior?.displayName).toBe('Key Press');
    });

    it('should return null for invalid ID', () => {
      const behavior = BehaviorMapper.getBehavior(999);
      expect(behavior).toBeNull();
    });
  });

  describe('isLayerBehavior', () => {
    it('should return true for layer-tap', () => {
      expect(BehaviorMapper.isLayerBehavior(3)).toBe(true);
    });

    it('should return true for momentary layer', () => {
      expect(BehaviorMapper.isLayerBehavior(4)).toBe(true);
    });

    it('should return true for toggle layer', () => {
      expect(BehaviorMapper.isLayerBehavior(5)).toBe(true);
    });

    it('should return false for key press', () => {
      expect(BehaviorMapper.isLayerBehavior(1)).toBe(false);
    });

    it('should return false for mod-tap', () => {
      expect(BehaviorMapper.isLayerBehavior(2)).toBe(false);
    });
  });

  describe('getParamCount', () => {
    it('should return 0 for transparent', () => {
      expect(BehaviorMapper.getParamCount(0)).toBe(0);
    });

    it('should return 1 for key press', () => {
      expect(BehaviorMapper.getParamCount(1)).toBe(1);
    });

    it('should return 2 for mod-tap', () => {
      expect(BehaviorMapper.getParamCount(2)).toBe(2);
    });

    it('should return 2 for layer-tap', () => {
      expect(BehaviorMapper.getParamCount(3)).toBe(2);
    });

    it('should return 0 for unknown behavior', () => {
      expect(BehaviorMapper.getParamCount(999)).toBe(0);
    });
  });

  describe('getBehaviorCode', () => {
    it('should return behavior code for valid ID', () => {
      expect(BehaviorMapper.getBehaviorCode(0)).toBe('trans');
      expect(BehaviorMapper.getBehaviorCode(1)).toBe('kp');
      expect(BehaviorMapper.getBehaviorCode(2)).toBe('mt');
      expect(BehaviorMapper.getBehaviorCode(3)).toBe('lt');
      expect(BehaviorMapper.getBehaviorCode(4)).toBe('mo');
      expect(BehaviorMapper.getBehaviorCode(5)).toBe('tog');
      expect(BehaviorMapper.getBehaviorCode(6)).toBe('bt');
    });

    it('should return null for invalid ID', () => {
      expect(BehaviorMapper.getBehaviorCode(999)).toBeNull();
    });
  });

  describe('getAllBehaviors', () => {
    it('should return map of all known behaviors', () => {
      const behaviors = BehaviorMapper.getAllBehaviors();

      expect(behaviors).toBeInstanceOf(Map);
      expect(behaviors.size).toBeGreaterThan(0);

      // Should have all standard behaviors
      expect(behaviors.has(0)).toBe(true); // trans
      expect(behaviors.has(1)).toBe(true); // kp
      expect(behaviors.has(2)).toBe(true); // mt
      expect(behaviors.has(3)).toBe(true); // lt
      expect(behaviors.has(4)).toBe(true); // mo
      expect(behaviors.has(5)).toBe(true); // tog
      expect(behaviors.has(6)).toBe(true); // bt
    });

    it('should return a new Map instance (not reference)', () => {
      const behaviors1 = BehaviorMapper.getAllBehaviors();
      const behaviors2 = BehaviorMapper.getAllBehaviors();

      // Should be different instances
      expect(behaviors1).not.toBe(behaviors2);

      // But have same content
      expect(behaviors1.size).toBe(behaviors2.size);
    });
  });

  describe('bluetooth behavior', () => {
    it('should format bluetooth binding with numeric param', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&bt 0');
    });

    it('should format bluetooth binding with different commands', () => {
      const result1 = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 1, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result1).toBe('&bt 1');

      const result2 = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 2, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result2).toBe('&bt 2');
    });
  });
});
