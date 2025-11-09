/**
 * Reverse Behavior Mapper
 *
 * Converts ZMK behavior codes to internal behavior IDs
 * This is the reverse of BehaviorMapper in export
 */

import type { ParsedBinding } from './DeviceTreeParser';
import type { PartialConvertedBinding } from './types';

export class ReverseBehaviorMapper {
  /**
   * Map of ZMK codes to behavior IDs
   */
  private static readonly BEHAVIOR_MAP: Map<string, number> = new Map([
    ['trans', 0],
    ['kp', 1],
    ['mt', 2],
    ['lt', 3],
    ['mo', 4],
    ['tog', 5],
    ['bt', 6],
  ]);

  /**
   * Get behavior ID from ZMK code
   */
  static getBehaviorId(code: string): number | null {
    return this.BEHAVIOR_MAP.get(code) ?? null;
  }

  /**
   * Convert a parsed binding to internal format
   *
   * @param binding - Parsed binding from DeviceTreeParser
   * @param getHidCode - Function to convert key names to HID codes
   * @returns Converted binding or null if unknown behavior
   */
  static convertBinding(
    binding: ParsedBinding,
    getHidCode?: (keyName: string) => number | null
  ): PartialConvertedBinding | null {
    const behaviorId = this.getBehaviorId(binding.behavior);
    if (behaviorId === null) {
      return null;
    }

    // Handle each behavior type
    switch (binding.behavior) {
      case 'trans':
        return {
          behaviorId,
          param1: null,
          param2: null,
        };

      case 'kp': {
        const keyName = binding.params[0];
        const hidCode = getHidCode ? getHidCode(keyName) : null;
        return {
          behaviorId,
          param1: hidCode,
          param2: null,
        };
      }

      case 'mt': {
        const modifier = binding.params[0];
        const key = binding.params[1];
        const param1 = getHidCode ? getHidCode(modifier) : null;
        const param2 = getHidCode ? getHidCode(key) : null;
        return {
          behaviorId,
          param1,
          param2,
        };
      }

      case 'lt': {
        // Layer-tap: param1 is layer number (not HID code), param2 is HID code
        const layerNum = parseInt(binding.params[0], 10);
        const key = binding.params[1];
        const param2 = getHidCode ? getHidCode(key) : null;
        return {
          behaviorId,
          param1: isNaN(layerNum) ? null : layerNum,
          param2,
        };
      }

      case 'mo': {
        // Momentary layer: param1 is layer number
        const layerNum = parseInt(binding.params[0], 10);
        return {
          behaviorId,
          param1: isNaN(layerNum) ? null : layerNum,
          param2: null,
        };
      }

      case 'tog': {
        // Toggle layer: param1 is layer number
        const layerNum = parseInt(binding.params[0], 10);
        return {
          behaviorId,
          param1: isNaN(layerNum) ? null : layerNum,
          param2: null,
        };
      }

      case 'bt': {
        // Bluetooth: param1 depends on command
        const command = binding.params[0];

        if (command === 'BT_CLR') {
          return {
            behaviorId,
            param1: 0,
            param2: null,
          };
        } else if (command === 'BT_SEL') {
          const index = parseInt(binding.params[1], 10);
          return {
            behaviorId,
            param1: isNaN(index) ? null : index,
            param2: null,
          };
        } else {
          // Unknown bluetooth command
          return {
            behaviorId,
            param1: null,
            param2: null,
          };
        }
      }

      default:
        return null;
    }
  }

  /**
   * Check if a behavior involves layer switching
   */
  static isLayerBehavior(code: string): boolean {
    return ['mo', 'tog', 'lt'].includes(code);
  }
}
