/**
 * Unit tests for ReverseBehaviorMapper
 *
 * TRUE TDD: Tests FIRST, then implementation
 */

import { describe, it, expect } from 'vitest';
import { ReverseBehaviorMapper } from './ReverseBehaviorMapper';

describe('ReverseBehaviorMapper', () => {
  describe('getBehaviorId', () => {
    it('should return ID for trans behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('trans')).toBe(0);
    });

    it('should return ID for kp behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('kp')).toBe(1);
    });

    it('should return ID for mt behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('mt')).toBe(2);
    });

    it('should return ID for lt behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('lt')).toBe(3);
    });

    it('should return ID for mo behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('mo')).toBe(4);
    });

    it('should return ID for tog behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('tog')).toBe(5);
    });

    it('should return ID for bt behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('bt')).toBe(6);
    });

    it('should return null for unknown behavior', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('unknown')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(ReverseBehaviorMapper.getBehaviorId('')).toBeNull();
    });
  });

  describe('convertBinding', () => {
    it('should convert trans binding', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'trans',
        params: [],
      });

      expect(result).toEqual({
        behaviorId: 0,
        param1: null,
        param2: null,
      });
    });

    it('should convert kp binding with key name', () => {
      const result = ReverseBehaviorMapper.convertBinding(
        {
          behavior: 'kp',
          params: ['A'],
        },
        (keyName) => (keyName === 'A' ? 0x04 : null)
      );

      expect(result).toEqual({
        behaviorId: 1,
        param1: 0x04,
        param2: null,
      });
    });

    it('should convert mt binding with two params', () => {
      const mockGetHidCode = (keyName: string) => {
        if (keyName === 'LCTRL') return 0xE0;
        if (keyName === 'A') return 0x04;
        return null;
      };

      const result = ReverseBehaviorMapper.convertBinding(
        {
          behavior: 'mt',
          params: ['LCTRL', 'A'],
        },
        mockGetHidCode
      );

      expect(result).toEqual({
        behaviorId: 2,
        param1: 0xE0,
        param2: 0x04,
      });
    });

    it('should convert lt binding with layer number and key', () => {
      const mockGetHidCode = (keyName: string) => {
        if (keyName === 'TAB') return 0x2B;
        return null;
      };

      const result = ReverseBehaviorMapper.convertBinding(
        {
          behavior: 'lt',
          params: ['1', 'TAB'],
        },
        mockGetHidCode
      );

      expect(result).toEqual({
        behaviorId: 3,
        param1: 1, // Layer number, not HID code
        param2: 0x2B,
      });
    });

    it('should convert mo binding with layer number', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'mo',
        params: ['2'],
      });

      expect(result).toEqual({
        behaviorId: 4,
        param1: 2,
        param2: null,
      });
    });

    it('should convert tog binding with layer number', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'tog',
        params: ['1'],
      });

      expect(result).toEqual({
        behaviorId: 5,
        param1: 1,
        param2: null,
      });
    });

    it('should convert bt BT_CLR binding', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'bt',
        params: ['BT_CLR'],
      });

      expect(result).toEqual({
        behaviorId: 6,
        param1: 0, // BT_CLR is 0
        param2: null,
      });
    });

    it('should convert bt BT_SEL binding with index', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'bt',
        params: ['BT_SEL', '2'],
      });

      expect(result).toEqual({
        behaviorId: 6,
        param1: 2, // BT_SEL with index
        param2: null,
      });
    });

    it('should return null for unknown behavior', () => {
      const result = ReverseBehaviorMapper.convertBinding({
        behavior: 'unknown',
        params: [],
      });

      expect(result).toBeNull();
    });

    it('should handle missing key name lookup', () => {
      const result = ReverseBehaviorMapper.convertBinding(
        {
          behavior: 'kp',
          params: ['UNKNOWN_KEY'],
        },
        () => null
      );

      // Should still return binding, but with null param
      expect(result).toEqual({
        behaviorId: 1,
        param1: null,
        param2: null,
      });
    });
  });

  describe('isLayerBehavior', () => {
    it('should return true for mo', () => {
      expect(ReverseBehaviorMapper.isLayerBehavior('mo')).toBe(true);
    });

    it('should return true for tog', () => {
      expect(ReverseBehaviorMapper.isLayerBehavior('tog')).toBe(true);
    });

    it('should return true for lt', () => {
      expect(ReverseBehaviorMapper.isLayerBehavior('lt')).toBe(true);
    });

    it('should return false for kp', () => {
      expect(ReverseBehaviorMapper.isLayerBehavior('kp')).toBe(false);
    });

    it('should return false for trans', () => {
      expect(ReverseBehaviorMapper.isLayerBehavior('trans')).toBe(false);
    });
  });
});
